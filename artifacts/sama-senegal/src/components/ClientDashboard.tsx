import { useState, useEffect, useRef } from "react";
import { PaymentModal } from "@/components/PaymentModal";
import { X, User, Calendar, Key, LogOut, Star, Gift, Copy, Check, Download, MessageCircle, Send, Inbox } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";
import { useBooking } from "@/pages/Home";
import { printQRConfirmation } from "@/components/QRConfirmation";
import { supabase } from "@/lib/supabase";

type DashTab = "reservations" | "fidelite" | "profil" | "identifiants" | "messages";

const PROMO_CODES: Record<string, { discount: number; label: string }> = {
  "SAMA10":      { discount: 10, label: "10% de réduction" },
  "SENEGAL20":   { discount: 20, label: "20% de réduction" },
  "BIENVENUE15": { discount: 15, label: "15% de réduction — Bienvenue !" },
};

const WHATSAPP_NUMBER = "221774188107";

function PointsBadge({ points }: { points: number }) {
  const level = points >= 500 ? { label: "Or 🥇", color: "#D4A017" }
              : points >= 200 ? { label: "Argent 🥈", color: "#9ca3af" }
              :                 { label: "Bronze 🥉", color: "#b45309" };
  return (
    <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
      <Star className="w-3 h-3" style={{ color: level.color }} />
      <span className="text-xs font-bold text-white">{points} pts — {level.label}</span>
    </div>
  );
}

function loadLocalMessages(userKey: string): any[] {
  try {
    const all = JSON.parse(localStorage.getItem("messages") || "[]");
    return all.filter((m: any) => m.from_user === userKey || m.to_user === userKey)
              .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } catch { return []; }
}

function saveMessage(msg: { from_user: string; to_user: string; content: string }) {
  try {
    const all = JSON.parse(localStorage.getItem("messages") || "[]");
    const newMsg = { ...msg, id: Date.now().toString(), read: false, created_at: new Date().toISOString() };
    all.push(newMsg);
    localStorage.setItem("messages", JSON.stringify(all));
    window.dispatchEvent(new Event("messagesUpdated"));
    return newMsg;
  } catch { return null; }
}

function markMessagesRead(userKey: string) {
  try {
    const all = JSON.parse(localStorage.getItem("messages") || "[]");
    const updated = all.map((m: any) =>
      m.to_user === userKey && !m.read ? { ...m, read: true } : m
    );
    localStorage.setItem("messages", JSON.stringify(updated));
    window.dispatchEvent(new Event("messagesUpdated"));
  } catch {}
}

export function ClientDashboard() {
  const { session, logout, showDashboard, setShowDashboard } = useAuth();
  const { language } = useLanguage();
  const { openBooking } = useBooking();
  const [tab, setTab] = useState<DashTab>("reservations");
  const [bookings, setBookings] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoResult, setPromoResult] = useState<{ valid: boolean; label?: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [payingBooking, setPayingBooking] = useState<any | null>(null);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = session?.clientUser;
  const userKey = user?.whatsapp || user?.email || "";

  // Charger réservations — Supabase en priorité, localStorage en fallback
  useEffect(() => {
    if (!showDashboard || !session || !user) return;

    const load = async () => {
      const phone = (user.whatsapp || "").replace(/\s/g, "");
      const email = (user.email || "").toLowerCase();

      try {
        // Tentative Supabase
        let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });
        if (phone && email) {
          query = query.or(`client_phone.ilike.%${phone}%,client_email.eq.${email}`);
        } else if (phone) {
          query = query.ilike("client_phone", `%${phone}%`);
        } else if (email) {
          query = query.eq("client_email", email);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          setBookings(data);
          return;
        }
      } catch {}

      // Fallback localStorage
      try {
        const all = JSON.parse(localStorage.getItem("bookings") || "[]");
        const filtered = all.filter((b: any) => {
          const p = (b.phone || b.client_phone || "").replace(/\s/g, "");
          const e = (b.email || b.client_email || "").toLowerCase();
          return (phone && p.includes(phone)) || (email && e === email);
        });
        setBookings(filtered.sort((a: any, b: any) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        ));
      } catch { setBookings([]); }
    };

    load();
    window.addEventListener("bookingsUpdated", load);
    return () => window.removeEventListener("bookingsUpdated", load);
  }, [showDashboard, session]);

  // Charger messages
  useEffect(() => {
    if (!showDashboard || !session || !userKey) return;
    const loadMsgs = () => {
      const msgs = loadLocalMessages(userKey);
      setMessages(msgs);
      setUnread(msgs.filter((m: any) => m.to_user === userKey && !m.read).length);
    };
    loadMsgs();
    const interval = setInterval(loadMsgs, 5000);
    window.addEventListener("messagesUpdated", loadMsgs);
    return () => { clearInterval(interval); window.removeEventListener("messagesUpdated", loadMsgs); };
  }, [showDashboard, session, userKey]);

  useEffect(() => {
    if (tab === "messages" && userKey) {
      markMessagesRead(userKey);
      setUnread(0);
    }
  }, [tab, userKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!showDashboard || !session || session.role !== "client" || !user) return null;

  const points = bookings.length * 50;
  const visibleBookings = showAll ? bookings : bookings.slice(0, 3);

  const T = {
    FR: { title: "Mon Espace Client", reservations: "Réservations", fidelite: "Fidélité", profil: "Mon Profil", identifiants: "Identifiants", messages: "Messages", logout: "Déconnexion", noRes: "Aucune réservation pour le moment.", firstName: "Prénom", lastName: "Nom", email: "Email", whatsapp: "WhatsApp", nationality: "Nationalité", lang: "Langue", joinedOn: "Membre depuis", loginEmail: "Email / WhatsApp", passHidden: "Mot de passe", bookNow: "Réserver maintenant", seeMore: "Voir plus", seeLess: "Voir moins", sendMsg: "Envoyer un message à l'équipe...", send: "Envoyer", noMsg: "Aucun message pour le moment. Envoyez-nous un message !" },
    EN: { title: "My Client Space", reservations: "Bookings", fidelite: "Loyalty", profil: "My Profile", identifiants: "Credentials", messages: "Messages", logout: "Sign Out", noRes: "No bookings yet.", firstName: "First name", lastName: "Last name", email: "Email", whatsapp: "WhatsApp", nationality: "Nationality", lang: "Language", joinedOn: "Member since", loginEmail: "Email / WhatsApp", passHidden: "Password", bookNow: "Book now", seeMore: "See more", seeLess: "See less", sendMsg: "Send a message to the team...", send: "Send", noMsg: "No messages yet. Send us a message!" },
    ES: { title: "Mi Espacio Cliente", reservations: "Reservas", fidelite: "Fidelidad", profil: "Mi Perfil", identifiants: "Credenciales", messages: "Mensajes", logout: "Cerrar sesión", noRes: "Sin reservas por ahora.", firstName: "Nombre", lastName: "Apellido", email: "Email", whatsapp: "WhatsApp", nationality: "Nacionalidad", lang: "Idioma", joinedOn: "Miembro desde", loginEmail: "Email / WhatsApp", passHidden: "Contraseña", bookNow: "Reservar ahora", seeMore: "Ver más", seeLess: "Ver menos", sendMsg: "Enviar un mensaje al equipo...", send: "Enviar", noMsg: "Sin mensajes aún. ¡Envíanos un mensaje!" },
  }[language];

  const tabs = [
    { id: "reservations" as DashTab, label: T.reservations, icon: Calendar },
    { id: "messages"     as DashTab, label: T.messages,     icon: Inbox,    badge: unread },
    { id: "fidelite"     as DashTab, label: T.fidelite,     icon: Gift },
    { id: "profil"       as DashTab, label: T.profil,       icon: User },
    { id: "identifiants" as DashTab, label: T.identifiants, icon: Key },
  ];

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-sm font-medium text-gray-800">{value || "—"}</div>
    </div>
  );

  const checkPromo = () => {
    const code = promoInput.trim().toUpperCase();
    setPromoResult(PROMO_CODES[code] ? { valid: true, label: PROMO_CODES[code].label } : { valid: false });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const openWhatsApp = (b: any) => {
    const msg = encodeURIComponent(`Bonjour, je suis ${user.firstName} ${user.lastName}. Je souhaite des informations sur ma réservation N° ${b.ref} du ${b.date || "date non spécifiée"}.`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  const sendMessage = () => {
    if (!newMsg.trim() || sending) return;
    setSending(true);
    const saved = saveMessage({ from_user: userKey, to_user: "admin@samasenegal.com", content: newMsg.trim() });
    if (saved) {
      setMessages(prev => [...prev, saved]);
      setNewMsg("");
    }
    setSending(false);
  };

  const availableCodes = points >= 200 ? ["SAMA10", "SENEGAL20", "BIENVENUE15"]
                       : points >= 100 ? ["SAMA10", "BIENVENUE15"]
                       : ["BIENVENUE15"];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDashboard(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#2C7A5C] to-[#1A1A2E] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#D4A017] flex items-center justify-center font-bold text-white text-lg shrink-0">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <div className="font-bold text-lg">{user.firstName} {user.lastName}</div>
              <PointsBadge points={points} />
            </div>
          </div>
          <button onClick={() => setShowDashboard(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, badge }: any) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 min-w-[60px] py-3 text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${tab === id ? "text-[#2C7A5C] border-b-2 border-[#2C7A5C]" : "text-gray-400 hover:text-gray-600"}`}>
              <div className="relative">
                <Icon className="w-4 h-4" />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{badge}</span>
                )}
              </div>
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 max-h-[55vh] overflow-y-auto">

          {/* RÉSERVATIONS */}
          {tab === "reservations" && (
            bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Calendar className="w-12 h-12 mb-3 opacity-30" />
                <p className="mb-4">{T.noRes}</p>
                <button onClick={() => { setShowDashboard(false); openBooking(); }}
                  className="px-6 py-2.5 bg-[#D4A017] hover:bg-[#c49015] text-white rounded-xl text-sm font-bold transition-colors">
                  {T.bookNow}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleBookings.map((b) => {
                  const services = Array.isArray(b.services) ? b.services : [b.service_name].filter(Boolean);
                  return (
                    <div key={b.ref || b.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-[#1A1A2E] text-sm font-mono">{b.ref}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${b.status === "confirmed" ? "bg-green-100 text-green-700" : b.status === "completed" ? "bg-gray-100 text-gray-600" : "bg-yellow-100 text-yellow-700"}`}>
                          {b.status === "confirmed" ? "✅ Confirmé" : b.status === "completed" ? "✔ Terminé" : "⏳ En attente"}
                        </span>
                      </div>
                      {services.length > 0 && <div className="text-xs text-gray-600 font-medium mb-1">{services.join(", ")}</div>}
                      <div className="text-xs text-gray-500">{b.date || "Date non spécifiée"} — {b.people || 1} pers.</div>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <button onClick={() => setPayingBooking(b)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#D4A017] hover:bg-[#b8880f] text-white rounded-lg text-xs font-bold transition-colors">
                          💳 Payer
                        </button>
                        <button onClick={() => printQRConfirmation({
                            ref: b.ref, client_name: `${user.firstName} ${user.lastName}`, client_phone: user.whatsapp,
                            service_type: b.service_type || "tours", service_name: services[0] || "Sama Senegal",
                            date: b.date, time: b.time, people: b.people, extra: b.extra, status: b.status,
                          })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#1A1A2E] hover:bg-[#2C7A5C] text-white rounded-lg text-xs font-bold transition-colors">
                          <Download className="w-3 h-3" /> PDF/QR
                        </button>
                        <button onClick={() => openWhatsApp(b)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-colors">
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </button>
                      </div>
                    </div>
                  );
                })}
                {bookings.length > 3 && (
                  <button onClick={() => setShowAll(!showAll)}
                    className="w-full py-2 text-xs font-bold text-[#2C7A5C] hover:bg-[#2C7A5C]/5 rounded-xl transition-colors border border-[#2C7A5C]/20">
                    {showAll ? `▲ ${T.seeLess}` : `▼ ${T.seeMore} (${bookings.length - 3})`}
                  </button>
                )}
              </div>
            )
          )}

          {/* MESSAGES */}
          {tab === "messages" && (
            <div className="flex flex-col h-[40vh]">
              <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Inbox className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm text-center">{T.noMsg}</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.from_user === userKey;
                    return (
                      <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-[#2C7A5C] text-white rounded-br-sm" : "bg-gray-100 text-[#1A1A2E] rounded-bl-sm"}`}>
                          <p>{m.content}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? "text-white/60 text-right" : "text-gray-400"}`}>
                            {new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            {isMe && (m.read ? " ✓✓" : " ✓")}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2 border-t border-gray-100 pt-3">
                <input
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={T.sendMsg}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]"
                />
                <button onClick={sendMessage} disabled={sending || !newMsg.trim()}
                  className="bg-[#2C7A5C] hover:bg-[#1A1A2E] disabled:opacity-40 text-white px-4 py-2 rounded-xl transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* FIDÉLITÉ */}
          {tab === "fidelite" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#2C7A5C]/10 to-[#D4A017]/10 rounded-2xl p-5 border border-[#2C7A5C]/20">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-[#1A1A2E]">Mes points</span>
                  <span className="text-2xl font-bold text-[#D4A017]">{points} pts</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div className="bg-[#D4A017] h-3 rounded-full transition-all" style={{ width: `${Math.min((points / 500) * 100, 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Bronze</span><span>Argent (200)</span><span>Or (500)</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                    <div className="text-xl font-bold text-[#2C7A5C]">{bookings.length}</div>
                    <div className="text-xs text-gray-400">Réservations</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                    <div className="text-xl font-bold text-[#D4A017]">{points}</div>
                    <div className="text-xs text-gray-400">Points</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                    <div className="text-xl font-bold text-[#1A1A2E]">{availableCodes.length}</div>
                    <div className="text-xs text-gray-400">Codes dispo</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">+50 points par réservation complétée</p>
              </div>

              <div>
                <h4 className="font-bold text-[#1A1A2E] mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#D4A017]" /> Codes promo disponibles
                </h4>
                <div className="space-y-2">
                  {availableCodes.map((code) => (
                    <div key={code} className="flex items-center justify-between bg-[#F5F0E8] rounded-xl px-4 py-3 border border-[#D4A017]/20">
                      <div>
                        <span className="font-bold text-[#1A1A2E] tracking-widest text-sm">{code}</span>
                        <p className="text-xs text-gray-500">{PROMO_CODES[code].label}</p>
                      </div>
                      <button onClick={() => copyCode(code)} className="text-[#2C7A5C] hover:text-[#1A1A2E] transition-colors">
                        {copied === code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#1A1A2E] mb-3">Vérifier un code promo</h4>
                <div className="flex gap-2">
                  <input value={promoInput} onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoResult(null); }}
                    placeholder="Ex: SAMA10"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]" />
                  <button onClick={checkPromo} className="bg-[#1A1A2E] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#2C7A5C] transition-colors">Vérifier</button>
                </div>
                {promoResult && (
                  <div className={`mt-2 text-sm px-3 py-2 rounded-lg ${promoResult.valid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    {promoResult.valid ? `✅ Code valide — ${promoResult.label}` : "❌ Code invalide ou expiré"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROFIL */}
          {tab === "profil" && (
            <div>
              <Field label={T.firstName}   value={user.firstName} />
              <Field label={T.lastName}    value={user.lastName} />
              <Field label={T.email}       value={user.email || ""} />
              <Field label={T.whatsapp}    value={user.whatsapp} />
              <Field label={T.nationality} value={user.nationality} />
              <Field label={T.lang}        value={user.language} />
              <Field label={T.joinedOn}    value={new Date(user.createdAt).toLocaleDateString()} />
            </div>
          )}

          {/* IDENTIFIANTS */}
          {tab === "identifiants" && (
            <div>
              <Field label={T.loginEmail} value={user.email || user.whatsapp} />
              <div className="py-3 border-b border-gray-100">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{T.passHidden}</div>
                <div className="text-sm font-medium text-gray-800">{"•".repeat(Math.min(user.password?.length || 8, 12))}</div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          {payingBooking && <PaymentModal booking={payingBooking} onClose={() => setPayingBooking(null)} />}
          <button onClick={logout}
            className="w-full py-2.5 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 rounded-xl font-medium text-sm transition-colors">
            <LogOut className="w-4 h-4" /> {T.logout}
          </button>
        </div>
      </div>
    </div>
  );
}
