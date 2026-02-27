import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/skills - List all skills
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where = category ? { category } : {};

    const skills = await prisma.skill.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Get skills error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/skills - Create a new skill (admin only in future)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, difficultyLevel = 1 } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.create({
      data: {
        name,
        category,
        difficultyLevel,
      },
    });

    return NextResponse.json({ skill }, { status: 201 });
  } catch (error) {
    console.error("Create skill error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
