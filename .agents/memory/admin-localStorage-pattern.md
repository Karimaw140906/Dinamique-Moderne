---
name: Pattern localStorage pour les modules admin
description: Architecture des données admin — localStorage, pas Supabase
---

## Règle
Tous les modules admin de Sama Senegal utilisent localStorage comme source de vérité, pas Supabase.

## Pourquoi
Supabase n'est pas connecté/configuré dans ce projet. Les anciennes implémentations (HotelsAdmin, RestaurantsAdmin, TransportAdmin) appelaient Supabase et affichaient "Chargement..." indéfiniment.

## Clés localStorage par module
- Tours → `toursData` / événement `toursDataUpdated`
- Guides → `guidesData` / événement `guidesDataUpdated`
- Hôtels → `hotelsData` / événement `hotelsDataUpdated`
- Restaurants → `restaurantsData` / événement `restaurantsDataUpdated`
- Transport → `transportData` / événement `transportDataUpdated`
- Activités → `activitiesData` / événement `activitiesDataUpdated`
- Menu → `menuData` / événement `menuDataUpdated`
- Sections config → `sectionsConfig` / événement `sectionsConfigUpdated`
- Staff → `staffAccounts`
- Réservations → `bookings`

## Pattern standard
```ts
useEffect(() => {
  const saved = localStorage.getItem("xxxData");
  if (saved) { try { setItems(JSON.parse(saved)); } catch { setItems(DEFAULT_DATA); } }
  else { setItems(DEFAULT_DATA); }
}, []);
const saveItems = (newItems: any[]) => {
  setItems(newItems);
  localStorage.setItem("xxxData", JSON.stringify(newItems));
  window.dispatchEvent(new Event("xxxDataUpdated"));
};
```
