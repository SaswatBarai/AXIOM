import { prisma } from "@axiom/database";
import { AppError } from "../middleware/errorHandler.middleware";
import { uploadToS3, deleteFromS3, getPresignedUrl, keyFromUrl } from "./s3.service";
import { parseResume as aiParseResume, analyzeResumeATS } from "./ai.service";
import type { ParsedResume } from "@axiom/shared-types";
import { v4 as uuid } from "uuid";

const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_BYTES     = 5 * 1024 * 1024; // 5 MB

export async function uploadResume(
  userId: string,
  file: Express.Multer.File
) {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new AppError(415, "Only PDF and DOCX files are accepted");
  }
  if (file.size > MAX_BYTES) {
    throw new AppError(413, "File size must be under 5 MB");
  }

  const ext      = file.mimetype === "application/pdf" ? "pdf" : "docx";
  const s3Key    = `resumes/${userId}/${uuid()}.${ext}`;
  const fileUrl  = await uploadToS3(s3Key, file.buffer, file.mimetype);
  const version  = await getNextVersion(userId);

  const resume = await prisma.resume.create({
    data: {
      userId,
      fileName: file.originalname,
      fileUrl,
      fileType: ext,
      version,
    },
  });

  // Parse in background — non-fatal if AI service is down
  aiParseResume(fileUrl, ext).then(async (parsed) => {
    if (!parsed) return;
    await prisma.resume.update({
      where: { id: resume.id },
      data:  { parsedData: parsed as object },
    });
  }).catch(() => {/* already logged inside aiParseResume */});

  return resume;
}

export async function listResumes(userId: string) {
  const resumes = await prisma.resume.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
  });
  // Attach short-lived presigned download URL for each
  return Promise.all(
    resumes.map(async (r) => ({
      ...r,
      downloadUrl: await getPresignedUrl(keyFromUrl(r.fileUrl)),
    }))
  );
}

export async function getResume(resumeId: string, userId: string) {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) throw new AppError(404, "Resume not found");
  if (resume.userId !== userId) throw new AppError(403, "Forbidden");
  return {
    ...resume,
    downloadUrl: await getPresignedUrl(keyFromUrl(resume.fileUrl)),
  };
}

export async function deleteResume(resumeId: string, userId: string) {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) throw new AppError(404, "Resume not found");
  if (resume.userId !== userId) throw new AppError(403, "Forbidden");

  await Promise.all([
    deleteFromS3(keyFromUrl(resume.fileUrl)),
    prisma.resume.delete({ where: { id: resumeId } }),
  ]);

  return { message: "Resume deleted" };
}

export async function analyzeResume(resumeId: string, userId: string, jobDescription: string) {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) throw new AppError(404, "Resume not found");
  if (resume.userId !== userId) throw new AppError(403, "Forbidden");
  if (!resume.parsedData) throw new AppError(422, "Resume has not been parsed yet — try again in a moment");

  const score = await analyzeResumeATS(resume.parsedData as unknown as ParsedResume, jobDescription);
  if (!score) throw new AppError(503, "ATS analysis service unavailable — try again later");

  const updated = await prisma.resume.update({
    where: { id: resumeId },
    data:  { atsScore: score as object },
  });
  return updated;
}

async function getNextVersion(userId: string): Promise<number> {
  const count = await prisma.resume.count({ where: { userId } });
  return count + 1;
}
