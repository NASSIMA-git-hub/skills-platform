import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "@/lib/middleware";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ProjectEvaluationInput {
  projectId: string;
  projectDescription: string;
  projectCode?: string;
  projectUrl?: string;
}

interface EvaluationResult {
  performanceScore: number;
  difficultyLevelMatched: boolean;
  skillImprovementSuggestions: string[];
  productionReadinessLevel: "EXCELLENT" | "GOOD" | "NEEDS_WORK" | "BEGINNER";
  strengths: string[];
  weaknesses: string[];
}

// POST /api/ai/evaluate-project - AI evaluates a project
async function evaluateProject(req: AuthenticatedRequest) {
  const user = req.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { projectId, projectDescription, projectCode, projectUrl } = body as ProjectEvaluationInput;

    if (!projectId || !projectDescription) {
      return NextResponse.json(
        { error: "Project ID and description are required" },
        { status: 400 }
      );
    }

    const userSkills = await prisma.userSkill.findMany({
      where: { userId: user.userId },
      include: { skill: true },
    });

    const prompt = `You are an expert software engineer evaluating a project submission.

User Skills:
${userSkills.map(s => `- ${s.skill.name}: Level ${s.level}, Score ${s.score}`).join('\n')}

Project Description:
${projectDescription}

${projectCode ? `Project Code:\n${projectCode.slice(0, 2000)}` : ''}
${projectUrl ? `Project URL: ${projectUrl}` : ''}

Evaluate this project and return a JSON response with:
{
  "performanceScore": number (0-100),
  "difficultyLevelMatched": boolean,
  "skillImprovementSuggestions": string[] (3-5 specific suggestions),
  "productionReadinessLevel": "EXCELLENT" | "GOOD" | "NEEDS_WORK" | "BEGINNER",
  "strengths": string[] (2-4 strengths),
  "weaknesses": string[] (2-4 weaknesses)
}

Be strict but fair in your evaluation.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert code reviewer and project evaluator. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}") as EvaluationResult;

    // Update project assignment with evaluation result
    const assignment = await prisma.projectAssignment.findFirst({
      where: {
        projectId,
        userId: user.userId,
      },
    });

    if (assignment) {
      await prisma.projectAssignment.update({
        where: { id: assignment.id },
        data: {
          performanceScore: result.performanceScore,
          completed: result.productionReadinessLevel !== "BEGINNER",
          completedAt: result.productionReadinessLevel !== "BEGINNER" ? new Date() : null,
        },
      });
    }

    return NextResponse.json({ evaluation: result });
  } catch (error) {
    console.error("Project evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate project. Check API key." },
      { status: 500 }
    );
  }
}

export const POST = authMiddleware(evaluateProject);
