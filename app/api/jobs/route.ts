import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "@/lib/middleware";

// GET /api/jobs - List all job openings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    const where = companyId ? { companyId } : {};

    const jobs = await prisma.jobOpening.findMany({
      where,
      include: {
        company: true,
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job opening (Company role)
async function createJob(req: AuthenticatedRequest) {
  const user = req.user;

  if (!user || user.role !== "COMPANY") {
    return NextResponse.json(
      { error: "Unauthorized: Only companies can post jobs" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      companyId,
      title,
      description,
      requiredSkills,
      minExperience = 0,
      salaryRange,
    } = body;

    if (!companyId || !title || !description) {
      return NextResponse.json(
        { error: "Company ID, title, and description are required" },
        { status: 400 }
      );
    }

    const job = await prisma.jobOpening.create({
      data: {
        companyId,
        title,
        description,
        requiredSkills: requiredSkills || [],
        minExperience,
        salaryRange: salaryRange || { min: 0, max: 0 },
      },
      include: { company: true },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = authMiddleware(createJob);
