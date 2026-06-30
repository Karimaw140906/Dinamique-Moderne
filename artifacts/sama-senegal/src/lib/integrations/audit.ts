import { logActivity } from "@/lib/activityLogger";

// Ce service etend activityLogger.ts existant avec le support old_value/new_value/entity
// pour un audit trail complet (qui a change quoi, quand, avant/apres).

export async function logChange({
  userIdentifier,
  userRole,
  action,
  entityType,
  entityId,
  oldValue,
  newValue,
}: {
  userIdentifier: string;
  userRole: string;
  action: string;
  entityType: string; // booking | payment | client | staff | section...
  entityId: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
}) {
  await logActivity({
    user_identifier: userIdentifier,
    user_role: userRole,
    action,
    target: entityType,
    details: {
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue || null,
      new_value: newValue || null,
    },
  });
}
