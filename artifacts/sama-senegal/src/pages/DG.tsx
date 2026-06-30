import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useCurrency } from "@/lib/currency";
import {
  LayoutDashboard, Users, CreditCard, Calendar, TrendingUp, LogOut,
  BookOpen, Star, AlertTriangle, ChevronRight, ArrowUpRight, ArrowDownRight,
  ShieldCheck, Settings, MapPin, Bell, UserCheck, Briefcase, Eye,
} from "lucide-react";

function tryParse<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || "") ?? fallback; }
  catch { return fallback; }
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  color: string;
}

function KpiCard({ icon, label, value, sub, trend, color }: KpiCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4`}>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider truncate">{label}</div>
        <div className="text-2xl font-black text-[#1A1A2E] mt-0.5 truncate">{value}</div>
        {sub && (
          <div className={`text-xs mt-1 flex items-center gap-1 ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-gray-400"}`}>
            {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
            {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
      <span className="w-1 h-5 bg-[#D4A017] rounded-full inline-block" />
      {children}
    </h2>
  );
}

export default function DG() {
  const { session, logout } = useAuth();
  const { convertPrice } = useCurrency();
  const [, navigate] = useLocation();
  const [now] = useState(new Date());

  const bookings    = tryParse<any[]>("bookings", []);
  const payments    = tryParse<any[]>("payments", []);
  const staff       = tryParse<any[]>("staffAccounts", []);
  const clients     = tryParse<any[]>("clientsData", []);
  const tours       = tryParse<any[]>("toursData", []);
  const hotels      = tryParse<any[]>("hotelsData", []);
  const restaurants = tryParse<any[]>("restaurantsData", []);
  const transport   = tryParse<any[]>("transportData", []);
  const activities  = tryParse<any[]>("activitiesData", []);
  const logs        = tryParse<any[]>("activityLogs", []);
  const messages    = tryParse<any[]>("messages", []);

  const totalRevenue   = payments.filter(p => p.status === "paid" || p.status === "validé").reduce((s, p) => s + (p.amount || p.montant || 0), 0);
  const pendingRevenue = payments.filter(p => p.status === "pending" || p.status === "en_attente").reduce((s, p) => s + (p.amount || p.montant || 0), 0);
  const confirmedBookings = bookings.filter(b => b.status === "confirmed" || b.status === "confirmé").length;
  const pendingBookings   = bookings.filter(b => b.status === "pending"   || b.status === "en_attente").length;
  const unreadMessages    = messages.filter(m => !m.read).length;

  const recentLogs = logs.slice(0, 8);
  const recentBookings = bookings.slice(-5).reverse();

  const staffByRole: Record<string, number> = {};
  staff.forEach(s => { staffByRole[s.role] = (staffByRole[s.role] || 0) + 1; });

  const greeting = now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1A1A2E] to-[#2C3E50] text-white sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4A017] flex items-center justify-center text-xl font-black shadow-lg">
              🏛️
            </div>
            <div>
              <div className="text-lg font-serif italic font-bold leading-tight">Direction Générale</div>
              <div className="text-xs text-white/60 capitalize">{dateStr}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {unreadMessages > 0 && (
              <div className="relative">
                <Bell className="w-5 h-5 text-white/70" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-black text-white flex items-center justify-center">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              </div>
            )}
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold">{session?.name || "Directeur Général"}</div>
              <div className="text-xs text-[#D4A017] font-semibold uppercase tracking-wider">DG — Sama Senegal</div>
            </div>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-red-500/20 hover:text-red-300 rounded-xl text-xs font-bold transition-all">
              <LogOut className="w-3.5 h-3.5" /> Quitter
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* Greeting */}
        <div className="bg-gradient-to-r from-[#1A1A2E] to-[#2C7A5C] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif italic font-bold">
                {greeting}, {session?.name?.split(" ")[0] || "Directeur"} 👋
              </h1>
              <p className="text-white/70 mt-1 text-sm">
                Vous avez <span className="text-[#D4A017] font-bold">{pendingBookings}</span> réservation(s) en attente
                {unreadMessages > 0 && <> et <span className="text-[#D4A017] font-bold">{unreadMessages}</span> message(s) non lu(s)</>}.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60 bg-white/10 px-4 py-2 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-[#D4A017]" />
              Autorité maximale — accès complet
            </div>
          </div>
        </div>

        {/* KPIs */}
        <section>
          <SectionTitle>Indicateurs stratégiques</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={<CreditCard className="w-6 h-6 text-white" />}
              label="Chiffre d'affaires"
              value={totalRevenue > 0 ? convertPrice(totalRevenue) : "—"}
              sub={pendingRevenue > 0 ? `${convertPrice(pendingRevenue)} en attente` : "Aucun paiement en attente"}
              trend="up"
              color="bg-[#2C7A5C]"
            />
            <KpiCard
              icon={<BookOpen className="w-6 h-6 text-white" />}
              label="Réservations totales"
              value={String(bookings.length)}
              sub={`${confirmedBookings} confirmées · ${pendingBookings} en attente`}
              trend={confirmedBookings > 0 ? "up" : "neutral"}
              color="bg-[#D4A017]"
            />
            <KpiCard
              icon={<Users className="w-6 h-6 text-white" />}
              label="Clients"
              value={String(clients.length)}
              sub={`${staff.length} membre(s) d'équipe`}
              trend="up"
              color="bg-[#1A1A2E]"
            />
            <KpiCard
              icon={<TrendingUp className="w-6 h-6 text-white" />}
              label="Services actifs"
              value={String(
                tours.filter(t => t.active !== false).length +
                hotels.filter(h => h.active !== false).length +
                restaurants.filter(r => r.active !== false).length +
                activities.filter(a => a.active !== false).length +
                transport.filter(t => t.active !== false).length
              )}
              sub={`Tours · Hôtels · Restau · Activités · Transport`}
              trend="neutral"
              color="bg-[#C2622D]"
            />
          </div>
        </section>

        {/* Inventaire services */}
        <section>
          <SectionTitle>Inventaire des services</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Tours", count: tours.length, active: tours.filter(t => t.active !== false).length, icon: "🗺️", color: "border-[#2C7A5C]" },
              { label: "Hôtels", count: hotels.length, active: hotels.filter(h => h.active !== false).length, icon: "🏨", color: "border-[#D4A017]" },
              { label: "Restaurants", count: restaurants.length, active: restaurants.filter(r => r.active !== false).length, icon: "🍽️", color: "border-[#C2622D]" },
              { label: "Activités", count: activities.length, active: activities.filter(a => a.active !== false).length, icon: "⚡", color: "border-[#5C3D1E]" },
              { label: "Transport", count: transport.length, active: transport.filter(t => t.active !== false).length, icon: "🚗", color: "border-[#1A1A2E]" },
            ].map(s => (
              <div key={s.label} className={`bg-white rounded-xl p-4 border-l-4 ${s.color} shadow-sm`}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="font-bold text-[#1A1A2E] text-sm">{s.label}</div>
                <div className="text-2xl font-black text-[#1A1A2E]">{s.count}</div>
                <div className="text-xs text-gray-400">{s.active} actif(s)</div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Réservations récentes */}
          <section>
            <SectionTitle>Dernières réservations</SectionTitle>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {recentBookings.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Aucune réservation enregistrée</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-[#F5F0E8] text-xs uppercase text-gray-500 font-bold">
                    <tr>
                      <th className="px-4 py-3 text-left">Client</th>
                      <th className="px-4 py-3 text-left">Service</th>
                      <th className="px-4 py-3 text-left">Statut</th>
                      <th className="px-4 py-3 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentBookings.map((b, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1A1A2E] truncate max-w-[100px]">{b.clientName || b.name || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 truncate max-w-[100px]">{b.service || b.tour || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            (b.status === "confirmed" || b.status === "confirmé") ? "bg-emerald-100 text-emerald-700" :
                            (b.status === "pending" || b.status === "en_attente") ? "bg-amber-100 text-amber-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {b.status || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#2C7A5C]">
                          {b.amount || b.montant ? convertPrice(b.amount || b.montant) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Équipe */}
          <section>
            <SectionTitle>Composition de l'équipe</SectionTitle>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {staff.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Aucun membre d'équipe enregistré</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {staff.slice(0, 8).map((s, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-[#1A1A2E]/10 flex items-center justify-center text-lg shrink-0">
                        {{ guide: "🌴", chauffeur: "🚗", restaurant: "🍽️", hotel: "🏨", commercial: "🎯" }[s.role] || "👤"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-[#1A1A2E] truncate">{s.name}</div>
                        <div className="text-xs text-gray-400 capitalize">{s.role}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.active !== false ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                        {s.active !== false ? "Actif" : "Inactif"}
                      </span>
                    </div>
                  ))}
                  {staff.length > 8 && (
                    <div className="px-4 py-3 text-xs text-gray-400 text-center">
                      +{staff.length - 8} autre(s) — voir dans le dashboard admin
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Journal d'activité récent */}
        <section>
          <SectionTitle>Journal d'activité récent</SectionTitle>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Aucune activité enregistrée</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <div className="w-2 h-2 rounded-full bg-[#2C7A5C] mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm text-[#1A1A2E]">{log.user_name || log.user_identifier || "Système"}</span>
                      <span className="text-gray-400 text-sm"> — {log.action || "action"}</span>
                      {log.details && <div className="text-xs text-gray-400 truncate">{log.details}</div>}
                    </div>
                    <div className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Accès rapides */}
        <section>
          <SectionTitle>Accès rapides — Gouvernance</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: <Users className="w-5 h-5" />, label: "Gestion équipe", desc: "Staff, rôles, permissions", color: "bg-[#1A1A2E]" },
              { icon: <CreditCard className="w-5 h-5" />, label: "Finances", desc: "Revenus, paiements, rapports", color: "bg-[#2C7A5C]" },
              { icon: <BookOpen className="w-5 h-5" />, label: "Réservations", desc: "Toutes les réservations", color: "bg-[#D4A017]" },
              { icon: <Star className="w-5 h-5" />, label: "Témoignages", desc: "Avis clients, notes", color: "bg-[#C2622D]" },
              { icon: <MapPin className="w-5 h-5" />, label: "Destinations", desc: "6 sites sénégalais", color: "bg-[#5C3D1E]" },
              { icon: <Briefcase className="w-5 h-5" />, label: "Prestataires", desc: "Demandes d'accès", color: "bg-[#2C7A5C]" },
              { icon: <AlertTriangle className="w-5 h-5" />, label: "Bans & sécurité", desc: "Clients bannis", color: "bg-red-600" },
              { icon: <Settings className="w-5 h-5" />, label: "Paramètres", desc: "Configuration globale", color: "bg-gray-600" },
            ].map((item, i) => (
              <div key={i}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-[#D4A017]/30 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[#1A1A2E]">{item.label}</div>
                  <div className="text-xs text-gray-400 truncate">{item.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#D4A017] transition-colors shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-6">
          Sama Senegal — Direction Générale · {session?.identifier} · Connecté le {new Date(session?.loginTime || "").toLocaleString("fr-FR")}
        </div>

      </main>
    </div>
  );
}
