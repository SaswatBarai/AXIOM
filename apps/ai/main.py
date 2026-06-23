import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import resume, jobs, skills, genai, chat, interview, roadmap
from utils.logger import logger


from services.embedding import preload_model

# Fail fast if internal secret is not set
_AI_SERVICE_SECRET = os.getenv("AI_SERVICE_SECRET")
if not _AI_SERVICE_SECRET:
    msg = "CRITICAL: AI_SERVICE_SECRET environment variable is not set"
    logger.error(msg)
    raise RuntimeError(msg)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("AXIOM AI service starting up")
    try:
        preload_model()
    except Exception as e:
        logger.error(f"Failed to preload model: {e}")
    yield
    logger.info("AXIOM AI service shutting down")


app = FastAPI(
    title="AXIOM AI Service",
    description="AI/ML backend for resume analysis, job matching, and GenAI features",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    ALLOWED_ORIGINS = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
else:
    ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:4000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "X-Internal-Secret"],
)

# ── Routers ──────────────────────────────────────────────────
app.include_router(resume.router,    prefix="/api/resume",    tags=["Resume"])
app.include_router(jobs.router,      prefix="/api/jobs",      tags=["Jobs"])
app.include_router(skills.router,    prefix="/api/skills",    tags=["Skills"])
app.include_router(genai.router,     prefix="/api/genai",     tags=["GenAI"])
app.include_router(chat.router,      prefix="/api/chat",      tags=["Chat"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview"])
app.include_router(roadmap.router,   prefix="/api/roadmap",   tags=["Roadmap"])


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "axiom-ai"}
