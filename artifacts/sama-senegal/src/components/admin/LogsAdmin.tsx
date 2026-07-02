import { useState, useEffect } from "react";
import { RefreshCw, Activity, Search, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ACTION_COLORS: Record<string, string> = {
  login:       "bg-blue-100 text-blue-700",
  logout:      "bg-gray-100 text-gray-600",
  create:      "bg-green-100 text-green-700",
  update:      "bg-yellow-100 text-yellow-700",
  delete:      "bg-red-100 text-red-600",
  validate:    "bg-green-100 text-green-700",
  cancel:      "bg-orange-100 text-orange-600",
  ban:         "bg-red-100 text-red-600",
  unban:       "bg-green-100 text-green-700",
  view:        "bg-purple-100 text-purple-700",
};

export function LogsAdmin() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [source, setSource] = useState<"supabase" | "local">("local");

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!error && data && data.length > 0) {
        setLogs(data);
        setSource("supabase");
        setLoading(false);
        return;
      }
    } catch {}
    try {
      const local = JSON.parse(localStorage.getItem("activityLogs") || "[]");
      setLogs(local);
    } catch { setLogs([]); }
    setSource("local");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const clearLogs = async () => {
    if (!confirm("Vider tous les logs ?")) return;
    try {
      await supabase.from("activity_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } catch {}
    localStorage.removeItem("activityLogs");
    setLogs([]);
  };

  const actions = [...new Set(logs.map(l => l.action))];

  const filtered = logs.filter(l => {
    const matchSearch = search === "" || 
      `${l.user_identifier} ${l.action} ${l.target} ${l.user_role}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || l.action === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4 max-w-4xl">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Logs d'activité</h2>
          <p className="text-xs text-gray-400 mt-0.5">{logs.length} entrée(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-xs px-3 py-1.5 rounded-full font-medium ${
            source === "supabase" ? "bg-green-50 text-green-600 border border-green-200" : "bg-yellow-50 text-yellow-600 border border-yellow-200"
          }`}>
            {source === "supabase" ? "✅ Supabase" : "⚠️ Local"}
          </div>
          <button onClick={load} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={clearLogs} className="flex items-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-bold">
            <Trash2 className="w-3 h-3" /> Vider
          </button>
        </div>
      </div>

      {/* Recherche + filtres */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3EF5]/30" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="all">Toutes les actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-30" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Aucun log enregistré</p>
          <p className="text-xs mt-1">Les actions admin apparaîtront ici automatiquement</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {filtered.map((log, i) => (
            <div key={log.id || i} className="px-4 py-3 flex items-start gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600"}`}>
                    {log.action}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{log.user_identifier}</span>
                  <span className="text-xs text-gray-400">{log.user_role}</span>
                </div>
                {log.target && <p className="text-xs text-gray-500">→ {log.target}</p>}
                {log.details && (
                  <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">
                    {typeof log.details === "object" ? JSON.stringify(log.details) : log.details}
                  </p>
                )}
              </div>
              <div className="text-xs text-gray-300 shrink-0">
                {log.created_at ? new Date(log.created_at).toLocaleString("fr-FR", {
                  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                }) : "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
