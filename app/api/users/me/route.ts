import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "@/lib/middleware";

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

export const PUT = authMiddleware(updateUser);
