import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import { useAuth, UserRole } from "@/lib/auth";
import { useCurrency, CurrencyCode } from "@/lib/currency";
import { useBooking } from "@/pages/Home";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, MessageCircle, User, ChevronDown, LayoutDashboard, LogOut, DollarSign, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const ROLE_ICONS: Record<UserRole, string> = { superadmin: "👑", guide: "🌴", chauffeur: "🚗", restaurant: "🍽️", hotel: "🏨", commercial: "🎯", client: "👤" };

function buildSearchIndex(): any[] {
  const tryParse = (key: string) => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
  const restaurants = tryParse("restaurantsData").filter((r: any) => r.active !== false);
  const hotels      = tryParse("hotelsData").filter((h: any) => h.active !== false);
  const activities  = tryParse("activitiesData").filter((a: any) => a.active !== false);
  const transport   = tryParse("transportData").filter((t: any) => t.active !== false);
  const tours       = tryParse("toursData").filter((t: any) => t.active !== false);

  return [
    ...restaurants.map((r: any) => ({ name: r.name, type: "Restaurant",  section: "#restaurants",  desc: r.desc_fr || r.descFR || "" })),
    ...hotels.map((h: any)      => ({ name: h.name, type: "Hébergement", section: "#hebergements", desc: h.desc_fr || h.descFR || "" })),
    ...activities.map((a: any)  => ({ name: a.nameFR || a.name_fr || a.name, type: "Activité",    section: "#activites",   desc: a.descFR || a.desc_fr || "" })),
    ...transport.map((t: any)   => ({ name: t.name, type: "Transport",   section: "#transport",    desc: t.desc_fr || t.descFR || "" })),
    ...tours.map((t: any)       => ({ name: t.name, type: "Tour",        section: "#tours",         desc: t.desc_fr || t.descFR || "" })),
  ];
}

function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openBooking } = useBooking();
  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const q = query.toLowerCase();
    const all = buildSearchIndex();
    const filtered = all.filter(i =>
      i.name?.toLowerCase().includes(q) ||
      i.desc?.toLowerCase().includes(q) ||
      i.type?.toLowerCase().includes(q)
    ).slice(0, 8);
    setResults(filtered);
  }, [query]);

  const handleSelect = (item: any) => {
    document.querySelector(item.section)?.scrollIntoView({ behavior: "smooth" });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un restaurant, hôtel, activité..."
            className="flex-1 text-base outline-none text-[#1A1A2E] placeholder-gray-400"
          />
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        {loading && <div className="px-4 py-6 text-center text-gray-400 text-sm">Recherche en cours...</div>}
        {!loading && results.length > 0 && (
          <ul className="py-2 max-h-80 overflow-y-auto">
            {results.map((item, i) => (
              <li key={i}>
                <button
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-4 py-3 hover:bg-[#F5F0E8] flex items-center gap-3 transition-colors">
                  <div className="text-xs font-bold text-white bg-[#2C7A5C] px-2 py-0.5 rounded-full shrink-0">{item.type}</div>
                  <div>
                    <div className="font-bold text-[#1A1A2E] text-sm">{item.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{item.desc}</div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); openBooking(item.name); onClose(); }}
                    className="ml-auto text-xs bg-[#D4A017] text-white px-2 py-1 rounded-lg shrink-0 hover:bg-[#b8880f]">
                    Réserver
                  </button>
                </button>
              </li>
            ))}
          </ul>
        )}
        {!loading && query.length >= 2 && results.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">Aucun résultat pour "{query}"</div>
        )}
        {query.length < 2 && (
          <div className="px-4 py-6 text-center text-gray-400 text-sm">Tapez au moins 2 caractères pour rechercher</div>
        )}
      </div>
    </div>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { session, logout, setShowModal, setShowDashboard } = useAuth();
  const { currency, setCurrency, currencies } = useCurrency();
  const { openBooking } = useBooking();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSearchOpen(false); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const navLinks = [{ href: "#tours", label: t("nav_tours") }, { href: "#destinations", label: t("nav_destinations") }, { href: "#guide", label: t("nav_guide") }];
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => { e.preventDefault(); document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }); setIsMobileMenuOpen(false); };
  const roleIcon = session ? ROLE_ICONS[session.role] : null;
  const displayName = session?.role === "client" ? session.clientUser?.firstName || session.name.split(" ")[0] : session?.name || "";
  const textColor = isScrolled ? "text-foreground/80" : "text-white/90";

  return (
    <>
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-4" : "bg-transparent py-6"}`}>
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <a href="#" className={`text-2xl font-serif font-bold italic tracking-wide transition-colors ${isScrolled ? "text-primary" : "text-secondary"}`}>🌴 Sama Senegal</a>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (<a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className={`text-sm font-medium transition-colors ${textColor} hover:text-secondary`}>{link.label}</a>))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)} className={`p-2 rounded-lg transition-colors ${isScrolled ? "text-foreground hover:bg-gray-100" : "text-white hover:bg-white/10"}`}><Search className="w-4 h-4" /></button>
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className={`gap-1 ${isScrolled ? "text-foreground" : "text-white hover:text-white hover:bg-white/10"}`}><Globe className="w-4 h-4" /><span className="font-bold text-xs">{language}</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setLanguage("FR")}>🇫🇷 Français</DropdownMenuItem><DropdownMenuItem onClick={() => setLanguage("EN")}>🇬🇧 English</DropdownMenuItem><DropdownMenuItem onClick={() => setLanguage("ES")}>🇪🇸 Español</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className={`gap-1 ${isScrolled ? "text-foreground" : "text-white hover:text-white hover:bg-white/10"}`}><DollarSign className="w-3 h-3" /><span className="font-bold text-xs">{currency}</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">{currencies.map((c) => (<DropdownMenuItem key={c.code} onClick={() => setCurrency(c.code as CurrencyCode)} className={currency === c.code ? "bg-[#2C7A5C]/10 text-[#2C7A5C] font-bold" : ""}>{c.flag} {c.code} — {c.name}</DropdownMenuItem>))}</DropdownMenuContent></DropdownMenu>
              {session ? (<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className={`gap-1.5 font-semibold ${isScrolled ? "text-foreground" : "text-white hover:text-white hover:bg-white/10"}`}><span>{roleIcon} {displayName}</span><ChevronDown className="w-3 h-3" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{session.role !== "client" && (<DropdownMenuItem onClick={() => setShowDashboard(true)}><LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard</DropdownMenuItem>)}{session.role === "client" && (<DropdownMenuItem onClick={() => setShowDashboard(true)}><User className="w-4 h-4 mr-2" /> Mon Espace</DropdownMenuItem>)}<DropdownMenuSeparator /><DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500"><LogOut className="w-4 h-4 mr-2" /> Déconnexion</DropdownMenuItem></DropdownMenuContent></DropdownMenu>) : (<Button variant="ghost" size="sm" onClick={() => setShowModal(true)} className={`font-semibold gap-1.5 ${isScrolled ? "text-foreground" : "text-white hover:text-white hover:bg-white/10"}`}><User className="w-4 h-4" /> Mon Compte</Button>)}
              <a href="https://wa.me/+221774188107" target="_blank" rel="noopener noreferrer"><Button className="bg-[#25D366] hover:bg-[#20bd5a] text-white" size="sm"><MessageCircle className="w-4 h-4 mr-1" /> WhatsApp</Button></a>
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold" size="sm" onClick={() => openBooking()}>{t("nav_book")}</Button>
            </div>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)} className={`p-2 ${isScrolled ? "text-foreground" : "text-white"}`}><Search className="w-5 h-5" /></button>
            {session && (<button onClick={() => setShowDashboard(true)} className={`text-sm font-semibold flex items-center gap-1 ${isScrolled ? "text-foreground" : "text-white"}`}>{roleIcon} {displayName}</button>)}
            {!session && (<button onClick={() => setShowModal(true)} className={`text-sm font-medium flex items-center gap-1 ${isScrolled ? "text-foreground/70" : "text-white/80"}`}><User className="w-4 h-4" /></button>)}
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={isScrolled ? "text-foreground" : "text-white"}>{isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</Button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-background border-b border-border shadow-lg p-4 flex flex-col gap-3 md:hidden">
            {navLinks.map((link) => (<a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="text-lg font-medium text-foreground py-2 border-b border-border">{link.label}</a>))}
            <div className="flex flex-wrap gap-2 pt-1">
              {(["FR", "EN", "ES"] as const).map((l) => (<Button key={l} variant="outline" size="sm" onClick={() => setLanguage(l)} className={language === l ? "bg-primary/10 border-primary text-primary" : ""}>{l}</Button>))}
              {currencies.slice(0, 4).map((c) => (<Button key={c.code} variant="outline" size="sm" onClick={() => setCurrency(c.code as CurrencyCode)} className={currency === c.code ? "bg-secondary/10 border-secondary text-secondary" : ""}>{c.flag} {c.code}</Button>))}
            </div>
            <a href="https://wa.me/+221774188107" target="_blank" rel="noopener noreferrer"><Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white"><MessageCircle className="w-4 h-4 mr-2" /> WhatsApp</Button></a>
            <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold" onClick={() => { openBooking(); setIsMobileMenuOpen(false); }}>{t("nav_book")}</Button>
            {session && (<Button variant="outline" className="w-full text-red-500 border-red-200" onClick={logout}><LogOut className="w-4 h-4 mr-2" /> Déconnexion</Button>)}
          </div>
        )}
      </nav>
    </>
  );
}
