import { PrismaClient } from "@prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString =
    process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL vagy DIRECT_DATABASE_URL környezeti változó nincs beállítva"
    );
  }

  // PrismaNeonHTTP v6+ a connection stringet várja közvetlenül (nem a neon() függvényt)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new (PrismaNeonHTTP as any)(connectionString);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
