import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import * as clService from "../services/coverLetter.service";

export async function generateHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await clService.generateCoverLetter(
      req.userId!,
      req.body.resumeId as string,
      req.params["applicationId"] as string,
      req.body.jobDescription as string,
      req.body.companyName as string,
      req.body.jobTitle as string,
      req.body.tone ?? "formal",
    );
    res.json(result);
  } catch (err) { next(err); }
}

export async function exportPdfHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const buf = await clService.exportPdf(
      req.body.letterBody as string,
      req.body.candidateName ?? "Candidate",
      req.body.jobTitle ?? "",
      req.body.companyName ?? "",
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="cover_letter.pdf"');
    res.send(buf);
  } catch (err) { next(err); }
}

export async function exportDocxHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const buf = await clService.exportDocx(
      req.body.letterBody as string,
      req.body.candidateName ?? "Candidate",
      req.body.jobTitle ?? "",
      req.body.companyName ?? "",
    );
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", 'attachment; filename="cover_letter.docx"');
    res.send(buf);
  } catch (err) { next(err); }
}

export async function getSavedHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const letter = await clService.getSavedLetter(req.userId!, req.params["applicationId"] as string);
    res.json({ letter });
  } catch (err) { next(err); }
}

export async function saveHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await clService.saveLetter(req.userId!, req.params["applicationId"] as string, req.body.letter as string);
    res.json({ success: true });
  } catch (err) { next(err); }
}
