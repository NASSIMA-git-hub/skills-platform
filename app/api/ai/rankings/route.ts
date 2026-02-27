import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/ai/rankings?skillId=xxx - Get top users for a specific skill
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skillId = searchParams.get("skillId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!skillId) {
      return NextResponse.json(
        { error: "Skill ID is required" },
        { status: 400 }
      );
    }

    const rankings = await prisma.userSkill.findMany({
      where: {
        skillId,
        score: { gt: 0 },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profilePic: true,
          },
        },
        skill: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: { score: "desc" },
      take: limit,
    });

    const rankedUsers = rankings.map((us, index) => ({
      rank: index + 1,
      userId: us.user.id,
      userName: us.user.fullName,
      userPic: us.user.profilePic,
      score: us.score,
      level: us.level,
      verified: us.verified,
    }));

    return NextResponse.json({ rankings: rankedUsers });
  } catch (error) {
    console.error("Get rankings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
