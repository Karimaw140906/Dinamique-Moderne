import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { useClientAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, MessageCircle, User, ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { clientSession, clientLogout, setShowClientModal, setShowClientDashboard } = useClientAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#tours", label: t("nav_tours") },
    { href: "#destinations", label: t("nav_destinations") },
    { href: "#guide", label: t("nav_guide") },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const textColor = isScrolled ? "text-foreground/80" : "text-white/90";
  const hoverColor = "hover:text-secondary";

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-4" : "bg-transparent py-6"}`}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <a href="#" className={`text-2xl font-serif font-bold italic tracking-wide transition-colors ${isScrolled ? "text-primary" : "text-secondary"}`}>
          🌴 Sama Senegal
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)}
                className={`text-sm font-medium transition-colors ${textColor} ${hoverColor}`}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Language selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`gap-1 ${isScrolled ? "text-foreground" : "text-white hover:text-white hover:bg-white/10"}`}>
                  <Globe className="w-4 h-4" />
                  <span className="font-bold">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("FR")}>🇫🇷 Français</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("EN")}>🇬🇧 English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ES")}>🇪🇸 Español</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mon Compte */}
            {clientSession ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className={`gap-1.5 font-semibold ${isScrolled ? "text-foreground" : "text-white hover:text-white hover:bg-white/10"}`}>
                    <User className="w-4 h-4" />
                    👤 {clientSession.user.firstName}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowClientDashboard(true)}>
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Mon Espace
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clientLogout} className="text-red-500 focus:text-red-500">
                    <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm"
                onClick={() => setShowClientModal(true)}
                className={`font-semibold gap-1.5 ${isScrolled ? "text-foreground" : "text-white hover:text-white hover:bg-white/10"}`}
                data-testid="button-mon-compte">
                <User className="w-4 h-4" /> Mon Compte
              </Button>
            )}

            {/* WhatsApp */}
            <a href="https://wa.me/+221774188107" target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-white" data-testid="button-whatsapp-nav">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
              </Button>
            </a>

            {/* Réserver */}
            <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
              onClick={() => document.querySelector("#reserver")?.scrollIntoView({ behavior: "smooth" })}
              data-testid="button-reserver-nav">
              {t("nav_book")}
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {clientSession ? (
            <button onClick={() => setShowClientDashboard(true)}
              className={`text-sm font-semibold flex items-center gap-1 ${isScrolled ? "text-foreground" : "text-white"}`}>
              👤 {clientSession.user.firstName}
            </button>
          ) : (
            <button onClick={() => setShowClientModal(true)}
              className={`text-sm font-medium flex items-center gap-1 ${isScrolled ? "text-foreground/70" : "text-white/80"}`}>
              <User className="w-4 h-4" />
            </button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={isScrolled ? "text-foreground" : "text-white"}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-b border-border shadow-lg p-4 flex flex-col gap-4 md:hidden">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)}
              className="text-lg font-medium text-foreground py-2 border-b border-border">
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-2 pt-2">
            {(["FR", "EN", "ES"] as const).map((l) => (
              <Button key={l} variant="outline" size="sm" onClick={() => setLanguage(l)}
                className={language === l ? "bg-primary/10 border-primary text-primary" : ""}>
                {l}
              </Button>
            ))}
          </div>
          <a href="https://wa.me/+221774188107" target="_blank" rel="noopener noreferrer" className="w-full">
            <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white">
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
            </Button>
          </a>
          <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
            onClick={() => { document.querySelector("#reserver")?.scrollIntoView({ behavior: "smooth" }); setIsMobileMenuOpen(false); }}>
            {t("nav_book")}
          </Button>
          {clientSession && (
            <Button variant="outline" className="w-full text-red-500 border-red-200" onClick={clientLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Déconnexion
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
