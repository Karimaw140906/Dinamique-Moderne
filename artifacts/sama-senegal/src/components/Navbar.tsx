import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { useAuth, UserRole } from "@/lib/auth";
import { useCurrency, CurrencyCode } from "@/lib/currency";
import { useBooking } from "@/context/BookingContext";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, User, ChevronDown, LayoutDashboard, LogOut, DollarSign, Search, Heart, Bell } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const ROLE_ICONS: Record<UserRole, string> = { dg: "🏛️", superadmin: "👑", guide: "🌴", guide_principal: "🗺️", chauffeur: "🚗", restaurant: "🍽️", hotel: "🏨", commercial: "🎯", client: "👤" };

function buildSearchIndex(): any[] {
  const tryParse = (key: string) => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
  const restaurants = tryParse("restaurantsData").filter((r: any) => r.active !== false);
  const hotels      = tryParse("hotelsData").filter((h: any) => h.active !== false);
  const activities  = tryParse("activitiesData").filter((a: any) => a.active !== false);
  const transport   = tryParse("transportData").filter((t: any) => t.active !== false);
  const tours       = tryParse("toursData").filter((t: any) => t.active !== false);
  return [
    ...restaurants.map((r: any) => ({ name: r.name, type: "Restaurant",  section: "/restaurants",  desc: r.desc_fr || r.descFR || "" })),
    ...hotels.map((h: any)      => ({ name: h.name, type: "Hébergement", section: "/hebergements", desc: h.desc_fr || h.descFR || "" })),
    ...activities.map((a: any)  => ({ name: a.nameFR || a.name_fr || a.name, type: "Activité", section: "/activites", desc: a.descFR || a.desc_fr || "" })),
    ...transport.map((t: any)   => ({ name: t.name, type: "Transport",   section: "/transport",    desc: t.desc_fr || t.descFR || "" })),
    ...tours.map((t: any)       => ({ name: t.name, type: "Tour",        section: "/destinations",         desc: t.desc_fr || t.descFR || "" })),
  ];
}

function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openBooking } = useBooking();
  const [, navigate] = useLocation();
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const q = query.toLowerCase();
    const filtered = buildSearchIndex().filter(i =>
      i.name?.toLowerCase().includes(q) || i.desc?.toLowerCase().includes(q) || i.type?.toLowerCase().includes(q)
    ).slice(0, 8);
    setResults(filtered);
  }, [query]);
  const handleSelect = (item: any) => {
    navigate(item.section);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-16 sm:pt-20 px-3 sm:px-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un restaurant, hôtel, activité..."
            className="flex-1 text-base outline-none text-[#0B0A14] placeholder-gray-400" />
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        {results.length > 0 && (
          <ul className="py-2 max-h-80 overflow-y-auto">
            {results.map((item, i) => (
              <li key={i}>
                <button onClick={() => handleSelect(item)}
                  className="w-full text-left px-4 py-3 hover:bg-[#2B1B4D] flex items-center gap-3 transition-colors">
                  <div className="text-xs font-bold text-white bg-[#6C3EF5] px-2 py-0.5 rounded-full shrink-0">{item.type}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#0B0A14] text-sm">{item.name}</div>
                    {item.desc && <div className="text-xs text-gray-500 truncate">{item.desc}</div>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); openBooking(item.name); onClose(); }}
                    className="ml-auto text-xs bg-[#F5B942] text-white px-2.5 py-1 rounded-lg shrink-0 hover:bg-[#b8880f] whitespace-nowrap">
                    Réserver
                  </button>
                </button>
              </li>
            ))}
          </ul>
        )}
        {query.length >= 2 && results.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">Aucun résultat pour "{query}"</div>
        )}
        {query.length < 2 && (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">Tapez au moins 2 caractères pour rechercher</div>
        )}
      </div>
    </div>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { session, logout, setShowModal, setShowDashboard } = useAuth();
  const { currency, setCurrency, currencies } = useCurrency();
  const { openBooking } = useBooking();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSearchOpen(false); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const navLinks = [
    { href: "/", label: { FR: "Accueil", EN: "Home", ES: "Inicio" } },
    { href: "/destinations", label: { FR: "Destinations", EN: "Destinations", ES: "Destinos" } },
    { href: "/hebergements", label: { FR: "Hébergements", EN: "Stays", ES: "Alojamientos" } },
    { href: "/activites", label: { FR: "Activités", EN: "Activities", ES: "Actividades" } },
    { href: "/restaurants", label: { FR: "Restaurants", EN: "Restaurants", ES: "Restaurantes" } },
    { href: "/transport", label: { FR: "Transport", EN: "Transport", ES: "Transporte" } },
    { href: "/evenements", label: { FR: "Événements", EN: "Events", ES: "Eventos" } },
    { href: "/a-propos", label: { FR: "À propos", EN: "About", ES: "Acerca de" } },
  ];

  const [, navigate] = useLocation();
  const roleIcon = session ? (ROLE_ICONS[session.role] ?? "👤") : null;
  const displayName = session?.role === "client"
    ? session.clientUser?.firstName || session.name.split(" ")[0]
    : session?.name?.split(" ")[0] || "";

  const isTransparent = !isScrolled && !isMobileMenuOpen;

  return (
    <>
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isTransparent ? "bg-transparent py-4 md:py-5" : "bg-[#0B0A14]/95 backdrop-blur-md border-b border-white/10 shadow-lg py-3"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/"
            className="flex items-center gap-2 shrink-0">
            <span className="text-xl md:text-2xl font-serif italic font-bold tracking-wide text-white drop-shadow">
              🌴 Sama Senegal
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className="px-3 py-2 text-sm font-medium text-white/90 hover:text-[#F5B942] hover:bg-white/10 rounded-lg transition-all">
                {link.label[language]}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-1.5">
            <button onClick={() => setSearchOpen(true)}
              className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Rechercher">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Favoris">
              <Heart className="w-4 h-4" />
            </button>

            {/* Langue */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10 gap-1 font-bold text-xs">
                  <Globe className="w-3.5 h-3.5" />{language}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[120px]">
                <DropdownMenuItem onClick={() => setLanguage("FR")}>🇫🇷 Français</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("EN")}>🇬🇧 English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ES")}>🇪🇸 Español</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Devise */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10 gap-1 font-bold text-xs">
                  <DollarSign className="w-3 h-3" />{currency}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
                {currencies.map(c => (
                  <DropdownMenuItem key={c.code} onClick={() => setCurrency(c.code as CurrencyCode)}
                    className={currency === c.code ? "bg-[#6C3EF5]/10 text-[#6C3EF5] font-bold" : ""}>
                    {c.flag} {c.code} — {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Compte */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10 gap-1.5 font-semibold">
                    <div className="w-7 h-7 rounded-full bg-[#F5B942] flex items-center justify-center text-sm font-bold text-white">
                      {roleIcon}
                    </div>
                    <span className="max-w-[80px] truncate text-xs">{displayName}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {session.role === "dg" && (
                    <DropdownMenuItem onClick={() => navigate("/dg")}>
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Direction Générale
                    </DropdownMenuItem>
                  )}
                  {session.role !== "client" && session.role !== "dg" && (
                    <DropdownMenuItem onClick={() => setShowDashboard(true)}>
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                    </DropdownMenuItem>
                  )}
                  {session.role === "client" && (
                    <DropdownMenuItem onClick={() => navigate("/mon-espace")}>
                      <User className="w-4 h-4 mr-2" /> Mon Espace
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500">
                    <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowModal(true)}
                className="text-white/90 hover:text-white hover:bg-white/10 font-semibold gap-1.5">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs hidden lg:inline">Mon compte</span>
              </Button>
            )}

            <Button
              className="bg-[#F5B942] hover:bg-[#c49015] text-white font-bold text-sm px-4 h-9 rounded-xl shadow-md"
              onClick={() => openBooking()}>
              Réserver
            </Button>
          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-1.5">
            <button onClick={() => setSearchOpen(true)} className="p-2 text-white">
              <Search className="w-5 h-5" />
            </button>
            {session ? (
              <button onClick={() => { window.location.href = "/mon-espace"; }}
                className="w-8 h-8 rounded-full bg-[#F5B942] flex items-center justify-center text-sm font-bold text-white">
                {roleIcon}
              </button>
            ) : (
              <button onClick={() => setShowModal(true)} className="p-2 text-white">
                <User className="w-5 h-5" />
              </button>
            )}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white min-w-[44px] min-h-[44px] flex items-center justify-center">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0B0A14] border-t border-white/10">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3.5 text-base font-medium text-white/90 hover:text-[#F5B942] hover:bg-white/5 rounded-xl transition-all min-h-[44px]">
                  {link.label[language]}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">
                {(["FR", "EN", "ES"] as const).map(l => (
                  <button key={l} onClick={() => setLanguage(l)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${language === l ? "bg-[#6C3EF5] text-white" : "bg-white/10 text-white/70"}`}>
                    {l}
                  </button>
                ))}
              </div>
              <Button className="w-full bg-[#F5B942] hover:bg-[#c49015] text-white font-bold h-12 rounded-xl mt-2"
                onClick={() => { openBooking(); setIsMobileMenuOpen(false); }}>
                Réserver maintenant
              </Button>
              {session && (
                <Button variant="outline" className="w-full text-red-400 border-red-400/30 hover:bg-red-500/10 h-11 rounded-xl"
                  onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
