import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Booking() {
  const { t, language } = useLanguage();
  const [date, setDate] = useState<Date>();
  
  const [toursData, setToursData] = useState<any[]>([]);
  const [transportData, setTransportData] = useState<any[]>([]);
  const [restaurantsData, setRestaurantsData] = useState<any[]>([]);
  const [hotelsData, setHotelsData] = useState<any[]>([]);
  const [activitiesData, setActivitiesData] = useState<any[]>([]);

  useEffect(() => {
    const load = () => {
      try { setToursData(JSON.parse(localStorage.getItem("adminTours") || "[]").filter((i:any)=>i.active)); } catch{}
      try { setTransportData(JSON.parse(localStorage.getItem("transportData") || "[]").filter((i:any)=>i.active)); } catch{}
      try { setRestaurantsData(JSON.parse(localStorage.getItem("restaurantsData") || "[]").filter((i:any)=>i.active)); } catch{}
      try { setHotelsData(JSON.parse(localStorage.getItem("hotelsData") || "[]").filter((i:any)=>i.active)); } catch{}
      try { setActivitiesData(JSON.parse(localStorage.getItem("activitiesData") || "[]").filter((i:any)=>i.active)); } catch{}
    };
    load();
    // In a real app we might want to listen to multiple events here, 
    // but just loading on mount is fine for the booking form.
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      tour: formData.get("tour"),
      people: formData.get("people"),
      message: formData.get("message"),
    };
    
    const text = `*Nouvelle Réservation / New Booking* 🌴
    
*Nom:* ${data.name}
*Service:* ${data.tour}
*Date:* ${date ? format(date, "dd/MM/yyyy") : "Non spécifiée"}
*Personnes:* ${data.people}
*Email:* ${data.email}

*Message:*
${data.message}`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/221774188107?text=${encodedText}`, "_blank");
  };

  const getName = (item: any) => {
    if (item.name) return item.name;
    if (language === "EN" && item.nameEN) return item.nameEN;
    if (language === "ES" && item.nameES) return item.nameES;
    return item.nameFR || "Item";
  };

  return (
    <section id="reserver" className="py-24 bg-gradient-to-br from-primary to-foreground text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              {t("booking_title")}
            </h2>
            <p className="text-white/70">
              Remplissez le formulaire ci-dessous. Nous vous répondrons rapidement via WhatsApp pour confirmer votre visite.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">{t("booking_name")}</label>
                <Input name="name" required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">{t("booking_email")}</label>
                <Input type="email" name="email" className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">{t("booking_phone")} *</label>
                <Input type="tel" name="phone" required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">{t("booking_people")}</label>
                <Input type="number" name="people" min="1" required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">{t("booking_tour")}</label>
                <Select name="tour" required>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-12">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {toursData.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Tours & Excursions</SelectLabel>
                        {toursData.map(t => (
                          <SelectItem key={`tour-${t.id}`} value={t.name}>{t.emoji} {t.name} - {t.price} FCFA</SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {transportData.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Transport</SelectLabel>
                        {transportData.map(t => (
                          <SelectItem key={`trans-${t.id}`} value={t.name}>🚗 {t.name} - {t.priceDay} FCFA/j</SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {activitiesData.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Activités</SelectLabel>
                        {activitiesData.map(a => (
                          <SelectItem key={`act-${a.id}`} value={getName(a)}>🎯 {getName(a)} - {a.price} FCFA</SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {restaurantsData.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Restaurants</SelectLabel>
                        {restaurantsData.map(r => (
                          <SelectItem key={`rest-${r.id}`} value={r.name}>🍽️ {r.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {hotelsData.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Hébergements</SelectLabel>
                        {hotelsData.map(h => (
                          <SelectItem key={`hot-${h.id}`} value={h.name}>🏨 {h.name} - {h.priceNight} FCFA/n</SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <label className="text-sm font-medium text-white/80">{t("booking_date")}</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white h-12 justify-start text-left font-normal",
                        !date && "text-white/50"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">{t("booking_message")}</label>
              <Textarea 
                name="message" 
                rows={4} 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none" 
              />
            </div>

            <div className="pt-4">
              <Button type="submit" size="lg" className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold h-14 text-lg">
                <MessageCircle className="w-5 h-5 mr-2" />
                {t("booking_submit")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
