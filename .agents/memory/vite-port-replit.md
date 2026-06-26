---
name: Port Vite dans Replit
description: Configuration du port Vite pour que les workflows Replit démarrent correctement
---

## Règle
Toujours configurer Vite pour lire le PORT depuis la variable d'environnement.

## Pourquoi
Replit assigne un port dynamique à chaque artifact via process.env.PORT. Si Vite démarre sur un port fixe (ex: 5173), le système détecte DIDNT_OPEN_A_PORT et marque le workflow FAILED.

## Configuration correcte dans vite.config.ts
```ts
server: {
  port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
  host: "0.0.0.0",
  allowedHosts: true,
},
```

## How to apply
Vérifier ce bloc dans vite.config.ts de chaque artifact Vite avant tout restart de workflow.
