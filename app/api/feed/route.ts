import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware, AuthenticatedRequest } from "@/lib/middleware";

// GET /api/feed - Get feed posts
async function getFeed(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const posts = await prisma.feedPost.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Get feed error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/feed - Create a feed post
async function createPost(req: AuthenticatedRequest) {
  const user = req.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, content, imageUrl, tags } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
    });

    const post = await prisma.feedPost.create({
      data: {
        authorId: user.userId,
        authorName: userData?.fullName || "Anonymous",
        authorPic: userData?.profilePic,
        title,
        content,
        imageUrl,
        tags: tags || [],
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/feed - Like a post
async function likePost(req: AuthenticatedRequest) {
  const user = req.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const post = await prisma.feedPost.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Like post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = getFeed;
export const POST = authMiddleware(createPost);
export const PUT = authMiddleware(likePost);
