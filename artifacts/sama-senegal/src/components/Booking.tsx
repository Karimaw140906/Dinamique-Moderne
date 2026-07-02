import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Send, Check, X, Download, Copy, AlertCircle, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateBookingPDF, generateBookingRef } from "@/lib/generatePDF";
import { printQRConfirmation, QRConfirmation } from "./QRConfirmation";
import { supabase } from "@/lib/supabase";

interface ServiceItem {
  id: string;
  name: string;
  price?: number;
  emoji?: string;
  category: string;
  whatsapp?: string;
  created_by?: string;
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  preselectedTour?: string;
}

function loadServicesFromLS(): ServiceItem[] {
  const tryParse = (key: string) => {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
  };
  const tours       = tryParse("toursData").filter((x: any) => x.active !== false);
  const transport   = tryParse("transportData").filter((x: any) => x.active !== false);
  const activities  = tryParse("activitiesData").filter((x: any) => x.active !== false);
  const restaurants = tryParse("restaurantsData").filter((x: any) => x.active !== false);
  const hotels      = tryParse("hotelsData").filter((x: any) => x.active !== false);
  const destinations = tryParse("destinationsData").filter((x: any) => x.active !== false);

  const svc: ServiceItem[] = [
    ...tours.map((t: any) => ({ id: String(t.id), whatsapp: t.whatsapp, created_by: t.created_by, name: t.name || t.nameFR || "Tour", price: t.price, emoji: "🌴", category: "🌴 Tours & Excursions" })),
    ...transport.map((t: any) => ({ id: `tr-${t.id}`, whatsapp: t.whatsapp, created_by: t.created_by, name: t.name || "Véhicule", price: t.price_day || t.priceDay, emoji: "🚗", category: "🚗 Transport" })),
    ...activities.map((a: any) => ({ id: `ac-${a.id}`, whatsapp: a.whatsapp, created_by: a.created_by, name: a.nameFR || a.name_fr || "Activité", price: a.price, emoji: "🎯", category: "🎯 Activités" })),
    ...restaurants.map((r: any) => ({ id: `re-${r.id}`, whatsapp: r.whatsapp, created_by: r.created_by, name: r.name || "Restaurant", emoji: "🍽️", category: "🍽️ Restaurants" })),
    ...hotels.map((h: any) => ({ id: `ho-${h.id}`, whatsapp: h.whatsapp, created_by: h.created_by, name: h.name || "Hébergement", price: h.price_night || h.priceNight, emoji: "🏨", category: "🏨 Hébergements" })),
    ...destinations.map((d: any) => ({ id: `de-${d.id}`, whatsapp: d.whatsapp, created_by: d.created_by, name: d.name || "Destination", emoji: "📍", category: "📍 Destinations" })),
  ];

  if (svc.length === 0) {
    return [
      { id: "1", name: "Tour Île de Gorée", emoji: "🌴", category: "🌴 Tours & Excursions", price: 25000 },
      { id: "2", name: "Visite Dakar", emoji: "🌴", category: "🌴 Tours & Excursions", price: 15000 },
      { id: "3", name: "Toyota HiAce (minibus)", emoji: "🚗", category: "🚗 Transport", price: 80000 },
      { id: "4", name: "Balade en Pirogue", emoji: "🎯", category: "🎯 Activités", price: 8000 },
      { id: "5", name: "Le Petit Baobab", emoji: "🍽️", category: "🍽️ Restaurants" },
      { id: "6", name: "Hôtel Gorée Saly", emoji: "🏨", category: "🏨 Hébergements", price: 85000 },
    ];
  }
  return svc;
}

function loadBlockedDates(): string[] {
  try {
    const avail = JSON.parse(localStorage.getItem("availabilities") || "[]");
    const today = format(new Date(), "yyyy-MM-dd");
    return avail.filter((a: any) => a.blocked && a.date >= today).map((a: any) => a.date);
  } catch { return []; }
}

async function saveBookingToSupabase(booking: any): Promise<boolean> {
  try {
    const { error } = await supabase.from("bookings").insert({
      client_name:    booking.client_name,
      client_email:   booking.client_email || null,
      client_whatsapp: booking.client_whatsapp,
      service_type:   booking.service_type,
      service_name:   booking.service_name,
      people_count:   booking.people_count,
      booking_date:   booking.booking_date || null,
      booking_time:   booking.booking_time || null,
      extras:         booking.extras || null,
      booking_status: "pending",
      payment_status: "unpaid",
      created_at:     new Date().toISOString(),
    });
    return !error;
  } catch { return false; }
}

function saveBookingToLS(booking: any) {
  try {
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    bookings.unshift(booking);
    localStorage.setItem("bookings", JSON.stringify(bookings));
    window.dispatchEvent(new Event("bookingsUpdated"));
  } catch {}
}

// Notification interne (table "messages") vers l'admin + le(s) créateur(s)
// des offres réservées (prestataire ou guide principal). Best-effort :
// une notification manquée ne doit jamais bloquer la réservation elle-même.
const ADMIN_MESSAGE_KEY = "admin@samasenegal.com";

async function notifyProviders(ref: string, selectedItems: ServiceItem[], clientName: string) {
  const targets = new Set<string>([ADMIN_MESSAGE_KEY]);
  selectedItems.forEach((s: any) => { if (s.created_by) targets.add(s.created_by); });

  const serviceLabel = selectedItems.length > 0
    ? selectedItems.map((s: any) => s.name).join(", ")
    : "Demande générale";
  const content = `🆕 Nouvelle réservation ${ref} — ${clientName} — ${serviceLabel}`;
  const now = new Date().toISOString();

  for (const to of targets) {
    try {
      await supabase.from("messages").insert({
        from_user: "system@samasenegal.com",
        to_user: to,
        content,
        read: false,
        created_at: now,
      });
    } catch {}
  }

  try {
    const local = JSON.parse(localStorage.getItem("messages") || "[]");
    targets.forEach((to) => {
      local.push({ from_user: "system@samasenegal.com", to_user: to, content, read: false, created_at: now });
    });
    localStorage.setItem("messages", JSON.stringify(local));
    window.dispatchEvent(new Event("messagesUpdated"));
  } catch {}
}

export function BookingModal({ open, onClose, preselectedTour }: BookingModalProps) {
  const { t } = useLanguage();
  const { session, setShowModal } = useAuth();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [step, setStep] = useState<"select" | "form">("select");
  const [allServices, setAllServices] = useState<ServiceItem[]>([]);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [confirmedData, setConfirmedData] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [dateError, setDateError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [lastFormData, setLastFormData] = useState<any>(null);

  useEffect(() => {
    if (!open) return;
    const services = loadServicesFromLS();
    setAllServices(services);
    setBlockedDates(loadBlockedDates());
    if (preselectedTour) {
      const found = services.find((s) =>
        s.name.toLowerCase() === preselectedTour.toLowerCase() ||
        s.name.toLowerCase().includes(preselectedTour.toLowerCase())
      );
      if (found) {
        setSelectedServices([found.id]);
        setStep("form");
      } else {
        setStep("select");
      }
    } else {
      setStep("select");
    }
  }, [open, preselectedTour]);

  useEffect(() => {
    if (!open) return;
    const reload = () => setAllServices(loadServicesFromLS());
    const events = ["toursDataUpdated","transportDataUpdated","activitiesDataUpdated","restaurantsDataUpdated","hotelsDataUpdated","destinationsDataUpdated"];
    events.forEach(e => window.addEventListener(e, reload));
    return () => events.forEach(e => window.removeEventListener(e, reload));
  }, [open]);

  const toggleService = (id: string) => {
    setSelectedServices((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const groupedServices = allServices.reduce((acc: Record<string, ServiceItem[]>, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleClose = () => {
    setConfirmed(null);
    setConfirmedData(null);
    setSelectedServices([]);
    setStep("select");
    setDate(undefined);
    setTime("");
    setDateError(null);
    setShowQR(false);
    setLastFormData(null);
    onClose();
  };

  const handleDateChange = (val: string) => {
    if (!val) { setDate(undefined); setDateError(null); return; }
    if (blockedDates.includes(val)) {
      setDateError("⛔ Cette date est indisponible. Veuillez choisir une autre date.");
      setDate(undefined);
    } else {
      setDateError(null);
      setDate(new Date(val + "T12:00:00"));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (dateError) return;

    const formData = new FormData(e.currentTarget);
    const name   = String(formData.get("name") || "");
    const email  = String(formData.get("email") || "");
    const phone  = String(formData.get("phone") || "");
    const people = String(formData.get("people") || "1");
    const extra  = String(formData.get("extra") || "");
    const ref    = generateBookingRef();

    const selectedItems = allServices.filter((s) => selectedServices.includes(s.id));
    const selectedNames = selectedItems.map((s) => `${s.emoji || ""} ${s.name}`.trim());
    const servicesText  = selectedNames.length > 0 ? selectedNames.map((n) => `  • ${n}`).join("\n") : "Non spécifié";
    const dateStr = date ? format(date, "dd/MM/yyyy") : "Non spécifiée";
    const dateISO = date ? format(date, "yyyy-MM-dd") : null;

    // Déterminer type de service
    const primaryCategory = selectedItems[0]?.category || "";
    let serviceType = "tours";
    if (primaryCategory.includes("Transport")) serviceType = "transport";
    else if (primaryCategory.includes("Activité")) serviceType = "activites";
    else if (primaryCategory.includes("Restaurant")) serviceType = "restaurant";
    else if (primaryCategory.includes("Hébergement")) serviceType = "hotel";

    // Objet réservation commun
    const bookingData = {
      ref,
      client_name:    name,
      client_email:   email || null,
      client_whatsapp: phone,
      service_type:   serviceType,
      service_name:   selectedItems[0]?.name || "Sama Senegal",
      people_count:   parseInt(people) || 1,
      booking_date:   dateISO,
      booking_time:   time || null,
      extras:         extra || null,
      booking_status: "pending",
      payment_status: "unpaid",
      services:       selectedNames,
      created_at:     new Date().toISOString(),
      // Champs compat localStorage
      name, email, phone,
      people: parseInt(people) || 1,
      date:   dateStr,
      time:   time || null,
      extra:  extra || null,
      status: "pending",
    };

    // 1. Sauvegarder dans Supabase
    const savedToSupabase = await saveBookingToSupabase(bookingData);

    // 2. Toujours sauvegarder en localStorage (backup + admin local)
    saveBookingToLS({ ...bookingData, ref });

    // 2bis. Notifier l'admin + le(s) prestataire(s)/guide(s) concerné(s)
    await notifyProviders(ref, selectedItems, name);

    // 3. Envoyer WhatsApp
    const text = `🌴 *NOUVELLE RÉSERVATION — Sama Senegal*\n\n👤 *Client:* ${name}\n📞 *Téléphone:* ${phone}\n📧 *Email:* ${email || "Non fourni"}\n👥 *Personnes:* ${people}\n🔖 *Référence:* ${ref}\n\n🗓️ *Date:* ${dateStr}\n⏰ *Heure:* ${time || "Non spécifiée"}\n\n🎯 *Services:*\n${servicesText}\n\n💬 *Demande:*\n${extra || "Aucune"}\n\n${savedToSupabase ? "✅ Enregistré dans le système" : "⚠️ Sauvegarde locale uniquement"}\n\n---\n_Réservation reçue via Sama Sénégal_`;

    const providerNumbers = [...new Set(selectedItems.map((s: any) => s.whatsapp).filter(Boolean))];
    const targets = providerNumbers.length > 0 ? providerNumbers : ["221774188107"];
    targets.forEach(num => {
      window.open(`https://wa.me/${num.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`, "_blank");
    });

    setConfirmed(ref);
    setConfirmedData(bookingData);
    setLastFormData({ name, email, phone, people, date: dateStr, time: time || "Non spécifiée", services: selectedNames, extra });
  };

  const handleDownloadPDF = async () => {
    if (!confirmed || !lastFormData) return;
    setGenerating(true);
    try {
      await generateBookingPDF({
        name: lastFormData.name, phone: lastFormData.phone, email: lastFormData.email,
        people: lastFormData.people, date: lastFormData.date, time: lastFormData.time,
        services: lastFormData.services.length > 0 ? lastFormData.services : ["Non spécifié"],
        extra: lastFormData.extra, ref: confirmed,
      });
    } finally { setGenerating(false); }
  };

  const handleShowQR = () => {
    if (confirmedData) {
      printQRConfirmation({
        ref: confirmedData.ref, client_name: lastFormData?.name || "",
        client_phone: lastFormData?.phone, service_type: confirmedData.service_type,
        service_name: confirmedData.service_name, date: lastFormData?.date,
        time: lastFormData?.time, people: lastFormData?.people,
        extra: lastFormData?.extra, status: "pending",
      });
    }
  };

  const copyRef = () => {
    if (confirmed) { navigator.clipboard.writeText(confirmed); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  if (!open) return null;

  // Rediriger vers connexion si non connecté
  if (open && !session) {
    onClose();
    setShowModal(true);
    return null;
  }

  return (
    <>
      {showQR && confirmedData && (
        <QRConfirmation
          reservation={{ ref: confirmedData.ref, client_name: lastFormData?.name || "", client_phone: lastFormData?.phone, service_type: confirmedData.service_type, service_name: confirmedData.service_name, date: lastFormData?.date, time: lastFormData?.time, people: lastFormData?.people, extra: lastFormData?.extra, status: "pending" }}
          onClose={() => setShowQR(false)}
        />
      )}

      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-primary to-foreground rounded-3xl shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-primary/90 backdrop-blur-md border-b border-white/10 rounded-t-3xl">
            <div>
              {!confirmed && (
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full transition-colors", step === "select" ? "bg-[#F5B942]" : "bg-white/20")} />
                  <span className={cn("w-1.5 h-1.5 rounded-full transition-colors", step === "form" ? "bg-[#F5B942]" : "bg-white/20")} />
                  <span className="text-white/40 text-xs font-bold uppercase tracking-wider">
                    Étape {step === "select" ? "1" : "2"} sur 2
                  </span>
                </div>
              )}
              <h2 className="text-2xl font-serif italic font-bold text-white">
                {confirmed ? "Réservation confirmée !" : step === "select" ? "Choisissez vos offres" : "Vos informations"}
              </h2>
            </div>
            <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors shrink-0">
              <X className="w-6 h-6" />
            </button>
          </div>

          {confirmed ? (
            <div className="p-8 flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 rounded-full bg-[#6C3EF5] flex items-center justify-center">
                <Check className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-white text-lg mb-2">Votre demande a été envoyée via WhatsApp.</p>
                <p className="text-white/60 text-sm">Conservez votre référence :</p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl px-8 py-4 flex items-center gap-4">
                <span className="text-2xl font-bold text-[#F5B942] tracking-widest">{confirmed}</span>
                <button onClick={copyRef} className="text-white/60 hover:text-white transition-colors">
                  {copied ? <Check className="w-5 h-5 text-[#6C3EF5]" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-white/40 text-xs">Notre équipe vous contactera dans les plus brefs délais.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                <Button onClick={handleDownloadPDF} disabled={generating} className="bg-[#F5B942] hover:bg-[#b8880f] text-white font-bold h-12 rounded-2xl">
                  <Download className="w-5 h-5 mr-2" />{generating ? "Génération..." : "PDF"}
                </Button>
                <Button onClick={handleShowQR} className="bg-[#6C3EF5] hover:bg-[#8B5CF6] text-white font-bold h-12 rounded-2xl">
                  <QrCode className="w-5 h-5 mr-2" />QR Code
                </Button>
                <Button onClick={handleClose} variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12 rounded-2xl">
                  Fermer
                </Button>
              </div>
            </div>
          ) : step === "select" ? (
            <div className="p-6 space-y-6">
              <div>
                <p className="text-white/50 text-sm">Sélectionnez une ou plusieurs offres, puis continuez vers le formulaire.</p>
              </div>
              {Object.keys(groupedServices).length === 0 ? (
                <p className="text-white/50 text-sm">Chargement des offres...</p>
              ) : (
                Object.entries(groupedServices).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white/60 uppercase tracking-wider whitespace-nowrap">{category}</p>
                      <span className="flex-1 h-px bg-white/10" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {items.map((item) => (
                        <button key={item.id} type="button" onClick={() => toggleService(item.id)}
                          className={cn("flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                            selectedServices.includes(item.id) ? "bg-secondary/30 border-secondary text-white" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10")}>
                          <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0", selectedServices.includes(item.id) ? "bg-secondary border-secondary" : "border-white/30")}>
                            {selectedServices.includes(item.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium">{item.emoji} {item.name}</span>
                          {item.price && <span className="ml-auto text-xs text-white/50 shrink-0">{item.price.toLocaleString("fr-FR")} FCFA</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
              <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-4 flex items-center justify-between gap-3 border-t border-white/10 bg-primary/95 backdrop-blur-md rounded-b-3xl">
                <div className="flex flex-col gap-0.5">
                  <span className="text-white/70 text-sm font-medium">
                    {selectedServices.length > 0 ? `${selectedServices.length} offre(s) sélectionnée(s)` : "Aucune offre sélectionnée"}
                  </span>
                  {selectedServices.length > 0 && (
                    <button type="button" onClick={() => setSelectedServices([])}
                      className="text-white/40 hover:text-white/70 text-xs text-left underline underline-offset-2 w-fit transition-colors">
                      Effacer la sélection
                    </button>
                  )}
                </div>
                <Button type="button" onClick={() => setStep("form")} disabled={selectedServices.length === 0}
                  className="bg-secondary hover:bg-secondary/90 text-white font-bold h-11 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                  Continuer <Send className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <form id="booking-form" onSubmit={handleSubmit} className="p-6 space-y-6">
              <button type="button" onClick={() => setStep("select")}
                className="text-white/60 hover:text-white text-sm flex items-center gap-1 -mt-2">
                ← Modifier la sélection
              </button>

              <div className="flex flex-wrap gap-2 pb-1">
                {allServices.filter((s) => selectedServices.includes(s.id)).map((s) => (
                  <span key={s.id} className="flex items-center gap-1.5 text-xs font-semibold bg-secondary/20 text-white border border-secondary/40 px-3 py-1.5 rounded-full">
                    {s.emoji} {s.name}
                    {s.price && <span className="text-white/50 font-normal">· {s.price.toLocaleString("fr-FR")} FCFA</span>}
                  </span>
                ))}
              </div>
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
                  <Input type="number" name="people" min="1" defaultValue="1" required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-11" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">{t("booking_date")}</label>
                  <input type="date" value={date ? format(date, "yyyy-MM-dd") : ""} onChange={(e) => handleDateChange(e.target.value)} min={format(new Date(), "yyyy-MM-dd")}
                    className={cn("w-full bg-white/10 border text-white h-11 rounded-md px-3 [color-scheme:dark] focus:outline-none focus:ring-2", dateError ? "border-red-400 focus:ring-red-400" : "border-white/20 focus:ring-white/30")} />
                  {dateError && <div className="flex items-center gap-2 text-red-300 text-xs mt-1"><AlertCircle className="w-3 h-3 shrink-0" /><span>{dateError}</span></div>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Heure souhaitée</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white h-11 rounded-md px-3 [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-white/30" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Demande supplémentaire</label>
                <Textarea name="extra" rows={3} placeholder="Allergies, accessibilité, demandes spéciales..." className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none" />
              </div>

              <Button type="submit" size="lg" disabled={!!dateError} className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold h-12 text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed">
                <Send className="w-5 h-5 mr-2" />Confirmer ma réservation
              </Button>
              <p className="text-center text-white/40 text-xs">Vous serez redirigé vers WhatsApp pour finaliser</p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
