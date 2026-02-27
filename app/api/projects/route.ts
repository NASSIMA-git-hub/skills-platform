import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "@/lib/middleware";

// GET /api/projects - List all projects
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const difficulty = searchParams.get("difficulty");

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (difficulty) where.difficultyLevel = parseInt(difficulty);

    const projects = await prisma.project.findMany({
      where,
      include: {
        assignments: {
          include: {
            user: {
              select: { id: true, fullName: true, profilePic: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
async function createProject(req: AuthenticatedRequest) {
  const user = req.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, difficultyLevel = 1, type = "INDIVIDUAL" } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        difficultyLevel,
        type: type as "INDIVIDUAL" | "TEAM",
        createdBy: user.userId,
      },
      include: {
        assignments: true,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = authMiddleware(createProject);
