import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { ShoppingCart, Plus, Minus, MessageCircle, X } from "lucide-react";

export function FoodSection() {
  const { t, language } = useLanguage();
  const { convertPrice } = useCurrency();
  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<{item: any, quantity: number}[]>([]);
  const [filter, setFilter] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const loadItems = () => {
    const saved = localStorage.getItem("menuData");
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        setItems(parsed.filter((i: any) => i.available));
      } catch { }
    }
  };

  useEffect(() => {
    loadItems();
    window.addEventListener("menuDataUpdated", loadItems);
    return () => window.removeEventListener("menuDataUpdated", loadItems);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  if (items.length === 0) return null;

  const categories = ["All", ...Array.from(new Set(items.map(i => i.category)))];
  const filteredItems = filter === "All" ? items : items.filter(i => i.category === filter);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(p => p.item.id === item.id);
      if (existing) return prev.map(p => p.item.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
      return [...prev, { item, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => {
      return prev.map(p => {
        if (p.item.id === id) {
          const newQ = p.quantity + delta;
          return newQ > 0 ? { ...p, quantity: newQ } : null;
        }
        return p;
      }).filter(Boolean) as any[];
    });
  };

  const cartTotal = cart.reduce((sum, p) => sum + (p.item.price * p.quantity), 0);

  const orderWhatsApp = () => {
    if (cart.length === 0) return;
    const lines = cart.map(p => `- ${p.quantity}x ${p.item.nameFR} (${p.item.price * p.quantity} FCFA)`).join("\n");
    const text = `*Commande Sama Senegal* 🍽️\n\n${lines}\n\n*Total: ${cartTotal} FCFA*`;
    window.open(`https://wa.me/221774188107?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section id="commander" className="py-24 bg-white text-[#1A1A2E] relative" ref={ref}>
      <div className={`container mx-auto px-4 md:px-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">{t("food_title")}</h2>
          <div className="w-24 h-1 bg-[#C2622D] mx-auto"></div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === c ? "bg-[#C2622D] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex gap-8 relative">
          {/* Menu Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => {
              const name = language === "EN" ? item.nameEN : language === "ES" ? item.nameES : item.nameFR;
              const desc = language === "EN" ? item.descEN : language === "ES" ? item.descES : item.descFR;
              
              return (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all flex flex-col">
                  {item.photo ? (
                    <img src={item.photo} alt={name} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-orange-50 flex items-center justify-center text-4xl">🍲</div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg text-[#1A1A2E] leading-tight">{name}</h3>
                      <span className="font-bold text-[#C2622D] whitespace-nowrap ml-2">{convertPrice(item.price)}</span>
                    </div>
                    
                    <div className="flex gap-2 mb-2">
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.spiceLevel}</span>
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">⏱️ {item.prepTime} min</span>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{desc}</p>
                    
                    <button 
                      onClick={() => addToCart(item)}
                      className="mt-auto w-full bg-[#1A1A2E] hover:bg-[#C2622D] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> {t("food_add")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Cart Sidebar */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24 bg-[#F5F0E8] rounded-2xl p-6 shadow-md border border-[#D4A017]/20">
              <h3 className="font-serif font-bold text-2xl mb-4 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-[#C2622D]" /> {t("food_cart")}
              </h3>
              
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-8 italic">{t("food_empty")}</div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                    {cart.map(p => (
                      <div key={p.item.id} className="flex justify-between items-center text-sm">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-bold truncate">{language === "EN" ? p.item.nameEN : language === "ES" ? p.item.nameES : p.item.nameFR}</div>
                          <div className="text-gray-500">{p.item.price.toLocaleString()} FCFA</div>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200">
                          <button onClick={() => updateQuantity(p.item.id, -1)} className="p-1 hover:text-[#C2622D]"><Minus className="w-3 h-3" /></button>
                          <span className="font-bold w-4 text-center">{p.quantity}</span>
                          <button onClick={() => updateQuantity(p.item.id, 1)} className="p-1 hover:text-[#C2622D]"><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-300 pt-4 mb-6">
                    <div className="flex justify-between font-bold text-lg">
                      <span>{t("food_total")}</span>
                      <span className="text-[#C2622D]">{convertPrice(cartTotal)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={orderWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" /> {t("food_order")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Floating Bar & Drawer */}
      <div className="lg:hidden">
        {cart.length > 0 && !cartOpen && (
          <div className="fixed bottom-4 left-4 right-4 z-[100]">
            <button 
              onClick={() => setCartOpen(true)}
              className="w-full bg-[#C2622D] text-white p-4 rounded-2xl shadow-xl font-bold flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">{cart.reduce((a,b)=>a+b.quantity,0)}</div>
                <span>{t("food_cart")}</span>
              </div>
              <span>{convertPrice(cartTotal)}</span>
            </button>
          </div>
        )}

        {cartOpen && (
          <div className="fixed inset-0 z-[200] flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
            <div className="bg-[#F5F0E8] w-full rounded-t-3xl shadow-2xl relative p-6 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif font-bold text-2xl flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-[#C2622D]" /> {t("food_cart")}
                </h3>
                <button onClick={() => setCartOpen(false)} className="p-2 bg-gray-200 rounded-full"><X className="w-5 h-5"/></button>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-8 italic mb-4">{t("food_empty")}</div>
              ) : (
                <div className="overflow-y-auto flex-1 mb-6 space-y-4 pr-2">
                  {cart.map(p => (
                    <div key={p.item.id} className="flex justify-between items-center text-sm bg-white p-3 rounded-xl shadow-sm">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-bold truncate">{language === "EN" ? p.item.nameEN : language === "ES" ? p.item.nameES : p.item.nameFR}</div>
                        <div className="text-gray-500">{p.item.price.toLocaleString()} FCFA</div>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200">
                        <button onClick={() => updateQuantity(p.item.id, -1)} className="p-2 hover:text-[#C2622D]"><Minus className="w-3 h-3" /></button>
                        <span className="font-bold w-4 text-center">{p.quantity}</span>
                        <button onClick={() => updateQuantity(p.item.id, 1)} className="p-2 hover:text-[#C2622D]"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="mt-auto">
                  <div className="border-t border-gray-300 pt-4 mb-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>{t("food_total")}</span>
                      <span className="text-[#C2622D]">{convertPrice(cartTotal)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={orderWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors text-lg"
                  >
                    <MessageCircle className="w-6 h-6" /> {t("food_order")}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
