# Esemény Sorsoló

QR-kódos regisztráció és nyereményjáték alkalmazás. Next.js 14, Prisma, Neon PostgreSQL.

## Funkciók

- **QR kód generálás** – a jelenlévők telefonjukkal beszkennelve regisztrálhatnak
- **Résztvevő kezelés** – lista, manuális hozzáadás, törlés, CSV export
- **Sorsolás** – shuffle animációval, korábbi nyertesek kizárásával, nyerteslista
- **Auto-refresh** – az admin felület 4 másodpercenként frissíti a résztvevőlistát

## Helyi futtatás

```bash
# 1. Függőségek telepítése
npm install

# 2. Környezeti változók
cp .env.example .env
# Töltsd ki a .env fájlt a Neon connection string-ekkel

# 3. Adatbázis migráció
npx prisma migrate dev --name init

# 4. Fejlesztői szerver
npm run dev
```

Az alkalmazás elérhető: http://localhost:3000

- Admin felület: http://localhost:3000
- Regisztrációs oldal: http://localhost:3000/register

## Neon DB beállítása

1. Látogass el a [console.neon.tech](https://console.neon.tech) oldalra
2. Hozz létre egy új projektet
3. A "Connection Details" panelből másold ki a connection string-et
4. Illeszd be a `.env` fájlba mind `DATABASE_URL`, mind `DIRECT_DATABASE_URL` értékeként

## Vercel deploy

1. Töltsd fel a projektet GitHub-ra
2. A [vercel.com](https://vercel.com) oldalon importáld a repót
3. A "Environment Variables" szekcióban add meg:
   - `DATABASE_URL` – Neon connection string
   - `DIRECT_DATABASE_URL` – Neon connection string (azonos lehet)
4. Deploy után futtasd a migrációt:
   ```bash
   npx prisma migrate deploy
   ```

> **Megjegyzés:** Az admin felület jelenleg nem védett autentikációval. Élesben érdemes lehet valamilyen egyszerű védést (pl. Basic Auth middleware) hozzáadni.

## Projekt struktúra

```
src/
  app/
    page.tsx              # Admin felület (3 tab: QR, Résztvevők, Sorsolás)
    register/
      page.tsx            # Regisztrációs oldal (QR után)
    api/
      participants/
        route.ts          # GET, POST, DELETE /api/participants
        [id]/
          route.ts        # DELETE /api/participants/:id
      raffle/
        route.ts          # POST /api/raffle
      winners/
        route.ts          # GET, DELETE /api/winners
  lib/
    prisma.ts             # Prisma singleton (Neon serverless adapter)
prisma/
  schema.prisma           # Adatmodell
  migrations/
    0001_init/
      migration.sql       # Kezdeti migráció
```
