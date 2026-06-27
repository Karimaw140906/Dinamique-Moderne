import { useState, useEffect } from "react";
import { Ban, CheckCircle, Search, UserX, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

function loadLocalClients(): any[] {
  try { return JSON.parse(localStorage.getItem("samaClients") || "[]"); } catch { return []; }
}
function saveLocalClients(data: any[]) {
  localStorage.setItem("samaClients", JSON.stringify(data));
  window.dispatchEvent(new Event("clientsUpdated"));
}

export function BansAdmin() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "banned" | "active">("all");
  const [reason, setReason] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"supabase" | "local">("local");

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setClients(data);
        setSource("supabase");
      } else {
        setClients(loadLocalClients());
        setSource("local");
      }
    } catch {
      setClients(loadLocalClients());
      setSource("local");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    window.addEventListener("clientsUpdated", load);
    return () => window.removeEventListener("clientsUpdated", load);
  }, []);

  const ban = async (client: any) => {
    const r = reason[client.id] || "Violation des conditions d'utilisation";
    const updates = { banned: true, ban_reason: r };

    // Optimiste
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, ...updates } : c));
    setReason(prev => ({ ...prev, [client.id]: "" }));

    // Supabase
    try {
      await supabase.from("clients").update(updates).eq("id", client.id);
    } catch {}

    // localStorage sync
    saveLocalClients(loadLocalClients().map(c =>
      c.id === client.id ? { ...c, ...updates } : c
    ));
  };

  const unban = async (id: string) => {
    const updates = { banned: false, ban_reason: null };

    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    try {
      await supabase.from("clients").update(updates).eq("id", id);
    } catch {}

    saveLocalClients(loadLocalClients().map(c =>
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const allFiltered = clients
    .filter(c => filter === "all" ? true : filter === "banned" ? c.banned : !c.banned)
    .filter(c =>
      `${c.firstName || ""} ${c.lastName || ""} ${c.whatsapp || ""} ${c.email || ""}`
        .toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-4">

      {/* Source indicator */}
      {!loading && (
        <div className={`text-xs px-3 py-1.5 rounded-full w-fit font-medium ${
          source === "supabase"
            ? "bg-green-50 text-green-600 border border-green-200"
            : "bg-yellow-50 text-yellow-600 border border-yellow-200"
        }`}>
          {source === "supabase" ? "✅ Données Supabase" : "⚠️ Données locales (Supabase vide)"}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Bannissements</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {clients.filter(c => c.banned).length} client(s) banni(s) · {clients.length} au total
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {(["all", "active", "banned"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                filter === f ? "bg-[#1A1A2E] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {f === "all"
                ? `Tous (${clients.length})`
                : f === "active"
                ? `Actifs (${clients.filter(c => !c.banned).length})`
                : `Bannis (${clients.filter(c => c.banned).length})`}
            </button>
          ))}
          <button onClick={load} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400" title="Rafraîchir">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un client (nom, WhatsApp, email)..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30" />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-30" />
          <p className="text-sm">Chargement des clients...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm">
          <UserX className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Aucun client inscrit</p>
          <p className="text-xs mt-1">Les clients apparaîtront ici après leur inscription</p>
        </div>
      ) : allFiltered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm">
          <Ban className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Aucun résultat pour cette recherche.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allFiltered.map(c => (
            <div key={c.id} className={`bg-white rounded-xl shadow-sm border p-4 ${c.banned ? "border-red-200 bg-red-50/30" : "border-gray-100"}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800">{c.firstName} {c.lastName}</span>
                    {c.banned && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">🚫 Banni</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {c.whatsapp && `📱 ${c.whatsapp}`}
                    {c.email && ` · 📧 ${c.email}`}
                    {c.nationality && ` · 🌍 ${c.nationality}`}
                  </div>
                  {c.banned && c.ban_reason && (
                    <div className="text-xs text-red-500 mt-1 font-medium">Motif : {c.ban_reason}</div>
                  )}
                  {c.created_at && (
                    <div className="text-xs text-gray-400 mt-1">
                      Inscrit le {new Date(c.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {!c.banned ? (
                    <>
                      <input
                        value={reason[c.id] || ""}
                        onChange={e => setReason(r => ({ ...r, [c.id]: e.target.value }))}
                        placeholder="Motif du bannissement..."
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-300 w-52" />
                      <button onClick={() => ban(c)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors">
                        <Ban className="w-3 h-3" /> Bannir
                      </button>
                    </>
                  ) : (
                    <button onClick={() => unban(c.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-colors">
                      <CheckCircle className="w-3 h-3" /> Débannir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
