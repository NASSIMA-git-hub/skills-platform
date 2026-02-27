import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "@/lib/middleware";

// GET /api/applications - Get user's applications
async function getApplications(req: AuthenticatedRequest) {
  const user = req.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const applications = await prisma.application.findMany({
      where: { userId: user.userId },
      include: {
        job: {
          include: { company: true },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Get applications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function applyToJob(req: AuthenticatedRequest) {
  const user = req.user;

  if (!user || user.role === "COMPANY") {
    return NextResponse.json(
      { error: "Unauthorized: Only students can apply" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const job = await prisma.jobOpening.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        userId: user.userId,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "Already applied to this job" },
        { status: 409 }
      );
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        userId: user.userId,
      },
      include: {
        job: {
          include: { company: true },
        },
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("Apply to job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = authMiddleware(getApplications);
export const POST = authMiddleware(applyToJob);
