import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "@/lib/middleware";

async function getCurrentUser(req: AuthenticatedRequest) {
  const user = req.user;

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      profilePic: true,
      createdAt: true,
      updatedAt: true,
      skills: {
        include: {
          skill: true,
        },
      },
      _count: {
        select: {
          projects: true,
          applications: true,
          notifications: true,
        },
      },
    },
  });

  if (!dbUser) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ user: dbUser });
}

export const GET = authMiddleware(getCurrentUser);
