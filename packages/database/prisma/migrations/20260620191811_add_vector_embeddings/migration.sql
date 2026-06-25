-- CreateExtension
CREATE EXTENSION IF NOT EXISTS vector;

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "embedding" vector(384);

-- AlterTable
ALTER TABLE "resumes" ADD COLUMN     "embedding" vector(384);

-- CreateIndex
CREATE INDEX ON "jobs" USING ivfflat (embedding vector_cosine_ops);
