export interface ResumeSkill {
  name: string;
  proficiency?: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface ResumeExperience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  skills: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  gpa?: number;
}

export interface ResumeProject {
  name: string;
  description: string;
  url?: string;
  skills: string[];
}

export interface ParsedResume {
  skills: ResumeSkill[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  certifications: string[];
  summary?: string;
  email?: string;
  phone?: string;
  location?: string;
}

export interface ATSScore {
  overall: number;
  formatting: number;
  keywordMatch: number;
  readability: number;
  completeness: number;
  strengths: string[];
  missingSkills: string[];
  suggestions: string[];
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: "pdf" | "docx";
  parsedData: ParsedResume | null;
  atsScore: ATSScore | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
