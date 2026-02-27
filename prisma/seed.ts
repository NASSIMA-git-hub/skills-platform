import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 12);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      fullName: "Admin",
      email: "admin@skillshub.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  // Create skills with icons
  const skills = await Promise.all([
    prisma.skill.create({ data: { name: "JavaScript", category: "Programming", difficultyLevel: 2, iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" } }),
    prisma.skill.create({ data: { name: "TypeScript", category: "Programming", difficultyLevel: 3, iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" } }),
    prisma.skill.create({ data: { name: "React", category: "Frontend", difficultyLevel: 3, iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" } }),
    prisma.skill.create({ data: { name: "Next.js", category: "Frontend", difficultyLevel: 4, iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" } }),
    prisma.skill.create({ data: { name: "Node.js", category: "Backend", difficultyLevel: 3, iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" } }),
    prisma.skill.create({ data: { name: "Python", category: "Programming", difficultyLevel: 2, iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" } }),
    prisma.skill.create({ data: { name: "Machine Learning", category: "AI", difficultyLevel: 5 } }),
    prisma.skill.create({ data: { name: "Data Science", category: "AI", difficultyLevel: 4 } }),
    prisma.skill.create({ data: { name: "SQL", category: "Database", difficultyLevel: 2, iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" } }),
    prisma.skill.create({ data: { name: "Docker", category: "DevOps", difficultyLevel: 4, iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" } }),
    prisma.skill.create({ data: { name: "AWS", category: "Cloud", difficultyLevel: 4, iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg" } }),
    prisma.skill.create({ data: { name: "Git", category: "Tools", difficultyLevel: 2, iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" } }),
  ]);

  console.log("Created skills:", skills.length);

  // Create users
  const student1 = await prisma.user.create({
    data: { fullName: "John Student", email: "john@student.com", passwordHash, role: "STUDENT" },
  });
  const student2 = await prisma.user.create({
    data: { fullName: "Jane Developer", email: "jane@developer.com", passwordHash, role: "STUDENT" },
  });
  const student3 = await prisma.user.create({
    data: { fullName: "Alex Coder", email: "alex@coder.com", passwordHash, role: "STUDENT" },
  });
  const mentor1 = await prisma.user.create({
    data: { fullName: "Bob Mentor", email: "bob@mentor.com", passwordHash, role: "MENTOR" },
  });
  const mentor2 = await prisma.user.create({
    data: { fullName: "Sarah Coach", email: "sarah@coach.com", passwordHash, role: "MENTOR" },
  });
  const company1 = await prisma.user.create({
    data: { fullName: "TechCorp Inc", email: "admin@techcorp.com", passwordHash, role: "COMPANY" },
  });
  const company2 = await prisma.user.create({
    data: { fullName: "DataSoft Solutions", email: "hr@datasoft.com", passwordHash, role: "COMPANY" },
  });
  const company3 = await prisma.user.create({
    data: { fullName: "AI Innovations", email: "careers@aiinnovations.com", passwordHash, role: "COMPANY" },
  });

  console.log("Created users");

  // Create user skills
  await prisma.userSkill.createMany({
    data: [
      { userId: student1.id, skillId: skills[0].id, level: 4, score: 82, verified: true },
      { userId: student1.id, skillId: skills[2].id, level: 3, score: 75, verified: true },
      { userId: student1.id, skillId: skills[4].id, level: 3, score: 68, verified: false },
      { userId: student2.id, skillId: skills[0].id, level: 5, score: 92, verified: true },
      { userId: student2.id, skillId: skills[1].id, level: 4, score: 85, verified: true },
      { userId: student2.id, skillId: skills[2].id, level: 4, score: 78, verified: true },
      { userId: student2.id, skillId: skills[3].id, level: 3, score: 70, verified: false },
      { userId: student3.id, skillId: skills[5].id, level: 4, score: 80, verified: true },
      { userId: student3.id, skillId: skills[7].id, level: 3, score: 65, verified: false },
      { userId: mentor1.id, skillId: skills[0].id, level: 5, score: 98, verified: true },
      { userId: mentor1.id, skillId: skills[1].id, level: 5, score: 95, verified: true },
      { userId: mentor1.id, skillId: skills[2].id, level: 5, score: 93, verified: true },
      { userId: mentor1.id, skillId: skills[4].id, level: 5, score: 90, verified: true },
      { userId: mentor2.id, skillId: skills[5].id, level: 5, score: 96, verified: true },
      { userId: mentor2.id, skillId: skills[6].id, level: 5, score: 94, verified: true },
    ],
  });

  console.log("Created user skills");

  // Create companies
  const companies = await Promise.all([
    prisma.company.create({ data: { name: "TechCorp Inc", industry: "Software", description: "Leading software development company", website: "https://techcorp.com", size: "1000+", location: "San Francisco, CA" } }),
    prisma.company.create({ data: { name: "DataSoft Solutions", industry: "Data Analytics", description: "Data-driven analytics platform", website: "https://datasoft.com", size: "500-1000", location: "New York, NY" } }),
    prisma.company.create({ data: { name: "AI Innovations", industry: "AI/ML", description: "Cutting-edge AI solutions", website: "https://aiinnovations.com", size: "100-500", location: "Austin, TX" } }),
    prisma.company.create({ data: { name: "CloudNine", industry: "Cloud Services", description: "Cloud infrastructure provider", website: "https://cloudnine.io", size: "500-1000", location: "Seattle, WA" } }),
    prisma.company.create({ data: { name: "DevHouse", industry: "EdTech", description: "Coding education platform", website: "https://devhouse.com", size: "50-100", location: "Remote" } }),
  ]);

  console.log("Created companies:", companies.length);

  // Create job openings
  const jobs = await Promise.all([
    prisma.jobOpening.create({ data: { companyId: companies[0].id, title: "Senior Frontend Developer", description: "Build scalable web applications using React and Next.js", requiredSkills: ["React", "TypeScript", "Next.js"], minExperience: 4, salaryRange: { min: 120000, max: 160000 }, location: "San Francisco, CA", jobType: "FULL_TIME" } }),
    prisma.jobOpening.create({ data: { companyId: companies[0].id, title: "Backend Engineer", description: "Design and implement scalable APIs", requiredSkills: ["Node.js", "Python", "SQL"], minExperience: 3, salaryRange: { min: 110000, max: 150000 }, location: "San Francisco, CA", jobType: "FULL_TIME" } }),
    prisma.jobOpening.create({ data: { companyId: companies[1].id, title: "Data Engineer", description: "Build data pipelines and analytics infrastructure", requiredSkills: ["Python", "SQL", "AWS"], minExperience: 3, salaryRange: { min: 100000, max: 140000 }, location: "New York, NY", jobType: "FULL_TIME" } }),
    prisma.jobOpening.create({ data: { companyId: companies[2].id, title: "Machine Learning Engineer", description: "Develop and deploy ML models", requiredSkills: ["Python", "Machine Learning", "TensorFlow"], minExperience: 4, salaryRange: { min: 140000, max: 200000 }, location: "Austin, TX", jobType: "FULL_TIME" } }),
    prisma.jobOpening.create({ data: { companyId: companies[2].id, title: "MLOps Engineer", description: "Build ML infrastructure and deployment pipelines", requiredSkills: ["Docker", "AWS", "Python"], minExperience: 3, salaryRange: { min: 120000, max: 170000 }, location: "Austin, TX", jobType: "FULL_TIME" } }),
    prisma.jobOpening.create({ data: { companyId: companies[3].id, title: "DevOps Engineer", description: "Manage cloud infrastructure and CI/CD", requiredSkills: ["Docker", "AWS", "Git"], minExperience: 2, salaryRange: { min: 90000, max: 130000 }, location: "Seattle, WA", jobType: "FULL_TIME" } }),
    prisma.jobOpening.create({ data: { companyId: companies[4].id, title: "Content Developer", description: "Create coding tutorials and courses", requiredSkills: ["JavaScript", "React", "Python"], minExperience: 1, salaryRange: { min: 60000, max: 90000 }, location: "Remote", jobType: "CONTRACT" } }),
  ]);

  console.log("Created jobs:", jobs.length);

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({ data: { name: "Personal Portfolio Website", description: "Build a stunning personal portfolio showcasing your skills and projects", difficultyLevel: 1, createdBy: admin.id, type: "INDIVIDUAL", tags: ["React", "CSS", "Portfolio"] } }),
    prisma.project.create({ data: { name: "Task Management App", description: "Full-stack task management application with real-time updates", difficultyLevel: 2, createdBy: admin.id, type: "INDIVIDUAL", tags: ["React", "Node.js", "MongoDB"] } }),
    prisma.project.create({ data: { name: "E-commerce Platform", description: "Complete e-commerce solution with payment integration", difficultyLevel: 3, createdBy: admin.id, type: "TEAM", tags: ["Next.js", "Stripe", "PostgreSQL"] } }),
    prisma.project.create({ data: { name: "AI Chatbot", description: "Build an intelligent chatbot using LLM technology", difficultyLevel: 4, createdBy: admin.id, type: "TEAM", tags: ["Python", "OpenAI", "FastAPI"] } }),
    prisma.project.create({ data: { name: "Social Media Dashboard", description: "Analytics dashboard for social media management", difficultyLevel: 2, createdBy: admin.id, type: "INDIVIDUAL", tags: ["React", "Chart.js", "API"] } }),
    prisma.project.create({ data: { name: "Real-time Collaboration Tool", description: "Google Docs-like collaborative editing application", difficultyLevel: 5, createdBy: admin.id, type: "TEAM", tags: ["WebSockets", "Node.js", "React"] } }),
  ]);

  console.log("Created projects:", projects.length);

  // Create project assignments
  await prisma.projectAssignment.createMany({
    data: [
      { projectId: projects[0].id, userId: student1.id, role: "Developer", performanceScore: 88, completed: true, completedAt: new Date() },
      { projectId: projects[1].id, userId: student1.id, role: "Full Stack Developer", performanceScore: 75, completed: true, completedAt: new Date() },
      { projectId: projects[2].id, userId: student1.id, role: "Frontend Lead", performanceScore: 70, completed: false },
      { projectId: projects[2].id, userId: student2.id, role: "Backend Developer", performanceScore: 68, completed: false },
      { projectId: projects[3].id, userId: student2.id, role: "ML Engineer", performanceScore: 72, completed: false },
      { projectId: projects[3].id, userId: student3.id, role: "Backend Developer", performanceScore: 65, completed: false },
    ],
  });

  console.log("Created project assignments");

  // Create notifications
  await prisma.notification.createMany({
    data: [
      { userId: student1.id, type: "JOB_ALERT", title: "New Job Match!", content: "A new job matching your skills is available", read: false },
      { userId: student1.id, type: "PROJECT_UPDATE", title: "Project Evaluated", content: "Your project 'Task Management App' has been evaluated", read: true },
      { userId: student1.id, type: "ACHIEVEMENT", title: "Skill Verified!", content: "Your JavaScript skill has been verified", read: true },
      { userId: student2.id, type: "SKILL_UPDATE", title: "Score Updated", content: "Your TypeScript skill score has been updated to 85", read: false },
      { userId: student2.id, type: "JOB_ALERT", title: "Interview Invitation", content: "TechCorp Inc wants to schedule an interview", read: false },
      { userId: student3.id, type: "NEWS", title: "New Project Available", content: "Check out the new AI Chatbot project", read: false },
    ],
  });

  console.log("Created notifications");

  // Create AI Agents
  await prisma.aIAgent.createMany({
    data: [
      { type: "EVALUATOR", name: "Project Evaluator", description: "Evaluates project submissions and provides feedback" },
      { type: "MENTOR", name: "AI Mentor", description: "Provides guidance on skill development" },
      { type: "MARKET", name: "Market Analyst", description: "Generates insights on job market trends" },
      { type: "CAREER_COACH", name: "Career Coach", description: "Helps with career planning and advice" },
      { type: "SKILL_ANALYZER", name: "Skill Analyzer", description: "Analyzes skill gaps and provides recommendations" },
    ],
  });

  console.log("Created AI Agents");

  // Create sample messages
  await prisma.message.createMany({
    data: [
      { senderId: mentor1.id, receiverId: student1.id, content: "Great progress on your React project! Keep it up!", read: true },
      { senderId: mentor1.id, receiverId: student2.id, content: "I'd like to schedule a mentorship session to discuss your career goals.", read: false },
      { senderId: student1.id, receiverId: mentor1.id, content: "Thank you for the feedback! I have a question about state management.", read: true },
    ],
  });

  console.log("Created messages");

  // Create feed posts
  await prisma.feedPost.createMany({
    data: [
      { authorId: mentor1.id, authorName: "Bob Mentor", title: "5 Tips for React Development", content: "Here are my top tips for becoming a better React developer...", tags: ["React", "JavaScript", "Tips"], likes: 42, comments: 8 },
      { authorId: mentor2.id, authorName: "Sarah Coach", title: "Breaking into Machine Learning", content: "The path to ML engineering requires strong fundamentals...", tags: ["Machine Learning", "Career", "AI"], likes: 89, comments: 15 },
      { authorId: admin.id, authorName: "SkillsHub Team", title: "New AI Evaluation Feature", content: "We're excited to announce our new AI-powered project evaluation system!", tags: ["Announcement", "Features"], likes: 156, comments: 23 },
    ],
  });

  console.log("Created feed posts");

  // Create leaderboard entries
  await prisma.leaderboard.create({
    data: {
      skillId: skills[0].id,
      period: "ALL_TIME",
      entries: [
        { rank: 1, userId: mentor1.id, userName: "Bob Mentor", score: 98, level: 5 },
        { rank: 2, userId: student2.id, userName: "Jane Developer", score: 92, level: 5 },
        { rank: 3, userId: student1.id, userName: "John Student", score: 82, level: 4 },
        { rank: 4, userId: student3.id, userName: "Alex Coder", score: 75, level: 4 },
      ],
    },
  });

  await prisma.leaderboard.create({
    data: {
      skillId: skills[2].id,
      period: "ALL_TIME",
      entries: [
        { rank: 1, userId: mentor1.id, userName: "Bob Mentor", score: 93, level: 5 },
        { rank: 2, userId: student2.id, userName: "Jane Developer", score: 78, level: 4 },
        { rank: 3, userId: student1.id, userName: "John Student", score: 75, level: 3 },
      ],
    },
  });

  console.log("Created leaderboards");

  console.log("\n✅ Seeding complete!");
  console.log("\nTest Accounts:");
  console.log("  Student: john@student.com / password123");
  console.log("  Mentor:  bob@mentor.com / password123");
  console.log("  Company: admin@techcorp.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
