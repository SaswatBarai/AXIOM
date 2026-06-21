import os

from fastapi import APIRouter, HTTPException, Header

from models.schemas import ResumeParseRequest, ATSAnalyzeRequest, JobMatchRequest
from services.parser import parse_resume
from services.ats import analyze_resume
from services.recommendation import match_resume_jobs
from utils.logger import logger

router = APIRouter()

AI_SECRET = os.getenv("AI_SERVICE_SECRET", "internal-secret")


def _check_secret(secret: str) -> None:
    if secret != AI_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized internal call")


@router.post("/parse")
async def parse_resume_endpoint(
    request: ResumeParseRequest,
    x_internal_secret: str = Header(...),
):
    _check_secret(x_internal_secret)
    try:
        data = await parse_resume(request.file_url, request.file_type)
        return {"success": True, "data": data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Resume parsing failed: {e}")
        raise HTTPException(status_code=500, detail="Parsing failed — check AI service logs")


@router.post("/analyze")
def analyze_resume_endpoint(
    request: ATSAnalyzeRequest,
    x_internal_secret: str = Header(...),
):
    _check_secret(x_internal_secret)
    try:
        score = analyze_resume(request.parsed_data, request.job_description)
        return {"success": True, "data": score}
    except Exception as e:
        logger.error(f"ATS analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed — check AI service logs")


@router.post("/match")
def match_resume_endpoint(
    request: JobMatchRequest,
    x_internal_secret: str = Header(...),
):
    _check_secret(x_internal_secret)
    try:
        results = match_resume_jobs(request.resume_id, request.job_ids)
        return {"success": True, "data": results}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Job matching failed: {e}")
        raise HTTPException(status_code=500, detail="Matching failed — check AI service logs")
