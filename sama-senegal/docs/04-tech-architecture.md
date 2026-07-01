# Architecture technique conseillée

## Frontend
- Next.js (SSR/SSG pour SEO)
- Tailwind CSS + design tokens custom
- React Query (server state) + Zustand (UI state)
- next-intl (i18n FR/EN)
- Mapbox / Google Maps API

## Backend
- NestJS ou Laravel (REST ou GraphQL)
- PostgreSQL (relationnel, transactions, disponibilités)
- Redis (cache recherche, sessions)
- Meilisearch / Algolia (recherche instantanée)
- Stripe + Wave/Orange Money/PayDunya/CinetPay
- S3 / Cloudinary (médias)
- JWT + OAuth (Google/Facebook)
- Notifications: email + SMS + push

## Domaines API
auth, destinations, properties, activities, availability, bookings,
payments, reviews, partners, admin

## Priorité produit
Équilibre conversion/immersion, léger biais conversion.
Immersion en découverte (Home, Destination).
Conversion stricte en décision (Search → Payment).

## Complexité produit
Hybride : marketplace multi-sided + couche éditoriale forte.
