import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const eligible = await prisma.participant.findMany({
      where: { isWinner: false },
    });

    if (eligible.length === 0) {
      return NextResponse.json(
        { error: "Nincs résztvevő a sorsoláshoz" },
        { status: 400 }
      );
    }

    const randomIndex = Math.floor(Math.random() * eligible.length);
    const winner = eligible[randomIndex];

    const winnerCount = await prisma.participant.count({ where: { isWinner: true } });

    const updated = await prisma.participant.update({
      where: { id: winner.id },
      data: {
        isWinner: true,
        wonAt: new Date(),
        drawOrder: winnerCount + 1,
      },
    });

    // Töröljük az összes nem-nyertes résztvevőt
    await prisma.participant.deleteMany({
      where: { isWinner: false },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Hiba a sorsoláskor" }, { status: 500 });
  }
}
