import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { MessageCircle, Instagram, MapPin } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();
  const { session, setShowModal, setShowDashboard } = useAuth();
  const year = new Date().getFullYear();

  const handleAdminClick = () => {
    if (session && session.role !== "client") {
      setShowDashboard(true);
    } else {
      setShowModal(true);
    }
  };

  return (
    <footer className="bg-foreground pt-20 pb-10 border-t border-white/10 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

            <div className="space-y-6">
              <a href="#" className="text-3xl font-serif font-bold italic text-secondary">
                🌴 Sama Senegal
              </a>
              <p className="text-white/60">{t("footer_tagline")}</p>
              <div className="flex gap-4">
                <a href="https://wa.me/+221774188107" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25D366] transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/sama__senegal" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-500 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 font-serif tracking-wider uppercase text-white/90">Navigation</h4>
              <ul className="space-y-4">
                <li><a href="#tours" className="text-white/60 hover:text-secondary transition-colors">{t("nav_tours")}</a></li>
                <li><a href="#destinations" className="text-white/60 hover:text-secondary transition-colors">{t("nav_destinations")}</a></li>
                <li><a href="#guide" className="text-white/60 hover:text-secondary transition-colors">{t("nav_guide")}</a></li>
                <li><a href="#reserver" className="text-white/60 hover:text-secondary transition-colors">{t("nav_book")}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 font-serif tracking-wider uppercase text-white/90">Contact</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-white/60">
                  <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <span>Île de Gorée, Dakar<br />Sénégal</span>
                </li>
                <li className="flex items-center gap-3 text-white/60">
                  <MessageCircle className="w-5 h-5 text-secondary shrink-0" />
                  <span>+221 77 418 81 07</span>
                </li>
                <li className="flex items-center gap-3 text-white/60">
                  <Instagram className="w-5 h-5 text-secondary shrink-0" />
                  <span>@sama__senegal</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 h-full flex items-center justify-center flex-col text-center">
                <div className="text-4xl mb-4">🌴</div>
                <p className="font-serif italic text-lg text-secondary">"L'hospitalité sénégalaise n'est pas un concept, c'est une réalité."</p>
              </div>
            </div>
          </div>

          {/* Carte OpenStreetMap */}
          <div className="mb-12 rounded-2xl overflow-hidden border border-white/10">
            <div className="bg-white/5 px-4 py-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4A017]" />
              <span className="text-white/70 text-sm font-medium">Nos zones d'intervention — Sénégal</span>
            </div>
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-17.5%2C14.4%2C-17.1%2C14.8&layer=mapnik&marker=14.6928%2C-17.4467"
              width="100%"
              height="300"
              style={{ border: 0, display: "block" }}
              loading="lazy"
              title="Carte Sama Senegal"
            />
            <div className="bg-white/5 px-4 py-2 text-center">
              <a href="https://www.openstreetmap.org/?mlat=14.6928&mlon=-17.4467#map=12/14.6928/-17.4467"
                target="_blank" rel="noopener noreferrer"
                className="text-[#D4A017] text-xs hover:underline">
                Voir la carte en plein écran →
              </a>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-sm">
            <p>© {year} Sama Senegal. {t("footer_rights")}</p>
            <div className="flex items-center gap-6">
              <p>Conçu avec ❤️ au Sénégal</p>
              <button onClick={handleAdminClick}
                className="text-white/15 hover:text-white/35 text-xs transition-colors"
                data-testid="button-admin-link">
                Admin
              </button>
            </div>
          </div>
        </div>
      </footer>
  );
}
