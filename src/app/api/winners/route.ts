import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const winners = await prisma.participant.findMany({
      where: { isWinner: true },
      orderBy: { drawOrder: "asc" },
    });
    return NextResponse.json(winners);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Hiba a nyertesek lekérésekor" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.participant.updateMany({
      data: {
        isWinner: false,
        wonAt: null,
        drawOrder: null,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Hiba a nyerteslista törlésekor" }, { status: 500 });
  }
}
