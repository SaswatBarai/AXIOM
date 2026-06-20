export type UserRole = "USER" | "PREMIUM" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  currentTitle?: string;
  yearsOfExperience?: number;
  profileCompletionPct: number;
}

export interface UserPreferences {
  userId: string;
  theme: "dark" | "light";
  emailNotifications: boolean;
  jobAlerts: boolean;
  weeklyDigest: boolean;
}
