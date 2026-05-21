import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useEffect, useState, useRef } from "react";

function Counter({ end, label, suffix = "" }: { end: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
    return undefined; 
  }, [isVisible, end]);

  return (
    <div ref={ref} className="text-center p-6 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm">
      <div className="text-4xl md:text-5xl font-serif font-bold text-secondary mb-2">
        {count}{suffix}
      </div>
      <div className="text-white/80 font-medium tracking-wider uppercase text-sm">
        {label}
      </div>
    </div>
  );
}

export function Stats() {
  const { t } = useLanguage();

  return (
    <section className="bg-foreground py-20 border-t border-b border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Counter end={500} label={t("stats_travelers")} suffix="+" />
          <Counter end={6} label={t("stats_destinations")} />
          <Counter end={4.9} label={t("stats_rating")} suffix="★" />
          <Counter end={5} label={t("stats_experience")} suffix="+" />
        </div>
      </div>
    </section>
  );
}