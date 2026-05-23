import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const DEFAULT_RESTAURANTS = [
  {id:1,name:"Le Petit Baobab",cuisine:"Sénégalaise",desc_fr:"Cuisine traditionnelle sénégalaise au cœur de Dakar",desc_en:"Traditional Senegalese cuisine in the heart of Dakar",desc_es:"Cocina tradicional senegalesa",photo:"",price_range:"$$",rating:5,address:"Plateau, Dakar",hours:"12h-23h",whatsapp:"221774188107",active:true},
  {id:2,name:"Chez Lamine",cuisine:"Grillades",desc_fr:"Grillades et fruits de mer frais",desc_en:"Fresh grilled seafood",desc_es:"Mariscos y parrillas frescas",photo:"",price_range:"$$$",rating:5,address:"Île de Gorée",hours:"11h-22h",whatsapp:"221774188107",active:true},
];

const DEFAULT_HOTELS = [
  {id:1,name:"Hôtel Gorée Saly",type:"Hôtel",desc_fr:"Vue panoramique sur l'océan Atlantique",desc_en:"Panoramic view of the Atlantic Ocean",desc_es:"Vista panorámica del Océano Atlántico",photo:"",rating:5,rooms:24,price_night:85000,address:"Saly, Thiès",amenities:["WiFi","Piscine","Clim"],whatsapp:"221774188107",booking_link:"",active:true},
  {id:2,name:"Villa Baobab",type:"Villa",desc_fr:"Villa de luxe au coeur de Dakar",desc_en:"Luxury villa in the heart of Dakar",desc_es:"Villa de lujo en el corazón de Dakar",photo:"",rating:5,rooms:8,price_night:120000,address:"Almadies, Dakar",amenities:["WiFi","Piscine","Clim","Parking"],whatsapp:"221774188107",booking_link:"",active:true},
];

const DEFAULT_ACTIVITIES = [
  {id:1,name_fr:"Balade en Pirogue",name_en:"Pirogue Ride",name_es:"Paseo en Piragua",category:"Sport nautique",desc_fr:"Exploration des côtes en pirogue traditionnelle",desc_en:"Coastal exploration by traditional pirogue",desc_es:"Exploración costera en piragua tradicional",photo:"",duration:"2h",price:8000,min_participants:2,location:"Île de Gorée",active:true},
  {id:2,name_fr:"Cours de Cuisine",name_en:"Cooking Class",name_es:"Clase de Cocina",category:"Culturel",desc_fr:"Apprenez à cuisiner le thiéboudienne",desc_en:"Learn to cook thiéboudienne",desc_es:"Aprende a cocinar thiéboudienne",photo:"",duration:"3h",price:12000,min_participants:1,location:"Dakar",active:true},
  {id:3,name_fr:"Visite Gorée",name_en:"Gorée Island Tour",name_es:"Visita a Gorée",category:"Culturel",desc_fr:"Découverte de l'île historique de Gorée",desc_en:"Discover the historic island of Gorée",desc_es:"Descubre la histórica isla de Gorée",photo:"",duration:"4h",price:15000,min_participants:1,location:"Île de Gorée",active:true},
];

const DEFAULT_TRANSPORT = [
  {id:1,name:"Toyota HiAce",category:"Minibus",desc_fr:"Minibus climatisé 12 places",desc_en:"Air-conditioned 12-seat minibus",desc_es:"Minibús climatizado de 12 plazas",photo:"",seats:12,aircon:true,driver_included:true,price_day:80000,price_half:45000,active:true},
  {id:2,name:"4x4 Land Cruiser",category:"SUV",desc_fr:"Véhicule tout-terrain pour les aventures",desc_en:"Off-road vehicle for adventures",desc_es:"Vehículo todoterreno para aventuras",photo:"",seats:7,aircon:true,driver_included:true,price_day:120000,price_half:65000,active:true},
];

const DEFAULT_MENU = [
  {id:1,name_fr:"Thiéboudienne",name_en:"Rice & Fish",name_es:"Arroz con Pescado",category:"Plat principal",desc_fr:"Le plat national sénégalais",desc_en:"The Senegalese national dish",desc_es:"El plato nacional senegalés",photo:"",price:3500,prep_time:30,spice_level:"Moyen",available:true},
  {id:2,name_fr:"Yassa Poulet",name_en:"Chicken Yassa",name_es:"Pollo Yassa",category:"Plat principal",desc_fr:"Poulet mariné au citron et oignons",desc_en:"Chicken marinated in lemon and onions",desc_es:"Pollo marinado en limón y cebollas",photo:"",price:3000,prep_time:25,spice_level:"Moyen",available:true},
  {id:3,name_fr:"Bissap",name_en:"Bissap Juice",name_es:"Jugo de Bissap",category:"Boisson",desc_fr:"Jus d'hibiscus frais",desc_en:"Fresh hibiscus juice",desc_es:"Jugo fresco de hibisco",photo:"",price:700,prep_time:2,spice_level:"Doux",available:true},
];

export function useSupabaseData<T>(
  table: string,
  defaults: T[],
  filter?: { column: string; value: any }
) {
  // ✅ Toujours initialiser avec les defaults — jamais de tableau vide
  const [data, setData] = useState<T[]>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        let query = supabase.from(table).select("*");
        if (filter) query = query.eq(filter.column, filter.value);
        const { data: rows, error } = await query;
        // ✅ On remplace les defaults SEULEMENT si Supabase retourne des données
        if (!error && rows && rows.length > 0) {
          setData(rows as T[]);
        }
        // ✅ Si vide ou erreur → on garde les defaults (déjà en state)
      } catch {
        // ✅ Erreur réseau → on garde les defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [table]);

  return { data, loading };
}

export {
  DEFAULT_RESTAURANTS,
  DEFAULT_HOTELS,
  DEFAULT_ACTIVITIES,
  DEFAULT_TRANSPORT,
  DEFAULT_MENU,
};
