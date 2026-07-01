import { supabase } from "@/lib/supabase";

export const MANUAL_KPI_DEFS: { key: string; label: string; placeholder: string }[] = [
  { key: "conversion_rate", label: "Taux de conversion", placeholder: "ex : 3.2%" },
  { key: "operational_alerts", label: "Alertes opérationnelles", placeholder: "ex : 0" },
  { key: "reported_incidents", label: "Incidents signalés", placeholder: "ex : 0" },
];

export async function loadManualKpis(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  try {
    const { data, error } = await supabase.from("dg_manual_kpis").select("kpi_key, kpi_value");
    if (!error && data) {
      data.forEach((row: any) => { result[row.kpi_key] = row.kpi_value; });
    }
  } catch {}
  return result;
}

export async function saveManualKpi(key: string, label: string, value: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("dg_manual_kpis").upsert({
      kpi_key: key,
      kpi_label: label,
      kpi_value: value,
      updated_at: new Date().toISOString(),
    }, { onConflict: "kpi_key" });
    return !error;
  } catch {
    return false;
  }
}
