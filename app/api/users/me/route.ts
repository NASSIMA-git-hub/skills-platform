import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "@/lib/middleware";

// GET /api/users/me - Get current user
async function getCurrentUser(req: AuthenticatedRequest) {
  const user = req.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        skills: {
          include: { skill: true },
        },
        _count: {
          select: {
            projects: true,
            applications: true,
            notifications: { where: { read: false } },
          },
        },
      },
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      user: {
        id: userData.id,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
        profilePic: userData.profilePic,
        createdAt: userData.createdAt,
        skills: userData.skills,
        _count: {
          projects: userData._count.projects,
          applications: userData._count.applications,
          notifications: userData._count.notifications,
        },
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function updateUser(req: AuthenticatedRequest) {
  const user = req.user;

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { fullName, profilePic } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        ...(fullName && { fullName }),
        ...(profilePic && { profilePic }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        profilePic: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = authMiddleware(getCurrentUser);
export const PUT = authMiddleware(updateUser);
