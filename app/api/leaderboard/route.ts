import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "@/lib/middleware";

// GET /api/leaderboard - Get global or skill leaderboard
async function getLeaderboard(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skillId = searchParams.get("skillId");
    const period = searchParams.get("period") || "ALL_TIME";

    if (skillId) {
      const userSkills = await prisma.userSkill.findMany({
        where: { skillId },
        include: {
          user: {
            select: { id: true, fullName: true, profilePic: true },
          },
        },
        orderBy: { score: "desc" },
        take: 50,
      });

      const rankings = userSkills.map((us, index) => ({
        rank: index + 1,
        userId: us.user.id,
        userName: us.user.fullName,
        userPic: us.user.profilePic,
        score: us.score,
        level: us.level,
        verified: us.verified,
      }));

      return NextResponse.json({ rankings });
    }

    const users = await prisma.user.findMany({
      include: {
        skills: true,
        _count: {
          select: {
            projects: { where: { completed: true } },
          },
        },
      },
    });

    const leaderboard = users
      .map((user) => {
        const avgScore =
          user.skills.length > 0
            ? user.skills.reduce((acc, s) => acc + s.score, 0) / user.skills.length
            : 0;
        const totalProjects = user._count.projects;
        const verifiedSkills = user.skills.filter((s) => s.verified).length;

        return {
          userId: user.id,
          userName: user.fullName,
          userPic: user.profilePic,
          avgScore: Math.round(avgScore),
          totalProjects,
          verifiedSkills,
          totalSkills: user.skills.length,
        };
      })
      .sort((a, b) => {
        if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
        return b.verifiedSkills - a.verifiedSkills;
      })
      .slice(0, 50)
      .map((u, i) => ({ ...u, rank: i + 1 }));

    return NextResponse.json({ rankings: leaderboard });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = getLeaderboard;
