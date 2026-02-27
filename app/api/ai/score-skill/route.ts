import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "@/lib/middleware";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/ai/score-skill - AI scores a user's skill
async function scoreSkill(req: AuthenticatedRequest) {
  const user = req.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { skillId, workUrl, description, experience } = body;

    if (!skillId) {
      return NextResponse.json(
        { error: "Skill ID is required" },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const prompt = `You are an expert evaluator assessing a user's skill level in ${skill.name}.

Skill Category: ${skill.category}
Skill Difficulty Level: ${skill.difficultyLevel}/5

User's submission:
- Description: ${description || "No description provided"}
- Work/Portfolio URL: ${workUrl || "No URL provided"}
- Years of Experience: ${experience || "Not specified"}

Evaluate this user's skill level and return a JSON response:
{
  "score": number (0-100),
  "level": number (1-5),
  "verified": boolean,
  "strengths": string[] (2-4 areas of strength),
  "areasForImprovement": string[] (2-4 areas to improve),
  "recommendation": string (brief recommendation)
}

Be strict but fair. Only set verified to true if there's strong evidence of proficiency.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert skill evaluator. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    // Update or create user skill
    const userSkill = await prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: user.userId,
          skillId,
        },
      },
      update: {
        score: result.score,
        level: result.level,
        verified: result.verified || false,
      },
      create: {
        userId: user.userId,
        skillId,
        score: result.score,
        level: result.level,
        verified: result.verified || false,
      },
      include: { skill: true },
    });

    return NextResponse.json({
      userSkill,
      evaluation: {
        strengths: result.strengths,
        areasForImprovement: result.areasForImprovement,
        recommendation: result.recommendation,
      },
    });
  } catch (error) {
    console.error("Score skill error:", error);
    return NextResponse.json(
      { error: "Failed to score skill. Check API key." },
      { status: 500 }
    );
  }
}

export const POST = authMiddleware(scoreSkill);
