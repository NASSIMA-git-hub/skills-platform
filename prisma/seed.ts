import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create skills
  const skills = await Promise.all([
    prisma.skill.create({
      data: { name: "JavaScript", category: "Programming", difficultyLevel: 2 },
    }),
    prisma.skill.create({
      data: { name: "TypeScript", category: "Programming", difficultyLevel: 3 },
    }),
    prisma.skill.create({
      data: { name: "React", category: "Frontend", difficultyLevel: 3 },
    }),
    prisma.skill.create({
      data: { name: "Node.js", category: "Backend", difficultyLevel: 3 },
    }),
    prisma.skill.create({
      data: { name: "Python", category: "Programming", difficultyLevel: 2 },
    }),
    prisma.skill.create({
      data: { name: "Machine Learning", category: "AI", difficultyLevel: 5 },
    }),
    prisma.skill.create({
      data: { name: "SQL", category: "Database", difficultyLevel: 2 },
    }),
    prisma.skill.create({
      data: { name: "Docker", category: "DevOps", difficultyLevel: 4 },
    }),
  ]);

  console.log("Created skills:", skills.length);

  // Create password hash
  const passwordHash = await bcrypt.hash("password123", 12);

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        fullName: "John Student",
        email: "john@student.com",
        passwordHash,
        role: "STUDENT",
      },
    }),
    prisma.user.create({
      data: {
        fullName: "Jane Developer",
        email: "jane@developer.com",
        passwordHash,
        role: "STUDENT",
      },
    }),
    prisma.user.create({
      data: {
        fullName: "Bob Mentor",
        email: "bob@mentor.com",
        passwordHash,
        role: "MENTOR",
      },
    }),
    prisma.user.create({
      data: {
        fullName: "TechCorp",
        email: "admin@techcorp.com",
        passwordHash,
        role: "COMPANY",
      },
    }),
  ]);

  console.log("Created users:", users.length);

  // Create user skills
  await prisma.userSkill.createMany({
    data: [
      { userId: users[0].id, skillId: skills[0].id, level: 3, score: 75, verified: true },
      { userId: users[0].id, skillId: skills[2].id, level: 2, score: 60, verified: false },
      { userId: users[1].id, skillId: skills[0].id, level: 4, score: 85, verified: true },
      { userId: users[1].id, skillId: skills[1].id, level: 3, score: 70, verified: true },
      { userId: users[1].id, skillId: skills[3].id, level: 3, score: 65, verified: false },
      { userId: users[2].id, skillId: skills[0].id, level: 5, score: 95, verified: true },
      { userId: users[2].id, skillId: skills[1].id, level: 5, score: 90, verified: true },
      { userId: users[2].id, skillId: skills[4].id, level: 4, score: 80, verified: true },
    ],
  });

  console.log("Created user skills");

  // Create companies
  const companies = await Promise.all([
    prisma.company.create({
      data: { name: "TechCorp", industry: "Software", website: "https://techcorp.com" },
    }),
    prisma.company.create({
      data: { name: "DataSoft", industry: "Data Analytics", website: "https://datasoft.com" },
    }),
    prisma.company.create({
      data: { name: "AI Innovations", industry: "AI/ML", website: "https://aiinnovations.com" },
    }),
  ]);

  console.log("Created companies:", companies.length);

  // Create job openings
  const jobs = await Promise.all([
    prisma.jobOpening.create({
      data: {
        companyId: companies[0].id,
        title: "Frontend Developer",
        description: "Build amazing user interfaces",
        requiredSkills: ["JavaScript", "React", "TypeScript"],
        minExperience: 2,
        salaryRange: { min: 80000, max: 120000 },
      },
    }),
    prisma.jobOpening.create({
      data: {
        companyId: companies[1].id,
        title: "Backend Engineer",
        description: "Design scalable APIs",
        requiredSkills: ["Node.js", "Python", "SQL"],
        minExperience: 3,
        salaryRange: { min: 90000, max: 130000 },
      },
    }),
    prisma.jobOpening.create({
      data: {
        companyId: companies[2].id,
        title: "ML Engineer",
        description: "Build AI models",
        requiredSkills: ["Python", "Machine Learning"],
        minExperience: 4,
        salaryRange: { min: 120000, max: 180000 },
      },
    }),
  ]);

  console.log("Created jobs:", jobs.length);

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "Personal Portfolio",
        description: "Build your personal portfolio website",
        difficultyLevel: 1,
        createdBy: users[0].id,
        type: "INDIVIDUAL",
      },
    }),
    prisma.project.create({
      data: {
        name: "E-commerce Platform",
        description: "Full-stack e-commerce application",
        difficultyLevel: 3,
        createdBy: users[2].id,
        type: "TEAM",
      },
    }),
    prisma.project.create({
      data: {
        name: "AI Chatbot",
        description: "Build an AI-powered chatbot",
        difficultyLevel: 4,
        createdBy: users[2].id,
        type: "TEAM",
      },
    }),
  ]);

  console.log("Created projects:", projects.length);

  // Create project assignments
  await prisma.projectAssignment.createMany({
    data: [
      { projectId: projects[0].id, userId: users[0].id, role: "Developer", performanceScore: 85, completed: true },
      { projectId: projects[1].id, userId: users[0].id, role: "Frontend Lead", performanceScore: 72, completed: false },
      { projectId: projects[1].id, userId: users[1].id, role: "Backend Developer", performanceScore: 68, completed: false },
    ],
  });

  console.log("Created project assignments");

  // Create notifications
  await prisma.notification.createMany({
    data: [
      { userId: users[0].id, type: "JOB_ALERT", content: "New job matching your skills!", read: false },
      { userId: users[0].id, type: "PROJECT_UPDATE", content: "Your project was evaluated", read: true },
      { userId: users[1].id, type: "SKILL_UPDATE", content: "Your skill score has been updated", read: false },
    ],
  });

  console.log("Created notifications");

  // Create AI Agents
  await prisma.aIAgent.createMany({
    data: [
      { type: "EVALUATOR", description: "Evaluates project submissions" },
      { type: "MENTOR", description: "Provides mentorship guidance" },
      { type: "MARKET", description: "Generates market insights" },
      { type: "CAREER_COACH", description: "Career guidance and advice" },
    ],
  });

  console.log("Created AI Agents");
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
