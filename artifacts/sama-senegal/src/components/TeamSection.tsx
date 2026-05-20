import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import { MessageCircle, Instagram } from "lucide-react";

export function TeamSection() {
  const { t, language } = useLanguage();
  const [guides, setGuides] = useState<any[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const loadGuides = () => {
    const saved = localStorage.getItem("guidesData");
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        setGuides(parsed.filter((g: any) => g.active));
      } catch { }
    } else {
      setGuides([{
        id: 1, name: "Bachirou Henry Sy", photo: "",
        bioFR: "Né sur l'île de Gorée, guide certifié depuis 5 ans, passionné par l'histoire et la culture sénégalaise.",
        bioEN: "Born on Gorée Island, certified guide for 5 years, passionate about Senegalese history and culture.",
        bioES: "Nacido en la isla de Gorée, guía certificado desde hace 5 años, apasionado por la historia y cultura senegalesa.",
        languages: ["FR", "EN", "Wolof"], certifications: ["Guide Officiel", "UNESCO Partner"],
        whatsapp: "+221774188107", instagram: "@sama__senegal", rating: 5, specialities: ["Histoire", "Culture", "City Tour"], active: true
      }]);
    }
  };

  useEffect(() => {
    loadGuides();
    window.addEventListener("guidesDataUpdated", loadGuides);
    return () => window.removeEventListener("guidesDataUpdated", loadGuides);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  if (guides.length === 0) return null;

  return (
    <section id="equipe" className="py-24 bg-[#F5F0E8] text-[#1A1A2E]" ref={ref}>
      <div className={`container mx-auto px-4 md:px-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">{t("team_title")}</h2>
          <div className="w-24 h-1 bg-[#D4A017] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((g) => {
            const bio = language === "EN" ? g.bioEN : language === "ES" ? g.bioES : g.bioFR;
            return (
              <div key={g.id} className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all flex flex-col items-center text-center">
                {g.photo ? (
                  <img src={g.photo} alt={g.name} className="w-32 h-32 rounded-full object-cover border-4 border-[#D4A017] mb-6" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-[#1A1A2E] flex items-center justify-center border-4 border-[#D4A017] mb-6">
                    <span className="text-[#D4A017] text-3xl font-bold font-serif">{g.name?.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                
                <h3 className="text-2xl font-serif font-bold text-[#1A1A2E] mb-2">{g.name}</h3>
                <div className="text-yellow-500 mb-4">{"⭐".repeat(g.rating || 5)}</div>
                
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {(g.languages || []).map((l: string) => (
                    <span key={l} className="bg-[#2C7A5C]/10 text-[#2C7A5C] text-xs font-bold px-2 py-1 rounded-full">{l}</span>
                  ))}
                </div>

                <p className="text-gray-600 mb-6 italic">"{bio}"</p>

                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {(g.specialities || []).map((s: string) => (
                    <span key={s} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full border border-gray-200">{s}</span>
                  ))}
                </div>

                <div className="mt-auto flex gap-4 w-full">
                  <a href={`https://wa.me/${g.whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors">
                    <MessageCircle className="w-5 h-5" /> WhatsApp
                  </a>
                  {g.instagram && (
                    <a href={`https://instagram.com/${g.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-pink-100 hover:bg-pink-200 text-pink-600 rounded-xl flex items-center justify-center transition-colors shrink-0">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
