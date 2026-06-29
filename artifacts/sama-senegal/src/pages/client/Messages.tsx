import { useEffect, useState } from "react";
import ClientLayout from "./_layout";
import { EmptyState, PageHeader, COLORS } from "./_shared";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function Messages() {
  const { session } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.clientUser) { setLoading(false); return; }
    const u = session.clientUser;
    supabase.from("messages")
      .select("*")
      .or(`sender_id.eq.${u.id},receiver_id.eq.${u.id}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setMessages(data || []); setLoading(false); });
  }, [session]);

  return (
    <ClientLayout>
      <PageHeader title="Mes messages" subtitle={`${messages.length} message${messages.length > 1 ? "s" : ""}`} />

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <EmptyState icon="✉" title="Aucun message" description="Vos échanges avec les prestataires apparaîtront ici." />
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-semibold" style={{ color: COLORS.noir }}>
                  {m.sender_name || "Prestataire"}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(m.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <p className="text-sm text-gray-600">{m.content}</p>
            </div>
          ))}
        </div>
      )}
    </ClientLayout>
  );
}
