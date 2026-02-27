import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateToken } from "@/lib/auth";

// GET /api/auth/google - Initiate Google OAuth
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/google/callback`;
    
    if (!clientId) {
      return NextResponse.json(
        { error: "Google OAuth not configured" },
        { status: 500 }
      );
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&access_type=offline`;
    
    return NextResponse.redirect(authUrl);
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.json(
        { error: "Failed to exchange code for token" },
        { status: 400 }
      );
    }

    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const googleUser = await userResponse.json();

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: googleUser.email },
          { oauthId: googleUser.id, oauthProvider: "google" },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName: googleUser.name,
          email: googleUser.email,
          profilePic: googleUser.picture,
          oauthProvider: "google",
          oauthId: googleUser.id,
          role: "STUDENT",
        },
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/?token=${token}&user=${encodeURIComponent(
        JSON.stringify({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        })
      )}`
    );
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
