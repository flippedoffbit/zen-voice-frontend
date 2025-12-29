Dev: Add default admin seed and DB reset instructions (backend patch)

Goal

Create a simple, safe dev-only way to seed a default admin user and nuke/reset the development database.

Design choices (least friction):
- Add a Prisma seed script to the backend that upserts an admin user (reads env vars for email & password). This is the least-friction, standard approach for Prisma based backends.
- Add npm scripts in the backend for `db:nuke` (prisma migrate reset --force) and `db:seed:admin` (node prisma/seed-admin.js).
- Add an optional dev-only HTTP endpoint `/testing/seed-admin` guarded by `NODE_ENV !== 'production'` and `DEV_SEED_SECRET` so CI or other tools can call it without having shell access.
- Document how to nuke and re-seed locally.

Backend patch (example files to add)

1) `prisma/seed-admin.ts` (TypeScript) — upsert admin user

```ts
// prisma/seed-admin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main () {
  const email = process.env.DEV_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.DEV_ADMIN_PASSWORD || 'admin1234';

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hash,
      role: 'SYSTEM_ADMIN',
      displayName: process.env.DEV_ADMIN_DISPLAYNAME || 'Admin',
      emailVerified: true,
    },
    create: {
      email,
      passwordHash: hash,
      role: 'SYSTEM_ADMIN',
      displayName: process.env.DEV_ADMIN_DISPLAYNAME || 'Admin',
      emailVerified: true,
    }
  });

  console.log('Seeded admin user:', user.id, user.email);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
```

If the backend is JS-only, add the compiled `prisma/seed-admin.js` or run via `ts-node`.

2) package.json scripts (backend)

```json
{
  "scripts": {
     "db:nuke": "prisma migrate reset --force",
     "db:seed:admin": "ts-node prisma/seed-admin.ts"
  }
}
```

3) Optional dev-only endpoint (safe guard):

- Add `src/routes/testing.ts`

```ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = express.Router();
const prisma = new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  router.post('/seed-admin', async (req, res) => {
    const secret = req.headers['x-dev-secret'] || req.query.secret;
    if (!process.env.DEV_SEED_SECRET || secret !== process.env.DEV_SEED_SECRET) return res.status(403).json({ error: 'Forbidden' });

    const { email = process.env.DEV_ADMIN_EMAIL || 'admin@example.com', password = process.env.DEV_ADMIN_PASSWORD || 'admin1234', displayName = process.env.DEV_ADMIN_DISPLAYNAME || 'Admin' } = req.body || {};

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: hash, role: 'SYSTEM_ADMIN', displayName, emailVerified: true },
      create: { email, passwordHash: hash, role: 'SYSTEM_ADMIN', displayName, emailVerified: true }
    });

    return res.json({ user });
  });
}

export default router;
```

- Mount it in your dev server startup only when not in production.

Commands to run locally (example)

1) Nuke DB (dangerous, development only)

- In backend repo:

```
# WARNING: this will drop data in your dev DB
npm run db:nuke
```

2) Seed admin

```
DEV_ADMIN_EMAIL=admin@example.com DEV_ADMIN_PASSWORD=admin1234 npm run db:seed:admin
```

Or, if you added the HTTP route, while backend is running in dev:

```
curl -X POST http://localhost:3000/testing/seed-admin -H "x-dev-secret: ${DEV_SEED_SECRET}" -d '{"email":"admin@example.com","password":"admin1234"}' -H 'Content-Type: application/json'
```

3) Quick flow: nuke + seed

```
# in backend repo
DEV_ADMIN_EMAIL=admin@example.com DEV_ADMIN_PASSWORD=admin1234 npm run db:nuke && npm run db:seed:admin
```

CI notes

- Only enable the HTTP seed route in non-production environments.
- Use `DEV_SEED_SECRET` to protect the route if you plan to call it from automation.

Acceptance test (dev)

1. Nuke DB
2. Run `npm run db:seed:admin` (or call seed endpoint)
3. Start backend
4. Login with `admin@example.com` via existing OTP flow (or local dev password flow) and assert the user has role `SYSTEM_ADMIN` and is authorized to admin actions.


If you want, I can:
- prepare a patch (diff) / PR text you can apply to the backend repo, or
- add a helper script here that runs these commands against a specified backend directory automatically.  

Tell me which you prefer (I recommend the backend Prisma seed + optional dev HTTP route).