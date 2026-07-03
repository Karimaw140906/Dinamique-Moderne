import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useCurrency } from "@/lib/currency";
import {
  LayoutDashboard, Users, CreditCard, Calendar, TrendingUp, LogOut,
  BookOpen, Star, AlertTriangle, ArrowUpRight, ArrowDownRight,
  ShieldCheck, MapPin, Bell, UserCheck, Briefcase,
  BarChart3, PieChart as PieChartIcon, Edit2, Save, Layers,
  Tag, Activity, Ban, Users2, Car, UtensilsCrossed, Hotel,
  ShoppingCart, Zap, Shield, Settings, MessageCircle, Map, Mail,
  UserCircle, Menu, X,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { TabsAdmin } from "@/components/admin/TabsAdmin";
import { GuidesAdmin } from "@/components/admin/GuidesAdmin";
import { TransportAdmin } from "@/components/admin/TransportAdmin";
import { RestaurantsAdmin } from "@/components/admin/RestaurantsAdmin";
import { HotelsAdmin } from "@/components/admin/HotelsAdmin";
import { MenuAdmin } from "@/components/admin/MenuAdmin";
import { ActivitiesAdmin } from "@/components/admin/ActivitiesAdmin";
import { StaffAdmin } from "@/components/admin/StaffAdmin";
import { ToursAdmin } from "@/components/admin/ToursAdmin";
import { ReservationsAdmin } from "@/components/admin/ReservationsAdmin";
import { BansAdmin } from "@/components/admin/BansAdmin";
import { PaymentsAdmin } from "@/components/admin/PaymentsAdmin";
import { MessagesAdmin } from "@/components/admin/MessagesAdmin";
import { TestimonialsAdmin } from "@/components/admin/TestimonialsAdmin";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";
import { PromoAdmin } from "@/components/admin/PromoAdmin";
import { LogsAdmin } from "@/components/admin/LogsAdmin";
import { CalendarAdmin } from "@/components/admin/CalendarAdmin";
import { MapAdmin } from "@/components/admin/MapAdmin";
import { WhatsappTemplatesAdmin } from "@/components/admin/WhatsappTemplatesAdmin";
import { EmailTemplatesAdmin } from "@/components/admin/EmailTemplatesAdmin";
import { ClientsSection } from "@/components/AdminDashboard";
import { ProviderRequestsAdmin } from "@/components/admin/ProviderRequestsAdmin";
import {
  loadBookings, loadPayments, loadProviderRequests,
  computeStrategicKpis, computeTacticalKpis, computeOperationalKpis, loadActiveCounts,
} from "@/lib/dgAnalytics";
import type { StrategicKpis, TacticalKpis, OperationalKpis } from "@/lib/dgAnalytics";
import { loadManualKpis, saveManualKpi, MANUAL_KPI_DEFS } from "@/lib/dgManualKpis";

const CHART_COLORS = ["#6C3EF5", "#F5B942", "#C2622D", "#0B0A14", "#5C3D1E", "#7A9E9F"];

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
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider truncate">{label}</div>
        <div className="text-2xl font-black text-[#0B0A14] mt-0.5 truncate">{value}</div>
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
    <h2 className="text-lg font-bold text-[#0B0A14] mb-4 flex items-center gap-2">
      <span className="w-1 h-5 bg-[#F5B942] rounded-full inline-block" />
      {children}
    </h2>
  );
}

function ManualKpiCard({ def, value, onSave }: {
  def: { key: string; label: string; placeholder: string };
  value: string;
  onSave: (key: string, label: string, value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => { setDraft(value); }, [value]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{def.label}</span>
        <button onClick={() => setEditing(!editing)} className="text-gray-400 hover:text-[#6C3EF5]">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={def.placeholder}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30"
          />
          <button
            onClick={() => { onSave(def.key, def.label, draft); setEditing(false); }}
            className="p-2 bg-[#6C3EF5] text-white rounded-lg hover:bg-[#8B5CF6]"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="text-2xl font-black text-[#0B0A14]">
          {value || <span className="text-gray-300 text-base font-normal">Non renseigné — cliquez sur ✎</span>}
        </div>
      )}
      <div className="text-[10px] text-gray-400 mt-1">Saisie manuelle</div>
    </div>
  );
}

type DgTab = "pilotage" | "affichage" | "administration";

type AdminSection =
  | "tours" | "guides" | "transport" | "restaurants" | "hotels" | "menu"
  | "activites" | "temoignages" | "reservations" | "clients" | "parametres"
  | "staff" | "bans" | "paiements" | "promos" | "logs" | "messages"
  | "calendrier" | "carte" | "whatsapp_templates" | "email_templates" | "prestataires";

const ADMIN_SECTIONS: { id: AdminSection; label: string; icon: any }[] = [
  { id: "tours", label: "Tours", icon: MapPin },
  { id: "guides", label: "Guides", icon: Users2 },
  { id: "transport", label: "Transport", icon: Car },
  { id: "restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { id: "hotels", label: "Hébergements", icon: Hotel },
  { id: "menu", label: "Commandes", icon: ShoppingCart },
  { id: "activites", label: "Activités", icon: Zap },
  { id: "temoignages", label: "Témoignages", icon: Star },
  { id: "reservations", label: "Réservations", icon: Calendar },
  { id: "clients", label: "Clients", icon: Users },
  { id: "parametres", label: "Paramètres", icon: Settings },
  { id: "staff", label: "Gestion Accès", icon: Shield },
  { id: "bans", label: "Bannissements", icon: Ban },
  { id: "paiements", label: "Paiements", icon: CreditCard },
  { id: "promos", label: "Offres & Promos", icon: Tag },
  { id: "logs", label: "Logs", icon: Activity },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "calendrier", label: "Disponibilités", icon: Calendar },
  { id: "carte", label: "Carte des sites", icon: Map },
  { id: "whatsapp_templates", label: "Templates WhatsApp", icon: MessageCircle },
    { id: "prestataires", label: "Demandes Prestataires", icon: Briefcase },
{ id: "email_templates", label: "Templates Email", icon: Mail },
];

function AdministrationPanel() {
  const [section, setSection] = useState<AdminSection>("reservations");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (section) {
      case "tours": return <ToursAdmin />;
      case "guides": return <GuidesAdmin />;
      case "transport": return <TransportAdmin />;
      case "restaurants": return <RestaurantsAdmin />;
      case "hotels": return <HotelsAdmin />;
      case "menu": return <MenuAdmin />;
      case "activites": return <ActivitiesAdmin />;
      case "temoignages": return <TestimonialsAdmin />;
      case "reservations": return <ReservationsAdmin />;
      case "clients": return <ClientsSection />;
      case "parametres": return <SettingsAdmin />;
      case "staff": return <StaffAdmin />;
      case "bans": return <BansAdmin />;
      case "paiements": return <PaymentsAdmin />;
      case "promos": return <PromoAdmin />;
      case "logs": return <LogsAdmin />;
      case "messages": return <MessagesAdmin />;
      case "calendrier": return <CalendarAdmin />;
      case "carte": return <MapAdmin />;
      case "whatsapp_templates": return <WhatsappTemplatesAdmin />;
      case "email_templates": return <EmailTemplatesAdmin />;
      case "prestataires": return <ProviderRequestsAdmin />;
      default: return null;
    }
  };

  return (
    <div className="flex bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 min-h-[600px]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-10 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed md:static top-0 left-0 h-full md:h-auto z-20 w-64 bg-[#0B0A14] text-white flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between md:hidden">
          <span className="font-bold text-sm">Sections</span>
          <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {ADMIN_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setSection(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${section === id ? "bg-[#6C3EF5] text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 bg-[#2B1B4D]">
        <button onClick={() => setSidebarOpen(true)} className="md:hidden mb-4 flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm text-sm font-bold">
          <Menu className="w-4 h-4" /> Sections
        </button>
        {renderSection()}
      </main>
    </div>
  );
}

export default function DG() {
  const { session, logout } = useAuth();
  const { convertPrice } = useCurrency();
  const [, navigate] = useLocation();
  const [now] = useState(new Date());
  const [tab, setTab] = useState<DgTab>("pilotage");

  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [providerRequests, setProviderRequests] = useState<any[]>([]);
  const [manualKpis, setManualKpis] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(true);
  const [activeDestinations, setActiveDestinations] = useState(0);
  const [activeEvents, setActiveEvents] = useState(0);

  const staff = tryParse<any[]>("staffAccounts", []);
  const logs = tryParse<any[]>("activityLogs", []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [b, p, pr, mk, ac] = await Promise.all([loadBookings(), loadPayments(), loadProviderRequests(), loadManualKpis(), loadActiveCounts()]);
      if (!mounted) return;
      setBookings(b);
      setPayments(p);
      setProviderRequests(pr);
      setManualKpis(mk);
      setActiveDestinations(ac.activeDestinations);
      setActiveEvents(ac.activeEvents);
      setLoadingData(false);
    })();
    return () => { mounted = false; };
  }, []);

  const strategic: StrategicKpis = computeStrategicKpis(bookings, payments);
  const tactical: TacticalKpis = computeTacticalKpis(bookings, payments, providerRequests);
  const operational: OperationalKpis = computeOperationalKpis(bookings);

  const handleSaveManualKpi = async (key: string, label: string, value: string) => {
    setManualKpis(prev => ({ ...prev, [key]: value }));
    await saveManualKpi(key, label, value);
  };

  const recentLogs = logs.slice(0, 8);
  const recentBookings = [...bookings].slice(0, 5);

  const greeting = now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const evolutionChartData = [
    { name: "Mois précédent", CA: strategic.previousMonthRevenue },
    { name: "Mois en cours", CA: strategic.monthlyRevenue },
  ];

  return (
    <div className="min-h-screen bg-[#2B1B4D]">
      <header className="bg-gradient-to-r from-[#0B0A14] to-[#2C3E50] text-white sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5B942] flex items-center justify-center text-xl font-black shadow-lg">🏛️</div>
            <div>
              <div className="text-lg font-serif italic font-bold leading-tight">Direction Générale</div>
              <div className="text-xs text-white/60 capitalize">{dateStr}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold">{session?.name || "Directeur Général"}</div>
              <div className="text-xs text-[#F5B942] font-semibold uppercase tracking-wider">DG — Sama Senegal</div>
            </div>
            <button onClick={() => { logout(); navigate("/"); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-red-500/20 hover:text-red-300 rounded-xl text-xs font-bold transition-all">
              <LogOut className="w-3.5 h-3.5" /> Quitter
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 border-t border-white/10 overflow-x-auto">
          <button onClick={() => setTab("pilotage")}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${tab === "pilotage" ? "border-[#F5B942] text-[#F5B942]" : "border-transparent text-white/50 hover:text-white"}`}>
            <LayoutDashboard className="w-4 h-4 inline mr-1.5 -mt-0.5" /> Pilotage
          </button>
          <button onClick={() => setTab("administration")}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${tab === "administration" ? "border-[#F5B942] text-[#F5B942]" : "border-transparent text-white/50 hover:text-white"}`}>
            <Shield className="w-4 h-4 inline mr-1.5 -mt-0.5" /> Administration
          </button>
          <button onClick={() => setTab("affichage")}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${tab === "affichage" ? "border-[#F5B942] text-[#F5B942]" : "border-transparent text-white/50 hover:text-white"}`}>
            <Layers className="w-4 h-4 inline mr-1.5 -mt-0.5" /> Affichage du site
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {tab === "affichage" && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <TabsAdmin />
          </section>
        )}

        {tab === "administration" && (
          <section>
            <SectionTitle>Administration complète</SectionTitle>
            <AdministrationPanel />
          </section>
        )}

        {tab === "pilotage" && (
        <>
        <div className="bg-gradient-to-r from-[#0B0A14] to-[#6C3EF5] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif italic font-bold">
                {greeting}, {session?.name?.split(" ")[0] || "Directeur"} 👋
              </h1>
              <p className="text-white/70 mt-1 text-sm">
                Vous avez <span className="text-[#F5B942] font-bold">{tactical.pendingBookings}</span> réservation(s) en attente
                {tactical.unreadMessages > 0 && <> et <span className="text-[#F5B942] font-bold">{tactical.unreadMessages}</span> message(s) non lu(s)</>}.
                {loadingData && <span className="text-white/40 ml-2">· Actualisation des données…</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60 bg-white/10 px-4 py-2 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-[#F5B942]" />
              Autorité maximale — accès complet
            </div>
          </div>
        </div>

        <section>
          <SectionTitle>Niveau stratégique</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard icon={<CreditCard className="w-6 h-6 text-white" />} label="Chiffre d'affaires global" value={convertPrice(strategic.totalRevenue)} color="bg-[#6C3EF5]" trend="up" />
            <KpiCard icon={<TrendingUp className="w-6 h-6 text-white" />} label="CA du mois" value={convertPrice(strategic.monthlyRevenue)}
              sub={strategic.monthlyEvolutionPct !== null ? `${strategic.monthlyEvolutionPct > 0 ? "+" : ""}${strategic.monthlyEvolutionPct}% vs mois précédent` : "Pas de comparatif disponible"}
              trend={strategic.monthlyEvolutionPct === null ? "neutral" : strategic.monthlyEvolutionPct >= 0 ? "up" : "down"}
              color="bg-[#F5B942]" />
            <KpiCard icon={<BookOpen className="w-6 h-6 text-white" />} label="Réservations totales" value={String(strategic.totalBookings)} color="bg-[#0B0A14]" trend="neutral" />
            <KpiCard icon={<CreditCard className="w-6 h-6 text-white" />} label="Panier moyen" value={strategic.averageBasket > 0 ? convertPrice(strategic.averageBasket) : "—"} color="bg-[#C2622D]" trend="neutral" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-sm text-gray-700 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[#6C3EF5]" /> Évolution mensuelle du CA</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={evolutionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => convertPrice(v)} />
                  <Bar dataKey="CA" fill="#6C3EF5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-sm text-gray-700 mb-4 flex items-center gap-2"><PieChartIcon className="w-4 h-4 text-[#F5B942]" /> Répartition des ventes par catégorie</h3>
              {strategic.categoryBreakdown.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">Aucune réservation enregistrée</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={strategic.categoryBreakdown} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={(d: any) => d.category}>
                      {strategic.categoryBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => convertPrice(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
            <h3 className="font-bold text-sm text-gray-700 mb-4">Top 5 des services les plus vendus</h3>
            {strategic.topServices.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-6">Aucune donnée disponible</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={strategic.topServices} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip formatter={(v: number) => convertPrice(v)} />
                  <Bar dataKey="revenue" fill="#F5B942" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MANUAL_KPI_DEFS.map(def => (
              <ManualKpiCard key={def.key} def={def} value={manualKpis[def.key] || ""} onSave={handleSaveManualKpi} />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>Niveau tactique</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={<Calendar className="w-6 h-6 text-white" />} label="Réservations en attente" value={String(tactical.pendingBookings)} color="bg-amber-500" trend="neutral" />
            <KpiCard icon={<CreditCard className="w-6 h-6 text-white" />} label="Paiements en attente" value={String(tactical.pendingPayments)} color="bg-amber-600" trend="neutral" />
            <KpiCard icon={<ArrowDownRight className="w-6 h-6 text-white" />} label="Remboursements" value={String(tactical.refundsCount)}
              sub={tactical.refundsCount > 0 ? convertPrice(tactical.refundsAmount) : undefined} color="bg-red-500" trend="neutral" />
            <KpiCard icon={<AlertTriangle className="w-6 h-6 text-white" />} label="Litiges ouverts" value={String(tactical.disputesCount)} color="bg-red-600" trend="neutral" />
            <KpiCard icon={<Briefcase className="w-6 h-6 text-white" />} label="Demandes prestataires" value={String(tactical.pendingProviderRequests)} color="bg-[#6C3EF5]" trend="neutral" />
            <KpiCard icon={<Bell className="w-6 h-6 text-white" />} label="Messages non lus" value={String(tactical.unreadMessages)} color="bg-[#0B0A14]" trend="neutral" />
          </div>
        </section>

        <section>
          <SectionTitle>Niveau opérationnel</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard icon={<Calendar className="w-6 h-6 text-white" />} label="Réservations du jour" value={String(operational.todayBookings)} color="bg-[#6C3EF5]" trend="neutral" />
            <KpiCard icon={<MapPin className="w-6 h-6 text-white" />} label="Tours actifs" value={String(operational.activeTours)} color="bg-[#F5B942]" trend="neutral" />
            <KpiCard icon={<UserCheck className="w-6 h-6 text-white" />} label="Guides actifs" value={String(operational.activeGuides)} color="bg-[#0B0A14]" trend="neutral" />
            <KpiCard icon={<Users className="w-6 h-6 text-white" />} label="Transport actif" value={String(operational.activeTransport)} color="bg-[#C2622D]" trend="neutral" />
            <KpiCard icon={<Star className="w-6 h-6 text-white" />} label="Hôtels actifs" value={String(operational.activeHotels)} color="bg-[#5C3D1E]" trend="neutral" />
            <KpiCard icon={<Globe className="w-6 h-6 text-white" />} label="Destinations actives" value={String(activeDestinations)} color="bg-[#6C3EF5]" trend="neutral" />
            <KpiCard icon={<PartyPopper className="w-6 h-6 text-white" />} label="Evenements actifs" value={String(activeEvents)} color="bg-[#F5B942]" trend="neutral" />
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-8">
          <section>
            <SectionTitle>Dernières réservations</SectionTitle>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {recentBookings.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Aucune réservation enregistrée</div>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead className="bg-[#2B1B4D] text-xs uppercase text-gray-500 font-bold">
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
                        <td className="px-4 py-3 font-medium text-[#0B0A14] truncate max-w-[100px]">{b.client_name || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 truncate max-w-[100px]">{b.service_name || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            b.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                            b.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                          }`}>{b.status || "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#6C3EF5]">{b.amount ? convertPrice(b.amount) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          </section>

          <section>
            <SectionTitle>Composition de l'équipe</SectionTitle>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {staff.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Aucun membre d'équipe enregistré</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {staff.slice(0, 8).map((s: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-[#0B0A14]/10 flex items-center justify-center text-lg shrink-0">
                        {({ guide: "🌴", chauffeur: "🚗", restaurant: "🍽️", hotel: "🏨", commercial: "🎯" } as Record<string, string>)[s.role] || "👤"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-[#0B0A14] truncate">{s.name}</div>
                        <div className="text-xs text-gray-400 capitalize">{s.role}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.active !== false ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                        {s.active !== false ? "Actif" : "Inactif"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <section>
          <SectionTitle>Journal d'activité récent</SectionTitle>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Aucune activité enregistrée</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentLogs.map((log: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <div className="w-2 h-2 rounded-full bg-[#6C3EF5] mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm text-[#0B0A14]">{log.user_name || log.user_identifier || "Système"}</span>
                      <span className="text-gray-400 text-sm"> — {log.action || "action"}</span>
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

        <div className="text-center text-xs text-gray-400 pb-6">
          Sama Senegal — Direction Générale · {session?.identifier} · Connecté le {new Date(session?.loginTime || "").toLocaleString("fr-FR")}
        </div>
        </>
        )}
      </main>
    </div>
  );
}
