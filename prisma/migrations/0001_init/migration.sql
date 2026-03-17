-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "wonAt" TIMESTAMP(3),
    "drawOrder" INTEGER,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);
