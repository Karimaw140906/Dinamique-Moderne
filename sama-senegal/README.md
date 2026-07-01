# Sama Senegal — Scaffold produit

Ce scaffold a été généré automatiquement à partir de la cartographie produit complète.

## Structure
- `apps/web` — Frontend Next.js (toutes les pages/routes de la cartographie)
- `apps/api` — Backend (modules par domaine métier)
- `packages/ui` — Composants du design system
- `packages/types` — Types partagés
- `docs/` — Documentation produit (sitemap, parcours utilisateurs, structure Home, architecture technique)

## Vérification
1. Parcourir `docs/01-sitemap.md` pour valider l'exhaustivité des pages
2. Parcourir `apps/web/app` pour vérifier que chaque route existe bien en tant que fichier
3. Parcourir `apps/api/src/modules` pour vérifier les domaines métier
4. Parcourir `packages/ui/components` pour la base du design system

## Prochaines étapes
- Remplacer les placeholders de pages par les vrais composants
- Connecter les modules API à une vraie base de données
- Définir les design tokens (couleurs, typographie, spacing) dans `packages/config`
