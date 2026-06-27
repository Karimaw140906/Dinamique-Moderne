import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

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
        {decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}{suffix}
      </div>
      <div className="text-white/80 font-medium tracking-wider uppercase text-sm">{label}</div>
    </div>
  );
}

const DEFAULTS = { services: 12, destinations: 6, rating: 4.9, bookings: 0, experience: new Date().getFullYear() - 2019 };

async function loadStatsFromSupabase() {
  try {
    const [restaurants, hotels, transport, activities, tours, bookings] = await Promise.all([
      supabase.from("restaurants").select("rating").eq("active", true),
      supabase.from("hotels").select("rating").eq("active", true),
      supabase.from("transport").select("id").eq("active", true),
      supabase.from("activities").select("location").eq("active", true),
      supabase.from("tours").select("id").eq("active", true),
      supabase.from("bookings").select("id"),
    ]);

    const totalServices =
      (restaurants.data?.length || 0) +
      (hotels.data?.length || 0) +
      (transport.data?.length || 0) +
      (activities.data?.length || 0) +
      (tours.data?.length || 0);

    const allRatings = [
      ...(restaurants.data || []).map((r: any) => r.rating || 5),
      ...(hotels.data || []).map((h: any) => h.rating || 5),
    ];
    const avgRating = allRatings.length > 0
      ? parseFloat((allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length).toFixed(1))
      : 4.9;

    const locations = new Set(
      (activities.data || []).map((a: any) => a.location).filter(Boolean)
    );

    return {
      services:     totalServices || DEFAULTS.services,
      destinations: locations.size || DEFAULTS.destinations,
      rating:       avgRating,
      bookings:     bookings.data?.length || 0,
      experience:   DEFAULTS.experience,
    };
  } catch {
    return DEFAULTS;
  }
}

export function Stats() {
  const [stats, setStats] = useState(DEFAULTS);

  useEffect(() => {
    loadStatsFromSupabase().then(setStats);

    // Refresh si une réservation est faite
    const refresh = () => loadStatsFromSupabase().then(setStats);
    window.addEventListener("bookingsUpdated", refresh);
    return () => window.removeEventListener("bookingsUpdated", refresh);
  }, []);

  return (
    <section className="bg-[#1A1A2E] py-20 border-t border-b border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Counter end={stats.services}     label="Services disponibles" suffix="+" />
          <Counter end={stats.destinations} label="Destinations"          suffix="+" />
          <Counter end={stats.rating}       label="Note moyenne"          suffix="★" decimals={1} />
          <Counter end={stats.experience}   label="Ans d'expérience"      suffix="+" />
        </div>
      </div>
    </section>
  );
}
