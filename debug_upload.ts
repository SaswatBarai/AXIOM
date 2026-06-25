import dotenv from "dotenv";
dotenv.config({ path: "./apps/api/.env" });
import { prisma } from "./packages/database/src/index";
import { uploadResume } from "./apps/api/src/services/resume.service";
import { matchJobs } from "./apps/api/src/services/ai.service";
import fs from "fs";
import path from "path";

async function main() {
  const email = "Saswatbarai611@gmail.com";
  const filePath = "/home/saswatbarai/Downloads/Saswat-new-resume.pdf";

  console.log("Checking user Saswatbarai611@gmail.com in database...");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("User Saswatbarai611@gmail.com not found!");
    process.exit(1);
  }
  console.log(`User found! ID: ${user.id}`);

  console.log(`Reading resume from path: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.error("Resume file not found at path:", filePath);
    process.exit(1);
  }
  const buffer = fs.readFileSync(filePath);
  const size = fs.statSync(filePath).size;

  const file = {
    fieldname: "resume",
    originalname: path.basename(filePath),
    encoding: "7bit",
    mimetype: "application/pdf",
    buffer,
    size,
  } as any;

  console.log("Uploading resume and invoking S3 bucket upload...");
  const resume = await uploadResume(user.id, file);
  console.log(`Successfully uploaded! Resume created with ID: ${resume.id}`);

  console.log("Polling database for asynchronous AI parsing results...");
  let parsedResume: any = null;
  for (let i = 0; i < 20; i++) {
    const r = await prisma.resume.findUnique({ where: { id: resume.id } });
    if (r?.parsedData) {
      parsedResume = r;
      break;
    }
    console.log(`Waiting for AI parsing to complete... ${i + 1}/20`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (!parsedResume) {
    console.error("Failed or timed out waiting for AI parsing. Please check FastAPI AI service logs.");
    process.exit(1);
  }

  console.log("AI parser completed successfully!");
  console.log("--- EXTRACTED RESUME DATA ---");
  console.log(JSON.stringify(parsedResume.parsedData, null, 2));

  console.log("Running job matching finder engine...");
  const matches = await matchJobs(resume.id);
  console.log("--- RECOMMENDED JOB MATCHES ---");
  console.log(JSON.stringify(matches, null, 2));

  process.exit(0);
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
