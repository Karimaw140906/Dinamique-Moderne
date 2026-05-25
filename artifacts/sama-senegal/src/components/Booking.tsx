import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Send, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { printQRConfirmation } from "@/components/QRConfirmation";

interface ServiceItem {
  id: string;
  name: string;
  price?: number;
  emoji?: string;
  category: string;
  whatsapp?: string;
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  preselectedTour?: string;
}

function generateRef() {
  return "SS-" + Date.now().toString(36).toUpperCase();
}

export function BookingModal({ open, onClose, preselectedTour }: BookingModalProps) {
  const { t } = useLanguage();
  const { session } = useAuth();
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [allServices, setAllServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const [r1, r2, r3, r4, r5] = await Promise.all([
        supabase.from("tours").select("*").eq("active", true),
        supabase.from("transport").select("*").eq("active", true),
        supabase.from("restaurants").select("*").eq("active", true),
        supabase.from("hotels").select("*").eq("active", true),
        supabase.from("activities").select("*").eq("active", true),
      ]);
      const services: ServiceItem[] = [
        ...(r1.data || []).map((t: any) => ({ ...t, name: t.name || t.nameFR, category: "🌴 Tours & Excursions" })),
        ...(r2.data || []).map((t: any) => ({ ...t, category: "🚗 Transport" })),
        ...(r3.data || []).map((r: any) => ({ ...r, category: "🍽️ Restaurants" })),
        ...(r4.data || []).map((h: any) => ({ ...h, category: "🏨 Hébergements" })),
        ...(r5.data || []).map((a: any) => ({ ...a, name: a.name_fr || a.nameFR, category: "🎯 Activités" })),
      ];
      setAllServices(services);
      if (preselectedTour) {
        const found = services.find(s => s.name === preselectedTour);
        if (found) setSelectedServices([found.id]);
      }
    };
    load();
  }, [open, preselectedTour]);

  const toggleService = (id: string) => {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const groupedServices = allServices.reduce((acc: Record<string, ServiceItem[]>, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const people = parseInt(formData.get("people") as string) || 1;
    const extra = formData.get("extra") as string;

    const selected = allServices.filter(s => selectedServices.includes(s.id));
    const ref = generateRef();

    // Sauvegarder dans Supabase
    try {
      for (const service of selected) {
        const categoryMap: Record<string, string> = {
          "🌴 Tours & Excursions": "tours",
          "🚗 Transport": "transport",
          "🍽️ Restaurants": "restaurant",
          "🏨 Hébergements": "hotel",
          "🎯 Activités": "activites",
        };
        await supabase.from("reservations").insert({
          ref: selected.length === 1 ? ref : `${ref}-${service.id.slice(0, 4)}`,
          client_name: name,
          client_phone: phone,
          client_email: email,
          service_type: categoryMap[service.category] || "tours",
          service_name: service.name,
          provider_whatsapp: service.whatsapp || "",
          date,
          time,
          people,
          extra,
          status: "pending",
        });
      }
    } catch {}

    // Envoyer WhatsApp
    const servicesText = selected.length > 0
      ? selected.map(s => `  • ${s.emoji || ""} ${s.name}${s.price ? ` - ${s.price} FCFA` : ""}`).join("\n")
      : "Non spécifié";

    const text = `🌴 *NOUVELLE RÉSERVATION — Sama Senegal*\n\n📋 *Réf:* ${ref}\n👤 *Client:* ${name}\n📞 *Téléphone:* ${phone}\n📧 *Email:* ${email || "Non fourni"}\n👥 *Personnes:* ${people}\n\n🗓️ *Date:* ${date || "Non spécifiée"}\n⏰ *Heure:* ${time || "Non spécifiée"}\n\n🎯 *Services:*\n${servicesText}\n\n💬 *Note:*\n${extra || "Aucune"}\n\n---\n_Réservation reçue via sama-senegal.vercel.app_`;

    // Notifier prestataires sur leurs numéros dédiés
    const providerNumbers = [...new Set(selected.map(s => s.whatsapp).filter(Boolean))];
    if (providerNumbers.length > 0) {
      for (const num of providerNumbers) {
        window.open(`https://wa.me/${num.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`, "_blank");
      }
    } else {
      window.open(`https://wa.me/221774188107?text=${encodeURIComponent(text)}`, "_blank");
    }

    // Afficher confirmation QR si un service sélectionné
    if (selected.length > 0) {
      const categoryMap: Record<string, string> = {
        "🌴 Tours & Excursions": "tours",
        "🚗 Transport": "transport",
        "🍽️ Restaurants": "restaurant",
        "🏨 Hébergements": "hotel",
        "🎯 Activités": "activites",
      };
      printQRConfirmation({
        ref,
        client_name: name,
        client_phone: phone,
        service_type: categoryMap[selected[0].category] || "tours",
        service_name: selected.map(s => s.name).join(", "),
        date,
        time,
        people,
        extra,
        status: "pending",
      });
    }

    setLoading(false);
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); onClose(); }, 3000);
  };

  if (!open) return null;

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">Réservation envoyée !</h2>
          <p className="text-gray-500 text-sm">Votre PDF de confirmation s'ouvre automatiquement. Vous serez contacté rapidement.</p>
        </div>
      </div>
    );
  }

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
              <Input name="name" required defaultValue={session?.clientUser ? `${session.clientUser.firstName} ${session.clientUser.lastName}` : ""} className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">{t("booking_email")}</label>
              <Input type="email" name="email" defaultValue={session?.clientUser?.email || ""} className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">{t("booking_phone")} *</label>
              <Input type="tel" name="phone" required defaultValue={session?.clientUser?.whatsapp || ""} className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">{t("booking_people")} *</label>
              <Input type="number" name="people" min="1" required defaultValue="1" className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">{t("booking_date")}</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="w-full bg-white/10 border border-white/20 text-white h-11 rounded-md px-3 [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-white/30" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Heure souhaitée</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white h-11 rounded-md px-3 [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-white/30" />
            </div>
          </div>

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
                    {items.map(item => (
                      <button key={item.id} type="button" onClick={() => toggleService(item.id)}
                        className={cn("flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                          selectedServices.includes(item.id) ? "bg-secondary/30 border-secondary text-white" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10")}>
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          selectedServices.includes(item.id) ? "bg-secondary border-secondary" : "border-white/30")}>
                          {selectedServices.includes(item.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm font-medium">{item.emoji} {item.name}</span>
                        {item.price && <span className="ml-auto text-xs text-white/50">{item.price} FCFA</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Demande supplémentaire</label>
            <Textarea name="extra" rows={3} placeholder="Allergies, accessibilité, demandes spéciales..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none" />
          </div>

          <Button type="submit" size="lg" disabled={loading}
            className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold h-12 text-lg rounded-2xl disabled:opacity-60">
            <Send className="w-5 h-5 mr-2" />
            {loading ? "Envoi en cours..." : "Confirmer ma réservation"}
          </Button>
          <p className="text-center text-white/40 text-xs">
            Un PDF de confirmation avec QR code sera généré automatiquement
          </p>
        </form>
      </div>
    </div>
  );
}
