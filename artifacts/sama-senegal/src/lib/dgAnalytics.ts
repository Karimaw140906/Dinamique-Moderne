import { supabase } from "@/lib/supabase";

function normalizeBooking(b: any): any {
  return {
    ...b,
    id: b.id || b.ref || Math.random().toString(36).slice(2),
    ref: b.id || b.ref || "—",
    client_name: b.client_name || b.name || b.clientName || "",
    service_name: b.service_name || b.service || b.tour || b.tourName || (Array.isArray(b.services) ? b.services[0] : "") || "Service",
    service_type: b.service_type || "tours",
    amount: Number(b.amount || b.montant || b.total_amount || 0),
    date: b.booking_date || b.date || b.created_at || null,
    status: b.booking_status || b.status || "pending",
    created_at: b.created_at || b.date || new Date(0).toISOString(),
  };
}

function normalizePayment(p: any): any {
  const rawStatus = p.status || "pending";
  const isPaid = rawStatus === "validated" || rawStatus === "completed";
  return {
    ...p,
    amount: Number(p.amount || 0),
    status: isPaid ? "completed" : rawStatus,
    isRefunded: rawStatus === "refunded",
    isDisputed: !!p.dispute_status && p.dispute_status !== "closed",
    created_at: p.created_at || new Date(0).toISOString(),
  };
}

export async function loadBookings(): Promise<any[]> {
  const results: any[] = [];
  try {
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (!error && data && data.length > 0) results.push(...data.map(normalizeBooking));
  } catch {}
  try {
    const local = JSON.parse(localStorage.getItem("bookings") || "[]");
    const knownRefs = new Set(results.map(r => r.ref));
    results.push(...local.map(normalizeBooking).filter((b: any) => !knownRefs.has(b.ref)));
  } catch {}
  return results;
}

export async function loadPayments(): Promise<any[]> {
  const results: any[] = [];
  try {
    const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
    if (!error && data && data.length > 0) results.push(...data.map(normalizePayment));
  } catch {}
  if (results.length === 0) {
    try {
      const local = JSON.parse(localStorage.getItem("payments") || "[]");
      results.push(...local.map(normalizePayment));
    } catch {}
  }
  return results;
}

export async function loadProviderRequests(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from("provider_requests").select("*");
    if (!error && data && data.length > 0) return data;
  } catch {}
  try { return JSON.parse(localStorage.getItem("providerRequests") || "[]"); } catch { return []; }
}

function loadCatalog(key: string): any[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}

export interface StrategicKpis {
  totalRevenue: number;
  monthlyRevenue: number;
  previousMonthRevenue: number;
  monthlyEvolutionPct: number | null;
  totalBookings: number;
  averageBasket: number;
  topServices: { name: string; count: number; revenue: number }[];
  categoryBreakdown: { category: string; count: number; revenue: number }[];
}

export function computeStrategicKpis(bookings: any[], payments: any[]): StrategicKpis {
  const paidPayments = payments.filter(p => p.status === "completed");
  const totalRevenue = paidPayments.reduce((s, p) => s + p.amount, 0);

  const now = new Date();
  const isSameMonth = (d: Date, ref: Date) => d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
  const prevMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const monthlyRevenue = paidPayments
    .filter(p => isSameMonth(new Date(p.created_at), now))
    .reduce((s, p) => s + p.amount, 0);
  const previousMonthRevenue = paidPayments
    .filter(p => isSameMonth(new Date(p.created_at), prevMonthRef))
    .reduce((s, p) => s + p.amount, 0);

  const monthlyEvolutionPct = previousMonthRevenue > 0
    ? Math.round(((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 1000) / 10
    : null;

  const totalBookings = bookings.length;
  const averageBasket = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

  const serviceMap = new Map<string, { count: number; revenue: number }>();
  bookings.forEach(b => {
    const key = b.service_name || "Autre";
    const entry = serviceMap.get(key) || { count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += b.amount;
    serviceMap.set(key, entry);
  });
  const topServices = [...serviceMap.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const categoryMap = new Map<string, { count: number; revenue: number }>();
  bookings.forEach(b => {
    const key = b.service_type || "autre";
    const entry = categoryMap.get(key) || { count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += b.amount;
    categoryMap.set(key, entry);
  });
  const categoryBreakdown = [...categoryMap.entries()]
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  return { totalRevenue, monthlyRevenue, previousMonthRevenue, monthlyEvolutionPct, totalBookings, averageBasket, topServices, categoryBreakdown };
}

export interface TacticalKpis {
  pendingBookings: number;
  pendingPayments: number;
  refundsCount: number;
  refundsAmount: number;
  disputesCount: number;
  pendingProviderRequests: number;
  unreadMessages: number;
}

export function computeTacticalKpis(bookings: any[], payments: any[], providerRequests: any[]): TacticalKpis {
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const pendingPayments = payments.filter(p => p.status === "pending").length;
  const refunded = payments.filter(p => p.isRefunded);
  const refundsCount = refunded.length;
  const refundsAmount = refunded.reduce((s, p) => s + (Number(p.refund_amount) || p.amount), 0);
  const disputesCount = payments.filter(p => p.isDisputed).length;
  const pendingProviderRequests = providerRequests.filter(r => r.status === "pending").length;

  let unreadMessages = 0;
  try {
    const messages = JSON.parse(localStorage.getItem("messages") || "[]");
    unreadMessages = messages.filter((m: any) => !m.read).length;
  } catch {}

  return { pendingBookings, pendingPayments, refundsCount, refundsAmount, disputesCount, pendingProviderRequests, unreadMessages };
}

export interface OperationalKpis {
  todayBookings: number;
  activeTours: number;
  activeGuides: number;
  activeTransport: number;
  activeHotels: number;
  activeRestaurants: number;
  activeActivities: number;
}

export function computeOperationalKpis(bookings: any[]): OperationalKpis {
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter(b => (b.date || "").slice(0, 10) === todayKey).length;

  const countActive = (key: string) => loadCatalog(key).filter((item: any) => item.active !== false).length;

  return {
    todayBookings,
    activeTours: countActive("toursData"),
    activeGuides: countActive("guidesData"),
    activeTransport: countActive("transportData"),
    activeHotels: countActive("hotelsData"),
    activeRestaurants: countActive("restaurantsData"),
    activeActivities: countActive("activitiesData"),
  };
}

export async function loadActiveCounts(): Promise<{ activeDestinations: number; activeEvents: number }> {
  let activeDestinations = 0;
  let activeEvents = 0;
  try {
    const { data } = await supabase.from("destinations").select("id").eq("active", true);
    activeDestinations = data?.length || 0;
  } catch {}
  try {
    const { data } = await supabase.from("events").select("id").eq("active", true);
    activeEvents = data?.length || 0;
  } catch {}
  return { activeDestinations, activeEvents };
}
