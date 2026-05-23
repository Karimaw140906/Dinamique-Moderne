import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { DEFAULT_RESTAURANTS, DEFAULT_HOTELS, DEFAULT_ACTIVITIES, DEFAULT_TRANSPORT } from "@/lib/useSupabaseData";

function Counter({ end, label, suffix = "", decimals = 0 }: { end: number; label: string; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || end === 0) return;
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else { setCount(parseFloat(start.toFixed(decimals))); }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, end, decimals]);

  return (
    <div ref={ref} className="text-center p-6 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm">
      <div className="text-4xl md:text-5xl font-serif font-bold text-[#D4A017] mb-2">
        {decimals > 0 ? count.toFixed(decimals) : count}{suffix}
      </div>
      <div className="text-white/80 font-medium tracking-wider uppercase text-sm">{label}</div>
    </div>
  );
}

export function Stats() {
  const [stats, setStats] = useState({
    services: DEFAULT_RESTAURANTS.length + DEFAULT_HOTELS.length + DEFAULT_ACTIVITIES.length + DEFAULT_TRANSPORT.length,
    destinations: DEFAULT_ACTIVITIES.length,
    rating: 4.9,
    experience: 5,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [r, h, a, tr] = await Promise.all([
          supabase.from("restaurants").select("rating", { count: "exact" }).eq("active", true),
          supabase.from("hotels").select("rating", { count: "exact" }).eq("active", true),
          supabase.from("activities").select("location", { count: "exact" }).eq("active", true),
          supabase.from("transport").select("id", { count: "exact" }).eq("active", true),
        ]);
        const totalServices =
          (r.count || DEFAULT_RESTAURANTS.length) +
          (h.count || DEFAULT_HOTELS.length) +
          (a.count || DEFAULT_ACTIVITIES.length) +
          (tr.count || DEFAULT_TRANSPORT.length);
        const allRatings = [
          ...(r.data || []).map((x: any) => x.rating || 5),
          ...(h.data || []).map((x: any) => x.rating || 5),
        ];
        const avgRating = allRatings.length > 0
          ? parseFloat((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1))
          : 4.9;
        const locations = new Set((a.data || []).map((x: any) => x.location).filter(Boolean));
        const destinations = locations.size || DEFAULT_ACTIVITIES.length;
        setStats({ services: totalServices, destinations, rating: avgRating, experience: 5 });
      } catch { }
    };
    load();
  }, []);

  return (
    <section className="bg-[#1A1A2E] py-20 border-t border-b border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Counter end={stats.services} label="Services disponibles" suffix="+" />
          <Counter end={stats.destinations} label="Destinations" suffix="+" />
          <Counter end={stats.rating} label="Note moyenne" suffix="★" decimals={1} />
          <Counter end={stats.experience} label="Ans d'expérience" suffix="+" />
        </div>
      </div>
    </section>
  );
}
