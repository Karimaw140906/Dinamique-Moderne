import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Send, Check, X, Download, Copy, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { generateBookingPDF, generateBookingRef } from "@/lib/generatePDF";

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
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
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
        const found = services.find((s) => s.name === preselectedTour || s.name_fr === preselectedTour);
        if (found) setSelectedServices([found.id]);
      }

      // Charger les dates bloquées
      try {
        const { data: avail } = await supabase
          .from("availabilities")
          .select("date")
          .eq("blocked", true)
          .gte("date", format(new Date(), "yyyy-MM-dd"));
        if (avail) setBlockedDates(avail.map((a: any) => a.date));
      } catch { }
    };
    load();
  }, [open, preselectedTour]);

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

  const handleClose = () => {
    setConfirmed(null);
    setSelectedServices([]);
    setDate(undefined);
    setTime("");
    setDateError(null);
    onClose();
  };

  const handleDateChange = (val: string) => {
    if (!val) { setDate(undefined); setDateError(null); return; }
    const iso = val; // yyyy-MM-dd
    if (blockedDates.includes(iso)) {
      setDateError("⛔ Cette date est indisponible. Veuillez choisir une autre date.");
      setDate(undefined);
    } else {
      setDateError(null);
      setDate(new Date(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (dateError) return;

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const phone = String(formData.get("phone") || "");
    const people = String(formData.get("people") || "");
    const extra = String(formData.get("extra") || "");
    const ref = generateBookingRef();

    const selectedNames = allServices
      .filter((s) => selectedServices.includes(s.id))
      .map((s) => `${s.emoji || ""} ${s.name}`.trim());

    const servicesText = selectedNames.length > 0
      ? selectedNames.map((n) => `  • ${n}`).join("\n")
      : "Non spécifié";

    const text = `🌴 *NOUVELLE RÉSERVATION — Sama Senegal*

👤 *Client:* ${name}
📞 *Téléphone:* ${phone}
📧 *Email:* ${email || "Non fourni"}
👥 *Nombre de personnes:* ${people}
🔖 *Référence:* ${ref}

🗓️ *Date souhaitée:* ${date ? format(date, "dd/MM/yyyy") : "Non spécifiée"}
⏰ *Heure souhaitée:* ${time || "Non spécifiée"}

🎯 *Services sélectionnés:*
${servicesText}

💬 *Demande supplémentaire:*
${extra || "Aucune"}

---
_Réservation reçue via sama-senegal.vercel.app_`;

    // Envoyer au prestataire du service sélectionné ou au numéro principal
    const selected = allServices.filter(s => selectedServices.includes(s.id));
    const providerNumbers = [...new Set(selected.map((s: any) => s.whatsapp).filter(Boolean))];
    const targets = providerNumbers.length > 0 ? providerNumbers : ["221774188107"];
    targets.forEach(num => {
      window.open(`https://wa.me/${num.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`, "_blank");
    });
    setConfirmed(ref);

    try {
      await supabase.from("bookings").insert({
        ref,
        name,
        email,
        phone,
        people: parseInt(people),
        date: date ? format(date, "yyyy-MM-dd") : null,
        time: time || null,
        services: selectedNames,
        extra: extra || null,
        status: "pending",
      });
    } catch { }
  };

  const handleDownloadPDF = async () => {
    if (!confirmed) return;
    setGenerating(true);
    try {
      const form = document.querySelector("form#booking-form") as HTMLFormElement;
      const fd = form ? new FormData(form) : new FormData();
      const selectedNames = allServices
        .filter((s) => selectedServices.includes(s.id))
        .map((s) => `${s.emoji || ""} ${s.name}`.trim());

      await generateBookingPDF({
        name: String(fd.get("name") || ""),
        phone: String(fd.get("phone") || ""),
        email: String(fd.get("email") || ""),
        people: String(fd.get("people") || ""),
        date: date ? format(date, "dd/MM/yyyy") : "Non spécifiée",
        time: time || "Non spécifiée",
        services: selectedNames.length > 0 ? selectedNames : ["Non spécifié"],
        extra: String(fd.get("extra") || ""),
        ref: confirmed,
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyRef = () => {
    if (confirmed) {
      navigator.clipboard.writeText(confirmed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-primary to-foreground rounded-3xl shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-primary/90 backdrop-blur-md border-b border-white/10 rounded-t-3xl">
          <h2 className="text-2xl font-serif font-bold text-white">
            {confirmed ? "✅ Réservation confirmée !" : "Réserver votre expérience"}
          </h2>
          <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {confirmed ? (
          <div className="p-8 flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-[#2C7A5C] flex items-center justify-center">
              <Check className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="text-white text-lg mb-2">Votre demande a été envoyée via WhatsApp.</p>
              <p className="text-white/60 text-sm">Conservez votre référence de réservation :</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-8 py-4 flex items-center gap-4">
              <span className="text-2xl font-bold text-[#D4A017] tracking-widest">{confirmed}</span>
              <button onClick={copyRef} className="text-white/60 hover:text-white transition-colors">
                {copied ? <Check className="w-5 h-5 text-[#2C7A5C]" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-white/40 text-xs">Notre équipe vous contactera dans les plus brefs délais.</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={handleDownloadPDF}
                disabled={generating}
                className="flex-1 bg-[#D4A017] hover:bg-[#b8880f] text-white font-bold h-12 rounded-2xl">
                <Download className="w-5 h-5 mr-2" />
                {generating ? "Génération..." : "Télécharger la confirmation (PNG)"}
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10 h-12 rounded-2xl">
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <form id="booking-form" onSubmit={handleSubmit} className="p-6 space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">{t("booking_date")}</label>
                <input
                  type="date"
                  value={date ? format(date, "yyyy-MM-dd") : ""}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className={cn(
                    "w-full bg-white/10 border text-white h-11 rounded-md px-3 [color-scheme:dark] focus:outline-none focus:ring-2",
                    dateError
                      ? "border-red-400 focus:ring-red-400"
                      : "border-white/20 focus:ring-white/30"
                  )}
                />
                {dateError && (
                  <div className="flex items-center gap-2 text-red-300 text-xs mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{dateError}</span>
                  </div>
                )}
                {blockedDates.length > 0 && !dateError && (
                  <p className="text-white/40 text-xs mt-1">
                    {blockedDates.length} date{blockedDates.length > 1 ? "s" : ""} indisponible{blockedDates.length > 1 ? "s" : ""} ce mois
                  </p>
                )}
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
                          )}>
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                            selectedServices.includes(item.id) ? "bg-secondary border-secondary" : "border-white/30"
                          )}>
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
              disabled={!!dateError}
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold h-12 text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed">
              <Send className="w-5 h-5 mr-2" />
              Confirmer ma réservation
            </Button>
            <p className="text-center text-white/40 text-xs">
              Vous serez redirigé vers WhatsApp pour finaliser
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
