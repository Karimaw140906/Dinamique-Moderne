import { useState, useEffect, useRef } from "react";
import { PaymentModal } from "@/components/PaymentModal";
import { X, User, Calendar, Key, LogOut, Star, Gift, Copy, Check, Download, MessageCircle, Send, Inbox } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useBooking } from "@/pages/Home";

type DashTab = "reservations" | "fidelite" | "profil" | "identifiants" | "messages";

const PROMO_CODES: Record<string, { discount: number; label: string }> = {
  "SAMA10": { discount: 10, label: "10% de réduction" },
  "SENEGAL20": { discount: 20, label: "20% de réduction" },
  "BIENVENUE15": { discount: 15, label: "15% de réduction — Bienvenue !" },
};

const WHATSAPP_NUMBER = "221774188107";
const ADMIN_USER = "admin@samasenegal.com";

function PointsBadge({ points }: { points: number }) {
  const level = points >= 500 ? { label: "Or 🥇", color: "#D4A017" } :
                points >= 200 ? { label: "Argent 🥈", color: "#9ca3af" } :
                { label: "Bronze 🥉", color: "#b45309" };
  return (
    <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
      <Star className="w-3 h-3" style={{ color: level.color }} />
      <span className="text-xs font-bold text-white">{points} pts — {level.label}</span>
    </div>
  );
}

function printConfirmation(b: any, user: any) {
  const qrData = encodeURIComponent(JSON.stringify({ ref: b.ref, date: b.date, people: b.people, status: b.status }));
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Confirmation — ${b.ref}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1A1A2E; padding: 40px; }
    .header { background: linear-gradient(135deg, #2C7A5C, #1A1A2E); color: white; padding: 30px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: 900; letter-spacing: 2px; }
    .logo span { color: #D4A017; }
    .subtitle { font-size: 12px; opacity: 0.7; margin-top: 4px; }
    .badge { background: #D4A017; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .body { display: flex; gap: 30px; }
    .infos { flex: 1; }
    .qr-block { text-align: center; }
    .qr-block img { border: 4px solid #2C7A5C; border-radius: 12px; }
    .qr-block p { font-size: 10px; color: #666; margin-top: 6px; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #2C7A5C; font-weight: 700; margin-bottom: 12px; border-bottom: 2px solid #2C7A5C; padding-bottom: 4px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
    .row .label { color: #888; }
    .row .val { font-weight: 600; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 12px; }
    .confirmed { background: #dcfce7; color: #16a34a; }
    .pending { background: #fef9c3; color: #ca8a04; }
    .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 16px; }
    @media print { body { padding: 20px; } }
  </style></head><body>
  <div class="header">
    <div><div class="logo">SAMA <span>SÉNÉGAL</span></div><div class="subtitle">Confirmation de réservation</div></div>
    <div class="badge">N° ${b.ref || "REF-000"}</div>
  </div>
  <div class="body">
    <div class="infos">
      <div class="section-title">Informations client</div>
      <div class="row"><span class="label">Nom complet</span><span class="val">${user.firstName} ${user.lastName}</span></div>
      <div class="row"><span class="label">WhatsApp</span><span class="val">${user.whatsapp}</span></div>
      <div class="row"><span class="label">Email</span><span class="val">${user.email || "—"}</span></div>
      <br/>
      <div class="section-title">Détails de la réservation</div>
      <div class="row"><span class="label">Date</span><span class="val">${b.date || "Non spécifiée"}</span></div>
      <div class="row"><span class="label">Personnes</span><span class="val">${b.people || 1}</span></div>
      <div class="row"><span class="label">Services</span><span class="val">${(b.services || []).join(", ") || "—"}</span></div>
      <div class="row"><span class="label">Créée le</span><span class="val">${new Date(b.created_at).toLocaleDateString("fr-FR")}</span></div>
      <div><span class="status ${b.status === "confirmed" ? "confirmed" : "pending"}">${b.status === "confirmed" ? "✅ Confirmée" : "⏳ En attente de confirmation"}</span></div>
    </div>
    <div class="qr-block">
      <img src="${qrUrl}" alt="QR Code" width="150" height="150"/>
      <p>Scanner pour vérifier</p>
    </div>
  </div>
  <div class="footer">Sama Sénégal — WhatsApp : +221 77 418 81 07 — Document généré le ${new Date().toLocaleDateString("fr-FR")}</div>
  <script>window.onload = () => { window.print(); }</script>
  </body></html>`);
  win.document.close();
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

  useEffect(() => {
    if (!showDashboard || !session) return;
    const load = async () => {
      try {
        const { data } = await supabase
          .from("bookings")
          .select("*")
          .eq("phone", session.clientUser?.whatsapp || "")
          .order("created_at", { ascending: false });
        if (data) setBookings(data);
      } catch { }
    };
    load();
  }, [showDashboard, session]);

  useEffect(() => {
    if (!showDashboard || !session) return;
    const loadMessages = async () => {
      try {
        const userKey = session.clientUser?.whatsapp || session.clientUser?.email || "";
        const { data } = await supabase
          .from("messages")
          .select("*")
          .or(`from_user.eq.${userKey},to_user.eq.${userKey}`)
          .order("created_at", { ascending: true });
        if (data) {
          setMessages(data);
          setUnread(data.filter((m: any) => m.to_user === userKey && !m.read).length);
          // Marquer comme lus si onglet messages ouvert
          if (tab === "messages") {
            await supabase.from("messages").update({ read: true })
              .eq("to_user", userKey).eq("read", false);
            setUnread(0);
          }
        }
      } catch { }
    };
    loadMessages();
    const interval = setInterval(loadMessages, 10000); // refresh toutes les 10s
    return () => clearInterval(interval);
  }, [showDashboard, session, tab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!showDashboard || !session || session.role !== "client") return null;

  const user = session.clientUser!;
  const userKey = user.whatsapp || user.email || "";
  const points = bookings.length * 50;
  const visibleBookings = showAll ? bookings : bookings.slice(0, 3);

  const T = {
    FR: { title: "Mon Espace Client", reservations: "Réservations", fidelite: "Fidélité", profil: "Mon Profil", identifiants: "Identifiants", messages: "Messages", logout: "Déconnexion", noRes: "Aucune réservation pour le moment.", firstName: "Prénom", lastName: "Nom", email: "Email", whatsapp: "WhatsApp", nationality: "Nationalité", lang: "Langue", joinedOn: "Membre depuis", loginEmail: "Email / WhatsApp", passHidden: "Mot de passe", bookNow: "Réserver maintenant", seeMore: "Voir plus", seeLess: "Voir moins", sendMsg: "Envoyer un message à l'équipe...", send: "Envoyer", noMsg: "Aucun message pour le moment. Envoyez-nous un message !" },
    EN: { title: "My Client Space", reservations: "Bookings", fidelite: "Loyalty", profil: "My Profile", identifiants: "Credentials", messages: "Messages", logout: "Sign Out", noRes: "No bookings yet.", firstName: "First name", lastName: "Last name", email: "Email", whatsapp: "WhatsApp", nationality: "Nationality", lang: "Language", joinedOn: "Member since", loginEmail: "Email / WhatsApp", passHidden: "Password", bookNow: "Book now", seeMore: "See more", seeLess: "See less", sendMsg: "Send a message to the team...", send: "Send", noMsg: "No messages yet. Send us a message!" },
    ES: { title: "Mi Espacio Cliente", reservations: "Reservas", fidelite: "Fidelidad", profil: "Mi Perfil", identifiants: "Credenciales", messages: "Mensajes", logout: "Cerrar sesión", noRes: "Sin reservas por ahora.", firstName: "Nombre", lastName: "Apellido", email: "Email", whatsapp: "WhatsApp", nationality: "Nacionalidad", lang: "Idioma", joinedOn: "Miembro desde", loginEmail: "Email / WhatsApp", passHidden: "Contraseña", bookNow: "Reservar ahora", seeMore: "Ver más", seeLess: "Ver menos", sendMsg: "Enviar un mensaje al equipo...", send: "Enviar", noMsg: "Sin mensajes aún. ¡Envíanos un mensaje!" },
  }[language];

  const tabs = [
    { id: "reservations" as DashTab, label: T.reservations, icon: Calendar },
    { id: "messages" as DashTab, label: T.messages, icon: Inbox, badge: unread },
    { id: "fidelite" as DashTab, label: T.fidelite, icon: Gift },
    { id: "profil" as DashTab, label: T.profil, icon: User },
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

  const sendMessage = async () => {
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      await supabase.from("messages").insert({
        from_user: userKey,
        to_user: ADMIN_USER,
        content: newMsg.trim(),
        read: false,
      });
      setNewMsg("");
      // Reload
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`from_user.eq.${userKey},to_user.eq.${userKey}`)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    } catch { } finally {
      setSending(false);
    }
  };

  const availableCodes = points >= 200 ? ["SAMA10", "SENEGAL20", "BIENVENUE15"] :
                         points >= 100 ? ["SAMA10", "BIENVENUE15"] : ["BIENVENUE15"];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDashboard(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#2C7A5C] to-[#1A1A2E] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#D4A017] flex items-center justify-center font-bold text-white text-lg">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <div className="font-bold text-lg">{user.firstName} {user.lastName}</div>
              <PointsBadge points={points} />
            </div>
          </div>
          <button onClick={() => setShowDashboard(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, badge }: any) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 min-w-[70px] py-3 text-xs font-semibold flex flex-col items-center gap-1 transition-colors relative ${tab === id ? "text-[#2C7A5C] border-b-2 border-[#2C7A5C]" : "text-gray-400 hover:text-gray-600"}`}>
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
                {visibleBookings.map((b) => (
                  <div key={b.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-[#1A1A2E] text-sm">{b.ref}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${b.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {b.status === "confirmed" ? "✅ Confirmé" : "⏳ En attente"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">{b.date || "Date non spécifiée"} — {b.people} pers.</div>
                    <div className="text-xs text-gray-400 mt-1">{(b.services || []).join(", ")}</div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <button onClick={() => setPayingBooking(b)} className="flex items-center gap-1 px-3 py-1.5 bg-[#D4A017] hover:bg-[#b8880f] text-white rounded-lg text-xs font-bold transition-colors">💳 Payer</button>
                      <button onClick={() => printConfirmation(b, user)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#1A1A2E] hover:bg-[#2C7A5C] text-white rounded-lg text-xs font-bold transition-colors">
                        <Download className="w-3 h-3" /> PDF
                      </button>
                      <button onClick={() => openWhatsApp(b)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-colors">
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </button>
                    </div>
                  </div>
                ))}
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
              <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Inbox className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm">{T.noMsg}</p>
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
              <Field label={T.firstName} value={user.firstName} />
              <Field label={T.lastName} value={user.lastName} />
              <Field label={T.email} value={user.email || ""} />
              <Field label={T.whatsapp} value={user.whatsapp} />
              <Field label={T.nationality} value={user.nationality} />
              <Field label={T.lang} value={user.language} />
              <Field label={T.joinedOn} value={new Date(user.createdAt).toLocaleDateString()} />
            </div>
          )}

          {/* IDENTIFIANTS */}
          {tab === "identifiants" && (
            <div>
              <Field label={T.loginEmail} value={user.email || user.whatsapp} />
              <div className="py-3 border-b border-gray-100">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{T.passHidden}</div>
                <div className="text-sm font-medium text-gray-800">{"•".repeat(user.password.length)}</div>
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
