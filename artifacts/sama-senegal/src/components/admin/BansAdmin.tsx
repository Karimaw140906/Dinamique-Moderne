import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Ban, CheckCircle, Search } from "lucide-react";

export function BansAdmin() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "banned" | "active">("all");
  const [reason, setReason] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    let query = supabase.from("clients").select("*").order("created_at", { ascending: false });
    if (filter === "banned") query = query.eq("banned", true);
    if (filter === "active") query = query.eq("banned", false);
    const { data } = await query;
    if (data) setClients(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const ban = async (client: any) => {
    const r = reason[client.id] || "Violation des conditions d'utilisation";
    await supabase.from("clients").update({
      banned: true,
      ban_reason: r,
    }).eq("id", client.id);
    setReason(prev => ({ ...prev, [client.id]: "" }));
    await load();
  };

  const unban = async (id: string) => {
    await supabase.from("clients").update({ banned: false, ban_reason: null }).eq("id", id);
    await load();
  };

  const filtered = clients.filter(c =>
    `${c.first_name} ${c.last_name} ${c.whatsapp} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-gray-800">Bannissements</h2>
        <div className="flex gap-2">
          {(["all", "active", "banned"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === f ? "bg-[#1A1A2E] text-white" : "bg-gray-100 text-gray-600"}`}>
              {f === "all" ? "Tous" : f === "active" ? "Actifs" : "Bannis"}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un client..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C7A5C]/30" />
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">
          <Ban className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Aucun client trouvé.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className={`bg-white rounded-xl shadow-sm border p-4 ${c.banned ? "border-red-200" : "border-gray-100"}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{c.first_name} {c.last_name}</span>
                    {c.banned && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">🚫 Banni</span>}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{c.whatsapp} {c.email ? `· ${c.email}` : ""}</div>
                  {c.banned && c.ban_reason && (
                    <div className="text-xs text-red-500 mt-1">Motif : {c.ban_reason}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    Inscrit le {new Date(c.created_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {!c.banned ? (
                    <>
                      <input value={reason[c.id] || ""} onChange={e => setReason(r => ({ ...r, [c.id]: e.target.value }))}
                        placeholder="Motif du bannissement..."
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-300 w-48" />
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
