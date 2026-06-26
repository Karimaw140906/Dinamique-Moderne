---
name: Hook dans renderForm (CrudSection)
description: Pattern anti-hookillégal pour les formulaires admin passés à CrudSection via renderForm
---

## Règle
Ne jamais appeler un hook React (useRef, useState, usePhotoUpload, etc.) à l'intérieur d'une fonction `renderForm` passée en prop à CrudSection.

## Pourquoi
CrudSection appelle `renderForm(item, onChange)` comme une fonction ordinaire dans son render — React ne considère pas ce contexte comme un composant React. Les hooks appelés là violent les Rules of Hooks et crashent avec "Rendered more hooks than during the previous render."

## Solution correcte
Créer un sous-composant nommé (ex: `TourForm`, `GuideForm`, `HotelForm`) défini EN DEHORS du composant parent avec `function XxxForm({ item, onChange }) { ... }`, puis `renderForm` ne fait que retourner `<XxxForm item={item} onChange={onChange} />`.

## Fichiers corrigés avec ce pattern
- ToursAdmin.tsx → TourForm
- GuidesAdmin.tsx → GuideForm
- HotelsAdmin.tsx → HotelForm
- RestaurantsAdmin.tsx → RestaurantForm
- TransportAdmin.tsx → TransportForm
- MenuAdmin.tsx → MenuForm
- ActivitiesAdmin.tsx → ActivityForm
