export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";
export type ExperienceLevel = "ENTRY" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE";

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogoUrl?: string;
  location: string;
  remote: boolean;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  source: "linkedin" | "indeed" | "naukri" | "internshala" | "manual";
  sourceUrl: string;
  postedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface JobMatch {
  job: Job;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}
