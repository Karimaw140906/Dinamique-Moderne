import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import { Users, Snowflake, CheckCircle2 } from "lucide-react";

export function TransportSection() {
  const { t, language } = useLanguage();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const loadVehicles = () => {
    const saved = localStorage.getItem("transportData");
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        setVehicles(parsed.filter((v: any) => v.active));
      } catch { }
    }
  };

  useEffect(() => {
    loadVehicles();
    window.addEventListener("transportDataUpdated", loadVehicles);
    return () => window.removeEventListener("transportDataUpdated", loadVehicles);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  if (vehicles.length === 0) return null;

  return (
    <section id="transport" className="py-24 bg-white text-[#1A1A2E]" ref={ref}>
      <div className={`container mx-auto px-4 md:px-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">{t("transport_title")}</h2>
          <div className="w-24 h-1 bg-[#2C7A5C] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((v) => {
            const desc = language === "EN" ? v.descEN : language === "ES" ? v.descES : v.descFR;
            return (
              <div key={v.id} className="bg-[#F5F0E8] rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all flex flex-col">
                {v.photo ? (
                  <img src={v.photo} alt={v.name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-5xl">🚗</div>
                )}
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-[#1A1A2E]">{v.name}</h3>
                    <span className="bg-[#2C7A5C] text-white text-xs font-bold px-2 py-1 rounded-full">{v.category}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{desc}</p>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-1 text-sm bg-white px-2 py-1 rounded border border-gray-200">
                      <Users className="w-4 h-4 text-gray-500" /> {v.seats} {t("transport_seats")}
                    </div>
                    {v.aircon && (
                      <div className="flex items-center gap-1 text-sm bg-white px-2 py-1 rounded border border-gray-200">
                        <Snowflake className="w-4 h-4 text-blue-500" /> {t("transport_aircon")}
                      </div>
                    )}
                    {v.driverIncluded && (
                      <div className="flex items-center gap-1 text-sm bg-green-50 px-2 py-1 rounded border border-green-200 text-green-700">
                        <CheckCircle2 className="w-4 h-4" /> {t("transport_driver")}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <div className="text-sm text-gray-500">{t("transport_per_day")}</div>
                        <div className="text-2xl font-bold text-[#D4A017]">{v.priceDay.toLocaleString()} FCFA</div>
                      </div>
                      {v.priceHalf > 0 && (
                        <div className="text-right">
                          <div className="text-xs text-gray-400">{t("transport_per_half")}</div>
                          <div className="text-sm font-bold text-gray-600">{v.priceHalf.toLocaleString()} FCFA</div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        const select = document.querySelector('select[name="tour"]');
                        if (select) (select as HTMLSelectElement).value = v.name;
                        document.querySelector("#reserver")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-full bg-[#1A1A2E] hover:bg-[#2C7A5C] text-white py-3 rounded-xl font-bold transition-colors"
                    >
                      {t("transport_book")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
