export interface User {
  id: string;
  fullName: string;
  email: string;
  role: "STUDENT" | "MENTOR" | "COMPANY";
  profilePic?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  difficultyLevel: number;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  level: number;
  verified: boolean;
  score: number;
  skill: Skill;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  difficultyLevel: number;
  createdBy: string;
  type: "INDIVIDUAL" | "TEAM";
  createdAt: string;
  assignments: ProjectAssignment[];
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  performanceScore: number;
  completed: boolean;
  completedAt?: string;
  user: Pick<User, "id" | "fullName" | "profilePic">;
  project?: Project;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website?: string;
  createdAt: string;
}

export interface JobOpening {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requiredSkills: string[];
  minExperience: number;
  salaryRange: { min: number; max: number };
  createdAt: string;
  company: Company;
  _count?: { applications: number };
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: "APPLIED" | "INTERVIEW" | "HIRED" | "REJECTED";
  score?: number;
  appliedAt: string;
  job: JobOpening;
}

export interface Notification {
  id: string;
  userId: string;
  type: "SKILL_UPDATE" | "PROJECT_UPDATE" | "JOB_ALERT" | "NEWS";
  content: string;
  read: boolean;
  createdAt: string;
}

export interface ProjectEvaluation {
  performanceScore: number;
  difficultyLevelMatched: boolean;
  skillImprovementSuggestions: string[];
  productionReadinessLevel: "EXCELLENT" | "GOOD" | "NEEDS_WORK" | "BEGINNER";
  strengths: string[];
  weaknesses: string[];
}

export interface Ranking {
  rank: number;
  userId: string;
  userName: string;
  userPic?: string;
  score: number;
  level: number;
  verified: boolean;
}
