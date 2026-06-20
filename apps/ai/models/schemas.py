from pydantic import BaseModel
from typing import Optional


class ResumeParseRequest(BaseModel):
    file_url: str
    file_type: str  # "pdf" | "docx"


class ATSAnalyzeRequest(BaseModel):
    resume_id: str
    job_description: Optional[str] = None


class JobMatchRequest(BaseModel):
    resume_id: str
    job_ids: list[str]


class SkillGapRequest(BaseModel):
    resume_id: str
    target_role: str


class CoverLetterRequest(BaseModel):
    resume_id: str
    job_description: str
    company_name: str
    job_title: str


class ChatRequest(BaseModel):
    session_id: str
    message: str
    resume_id: Optional[str] = None


class InterviewQuestionsRequest(BaseModel):
    job_description: str
    difficulty: str = "medium"  # easy | medium | hard
    sections: list[str] = ["dsa", "system_design", "behavioral"]


class RoadmapRequest(BaseModel):
    resume_id: str
    target_role: str
    weeks: int = 8
