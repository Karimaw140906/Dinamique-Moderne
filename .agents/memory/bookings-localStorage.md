---
name: Réservations dans localStorage
description: Toute la chaîne réservation (Booking form → ReservationsAdmin → ClientDashboard) utilise localStorage "bookings"
---

## Règle
La clé `bookings` du localStorage est la source de vérité pour toutes les réservations.

## Champs stockés par Booking.tsx
`ref, name, email, phone, people, date, time, services[], extra, status, service_type, service_name, created_at`

## Normalisation dans ReservationsAdmin
Les bookings publics (champs `name`, `phone`, `email`) sont normalisés en `client_name`, `client_phone`, `client_email` au chargement dans `loadBookings()`.

## Lookup dans ClientDashboard
`loadClientBookings(whatsapp, email)` filtre par correspondance souple sur `phone/client_phone` ou `email/client_email`.

## Événement
`window.dispatchEvent(new Event("bookingsUpdated"))` après tout write.
Stats.tsx et ReservationsAdmin écoutent cet événement.

## Messages (messagerie interne)
Clé localStorage: `messages` — champs: `id, from_user, to_user, content, read, created_at`
Événement: `messagesUpdated`
