import ClientLayout from "./_layout";
import { EmptyState, PageHeader, COLORS } from "./_shared";

export default function Messages() {
  return (
    <ClientLayout>
      <PageHeader
        title="Mes messages"
        subtitle="Vos conversations avec les prestataires"
      />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <EmptyState
          icon="✉"
          title="Aucun message"
          description="Vos échanges avec les hôtels, restaurants et prestataires apparaîtront ici."
        />
      </div>
    </ClientLayout>
  );
}
