import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/companies - List all companies
export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        jobOpenings: {
          select: { id: true },
        },
        _count: {
          select: { jobOpenings: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error("Get companies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/companies - Create a new company
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, industry, website } = body;

    if (!name || !industry) {
      return NextResponse.json(
        { error: "Name and industry are required" },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        industry,
        website,
      },
    });

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    console.error("Create company error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
