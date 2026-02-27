import axios from "axios";
import type { AuthResponse, User, Skill, UserSkill, Project, JobOpening, Application, Notification, ProjectEvaluation, Ranking, Company, ProjectAssignment, FeedPost, Message } from "../types";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: { fullName: string; email: string; password: string; role?: string }) =>
    api.post<AuthResponse>("/users/register", data),
  
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/users/login", data),
  
  getMe: () => api.get<{ user: User & { skills: UserSkill[]; _count: { projects: number; applications: number; notifications: number } } }>("/users/me"),
  
  updateProfile: (data: { fullName?: string; profilePic?: string }) =>
    api.put<{ user: User }>("/users/me", data),

  googleAuth: () => api.get("/auth/google"),
};

export const skillsAPI = {
  getAll: (category?: string) =>
    api.get<{ skills: Skill[] }>("/skills", { params: { category } }),
  
  create: (data: { name: string; category: string; difficultyLevel?: number }) =>
    api.post<{ skill: Skill }>("/skills", data),
  
  getUserSkills: () =>
    api.get<{ userSkills: UserSkill[] }>("/skills/users"),
  
  addUserSkill: (data: { skillId: string; level?: number; score?: number }) =>
    api.post<{ userSkill: UserSkill }>("/skills/users", data),
  
  scoreSkill: (data: { skillId: string; workUrl?: string; description?: string; experience?: string }) =>
    api.post<{ userSkill: UserSkill; evaluation: Record<string, unknown> }>("/ai/score-skill", data),
};

export const projectsAPI = {
  getAll: (type?: string, difficulty?: number) =>
    api.get<{ projects: Project[] }>("/projects", { params: { type, difficulty } }),
  
  create: (data: { name: string; description: string; difficultyLevel?: number; type?: string }) =>
    api.post<{ project: Project }>("/projects", data),
  
  assign: (data: { projectId: string; role?: string }) =>
    api.post<{ assignment: ProjectAssignment }>("/projects/assign", data),
  
  evaluate: (data: { projectId: string; projectDescription: string; projectCode?: string; projectUrl?: string }) =>
    api.post<{ evaluation: ProjectEvaluation }>("/ai/evaluate-project", data),
};

export const jobsAPI = {
  getAll: (companyId?: string) =>
    api.get<{ jobs: JobOpening[] }>("/jobs", { params: { companyId } }),
  
  create: (data: { companyId: string; title: string; description: string; requiredSkills?: string[]; minExperience?: number; salaryRange?: { min: number; max: number } }) =>
    api.post<{ job: JobOpening }>("/jobs", data),
};

export const applicationsAPI = {
  getMy: () =>
    api.get<{ applications: Application[] }>("/applications"),
  
  apply: (data: { jobId: string }) =>
    api.post<{ application: Application }>("/applications", data),
};

export const notificationsAPI = {
  getAll: () =>
    api.get<{ notifications: Notification[]; unreadCount: number }>("/notifications"),
  
  markRead: (data: { notificationId?: string; markAllRead?: boolean }) =>
    api.post<{ notification?: Notification }>("/notifications", data),
};

export const rankingsAPI = {
  getSkillRankings: (skillId: string, limit?: number) =>
    api.get<{ rankings: Ranking[] }>("/ai/rankings", { params: { skillId, limit } }),
  
  getLeaderboard: (skillId?: string, period?: string) =>
    api.get<{ rankings: Ranking[] }>("/leaderboard", { params: { skillId, period } }),
};

export const companiesAPI = {
  getAll: () =>
    api.get<{ companies: Company[] }>("/companies"),
  
  create: (data: { name: string; industry: string; website?: string }) =>
    api.post<{ company: Company }>("/companies", data),
};

export const feedAPI = {
  getPosts: (limit?: number, offset?: number) =>
    api.get<{ posts: FeedPost[] }>("/feed", { params: { limit, offset } }),
  
  createPost: (data: { title: string; content: string; imageUrl?: string; tags?: string[] }) =>
    api.post<{ post: FeedPost }>("/feed", data),
  
  likePost: (postId: string) =>
    api.put<{ post: FeedPost }>("/feed", { postId }),
};

export const messagesAPI = {
  getAll: (userId?: string) =>
    api.get<{ messages: Message[] }>("/messages", { params: { userId } }),
  
  send: (data: { receiverId: string; content: string }) =>
    api.post<{ message: Message }>("/messages", data),
  
  markAsRead: (messageId: string) =>
    api.put<{ message: Message }>("/messages", { messageId }),
};

export const chatAPI = {
  sendMessage: (message: string) =>
    api.post<{ reply: string }>("/chat", { message }),
};

export default api;
