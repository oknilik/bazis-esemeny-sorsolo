import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const participants = await prisma.participant.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(participants);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Hiba a résztvevők lekérésekor" }, { status: 500 });
  }
}

async function generateUniqueCode(): Promise<string> {
  const existing = await prisma.participant.findMany({ select: { code: true } });
  const usedCodes = new Set(existing.map((p) => p.code));
  let code: string;
  do {
    code = String(Math.floor(100 + Math.random() * 900));
  } while (usedCodes.has(code));
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email } = body as { name?: string; email?: string };

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "A név megadása kötelező" }, { status: 400 });
    }

    const code = await generateUniqueCode();

    const participant = await prisma.participant.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        code,
      },
    });

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Hiba a regisztrációkor" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.participant.deleteMany();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Hiba a törléskor" }, { status: 500 });
  }
}
