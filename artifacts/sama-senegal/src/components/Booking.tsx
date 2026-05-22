import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Send, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface ServiceItem {
  id: string;
  name: string;
  price?: number;
  emoji?: string;
  category: string;
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  preselectedTour?: string;
}

export function BookingModal({ open, onClose, preselectedTour }: BookingModalProps) {
  const { t } = useLanguage();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [allServices, setAllServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: tours } = await supabase.from("tours").select("*").eq("active", true);
      const { data: transport } = await supabase.from("transport").select("*").eq("active", true);
      const { data: restaurants } = await supabase.from("restaurants").select("*").eq("active", true);
      const { data: hotels } = await supabase.from("hotels").select("*").eq("active", true);
      const { data: activities } = await supabase.from("activities").select("*").eq("active", true);

      const services: ServiceItem[] = [
        ...(tours || []).map((t: any) => ({ ...t, category: "🌴 Tours & Excursions" })),
        ...(transport || []).map((t: any) => ({ ...t, category: "🚗 Transport" })),
        ...(activities || []).map((a: any) => ({ ...a, category: "🎯 Activités" })),
        ...(restaurants || []).map((r: any) => ({ ...r, category: "🍽️ Restaurants" })),
        ...(hotels || []).map((h: any) => ({ ...h, category: "🏨 Hébergements" })),
      ];
      setAllServices(services);

      if (preselectedTour) {
        const found = services.find((s) => s.name === preselectedTour);
        if (found) setSelectedServices([found.id]);
      }
    };
    load();
  }, [preselectedTour]);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const groupedServices = allServices.reduce((acc: Record<string, ServiceItem[]>, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const people = formData.get("people");
    const extra = formData.get("extra");

    const servicesText =
      selectedServices.length > 0
        ? allServices
            .filter((s) => selectedServices.includes(s.id))
            .map((s) => `  • ${s.emoji || ""} ${s.name}${s.price ? ` - ${s.price} FCFA` : ""}`)
            .join("\n")
        : "Non spécifié";

    const text = `🌴 *NOUVELLE RÉSERVATION — Sama Senegal*

👤 *Client:* ${name}
📞 *Téléphone:* ${phone}
📧 *Email:* ${email || "Non fourni"}
👥 *Nombre de personnes:* ${people}

🗓️ *Date souhaitée:* ${date ? format(date, "dd/MM/yyyy") : "Non spécifiée"}
⏰ *Heure souhaitée:* ${time || "Non spécifiée"}

🎯 *Services sélectionnés:*
${servicesText}

💬 *Demande supplémentaire:*
${extra || "Aucune"}

---
_Réservation reçue via sama-senegal.vercel.app_`;

    window.open(`https://wa.me/221774188107?text=${encodeURIComponent(text)}`, "_blank");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-primary to-foreground rounded-3xl shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-primary/90 backdrop-blur-md border-b border-white/10 rounded-t-3xl">
          <h2 className="text-2xl font-serif font-bold text-white">Réserver votre expérience</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">{t("booking_name")} *</label>
              <Input name="name" required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">{t("booking_email")}</label>
              <Input type="email" name="email" className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">{t("booking_phone")} *</label>
              <Input type="tel" name="phone" required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">{t("booking_people")} *</label>
              <Input type="number" name="people" min="1" required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11" />
            </div>
          </div>

          {/* Date et heure natifs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">{t("booking_date")}</label>
              <input
                type="date"
                value={date ? format(date, "yyyy-MM-dd") : ""}
                onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : undefined)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="w-full bg-white/10 border border-white/20 text-white h-11 rounded-md px-3 [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Heure souhaitée</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white h-11 rounded-md px-3 [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-white/80">
              Services souhaités <span className="text-white/50">(sélection multiple)</span>
            </label>
            {Object.keys(groupedServices).length === 0 ? (
              <p className="text-white/50 text-sm">Chargement des services...</p>
            ) : (
              Object.entries(groupedServices).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <p className="text-xs font-bold text-white/60 uppercase tracking-wider">{category}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleService(item.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                          selectedServices.includes(item.id)
                            ? "bg-secondary/30 border-secondary text-white"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          selectedServices.includes(item.id) ? "bg-secondary border-secondary" : "border-white/30"
                        )}>
                          {selectedServices.includes(item.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm font-medium">{item.emoji} {item.name}</span>
                        {item.price && (
                          <span className="ml-auto text-xs text-white/50">{item.price} FCFA</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Demande supplémentaire</label>
            <Textarea
              name="extra"
              rows={3}
              placeholder="Allergies, accessibilité, demandes spéciales..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold h-12 text-lg rounded-2xl"
          >
            <Send className="w-5 h-5 mr-2" />
            Confirmer ma réservation
          </Button>
          <p className="text-center text-white/40 text-xs">
            Vous serez redirigé vers WhatsApp pour finaliser
          </p>
        </form>
      </div>
    </div>
  );
}