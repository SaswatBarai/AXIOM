export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "OA_RECEIVED"
  | "INTERVIEW_SCHEDULED"
  | "OFFER_RECEIVED"
  | "REJECTED"
  | "WITHDRAWN";

export interface ApplicationTimeline {
  status: ApplicationStatus;
  note?: string;
  timestamp: Date;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: ApplicationStatus;
  timeline: ApplicationTimeline[];
  coverLetter?: string;
  notes?: string;
  appliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
