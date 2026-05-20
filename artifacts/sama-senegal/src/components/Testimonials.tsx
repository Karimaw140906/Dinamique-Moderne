import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export function Testimonials() {
  const reviews = [
    {
      name: "Sophie L.",
      country: "France",
      text: "Une expérience inoubliable. Moussa nous a fait vivre la vraie âme de Gorée.",
      rating: 5
    },
    {
      name: "James K.",
      country: "UK",
      text: "Best tour guide in Dakar. Incredible knowledge and warmth.",
      rating: 5
    },
    {
      name: "María R.",
      country: "España",
      text: "Moussa es excepcional. La visita a Gorée fue mágica.",
      rating: 5
    }
  ];

  return (
    <section className="py-24 bg-foreground text-white relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#D4A017 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <Quote className="w-16 h-16 text-secondary/40 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Ce qu'ils en pensent
          </h2>
          <div className="flex justify-center items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-6 h-6 fill-secondary text-secondary" />
            ))}
          </div>
          <p className="text-white/60 font-medium">4.9 / 5 Note Moyenne</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>
              
              <p className="text-lg text-white/90 italic font-serif mb-8 flex-grow">
                "{review.text}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold text-xl text-white">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white">{review.name}</h4>
                  <span className="text-sm text-secondary">{review.country}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}