# Sama Sénégal

Plateforme de tourisme au Sénégal (hébergements, restaurants, transport, activités, événements, destinations), avec espace client, dashboards prestataires/staff, et dashboard DG (direction).

## Run & Operate
- `cd artifacts/sama-senegal && pnpm dev` — lance l'app (Vite, port 5173)
- `cd artifacts/sama-senegal && pnpm typecheck` — vérifie les erreurs TypeScript

## Stack
- Vite + React + TypeScript + wouter (routing) — PAS Next.js
- Supabase (auth + base de données) — PAS Prisma/Postgres direct
- Tailwind CSS, Radix UI (shadcn), Framer Motion
- Paiements : PayTech (Orange Money, Wave)

## Où sont les choses
- `artifacts/sama-senegal/src/pages/DG.tsx` — dashboard direction générale
- `artifacts/sama-senegal/src/components/AdminDashboard.tsx` + `components/admin/*` — back-office
- `artifacts/sama-senegal/src/lib/auth.tsx` — logique de rôles (client | staff:[guide,chauffeur,restaurant,hotel,commercial] | superadmin | dg)
- `artifacts/sama-senegal/src/lib/supabase.ts` — client Supabase

## Gotchas
- SEUL `artifacts/sama-senegal/` est le vrai projet. Ne pas créer de nouveau projet Next.js/Prisma en parallèle — voir `_archive/` pour les tentatives précédentes abandonnées.
- Toujours lancer `pnpm typecheck` avant de committer — le build a déjà cassé plusieurs fois après des correctifs ciblés au perl/sed.
