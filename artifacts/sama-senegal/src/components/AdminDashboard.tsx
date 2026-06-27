import { useState, useRef, useEffect } from "react";
import {
  Ban,
  LayoutDashboard,
  MapPin,
  Star,
  Calendar,
  Users,
  UserCircle,
  Settings,
  LogOut,
  X,
  Upload,
  Link as LinkIcon,
  Trash2,
  Save,
  Plus,
  Edit2,
  MessageCircle,
  Menu,
  Users2,
  Car,
  UtensilsCrossed,
  Hotel,
  ShoppingCart,
  Zap,
  Shield,
  DollarSign,
  Layers,
  CreditCard,
  Map,
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
import { CalendarAdmin } from "./admin/CalendarAdmin";
import { MapAdmin } from "./admin/MapAdmin";

type Section =
  | "tours"
  | "destinations"
  | "temoignages"
  | "reservations"
  | "clients"
  | "profil"
  | "parametres"
  | "guides"
  | "transport"
  | "restaurants"
  | "hotels"
  | "menu"
  | "activites"
  | "bans"
  | "staff"
  | "tabs"
  | "paiements"
  | "calendrier"
  | "carte";

const DEFAULT_DESTINATIONS = [
  {
    id: 1,
    icon: "🏛️",
    name: "Île de Gorée",
    desc: "UNESCO",
    region: "Dakar",
    gradient: "from-blue-900 to-indigo-900",
    active: true,
  },
  {
    id: 2,
    icon: "🌆",
    name: "Dakar",
    desc: "Capitale",
    region: "Dakar",
    gradient: "from-orange-800 to-red-900",
    active: true,
  },
  {
    id: 3,
    icon: "🦁",
    name: "Bandia",
    desc: "Safari",
    region: "Thiès",
    gradient: "from-yellow-700 to-orange-900",
    active: true,
  },
  {
    id: 4,
    icon: "🏜️",
    name: "Lac Rose",
    desc: "Phénomène naturel",
    region: "Dakar",
    gradient: "from-pink-800 to-rose-900",
    active: true,
  },
  {
    id: 5,
    icon: "🌊",
    name: "Saly",
    desc: "Plage",
    region: "Thiès",
    gradient: "from-cyan-700 to-blue-900",
    active: true,
  },
  {
    id: 6,
    icon: "🦣",
    name: "Sine Saloum",
    desc: "Delta",
    region: "Fatick",
    gradient: "from-green-800 to-emerald-900",
    active: true,
  },
  {
    id: 7,
    icon: "🕌",
    name: "Saint-Louis",
    desc: "Patrimoine UNESCO",
    region: "Saint-Louis",
    gradient: "from-amber-700 to-orange-900",
    active: true,
  },
  {
    id: 8,
    icon: "🌊",
    name: "Casamance",
    desc: "Nature",
    region: "Ziguinchor",
    gradient: "from-emerald-700 to-teal-900",
    active: true,
  },
];

const GRADIENTS = [
  "from-blue-900 to-indigo-900",
  "from-orange-800 to-red-900",
  "from-yellow-700 to-orange-900",
  "from-pink-800 to-rose-900",
  "from-cyan-700 to-blue-900",
  "from-green-800 to-emerald-900",
  "from-amber-700 to-orange-900",
  "from-emerald-700 to-teal-900",
  "from-purple-800 to-violet-900",
];

const DEFAULT_TEMOIGNAGES = [
  {
    id: 1,
    name: "Sophie L.",
    country: "France",
    text: "Une expérience inoubliable. Bachirou nous a fait vivre la vraie âme de Gorée.",
    rating: 5,
    active: true,
  },
  {
    id: 2,
    name: "James K.",
    country: "UK",
    text: "Best tour guide in Dakar. Incredible knowledge and warmth.",
    rating: 5,
    active: true,
  },
  {
    id: 3,
    name: "María R.",
    country: "España",
    text: "Bachirou es excepcional. La visita a Gorée fue mágica.",
    rating: 5,
    active: true,
  },
];

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

function loadDestinationsData() {
  try {
    const saved = localStorage.getItem("destinationsData");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem(
    "destinationsData",
    JSON.stringify(DEFAULT_DESTINATIONS),
  );
  return DEFAULT_DESTINATIONS;
}

function saveDestinationsData(data: any[]) {
  localStorage.setItem("destinationsData", JSON.stringify(data));
  window.dispatchEvent(new Event("destinationsDataUpdated"));
}

const STAFF_SECTIONS: Record<
  string,
  { id: Section; label: string; icon: any }[]
> = {
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
};

export function AdminDashboard() {
  const { showAdminDashboard, adminLogout, isSuperAdmin, staffRole } =
    useAdminAuth();
  const { session } = useAuth();
  const [section, setSection] = useState<Section>("profil");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [temoignages, setTemos] = useLocalData(
    "adminTemoignages",
    DEFAULT_TEMOIGNAGES,
  );

  const [guideName, setGuideName] = useLocalData(
    "guideName",
    "Bachirou Henry Sy",
  );
  const [guideBio, setGuideBio] = useLocalData(
    "guideBio",
    "Né sur l'île de Gorée, guide certifié depuis 5 ans, passionné par l'histoire et la culture sénégalaise.",
  );
  const [guidePhoto, setGuidePhotoState] = useState<string>(
    () => localStorage.getItem("guidPhoto") || "",
  );
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [currencyRates, setCurrencyRatesState] = useState<
    Record<string, number>
  >(() => {
    try {
      return JSON.parse(localStorage.getItem("currencyRates") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const stored = localStorage.getItem("guidPhoto") || "";
    setGuidePhotoState(stored);
    setPhotoPreview(stored);
  }, []);

  if (!showAdminDashboard) return null;

  const roleIcon = isSuperAdmin
    ? "👑"
    : staffRole === "guide"
      ? "🌴"
      : staffRole === "chauffeur"
        ? "🚗"
        : staffRole === "restaurant"
          ? "🍽️"
          : staffRole === "hotel"
            ? "🏨"
            : "🎯";

  const displayName = isSuperAdmin ? "Admin" : session?.name || "";

  const saveGuidePhoto = (src: string) => {
    localStorage.setItem("guidPhoto", src);
    setGuidePhotoState(src);
    setPhotoPreview(src);
    window.dispatchEvent(new Event("guidePhotoUpdated"));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhotoPreview(result);
      setPhotoUrl("");
    };
    reader.readAsDataURL(file);
  };

  const handleUrlPreview = () => {
    if (photoUrl.trim()) setPhotoPreview(photoUrl.trim());
  };

  const deletePhoto = () => {
    localStorage.removeItem("guidPhoto");
    setGuidePhotoState("");
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

  const superAdminNav: { id: Section; label: string; icon: any }[] = [
    { id: "tours", label: "Tours", icon: MapPin },
    { id: "destinations", label: "Destinations", icon: LayoutDashboard },
    { id: "guides", label: "Guides", icon: Users2 },
    { id: "transport", label: "Transport", icon: Car },
    { id: "restaurants", label: "Restaurants", icon: UtensilsCrossed },
    { id: "hotels", label: "Hébergements", icon: Hotel },
    { id: "menu", label: "Commandes", icon: ShoppingCart },
    { id: "activites", label: "Activités", icon: Zap },
    { id: "temoignages", label: "Témoignages", icon: Star },
    { id: "reservations", label: "Réservations", icon: Calendar },
    { id: "clients", label: "Clients", icon: Users },
    { id: "profil", label: "Profil Guide", icon: UserCircle },
    { id: "parametres", label: "Paramètres", icon: Settings },
    { id: "staff", label: "Gestion Accès", icon: Shield },
    { id: "bans", label: "Bannissements", icon: Ban },
    { id: "tabs", label: "Onglets & Sections", icon: Layers },
    { id: "paiements", label: "Paiements", icon: CreditCard },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "calendrier", label: "Disponibilités", icon: Calendar },
    { id: "carte", label: "Carte des sites", icon: Map },
  ];

  const navItems = isSuperAdmin
    ? superAdminNav
    : STAFF_SECTIONS[staffRole || "guide"] || [];
  const navigate = (id: Section) => {
    setSection(id);
    setSidebarOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[250] flex bg-gray-100 font-sans">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 h-full z-20 w-64 bg-[#1A1A2E] text-white flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="text-xl font-serif italic font-bold text-[#D4A017]">
            🌴 Sama Senegal
          </div>
          <div className="text-white/50 text-xs mt-1">
            {roleIcon}{" "}
            {isSuperAdmin ? "Administration" : `Espace ${displayName}`}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${section === id ? "bg-[#2C7A5C] text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={adminLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">
              {navItems.find((n) => n.id === section)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 hidden sm:block">
              {roleIcon} {displayName}
            </div>
            <button
              onClick={adminLogout}
              className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {section === "guides" && <GuidesAdmin />}
          {section === "reservations" && <ReservationsAdmin />}
          {section === "bans" && isSuperAdmin && <BansAdmin />}
          {section === "transport" && <TransportAdmin />}
          {section === "restaurants" && <RestaurantsAdmin />}
          {section === "hotels" && <HotelsAdmin />}
          {section === "menu" && <MenuAdmin />}
          {section === "activites" && <ActivitiesAdmin />}
          {section === "staff" && <StaffAdmin />}
          {section === "tabs" && <TabsAdmin />}
          {section === "tours" && <ToursAdmin />}
          {section === "paiements" && <PaymentsAdmin />}
          {section === "messages" && <MessagesAdmin />}
          {section === "calendrier" && <CalendarAdmin />}
          {section === "carte" && <MapAdmin />}

          {section === "destinations" && <DestinationsAdminInline />}

          {section === "temoignages" && (
            <div className="space-y-4">
              {temoignages.map((t, i) => (
                <div key={t.id} className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-800">
                          {t.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          · {t.country}
                        </span>
                        <span className="text-yellow-400">
                          {"⭐".repeat(t.rating)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 italic">"{t.text}"</p>
                    </div>
                    <button
                      onClick={() => {
                        const ts = [...temoignages];
                        ts[i].active = !ts[i].active;
                        setTemos(ts);
                      }}
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${t.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {t.active ? "Publié" : "Masqué"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}


          {section === "clients" && <ClientsSection />}

          {section === "profil" && (
            <div className="max-w-xl space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-gray-800 text-lg border-b pb-3">
                  Profil du Guide
                </h2>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Nom du guide
                  </label>
                  <input
                    type="text"
                    value={guideName}
                    onChange={(e) => setGuideName(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Biographie
                  </label>
                  <textarea
                    value={guideBio}
                    onChange={(e) => setGuideBio(e.target.value)}
                    rows={3}
                    className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30 resize-none"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
                <h2 className="font-bold text-gray-800 text-lg border-b pb-3">
                  Photo du Guide
                </h2>
                <div className="flex justify-center">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Guide"
                      className="w-36 h-36 rounded-full object-cover border-4 border-[#D4A017] shadow-lg"
                    />
                  ) : (
                    <div className="w-36 h-36 rounded-full bg-[#1A1A2E] flex items-center justify-center border-4 border-[#D4A017] shadow-lg">
                      <span className="text-[#D4A017] text-3xl font-bold font-serif">
                        BHS
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <LinkIcon className="w-3 h-3" /> Option 1 : URL de l'image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://exemple.com/photo.jpg"
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30"
                    />
                    <button
                      onClick={handleUrlPreview}
                      className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                    >
                      Aperçu
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Upload className="w-3 h-3" /> Option 2 : Télécharger depuis
                    l'appareil
                  </label>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-[#2C7A5C] rounded-xl text-sm text-gray-500 hover:text-[#2C7A5C] flex items-center justify-center gap-2 transition-colors"
                  >
                    <Upload className="w-4 h-4" /> Choisir une photo
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => saveGuidePhoto(photoPreview)}
                    disabled={!photoPreview}
                    className="flex-1 py-2.5 bg-[#2C7A5C] hover:bg-[#245f49] disabled:opacity-40 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" /> Enregistrer la photo
                  </button>
                  <button
                    onClick={deletePhoto}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
                <h2 className="font-bold text-gray-800 text-lg border-b pb-3">
                  Contact
                </h2>
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

          {section === "parametres" && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
                <h2 className="font-bold text-gray-800 text-lg border-b pb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5" /> Paramètres du site
                </h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span>Langue par défaut</span>
                    <span className="font-bold text-[#2C7A5C]">Français</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span>WhatsApp</span>
                    <span className="font-bold">+221774188107</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span>Instagram</span>
                    <span className="font-bold">@sama__senegal</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Version</span>
                    <span className="font-bold text-gray-400">v2.0.0</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-gray-800 text-lg border-b pb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#D4A017]" /> Taux de
                  conversion des devises
                </h2>
                <p className="text-xs text-gray-500">
                  Modifiez les taux de conversion (base : 1 FCFA). Les prix sont
                  toujours saisis en FCFA.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { code: "EUR", flag: "🇪🇺", default: 0.00152 },
                    { code: "USD", flag: "🇺🇸", default: 0.00166 },
                    { code: "GBP", flag: "🇬🇧", default: 0.0013 },
                    { code: "MAD", flag: "🇲🇦", default: 0.01658 },
                    { code: "DZD", flag: "🇩🇿", default: 0.224 },
                    { code: "CAD", flag: "🇨🇦", default: 0.00226 },
                    { code: "CHF", flag: "🇨🇭", default: 0.00149 },
                    { code: "SAR", flag: "🇸🇦", default: 0.00623 },
                    { code: "AED", flag: "🇦🇪", default: 0.0061 },
                    { code: "CNY", flag: "🇨🇳", default: 0.012 },
                  ].map(({ code, flag, default: def }) => (
                    <div key={code} className="flex items-center gap-3">
                      <span className="text-lg">{flag}</span>
                      <span className="font-bold text-sm w-10">{code}</span>
                      <input
                        type="number"
                        step="0.00001"
                        defaultValue={currencyRates[code] ?? def}
                        onBlur={(e) => saveCurrencyRate(code, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/30"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#D4A017] font-medium">
                  💡 Les taux sont sauvegardés automatiquement à la sortie du
                  champ.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function DestinationsAdminInline() {
  const [dests, setDestsState] = useState<any[]>(() => loadDestinationsData());
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const onUpdate = () => setDestsState(loadDestinationsData());
    window.addEventListener("destinationsDataUpdated", onUpdate);
    return () =>
      window.removeEventListener("destinationsDataUpdated", onUpdate);
  }, []);

  const save = (data: any[]) => {
    setDestsState(data);
    saveDestinationsData(data);
  };

  const openAdd = () => {
    setIsNew(true);
    setEditing({
      id: Date.now(),
      icon: "📍",
      name: "",
      desc: "",
      region: "",
      gradient: GRADIENTS[0],
      active: true,
    });
  };

  const saveEdit = () => {
    if (!editing?.name) return;
    save(
      isNew
        ? [...dests, editing]
        : dests.map((d) => (d.id === editing.id ? editing : d)),
    );
    setEditing(null);
    setIsNew(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {dests.filter((d) => d.active).length} actives sur {dests.length}
        </p>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#2C7A5C] hover:bg-[#245f49] text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/70 z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-lg">
                {isNew ? "Nouvelle destination" : "Modifier"}
              </h3>
              <button onClick={() => setEditing(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">
                  Nom *
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  placeholder="Ex: Île de Gorée"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Icône
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={editing.icon}
                  onChange={(e) =>
                    setEditing({ ...editing, icon: e.target.value })
                  }
                  placeholder="🏛️"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Région
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={editing.region}
                  onChange={(e) =>
                    setEditing({ ...editing, region: e.target.value })
                  }
                  placeholder="Dakar"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">
                  Description
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={editing.desc}
                  onChange={(e) =>
                    setEditing({ ...editing, desc: e.target.value })
                  }
                  placeholder="UNESCO, Plage..."
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">
                  Couleur
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setEditing({ ...editing, gradient: g })}
                      className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} transition-transform ${editing.gradient === g ? "scale-125 ring-2 ring-gray-800" : "hover:scale-110"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <span className="text-xs text-gray-500">Active</span>
                <button
                  onClick={() =>
                    setEditing({ ...editing, active: !editing.active })
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors ${editing.active ? "bg-[#2C7A5C]" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${editing.active ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
                <span
                  className={`text-xs font-bold ${editing.active ? "text-[#2C7A5C]" : "text-gray-400"}`}
                >
                  {editing.active ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={saveEdit}
                disabled={!editing.name}
                className="flex-1 bg-[#2C7A5C] hover:bg-[#245f49] disabled:opacity-40 text-white py-2 rounded-xl font-bold text-sm transition-colors"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {dests.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div
              className={`h-16 bg-gradient-to-br ${d.gradient} flex items-center px-4 gap-3`}
            >
              <span className="text-2xl">{d.icon}</span>
              <div>
                <div className="text-white font-bold text-sm">{d.name}</div>
                <div className="text-white/60 text-xs">
                  {d.region} · {d.desc}
                </div>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <button
                onClick={() =>
                  save(
                    dests.map((x) =>
                      x.id === d.id ? { ...x, active: !x.active } : x,
                    ),
                  )
                }
                className={`px-3 py-1 rounded-full text-xs font-bold ${d.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
              >
                {d.active ? "Actif" : "Inactif"}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsNew(false);
                    setEditing({ ...d });
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Supprimer ?"))
                      save(dests.filter((x) => x.id !== d.id));
                  }}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientsSection() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    try {
      setClients(JSON.parse(localStorage.getItem("samaClients") || "[]"));
    } catch {}
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
        <div
          key={c.id}
          className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-[#2C7A5C]/10 flex items-center justify-center font-bold text-[#2C7A5C] text-sm shrink-0">
            {c.firstName?.[0]}
            {c.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800">
              {c.firstName} {c.lastName}
            </div>
            <div className="text-xs text-gray-500">
              {c.whatsapp} · {c.nationality}
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {new Date(c.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
