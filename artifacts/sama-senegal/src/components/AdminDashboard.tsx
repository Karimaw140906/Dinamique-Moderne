import { useState, useRef, useEffect } from "react";
import {
  Tag, Activity, Ban, LayoutDashboard, MapPin, Star, Calendar, Users,
  UserCircle, Settings, LogOut, X, Upload, Link as LinkIcon, Trash2,
  Save, MessageCircle, Menu, Users2, Car, UtensilsCrossed, Hotel,
  ShoppingCart, Zap, Shield, DollarSign, Layers, CreditCard, Map,
  Mail, Globe, PartyPopper, Video, Home, ChevronDown,
} from "lucide-react";
import { useAdminAuth, useAuth } from "@/lib/auth";

import { GuidesAdmin } from "./admin/GuidesAdmin";
import { TransportAdmin } from "./admin/TransportAdmin";
import { RestaurantsAdmin } from "./admin/RestaurantsAdmin";
import { HotelsAdmin } from "./admin/HotelsAdmin";
import { MenuAdmin } from "./admin/MenuAdmin";
import { ActivitiesAdmin } from "./admin/ActivitiesAdmin";
import { StaffAdmin } from "./admin/StaffAdmin";
import { TabsAdmin } from "./admin/TabsAdmin";
import { ToursAdmin } from "./admin/ToursAdmin";
import { ReservationsAdmin } from "./admin/ReservationsAdmin";
import { BansAdmin } from "./admin/BansAdmin";
import { PaymentsAdmin } from "./admin/PaymentsAdmin";
import { MessagesAdmin } from "./admin/MessagesAdmin";
import { TestimonialsAdmin } from "./admin/TestimonialsAdmin";
import { SettingsAdmin } from "./admin/SettingsAdmin";
import { PromoAdmin } from "./admin/PromoAdmin";
import { LogsAdmin } from "./admin/LogsAdmin";
import { CalendarAdmin } from "./admin/CalendarAdmin";
import { MapAdmin } from "./admin/MapAdmin";
import { WhatsappTemplatesAdmin } from "./admin/WhatsappTemplatesAdmin";
import { EmailTemplatesAdmin } from "./admin/EmailTemplatesAdmin";
import { DestinationsAdmin } from "./admin/DestinationsAdmin";
import { EventsAdmin } from "./admin/EventsAdmin";
import { HeroVideosAdmin } from "./admin/HeroVideosAdmin";

type Section =
  | "tours" | "temoignages" | "reservations" | "clients" | "profil"
  | "parametres" | "guides" | "transport" | "restaurants" | "hotels"
  | "menu" | "activites" | "bans" | "staff" | "tabs" | "paiements"
  | "promos" | "logs" | "messages" | "calendrier" | "carte"
  | "whatsapp_templates" | "email_templates" | "destinations" | "events"
  | "hero_videos";

interface NavItem { id: Section; label: string; icon: any }
interface NavGroup { id: string; label: string; icon: any; items: NavItem[] }

// Ordre identique au menu public : Accueil → Destinations → Hébergements →
// Activités → Restaurants → Transport → Événements → À propos → Paramètres
const NAV_GROUPS: NavGroup[] = [
  { id: "accueil", label: "Accueil", icon: Home, items: [
    { id: "tabs", label: "Onglets & Sections", icon: Layers },
    { id: "temoignages", label: "Témoignages", icon: Star },
    { id: "hero_videos", label: "Vidéos des pages", icon: Video },
  ]},
  { id: "destinations", label: "Destinations", icon: Globe, items: [
    { id: "destinations", label: "Destinations", icon: Globe },
  ]},
  { id: "hebergements", label: "Hébergements", icon: Hotel, items: [
    { id: "hotels", label: "Hébergements", icon: Hotel },
  ]},
  { id: "activites", label: "Activités", icon: Zap, items: [
    { id: "activites", label: "Activités", icon: Zap },
    { id: "tours", label: "Tours & Excursions", icon: MapPin },
  ]},
  { id: "restaurants", label: "Restaurants", icon: UtensilsCrossed, items: [
    { id: "restaurants", label: "Restaurants", icon: UtensilsCrossed },
    { id: "menu", label: "Commandes / Menu", icon: ShoppingCart },
  ]},
  { id: "transport", label: "Transport", icon: Car, items: [
    { id: "transport", label: "Transport", icon: Car },
  ]},
  { id: "evenements", label: "Événements", icon: PartyPopper, items: [
    { id: "events", label: "Événements", icon: PartyPopper },
  ]},
  { id: "apropos", label: "À propos", icon: UserCircle, items: [
    { id: "profil", label: "Profil Guide", icon: UserCircle },
    { id: "guides", label: "Guides", icon: Users2 },
    { id: "staff", label: "Gestion Accès", icon: Shield },
  ]},
  { id: "parametres_gen", label: "Paramètres généraux", icon: Settings, items: [
    { id: "parametres", label: "Paramètres", icon: Settings },
    { id: "promos", label: "Offres & Promos", icon: Tag },
    { id: "whatsapp_templates", label: "Templates WhatsApp", icon: MessageCircle },
    { id: "email_templates", label: "Templates Email", icon: Mail },
    { id: "reservations", label: "Réservations", icon: Calendar },
    { id: "clients", label: "Clients", icon: Users },
    { id: "paiements", label: "Paiements", icon: CreditCard },
    { id: "calendrier", label: "Disponibilités", icon: Calendar },
    { id: "carte", label: "Carte des sites", icon: Map },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "bans", label: "Bannissements", icon: Ban },
    { id: "logs", label: "Logs", icon: Activity },
  ]},
];

function findGroupForSection(section: Section): NavGroup {
  return (
    NAV_GROUPS.find((g) => g.items.some((i) => i.id === section)) ||
    NAV_GROUPS[0]
  );
}

function useLocalData<T>(key: string, defaults: T): [T, (v: T) => void] {
  const [data, setData] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : defaults;
    } catch {
      return defaults;
    }
  });
  const save = (v: T) => {
    setData(v);
    localStorage.setItem(key, JSON.stringify(v));
  };
  return [data, save];
}

const STAFF_SECTIONS: Record<string, { id: Section; label: string; icon: any }[]> = {
  guide: [
    { id: "reservations", label: "📋 Mes Réservations", icon: Calendar },
    { id: "profil", label: "👤 Mon Profil", icon: UserCircle },
  ],
  chauffeur: [
    { id: "transport", label: "🚗 Mon Transport", icon: Car },
    { id: "reservations", label: "📅 Mes Trajets", icon: Calendar },
    { id: "profil", label: "👤 Mon Profil", icon: UserCircle },
  ],
  restaurant: [
    { id: "menu", label: "🍽️ Mon Menu", icon: ShoppingCart },
    { id: "reservations", label: "🛒 Commandes reçues", icon: Calendar },
    { id: "profil", label: "👤 Mon Profil", icon: UserCircle },
  ],
  hotel: [
    { id: "hotels", label: "🏨 Mon Hébergement", icon: Hotel },
    { id: "reservations", label: "📋 Réservations", icon: Calendar },
    { id: "profil", label: "👤 Mon Profil", icon: UserCircle },
  ],
  commercial: [
    { id: "clients", label: "👥 Clients", icon: Users },
    { id: "reservations", label: "📊 Vue globale", icon: LayoutDashboard },
    { id: "profil", label: "👤 Mon Profil", icon: UserCircle },
  ],
  guide_principal: [
    { id: "hotels", label: "🏨 Hébergements", icon: Hotel },
    { id: "restaurants", label: "🍽️ Restaurants", icon: UtensilsCrossed },
    { id: "transport", label: "🚗 Transport", icon: Car },
    { id: "activites", label: "🎯 Activités", icon: Zap },
    { id: "destinations", label: "🗺️ Destinations", icon: Globe },
    { id: "events", label: "🎉 Événements", icon: PartyPopper },
    { id: "reservations", label: "📋 Réservations", icon: Calendar },
    { id: "profil", label: "👤 Mon Profil", icon: UserCircle },
  ],
};

export function AdminDashboard() {
  const { showAdminDashboard, adminLogout, isSuperAdmin, staffRole } = useAdminAuth();
  const { session } = useAuth();
  const [section, setSection] = useState<Section>("profil");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [guideName, setGuideName] = useLocalData("guideName", "Bachirou Henry Sy");
  const [guideBio, setGuideBio] = useLocalData(
    "guideBio",
    "Né sur l'île de Gorée, guide certifié depuis 5 ans, passionné par l'histoire et la culture sénégalaise."
  );
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [currencyRates, setCurrencyRatesState] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem("currencyRates") || "{}"); } catch { return {}; }
  });

  useEffect(() => {
    const stored = localStorage.getItem("guidPhoto") || "";
    setPhotoPreview(stored);
  }, []);

  if (!showAdminDashboard) return null;

  const roleIcon = isSuperAdmin ? "👑"
    : staffRole === "guide" ? "🌴"
    : staffRole === "guide_principal" ? "🗺️"
    : staffRole === "chauffeur" ? "🚗"
    : staffRole === "restaurant" ? "🍽️"
    : staffRole === "hotel" ? "🏨"
    : "🎯";

  const displayName = isSuperAdmin ? "Admin" : session?.name || "";

  const saveGuidePhoto = (src: string) => {
    localStorage.setItem("guidPhoto", src);
    setPhotoPreview(src);
    window.dispatchEvent(new Event("guidePhotoUpdated"));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setPhotoPreview(ev.target?.result as string); setPhotoUrl(""); };
    reader.readAsDataURL(file);
  };

  const handleUrlPreview = () => { if (photoUrl.trim()) setPhotoPreview(photoUrl.trim()); };

  const deletePhoto = () => {
    localStorage.removeItem("guidPhoto");
    setPhotoPreview("");
    setPhotoUrl("");
    window.dispatchEvent(new Event("guidePhotoUpdated"));
  };

  const saveCurrencyRate = (currency: string, value: string) => {
    const rate = parseFloat(value);
    if (!isNaN(rate)) {
      const newRates = { ...currencyRates, [currency]: rate };
      setCurrencyRatesState(newRates);
      localStorage.setItem("currencyRates", JSON.stringify(newRates));
    }
  };

  const staffNavItems = STAFF_SECTIONS[staffRole || "guide"] || [];
  const activeGroup = isSuperAdmin ? findGroupForSection(section) : null;

  const navigate = (id: Section) => { setSection(id); setMobileNavOpen(false); };

  return (
    <div className="fixed inset-0 z-[250] flex flex-col bg-gray-100 font-sans">

      {/* ── HEADER : logo + groupes horizontaux (façon menu public) ── */}
      <header className="bg-[#0B0A14] text-white shrink-0">
        <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="text-lg md:text-xl font-serif italic font-bold text-[#F5B942]">
              🌴 Sama Senegal
            </div>
            <div className="hidden sm:block text-white/40 text-xs">
              {roleIcon} {isSuperAdmin ? "Administration" : `Espace ${displayName}`}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={adminLogout}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>

        {isSuperAdmin ? (
          <nav className={`${mobileNavOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row overflow-x-auto`}>
            {NAV_GROUPS.map((g) => {
              const Icon = g.icon;
              const isActive = activeGroup?.id === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => navigate(g.items[0].id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? "border-[#6C3EF5] text-white bg-[#6C3EF5]/10"
                      : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {g.label}
                </button>
              );
            })}
          </nav>
        ) : (
          <nav className={`${mobileNavOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row overflow-x-auto`}>
            {staffNavItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  section === id
                    ? "border-[#6C3EF5] text-white bg-[#6C3EF5]/10"
                    : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </nav>
        )}

        {/* Sous-onglets du groupe actif (superadmin uniquement, si >1 item) */}
        {isSuperAdmin && activeGroup && activeGroup.items.length > 1 && (
          <div className="flex overflow-x-auto bg-[#15131f] px-4 md:px-8">
            {activeGroup.items.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  section === id ? "text-[#F5B942]" : "text-white/40 hover:text-white/70"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── CONTENU ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex items-center justify-between shrink-0">
          <h1 className="text-base md:text-lg font-bold text-gray-800">
            {(isSuperAdmin
              ? NAV_GROUPS.flatMap((g) => g.items)
              : staffNavItems
            ).find((n) => n.id === section)?.label || "Dashboard"}
          </h1>
          <button onClick={adminLogout} className="md:hidden p-2 rounded-lg hover:bg-red-50 text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {section === "guides" && <GuidesAdmin />}
          {section === "reservations" && <ReservationsAdmin />}
          {section === "bans" && isSuperAdmin && <BansAdmin />}
          {section === "transport" && <TransportAdmin />}
          {section === "restaurants" && <RestaurantsAdmin />}
          {section === "hotels" && <HotelsAdmin />}
          {section === "menu" && <MenuAdmin />}
          {section === "activites" && <ActivitiesAdmin />}
          {section === "destinations" && <DestinationsAdmin />}
          {section === "events" && <EventsAdmin />}
          {section === "hero_videos" && <HeroVideosAdmin />}
          {section === "staff" && <StaffAdmin />}
          {section === "tabs" && <TabsAdmin />}
          {section === "tours" && <ToursAdmin />}
          {section === "paiements" && <PaymentsAdmin />}
          {section === "promos" && <PromoAdmin />}
          {section === "logs" && <LogsAdmin />}
          {section === "messages" && <MessagesAdmin />}
          {section === "calendrier" && <CalendarAdmin />}
          {section === "carte" && <MapAdmin />}
          {section === "whatsapp_templates" && <WhatsappTemplatesAdmin />}
          {section === "email_templates" && <EmailTemplatesAdmin />}
          {section === "temoignages" && <TestimonialsAdmin />}
          {section === "clients" && <ClientsSection />}

          {section === "profil" && (
            <div className="max-w-xl space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-gray-800 text-lg border-b pb-3">Profil du Guide</h2>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Nom du guide</label>
                  <input type="text" value={guideName} onChange={(e) => setGuideName(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Biographie</label>
                  <textarea value={guideBio} onChange={(e) => setGuideBio(e.target.value)} rows={3}
                    className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30 resize-none" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
                <h2 className="font-bold text-gray-800 text-lg border-b pb-3">Photo du Guide</h2>
                <div className="flex justify-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Guide" className="w-36 h-36 rounded-full object-cover border-4 border-[#F5B942] shadow-lg" />
                  ) : (
                    <div className="w-36 h-36 rounded-full bg-[#0B0A14] flex items-center justify-center border-4 border-[#F5B942] shadow-lg">
                      <span className="text-[#F5B942] text-3xl font-bold font-serif">BHS</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <LinkIcon className="w-3 h-3" /> Option 1 : URL de l'image
                  </label>
                  <div className="flex gap-2">
                    <input type="url" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://exemple.com/photo.jpg"
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
                    <button onClick={handleUrlPreview}
                      className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
                      Aperçu
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Upload className="w-3 h-3" /> Option 2 : Télécharger depuis l'appareil
                  </label>
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-[#6C3EF5] rounded-xl text-sm text-gray-500 hover:text-[#6C3EF5] flex items-center justify-center gap-2 transition-colors">
                    <Upload className="w-4 h-4" /> Choisir une photo
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => saveGuidePhoto(photoPreview)} disabled={!photoPreview}
                    className="flex-1 py-2.5 bg-[#6C3EF5] hover:bg-[#8B5CF6] disabled:opacity-40 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                    <Save className="w-4 h-4" /> Enregistrer la photo
                  </button>
                  <button onClick={deletePhoto}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
                <h2 className="font-bold text-gray-800 text-lg border-b pb-3">Contact</h2>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>+221 77 418 81 07</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-pink-400">@</span>
                  <span>@sama__senegal</span>
                </div>
              </div>
            </div>
          )}

          {section === "parametres" && <SettingsAdmin />}
        </div>
      </main>
    </div>
  );
}

export function ClientsSection() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    try { setClients(JSON.parse(localStorage.getItem("samaClients") || "[]")); } catch {}
  }, []);

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm text-center text-gray-400">
        <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg">Aucun client inscrit pour l'instant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {clients.map((c: any) => (
        <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#6C3EF5]/10 flex items-center justify-center font-bold text-[#6C3EF5] text-sm shrink-0">
            {c.firstName?.[0]}{c.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800">{c.firstName} {c.lastName}</div>
            <div className="text-xs text-gray-500">{c.whatsapp} · {c.nationality}</div>
          </div>
          <div className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  );
}
