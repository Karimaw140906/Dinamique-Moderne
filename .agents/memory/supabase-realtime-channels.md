---
name: Supabase Realtime channels
description: Contrainte de nommage des canaux Realtime lorsque plusieurs instances d'un hook coexistent.
---

Les canaux Supabase Realtime ne doivent pas partager le même nom lorsque plusieurs instances d'un hook configurent des callbacks `postgres_changes`. Une seconde instance qui récupère le canal déjà abonné peut échouer avec « cannot add callbacks ... after subscribe() ».

**Why:** La homepage peut monter plusieurs instances du même hook pour une même ressource, par exemple le Hero et une section de catalogue. Supabase réutilise alors le canal nommé et refuse l'ajout tardif de callbacks.

**How to apply:** Générer un identifiant stable par instance de hook, l'inclure dans le nom du canal, et conserver le cleanup via `removeChannel` dans l'effet.