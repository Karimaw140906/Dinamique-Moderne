export const DEFAULT_RESTAURANTS = [
  {id:1,name:"Le Petit Baobab",cuisine:"Sénégalaise",descFR:"Cuisine traditionnelle sénégalaise au cœur de Dakar",descEN:"Traditional Senegalese cuisine in the heart of Dakar",descES:"Cocina tradicional senegalesa en el corazón de Dakar",photo:"",priceRange:"$$",rating:5,address:"Plateau, Dakar",hours:"12h-23h",whatsapp:"221774188107",active:true},
  {id:2,name:"Chez Lamine",cuisine:"Grillades",descFR":"Grillades et fruits de mer frais",descEN":"Fresh grilled seafood",descES":"Mariscos y parrillas frescas",photo:"",priceRange:"$$$",rating:5,address:"Île de Gorée",hours:"11h-22h",whatsapp:"221774188107",active:true}
];

export const DEFAULT_HOTELS = [
  {id:1,name:"Hôtel Gorée Saly",type:"Hôtel",descFR:"Vue panoramique sur l'océan Atlantique",descEN:"Panoramic view of the Atlantic Ocean",descES:"Vista panorámica del Océano Atlántico",photo:"",rating:5,rooms:24,priceNight:85000,address:"Saly, Thiès",amenities:["WiFi","Piscine","Clim"],whatsapp:"221774188107",bookingLink:"",active:true}
];

export const DEFAULT_ACTIVITIES = [
  {id:1,nameFR:"Balade en Pirogue",nameEN:"Pirogue Ride",nameES:"Paseo en Piragua",category:"Sport nautique",descFR:"Exploration des côtes en pirogue traditionnelle",descEN:"Coastal exploration by traditional pirogue",descES:"Exploración costera en piragua tradicional",photo:"",duration:"2h",price:8000,minParticipants:2,location:"Île de Gorée",active:true},
  {id:2,nameFR:"Cours de Cuisine",nameEN:"Cooking Class",nameES:"Clase de Cocina",category:"Culturel",descFR:"Apprenez à cuisiner le thiéboudienne",descEN:"Learn to cook thiéboudienne",descES:"Aprende a cocinar thiéboudienne",photo:"",duration:"3h",price:12000,minParticipants:1,location:"Dakar",active:true}
];

export const DEFAULT_TRANSPORT = [
  {id:1,name:"Toyota HiAce",category:"Minibus",descFR:"Minibus climatisé 12 places idéal pour les groupes",descEN:"Air-conditioned 12-seat minibus",descES:"Minibús climatizado de 12 plazas",photo:"",seats:12,aircon:true,driverIncluded:true,priceDay:80000,priceHalf:45000,active:true},
  {id:2,name:"4x4 Land Cruiser",category:"SUV",descFR:"Véhicule tout-terrain pour les aventures",descEN:"Off-road vehicle for adventures",descES:"Vehículo todoterreno para aventuras",photo:"",seats:7,aircon:true,driverIncluded:true,priceDay:120000,priceHalf:65000,active:true}
];

export const DEFAULT_MENU = [
  {id:1,nameFR:"Thiéboudienne",nameEN:"Rice & Fish",nameES:"Arroz con Pescado",category:"Plat principal",descFR:"Le plat national sénégalais",descEN:"The Senegalese national dish",descES:"El plato nacional senegalés",photo:"",price:3500,prepTime:30,spiceLevel:"Moyen",available:true},
  {id:2,nameFR:"Yassa Poulet",nameEN:"Chicken Yassa",nameES:"Pollo Yassa",category:"Plat principal",descFR:"Poulet mariné au citron et oignons",descEN:"Chicken marinated in lemon and onions",descES:"Pollo marinado en limón y cebollas",photo:"",price:3000,prepTime:25,spiceLevel:"Moyen",available:true}
];

export function initDefaultData() {
  const keys = [
    ["restaurantsData", DEFAULT_RESTAURANTS],
    ["hotelsData", DEFAULT_HOTELS],
    ["activitiesData", DEFAULT_ACTIVITIES],
    ["transportData", DEFAULT_TRANSPORT],
    ["menuData", DEFAULT_MENU],
  ] as const;

  keys.forEach(([key, defaults]) => {
    const existing = localStorage.getItem(key);
    if (!existing) {
      localStorage.setItem(key, JSON.stringify(defaults));
    }
  });
}
