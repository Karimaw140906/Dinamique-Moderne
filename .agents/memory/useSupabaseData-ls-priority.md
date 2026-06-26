---
name: useSupabaseData priorité localStorage
description: Le hook useSupabaseData lit localStorage d'abord, puis Supabase, puis les defaults hardcodés
---

## Règle
`useSupabaseData` donne toujours priorité à localStorage pour toutes les tables mappées dans LS_MAP.

## Pourquoi
Le projet n'a pas Supabase configuré. Les admins éditent via localStorage (hotelsData, restaurantsData, etc.). Les sections publiques doivent refléter ces changements en temps réel sans rechargement.

## Architecture dans useSupabaseData.ts
- `LS_MAP` mappe table Supabase → `{ key: string, event: string }` (ex: "hotels" → `{ key: "hotelsData", event: "hotelsDataUpdated" }`)
- `readLocalStorage()` parse, normalise les champs (normalize()), filtre par `filter` prop
- `getInitial()` est appelé comme initial state pour éviter flash de defaults
- Un `useEffect` écoute `entry.event` pour re-render quand l'admin modifie

## Fonction normalize()
Normalise les deux conventions de nommage (camelCase admin vs snake_case Supabase):
- `name_fr ↔ nameFR`, `desc_fr ↔ descFR`
- `driver_included ↔ driverIncluded`
- `price_night ↔ priceNight`, `booking_link ↔ bookingLink`

## How to apply
Quand on ajoute un nouveau type de données admin, ajouter son entrée dans LS_MAP et s'assurer que la clé localStorage matche exactement celle utilisée dans le module admin.
