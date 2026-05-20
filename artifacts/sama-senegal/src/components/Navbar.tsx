import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
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
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <a href="#" className={`text-2xl font-serif font-bold italic tracking-wide transition-colors ${isScrolled ? "text-primary" : "text-secondary"}`}>
          🌴 Sama Senegal
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-sm font-medium transition-colors hover:text-secondary ${isScrolled ? "text-foreground/80" : "text-white/90"}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={isScrolled ? "text-foreground" : "text-white hover:text-white hover:bg-white/10"}>
                  <Globe className="w-4 h-4" />
                  <span className="ml-2 font-bold">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("FR")}>🇫🇷 Français</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("EN")}>🇬🇧 English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ES")}>🇪🇸 Español</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a href="https://wa.me/+221774188107" target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-white">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </a>
            
            <Button
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
              onClick={() => {
                document.querySelector("#reserver")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t("nav_book")}
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={isScrolled ? "text-foreground" : "text-white"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-b border-border shadow-lg p-4 flex flex-col gap-4 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-lg font-medium text-foreground py-2 border-b border-border"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-4 pt-2">
            <Button variant="outline" onClick={() => setLanguage("FR")} className={language === "FR" ? "bg-accent/10" : ""}>FR</Button>
            <Button variant="outline" onClick={() => setLanguage("EN")} className={language === "EN" ? "bg-accent/10" : ""}>EN</Button>
            <Button variant="outline" onClick={() => setLanguage("ES")} className={language === "ES" ? "bg-accent/10" : ""}>ES</Button>
          </div>
          <a href="https://wa.me/+221774188107" target="_blank" rel="noopener noreferrer" className="w-full">
            <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </a>
          <Button
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
            onClick={() => {
              document.querySelector("#reserver")?.scrollIntoView({ behavior: "smooth" });
              setIsMobileMenuOpen(false);
            }}
          >
            {t("nav_book")}
          </Button>
        </div>
      )}
    </nav>
  );
}