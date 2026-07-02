import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Ban, CheckCircle, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";

const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS_FR = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

function loadLocalBlocked(): Set<string> {
  try {
    const data = JSON.parse(localStorage.getItem("availabilities") || "[]");
    return new Set(Array.isArray(data) ? data : []);
  } catch { return new Set(); }
}

function saveLocalBlocked(set: Set<string>) {
  localStorage.setItem("availabilities", JSON.stringify([...set]));
  window.dispatchEvent(new Event("availabilitiesUpdated"));
}

async function loadBlockedFromSupabase(): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from("availabilities")
      .select("date")
      .eq("blocked", true);
    if (!error && data && data.length > 0) {
      return new Set(data.map((r: any) => r.date));
    }
  } catch {}
  return loadLocalBlocked();
}

async function toggleDayInSupabase(key: string, block: boolean) {
  try {
    if (block) {
      await supabase.from("availabilities").upsert({ date: key, blocked: true }, { onConflict: "date" });
    } else {
      await supabase.from("availabilities").delete().eq("date", key);
    }
  } catch {}
  // localStorage sync
  const local = loadLocalBlocked();
  if (block) local.add(key); else local.delete(key);
  saveLocalBlocked(local);
}

export function CalendarAdmin() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState<"block" | "unblock">("block");
  const [saved, setSaved] = useState(false);
  const [source, setSource] = useState<"supabase" | "local">("local");

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from("availabilities").select("date").eq("blocked", true);
        if (!error && data) {
          setBlocked(new Set(data.map((r: any) => r.date)));
          setSource(data.length > 0 ? "supabase" : "local");
          if (data.length === 0) setBlocked(loadLocalBlocked());
          return;
        }
      } catch {}
      setBlocked(loadLocalBlocked());
      setSource("local");
    };
    load();
  }, []);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const toggleDay = async (d: number) => {
    const key = toKey(year, month, d);
    const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());
    if (key < todayKey) return;

    const next = new Set(blocked);
    const block = selectMode === "block";
    if (block) next.add(key); else next.delete(key);
    setBlocked(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    await toggleDayInSupabase(key, block);
  };

  const blockAll = async () => {
    const next = new Set(blocked);
    const keys: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const key = toKey(year, month, d);
      next.add(key);
      keys.push(key);
    }
    setBlocked(next);
    try {
      await supabase.from("availabilities").upsert(
        keys.map(date => ({ date, blocked: true })),
        { onConflict: "date" }
      );
    } catch {}
    saveLocalBlocked(next);
  };

  const unblockAll = async () => {
    const next = new Set(blocked);
    const keys: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const key = toKey(year, month, d);
      next.delete(key);
      keys.push(key);
    }
    setBlocked(next);
    try {
      await supabase.from("availabilities").delete()
        .in("date", keys);
    } catch {}
    saveLocalBlocked(next);
  };

  const isBlocked = (d: number) => blocked.has(toKey(year, month, d));
  const isPast = (d: number) => {
    const key = toKey(year, month, d);
    const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());
    return key < todayKey;
  };
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const blockedCount = [...blocked].filter(k =>
    k.startsWith(`${year}-${String(month+1).padStart(2,"0")}`)
  ).length;

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Source indicator */}
      <div className={`text-xs px-3 py-1.5 rounded-full w-fit font-medium ${
        source === "supabase"
          ? "bg-green-50 text-green-600 border border-green-200"
          : "bg-yellow-50 text-yellow-600 border border-yellow-200"
      }`}>
        {source === "supabase" ? "✅ Données Supabase" : "⚠️ Données locales"}
      </div>

      {/* Légende */}
      <div className="bg-[#2B1B4D] rounded-xl p-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-white border border-gray-200" /><span className="text-gray-600">Disponible</span></div>
        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-red-100 border border-red-300" /><span className="text-gray-600">Bloqué</span></div>
        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-[#6C3EF5]" /><span className="text-gray-600">Aujourd'hui</span></div>
        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-gray-100 border border-gray-200" /><span className="text-gray-400">Passé</span></div>
      </div>

      {/* Contrôles mode */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-bold text-gray-600">Mode :</span>
        <button onClick={() => setSelectMode("block")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${selectMode === "block" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          <Ban className="w-4 h-4" /> Bloquer
        </button>
        <button onClick={() => setSelectMode("unblock")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${selectMode === "unblock" ? "bg-[#6C3EF5] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          <CheckCircle className="w-4 h-4" /> Débloquer
        </button>
        <div className="ml-auto flex gap-2">
          <button onClick={blockAll} className="px-3 py-2 text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
            Tout bloquer
          </button>
          <button onClick={unblockAll} className="px-3 py-2 text-xs font-bold bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors">
            Tout débloquer
          </button>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#0B0A14] text-white">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="font-bold text-lg">{MONTHS_FR[month]} {year}</div>
            <div className="text-white/50 text-xs">{blockedCount} jour(s) bloqué(s) ce mois</div>
          </div>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS_FR.map(d => (
            <div key={d} className="text-center py-2.5 text-xs font-bold text-gray-400 uppercase">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square border-b border-r border-gray-50" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
            const isB = isBlocked(d);
            const past = isPast(d);
            const todayFlag = isToday(d);
            return (
              <button key={d} onClick={() => !past && toggleDay(d)} disabled={past}
                className={`aspect-square border-b border-r border-gray-50 flex items-center justify-center text-sm font-medium transition-all
                  ${past ? "bg-gray-50 text-gray-300 cursor-not-allowed" :
                    todayFlag ? "bg-[#6C3EF5] text-white hover:bg-[#8B5CF6] font-bold" :
                    isB ? "bg-red-50 text-red-500 hover:bg-red-100 border-red-100" :
                    "hover:bg-[#2B1B4D] text-gray-700"}`}>
                {d}
              </button>
            );
          })}
        </div>

        {saved && (
          <div className="p-3 text-center text-xs font-bold text-[#6C3EF5] bg-green-50 border-t border-green-100">
            ✅ Calendrier mis à jour
          </div>
        )}
      </div>

      {/* Récap dates bloquées */}
      {blocked.size > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Ban className="w-4 h-4 text-red-500" /> Dates bloquées à venir
          </h3>
          <div className="flex flex-wrap gap-2">
            {[...blocked].sort()
              .filter(k => k >= toKey(today.getFullYear(), today.getMonth(), today.getDate()))
              .map(k => (
                <span key={k} className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100">
                  {new Date(k + "T12:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                  <button onClick={async () => {
                    const next = new Set(blocked);
                    next.delete(k);
                    setBlocked(next);
                    await toggleDayInSupabase(k, false);
                  }} className="ml-1 hover:text-red-800 font-bold">×</button>
                </span>
              ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-4">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Les dates bloquées ici apparaîtront comme indisponibles dans le formulaire de réservation.</span>
      </div>
    </div>
  );
}
