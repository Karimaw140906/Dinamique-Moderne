import { useState, useEffect } from "react";
import { Check, X, RefreshCw, Briefcase, Phone, Mail, FileText, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { logActivity } from "@/lib/activityLogger";

const ROLE_LABELS: Record<string, string> = {
  guide: "🌴 Guide", chauffeur: "🚗 Chauffeur", restaurant: "🍽️ Restaurateur",
  hotel: "🏨 Hébergement", activites: "🎯 Activités", autre: "✨ Autre",
};

const ROLE_TO_STAFF: Record<string, string> = {
  guide: "guide", chauffeur: "chauffeur", restaurant: "restaurant",
  hotel: "hotel", activites: "guide", autre: "commercial",
};

function slugify(name: string): string {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function loadLocalRequests(): any[] {
  try { return JSON.parse(localStorage.getItem("providerRequests") || "[]"); } catch { return []; }
}

function saveLocalRequests(list: any[]) {
  localStorage.setItem("providerRequests", JSON.stringify(list));
  window.dispatchEvent(new Event("providerRequestsUpdated"));
}

export function ProviderRequestsAdmin() {
  const { session } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"supabase" | "local">("local");
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [lastCreated, setLastCreated] = useState<{ name: string; identifier: string; password: string; whatsapp: string } | null>(null);

  const actor = () => ({
    user_identifier: session?.identifier || "unknown",
    user_role: session?.role || "unknown",
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("provider_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        setRequests(data);
        setSource("supabase");
        setLoading(false);
        return;
      }
    } catch {}
    setRequests(loadLocalRequests());
    setSource("local");
    setLoading(false);
  };

  useEffect(() => {
    load();
    window.addEventListener("providerRequestsUpdated", load);
    return () => window.removeEventListener("providerRequestsUpdated", load);
  }, []);

  const approve = async (req: any) => {
    const roles: string[] = req.roles || [];
    const primaryRole = ROLE_TO_STAFF[roles[0]] || "guide";
    const identifier = `${slugify(req.name)}${Math.floor(Math.random() * 90 + 10)}`;
    const password = generatePassword();

    try {
      await supabase.from("staff_accounts").insert({
        name: req.name,
        role: primaryRole,
        identifier,
        password,
        whatsapp: req.whatsapp,
        email: req.email || null,
        permissions: [],
        active: true,
        created_at: new Date().toISOString(),
      });
    } catch {}

    // Marquer la demande comme approuvee (Supabase + localStorage)
    try {
      await supabase.from("provider_requests").update({ status: "approved" }).eq("id", req.id);
    } catch {}
    const local = loadLocalRequests();
    saveLocalRequests(local.map((r: any) => r.id === req.id ? { ...r, status: "approved" } : r));

    logActivity({ ...actor(), action: "approve", target: req.name, details: { type: "provider_request", role: primaryRole, identifier } });
    window.dispatchEvent(new Event("staffAccountsUpdated"));
    setLastCreated({ name: req.name, identifier, password, whatsapp: req.whatsapp });
    await load();
  };

  const reject = async (req: any) => {
    const reason = window.prompt("Raison du refus (optionnel) :") || "";
    try {
      await supabase.from("provider_requests").update({ status: "rejected" }).eq("id", req.id);
    } catch {}
    const local = loadLocalRequests();
    saveLocalRequests(local.map((r: any) => r.id === req.id ? { ...r, status: "rejected" } : r));

    logActivity({ ...actor(), action: "reject", target: req.name, details: { type: "provider_request", reason } });
    await load();
  };

  const filtered = requests.filter(r => filter === "all" || (r.status || "pending") === "pending");

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Demandes Prestataires</h2>
          <p className="text-xs text-gray-500 mt-0.5">{filtered.length} demande(s) {filter === "pending" ? "en attente" : "au total"}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-xs px-3 py-1.5 rounded-full font-medium ${
            source === "supabase" ? "bg-green-50 text-green-600 border border-green-200" : "bg-yellow-50 text-yellow-600 border border-yellow-200"
          }`}>
            {source === "supabase" ? "✅ Supabase (multi-appareil)" : "⚠️ Local uniquement (cet appareil)"}
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value as any)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
            <option value="pending">En attente</option>
            <option value="all">Toutes</option>
          </select>
          <button onClick={load} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {source === "local" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
          ⚠️ Aucune demande trouvée côté Supabase — celles affichées ici viennent uniquement de cet appareil.
          Si un prestataire a soumis une demande depuis un autre appareil, elle n'apparaîtra que si la synchronisation Supabase fonctionne (vérifier le schéma de la table <code>provider_requests</code> si ce message persiste).
        </div>
      )}

      {lastCreated && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
          <div className="font-bold text-emerald-800 text-sm">✅ Compte staff créé pour {lastCreated.name}</div>
          <div className="text-sm text-emerald-700">Identifiant : <span className="font-mono font-bold">{lastCreated.identifier}</span></div>
          <div className="text-sm text-emerald-700">Mot de passe : <span className="font-mono font-bold">{lastCreated.password}</span></div>
            <a
              href={`https://wa.me/${lastCreated.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`🌴 Bienvenue chez Sama Senegal !\n\nVotre compte a été créé.\nIdentifiant : ${lastCreated.identifier}\nMot de passe : ${lastCreated.password}\n\nConnectez-vous pour accéder à votre espace.`)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-[#25D366] text-white rounded-lg text-xs font-bold hover:bg-[#20bd5a] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Envoyer les identifiants via WhatsApp
          </a>
          <button onClick={() => setLastCreated(null)} className="block text-xs text-emerald-600 hover:underline mt-1">Fermer</button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-30" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center text-gray-400">
          <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Aucune demande {filter === "pending" ? "en attente" : "enregistrée"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req: any, i: number) => {
            const status = req.status || "pending";
            return (
              <div key={req.id || i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-gray-800">{req.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        status === "approved" ? "bg-green-100 text-green-700" :
                        status === "rejected" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                      }`}>{status === "approved" ? "Approuvée" : status === "rejected" ? "Refusée" : "En attente"}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {req.whatsapp}</span>
                      {req.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {req.email}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(req.roles || []).map((r: string) => (
                        <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{ROLE_LABELS[r] || r}</span>
                      ))}
                    </div>
                    {req.documents && Object.keys(req.documents).length > 0 && (
                      <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {Object.keys(req.documents).length} document(s) fourni(s)
                      </div>
                    )}
                  </div>
                  {status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => approve(req)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#6C3EF5] text-white rounded-lg text-xs font-bold hover:bg-[#245f49] transition-colors">
                        <Check className="w-3.5 h-3.5" /> Approuver
                      </button>
                      <button onClick={() => reject(req)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                        <X className="w-3.5 h-3.5" /> Refuser
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
