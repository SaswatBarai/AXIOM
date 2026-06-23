from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional


class FileType(str, Enum):
    pdf = "pdf"
    docx = "docx"


class ResumeParseRequest(BaseModel):
    file_url: str = Field(..., max_length=2048)
    file_type: FileType


class ATSAnalyzeRequest(BaseModel):
    parsed_data: dict        # ParsedResume as JSON
    job_description: str = Field(..., max_length=8000)


class JobMatchRequest(BaseModel):
    resume_id: str = Field(..., max_length=200)
    job_ids: list[str] = Field(..., max_length=100)


class SkillGapRequest(BaseModel):
    parsed_data: dict   # ParsedResume as JSON (AI service stays stateless w.r.t. Postgres)
    role_id: str = Field(..., max_length=200)  # must match a key in target_roles.json


class CoverLetterRequest(BaseModel):
    resume_id: str = Field(..., max_length=200)
    job_description: str = Field(..., max_length=8000)
    company_name: str = Field(..., max_length=200)
    job_title: str = Field(..., max_length=200)


class ChatRequest(BaseModel):
    session_id: str = Field(..., max_length=200)
    message: str = Field(..., max_length=4000)
    resume_id: Optional[str] = Field(default=None, max_length=200)


class InterviewQuestionsRequest(BaseModel):
    job_description: str = Field(..., max_length=8000)
    difficulty: str = Field(default="medium", max_length=10)  # easy | medium | hard
    sections: list[str] = Field(default_factory=lambda: ["dsa", "system_design", "behavioral"], max_length=10)


class RoadmapRequest(BaseModel):
    resume_id: str = Field(..., max_length=200)
    target_role: str = Field(..., max_length=200)
    weeks: int = Field(default=8, ge=1, le=52)
