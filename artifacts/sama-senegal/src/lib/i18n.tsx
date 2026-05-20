import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "FR" | "EN" | "ES";

interface Dictionary {
  [key: string]: string;
}

const dictionaries: Record<Language, Dictionary> = {
  FR: {
    nav_tours: "Nos Tours",
    nav_destinations: "Destinations",
    nav_guide: "Notre Guide",
    nav_book: "Réserver",
    hero_subtitle: "La maison de l'histoire",
    hero_badge: "Guide Officiel Certifié",
    hero_book: "Réserver maintenant",
    stats_travelers: "Voyageurs satisfaits",
    stats_destinations: "Destinations",
    stats_rating: "Note moyenne",
    stats_experience: "Années d'expérience",
    tours_title: "Nos Tours",
    tours_book: "Réserver",
    destinations_title: "Nos Destinations",
    guide_role: "Guide Officiel Certifié",
    guide_bio: "Né sur l'île de Gorée, guide certifié depuis 5 ans, passionné par l'histoire et la culture sénégalaise",
    booking_title: "Réserver votre expérience",
    booking_name: "Nom complet",
    booking_email: "Email",
    booking_phone: "Téléphone (WhatsApp)",
    booking_tour: "Sélectionnez un service",
    booking_date: "Date souhaitée",
    booking_people: "Nombre de personnes",
    booking_message: "Message",
    booking_submit: "Envoyer via WhatsApp",
    footer_tagline: "L'expérience authentique du Sénégal",
    footer_rights: "Tous droits réservés.",
    
    // New Sections
    team_title: "Notre Équipe",
    transport_title: "Transport & Location",
    transport_book: "Réserver",
    transport_seats: "places",
    transport_driver: "Chauffeur inclus",
    transport_aircon: "Climatisé",
    transport_per_day: "Par jour",
    transport_per_half: "Demi-journée",
    
    restaurants_title: "Restaurants & Gastronomie",
    restaurants_contact: "Contacter",
    restaurants_hours: "Horaires",
    
    hotels_title: "Hébergements",
    hotels_book: "Réserver",
    hotels_per_night: "Par nuit",
    hotels_rooms: "chambres",
    
    food_title: "Commander un Repas",
    food_add: "Ajouter",
    food_order: "Commander via WhatsApp",
    food_cart: "Panier",
    food_total: "Total",
    food_empty: "Votre panier est vide.",
    
    activities_title: "Autres Activités",
    activities_book: "Réserver",
    activities_duration: "",
    activities_min_participants: "pers",
  },
  EN: {
    nav_tours: "Our Tours",
    nav_destinations: "Destinations",
    nav_guide: "Our Guide",
    nav_book: "Book Now",
    hero_subtitle: "The house of history",
    hero_badge: "Official Certified Guide",
    hero_book: "Book Now",
    stats_travelers: "Happy Travelers",
    stats_destinations: "Destinations",
    stats_rating: "Average Rating",
    stats_experience: "Years of Experience",
    tours_title: "Our Tours",
    tours_book: "Book",
    destinations_title: "Our Destinations",
    guide_role: "Official Certified Guide",
    guide_bio: "Born on Gorée Island, certified guide for 5 years, passionate about Senegalese history and culture",
    booking_title: "Book your experience",
    booking_name: "Full Name",
    booking_email: "Email",
    booking_phone: "Phone (WhatsApp)",
    booking_tour: "Select a service",
    booking_date: "Desired Date",
    booking_people: "Number of people",
    booking_message: "Message",
    booking_submit: "Send via WhatsApp",
    footer_tagline: "The authentic Senegalese experience",
    footer_rights: "All rights reserved.",
    
    team_title: "Our Team",
    transport_title: "Transport & Car Rental",
    transport_book: "Book",
    transport_seats: "seats",
    transport_driver: "Driver included",
    transport_aircon: "Air con",
    transport_per_day: "Per day",
    transport_per_half: "Half day",
    
    restaurants_title: "Restaurants & Gastronomy",
    restaurants_contact: "Contact",
    restaurants_hours: "Hours",
    
    hotels_title: "Accommodation",
    hotels_book: "Book",
    hotels_per_night: "Per night",
    hotels_rooms: "rooms",
    
    food_title: "Order a Meal",
    food_add: "Add",
    food_order: "Order via WhatsApp",
    food_cart: "Cart",
    food_total: "Total",
    food_empty: "Your cart is empty.",
    
    activities_title: "Other Activities",
    activities_book: "Book",
    activities_duration: "",
    activities_min_participants: "ppl",
  },
  ES: {
    nav_tours: "Nuestros Tours",
    nav_destinations: "Destinos",
    nav_guide: "Nuestro Guía",
    nav_book: "Reservar",
    hero_subtitle: "La casa de la historia",
    hero_badge: "Guía Oficial Certificado",
    hero_book: "Reservar ahora",
    stats_travelers: "Viajeros felices",
    stats_destinations: "Destinos",
    stats_rating: "Valoración media",
    stats_experience: "Años de experiencia",
    tours_title: "Nuestros Tours",
    tours_book: "Reservar",
    destinations_title: "Nuestros Destinos",
    guide_role: "Guía Oficial Certificado",
    guide_bio: "Nacido en la isla de Gorée, guía certificado desde hace 5 años, apasionado por la historia y cultura senegalesa",
    booking_title: "Reserva tu experiencia",
    booking_name: "Nombre completo",
    booking_email: "Email",
    booking_phone: "Teléfono (WhatsApp)",
    booking_tour: "Selecciona un servicio",
    booking_date: "Fecha deseada",
    booking_people: "Número de personas",
    booking_message: "Mensaje",
    booking_submit: "Enviar por WhatsApp",
    footer_tagline: "La auténtica experiencia senegalesa",
    footer_rights: "Todos los derechos reservados.",
    
    team_title: "Nuestro Equipo",
    transport_title: "Transporte y Alquiler",
    transport_book: "Reservar",
    transport_seats: "plazas",
    transport_driver: "Conductor incluido",
    transport_aircon: "Aire acond.",
    transport_per_day: "Por día",
    transport_per_half: "Medio día",
    
    restaurants_title: "Restaurantes y Gastronomía",
    restaurants_contact: "Contactar",
    restaurants_hours: "Horarios",
    
    hotels_title: "Alojamientos",
    hotels_book: "Reservar",
    hotels_per_night: "Por noche",
    hotels_rooms: "habs",
    
    food_title: "Pedir Comida",
    food_add: "Añadir",
    food_order: "Pedir por WhatsApp",
    food_cart: "Carrito",
    food_total: "Total",
    food_empty: "Tu carrito está vacío.",
    
    activities_title: "Otras Actividades",
    activities_book: "Reservar",
    activities_duration: "",
    activities_min_participants: "pers",
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("FR");

  useEffect(() => {
    const saved = localStorage.getItem("sama-senegal-lang") as Language;
    if (saved && ["FR", "EN", "ES"].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("sama-senegal-lang", lang);
  };

  const t = (key: string) => {
    return dictionaries[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
