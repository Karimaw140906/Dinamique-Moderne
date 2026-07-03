import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Aucun témoignage fictif par défaut : si Supabase et le localStorage
// sont vides, la section ne doit rien afficher plutôt que montrer des
// avis inventés.
const DEFAULT_TESTIMONIALS: any[] = [];

interface Testimonial {
  id: string;
  author: string;
  nationality?: string;
  rating: number;
  comment: string;
  active?: boolean;
}

async function loadActiveTestimonials(): Promise<Testimonial[]> {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch {}
  try {
    const saved = localStorage.getItem("adminTemoignages");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((t: Testimonial) => t.active !== false);
      }
    }
  } catch {}
  return DEFAULT_TESTIMONIALS;
}

export function Testimonials() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = () => loadActiveTestimonials().then((data) => {
      if (mounted) { setReviews(data); setLoading(false); }
    });
    load();
    window.addEventListener("testimonialsUpdated", load);
    return () => { mounted = false; window.removeEventListener("testimonialsUpdated", load); };
  }, []);

  if (loading || reviews.length === 0) return null;

  const avgRating = parseFloat(
    (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
  );

  return (
    <section className="py-24 bg-foreground text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#F5B942 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <Quote className="w-16 h-16 text-secondary/40 mx-auto mb-6" />
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">
            Avis clients
          </span>
          <h2 className="text-4xl md:text-5xl font-serif italic font-bold text-white mt-2 mb-4">
            Ce qu'ils en pensent
          </h2>
          <div className="flex justify-center items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${i <= Math.round(avgRating) ? "fill-secondary text-secondary" : "text-white/20"}`}
              />
            ))}
          </div>
          <p className="text-white/60 font-medium">{avgRating} / 5 · {reviews.length} avis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.slice(0, 6).map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors flex flex-col"
            >
              <div className="flex gap-1 mb-6">
                {Array.from({ length: review.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>

              <p className="text-lg text-white/90 italic font-serif mb-8 flex-grow">
                "{review.comment}"
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold text-xl text-white">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white">{review.author}</h4>
                  {review.nationality && (
                    <span className="text-sm text-secondary">{review.nationality}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
