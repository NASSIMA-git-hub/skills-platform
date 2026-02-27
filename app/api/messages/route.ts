import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "@/lib/middleware";

// GET /api/messages - Get user's messages
async function getMessages(req: AuthenticatedRequest) {
  const user = req.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("userId");

    if (otherUserId) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: user.userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: user.userId },
          ],
        },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ messages });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: user.userId }, { receiverId: user.userId }],
      },
      include: {
        sender: { select: { id: true, fullName: true, profilePic: true } },
        receiver: { select: { id: true, fullName: true, profilePic: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a message
async function sendMessage(req: AuthenticatedRequest) {
  const user = req.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { receiverId, content } = body;

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Receiver ID and content are required" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId: user.userId,
        receiverId,
        content,
      },
      include: {
        sender: { select: { id: true, fullName: true, profilePic: true } },
        receiver: { select: { id: true, fullName: true, profilePic: true } },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/messages - Mark message as read
async function markAsRead(req: AuthenticatedRequest) {
  const user = req.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    const message = await prisma.message.update({
      where: { id: messageId, receiverId: user.userId },
      data: { read: true },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Mark as read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = authMiddleware(getMessages);
export const POST = authMiddleware(sendMessage);
export const PUT = authMiddleware(markAsRead);
