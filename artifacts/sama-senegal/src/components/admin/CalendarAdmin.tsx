import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Ban, CheckCircle, Info } from "lucide-react";

const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS_FR = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

function loadBlocked(): Set<string> {
  try {
    const data = JSON.parse(localStorage.getItem("availabilities") || "[]");
    return new Set(Array.isArray(data) ? data : []);
  } catch { return new Set(); }
}

function saveBlocked(set: Set<string>) {
  localStorage.setItem("availabilities", JSON.stringify([...set]));
  window.dispatchEvent(new Event("availabilitiesUpdated"));
}

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

export function CalendarAdmin() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [selecting, setSelecting] = useState(false);
  const [selectMode, setSelectMode] = useState<"block" | "unblock">("block");
  const [saved, setSaved] = useState(false);

  useEffect(() => { setBlocked(loadBlocked()); }, []);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  // Jours du mois
  const firstDay = new Date(year, month, 1).getDay(); // 0=dim
  const offset = (firstDay + 6) % 7; // décaler pour Lun en premier
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const toggleDay = (d: number) => {
    const key = toKey(year, month, d);
    const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());
    if (key < todayKey) return; // passé, ignoré

    const next = new Set(blocked);
    if (selectMode === "block") { next.add(key); }
    else { next.delete(key); }
    setBlocked(next);
    saveBlocked(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const blockAll = () => {
    const next = new Set(blocked);
    for (let d = 1; d <= daysInMonth; d++) { next.add(toKey(year, month, d)); }
    setBlocked(next); saveBlocked(next);
  };
  const unblockAll = () => {
    const next = new Set(blocked);
    for (let d = 1; d <= daysInMonth; d++) { next.delete(toKey(year, month, d)); }
    setBlocked(next); saveBlocked(next);
  };

  const isBlocked = (d: number) => blocked.has(toKey(year, month, d));
  const isPast = (d: number) => {
    const key = toKey(year, month, d);
    const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());
    return key < todayKey;
  };
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const blockedCount = [...blocked].filter(k => k.startsWith(`${year}-${String(month+1).padStart(2,"0")}`)).length;

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Légende */}
      <div className="bg-[#F5F0E8] rounded-xl p-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-white border border-gray-200" /><span className="text-gray-600">Disponible</span></div>
        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-red-100 border border-red-300" /><span className="text-gray-600">Bloqué (indisponible)</span></div>
        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-[#2C7A5C]" /><span className="text-gray-600">Aujourd'hui</span></div>
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
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${selectMode === "unblock" ? "bg-[#2C7A5C] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
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

        {/* Navigation mois */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#1A1A2E] text-white">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="font-bold text-lg">{MONTHS_FR[month]} {year}</div>
            <div className="text-white/50 text-xs">
              {blockedCount} jour(s) bloqué(s) ce mois
            </div>
          </div>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* En-têtes jours */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS_FR.map(d => (
            <div key={d} className="text-center py-2.5 text-xs font-bold text-gray-400 uppercase">
              {d}
            </div>
          ))}
        </div>

        {/* Grille */}
        <div className="grid grid-cols-7">
          {/* Décalage */}
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square border-b border-r border-gray-50" />
          ))}

          {/* Jours */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
            const blocked = isBlocked(d);
            const past = isPast(d);
            const todayFlag = isToday(d);
            return (
              <button
                key={d}
                onClick={() => !past && toggleDay(d)}
                disabled={past}
                className={`aspect-square border-b border-r border-gray-50 flex items-center justify-center text-sm font-medium transition-all
                  ${past ? "bg-gray-50 text-gray-300 cursor-not-allowed" :
                    todayFlag ? "bg-[#2C7A5C] text-white hover:bg-[#245f49] font-bold" :
                    blocked ? "bg-red-50 text-red-500 hover:bg-red-100 border-red-100" :
                    "hover:bg-[#F5F0E8] text-gray-700"}`}
              >
                {d}
                {blocked && !past && !todayFlag && (
                  <span className="absolute w-1 h-1 bg-red-400 rounded-full mt-5 -mr-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {saved && (
          <div className="p-3 text-center text-xs font-bold text-[#2C7A5C] bg-green-50 border-t border-green-100">
            ✅ Calendrier mis à jour
          </div>
        )}
      </div>

      {/* Récap dates bloquées futures */}
      {blocked.size > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Ban className="w-4 h-4 text-red-500" /> Toutes les dates bloquées à venir
          </h3>
          <div className="flex flex-wrap gap-2">
            {[...blocked].sort().filter(k => k >= toKey(today.getFullYear(), today.getMonth(), today.getDate())).map(k => (
              <span key={k} className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100">
                {new Date(k + "T12:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                <button onClick={() => {
                  const next = new Set(blocked); next.delete(k); setBlocked(next); saveBlocked(next);
                }} className="ml-1 hover:text-red-800 font-bold">×</button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-4">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Les dates bloquées ici apparaîtront comme indisponibles dans le formulaire de réservation. Les clients ne pourront pas choisir ces dates.</span>
      </div>
    </div>
  );
}
