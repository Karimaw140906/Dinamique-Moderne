import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, MapPin, Star, Calendar, Users, UserCircle, Settings,
  LogOut, X, Upload, Link as LinkIcon, Trash2, Save, Plus, Edit2, Check,
  MessageCircle, Menu
} from "lucide-react";
import { useAdminAuth } from "@/lib/auth";

type Section = "tours" | "destinations" | "temoignages" | "reservations" | "clients" | "profil" | "parametres";

const DEFAULT_TOURS = [
  { id: 1, emoji: "🏛️", name: "Visite guidée Île de Gorée", duration: "4-5h", price: 15000, location: "Île de Gorée", active: true },
  { id: 2, emoji: "🏙", name: "City Tour Dakar", duration: "3-4h", price: 20000, location: "Dakar", active: true },
  { id: 3, emoji: "🦒", name: "Excursion Bandia", duration: "1 journée", price: 35000, location: "Bandia", active: true },
  { id: 4, emoji: "🎒", name: "Combo Gorée+Dakar", duration: "1 journée", price: 30000, location: "Gorée & Dakar", active: true },
  { id: 5, emoji: "🌅", name: "Coucher de soleil Gorée", duration: "2h", price: 10000, location: "Île de Gorée", active: true },
  { id: 6, emoji: "🏜️", name: "Lac Rose", duration: "1 journée", price: 25000, location: "Lac Rose", active: true },
];

const DEFAULT_DESTINATIONS = [
  { id: 1, emoji: "🏛️", name: "Île de Gorée", region: "Dakar", tag: "UNESCO", active: true },
  { id: 2, emoji: "🌆", name: "Dakar", region: "Dakar", tag: "Capitale", active: true },
  { id: 3, emoji: "🦁", name: "Bandia", region: "Thiès", tag: "Safari", active: true },
  { id: 4, emoji: "🏜️", name: "Lac Rose", region: "Dakar", tag: "Phénomène naturel", active: true },
  { id: 5, emoji: "🌊", name: "Saly", region: "Thiès", tag: "Plage", active: true },
  { id: 6, emoji: "🦣", name: "Sine Saloum", region: "Fatick", tag: "Delta", active: true },
  { id: 7, emoji: "🕌", name: "Saint-Louis", region: "Saint-Louis", tag: "UNESCO", active: true },
  { id: 8, emoji: "🌊", name: "Casamance", region: "Ziguinchor", tag: "Nature", active: true },
];

const DEFAULT_TEMOIGNAGES = [
  { id: 1, name: "Sophie L.", country: "France", text: "Une expérience inoubliable. Bachirou nous a fait vivre la vraie âme de Gorée.", rating: 5, active: true },
  { id: 2, name: "James K.", country: "UK", text: "Best tour guide in Dakar. Incredible knowledge and warmth.", rating: 5, active: true },
  { id: 3, name: "María R.", country: "España", text: "Bachirou es excepcional. La visita a Gorée fue mágica.", rating: 5, active: true },
];

function useLocalData<T>(key: string, defaults: T): [T, (v: T) => void] {
  const [data, setData] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : defaults; } catch { return defaults; }
  });
  const save = (v: T) => { setData(v); localStorage.setItem(key, JSON.stringify(v)); };
  return [data, save];
}

export function AdminDashboard() {
  const { adminSession, adminLogout, showAdminDashboard } = useAdminAuth();
  const [section, setSection] = useState<Section>("profil");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [tours, setTours] = useLocalData("adminTours", DEFAULT_TOURS);
  const [destinations, setDests] = useLocalData("adminDestinations", DEFAULT_DESTINATIONS);
  const [temoignages, setTemos] = useLocalData("adminTemoignages", DEFAULT_TEMOIGNAGES);

  const [guideName, setGuideName] = useLocalData("guideName", "Bachirou Henry Sy");
  const [guideBio, setGuideBio] = useLocalData("guideBio", "Né sur l'île de Gorée, guide certifié depuis 5 ans, passionné par l'histoire et la culture sénégalaise.");
  const [guidePhoto, setGuidePhotoState] = useState<string>(() => localStorage.getItem("guidPhoto") || "");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("guidPhoto") || "";
    setGuidePhotoState(stored);
    setPhotoPreview(stored);
  }, []);

  if (!showAdminDashboard || !adminSession) return null;

  const saveGuidePhoto = (src: string) => {
    localStorage.setItem("guidPhoto", src);
    setGuidePhotoState(src);
    setPhotoPreview(src);
    window.dispatchEvent(new Event("guidePhotoUpdated"));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhotoPreview(result);
      setPhotoUrl("");
    };
    reader.readAsDataURL(file);
  };

  const handleUrlPreview = () => {
    if (photoUrl.trim()) setPhotoPreview(photoUrl.trim());
  };

  const deletePhoto = () => {
    localStorage.removeItem("guidPhoto");
    setGuidePhotoState("");
    setPhotoPreview("");
    setPhotoUrl("");
    window.dispatchEvent(new Event("guidePhotoUpdated"));
  };

  const navItems: { id: Section; label: string; icon: any }[] = [
    { id: "tours", label: "Tours", icon: MapPin },
    { id: "destinations", label: "Destinations", icon: LayoutDashboard },
    { id: "temoignages", label: "Témoignages", icon: Star },
    { id: "reservations", label: "Réservations", icon: Calendar },
    { id: "clients", label: "Clients", icon: Users },
    { id: "profil", label: "Profil Guide", icon: UserCircle },
    { id: "parametres", label: "Paramètres", icon: Settings },
  ];

  const navigate = (id: Section) => { setSection(id); setSidebarOpen(false); };

  return (
    <div className="fixed inset-0 z-[250] flex bg-gray-100 font-sans">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-10 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed md:static top-0 left-0 h-full z-20 w-64 bg-[#1A1A2E] text-white flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6 border-b border-white/10">
          <div className="text-xl font-serif italic font-bold text-[#D4A017]">🌴 Sama Senegal</div>
          <div className="text-white/50 text-xs mt-1">Administration</div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => navigate(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${section === id ? "bg-[#2C7A5C] text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={adminLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">{navItems.find(n => n.id === section)?.label}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 hidden sm:block">Admin: {adminSession.username}</div>
            <button onClick={adminLogout} className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">

          {/* ── TOURS ── */}
          {section === "tours" && (
            <div className="space-y-4">
              <div className="grid gap-3">
                {tours.map((tour, i) => (
                  <div key={tour.id} className="bg-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="text-3xl">{tour.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800">{tour.name}</div>
                      <div className="text-sm text-gray-500">{tour.duration} · {tour.location}</div>
                    </div>
                    <div className="font-bold text-[#2C7A5C]">{tour.price.toLocaleString()} FCFA</div>
                    <button
                      onClick={() => { const t = [...tours]; t[i].active = !t[i].active; setTours(t); }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${tour.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {tour.active ? "Actif" : "Inactif"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DESTINATIONS ── */}
          {section === "destinations" && (
            <div className="grid sm:grid-cols-2 gap-3">
              {destinations.map((d, i) => (
                <div key={d.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                  <div className="text-2xl">{d.emoji}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{d.name}</div>
                    <div className="text-xs text-gray-500">{d.region} · {d.tag}</div>
                  </div>
                  <button
                    onClick={() => { const dests = [...destinations]; dests[i].active = !dests[i].active; setDests(dests); }}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${d.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {d.active ? "Actif" : "Inactif"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── TÉMOIGNAGES ── */}
          {section === "temoignages" && (
            <div className="space-y-4">
              {temoignages.map((t, i) => (
                <div key={t.id} className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-800">{t.name}</span>
                        <span className="text-xs text-gray-400">· {t.country}</span>
                        <span className="text-yellow-400">{"⭐".repeat(t.rating)}</span>
                      </div>
                      <p className="text-sm text-gray-600 italic">"{t.text}"</p>
                    </div>
                    <button
                      onClick={() => { const ts = [...temoignages]; ts[i].active = !ts[i].active; setTemos(ts); }}
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${t.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {t.active ? "Publié" : "Masqué"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── RÉSERVATIONS ── */}
          {section === "reservations" && (
            <div className="bg-white rounded-xl p-8 shadow-sm text-center text-gray-400">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Aucune réservation reçue pour l'instant.</p>
              <p className="text-sm mt-2">Les réservations via WhatsApp apparaîtront ici.</p>
            </div>
          )}

          {/* ── CLIENTS ── */}
          {section === "clients" && (
            <ClientsSection />
          )}

          {/* ── PROFIL GUIDE ── */}
          {section === "profil" && (
            <div className="max-w-xl space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-gray-800 text-lg border-b pb-3">Profil du Guide</h2>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Nom du guide</label>
                  <input
                    type="text" value={guideName}
                    onChange={(e) => setGuideName(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Biographie</label>
                  <textarea
                    value={guideBio}
                    onChange={(e) => setGuideBio(e.target.value)}
                    rows={3}
                    className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30 resize-none"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
                <h2 className="font-bold text-gray-800 text-lg border-b pb-3">Photo du Guide</h2>

                {/* Current preview */}
                <div className="flex justify-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Guide" className="w-36 h-36 rounded-full object-cover border-4 border-[#D4A017] shadow-lg" />
                  ) : (
                    <div className="w-36 h-36 rounded-full bg-[#1A1A2E] flex items-center justify-center border-4 border-[#D4A017] shadow-lg">
                      <span className="text-[#D4A017] text-3xl font-bold font-serif">BHS</span>
                    </div>
                  )}
                </div>

                {/* Option 1: URL */}
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <LinkIcon className="w-3 h-3" /> Option 1 : URL de l'image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://exemple.com/photo.jpg"
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30"
                    />
                    <button onClick={handleUrlPreview}
                      className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
                      Aperçu
                    </button>
                  </div>
                </div>

                {/* Option 2: File upload */}
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Upload className="w-3 h-3" /> Option 2 : Télécharger depuis l'appareil
                  </label>
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-[#2C7A5C] rounded-xl text-sm text-gray-500 hover:text-[#2C7A5C] flex items-center justify-center gap-2 transition-colors">
                    <Upload className="w-4 h-4" />
                    Choisir une photo
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => saveGuidePhoto(photoPreview)}
                    disabled={!photoPreview}
                    className="flex-1 py-2.5 bg-[#2C7A5C] hover:bg-[#245f49] disabled:opacity-40 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" /> Enregistrer la photo
                  </button>
                  <button
                    onClick={deletePhoto}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </div>
              </div>

              {/* WhatsApp & Contact */}
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
                <h2 className="font-bold text-gray-800 text-lg border-b pb-3">Contact</h2>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>+221 77 418 81 07</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-pink-400">@</span>
                  <span>@sama__senegal</span>
                </div>
              </div>
            </div>
          )}

          {/* ── PARAMÈTRES ── */}
          {section === "parametres" && (
            <div className="max-w-md bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-gray-800 text-lg border-b pb-3">Paramètres du site</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span>Langue par défaut</span><span className="font-bold text-[#2C7A5C]">Français</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span>WhatsApp</span><span className="font-bold">+221774188107</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span>Instagram</span><span className="font-bold">@sama__senegal</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Version</span><span className="font-bold text-gray-400">v1.0.0</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ClientsSection() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    try { setClients(JSON.parse(localStorage.getItem("samaClients") || "[]")); } catch {}
  }, []);

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm text-center text-gray-400">
        <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg">Aucun client inscrit pour l'instant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {clients.map((c: any) => (
        <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#2C7A5C]/10 flex items-center justify-center font-bold text-[#2C7A5C] text-sm shrink-0">
            {c.firstName?.[0]}{c.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800">{c.firstName} {c.lastName}</div>
            <div className="text-xs text-gray-500">{c.whatsapp} · {c.nationality}</div>
          </div>
          <div className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  );
}
