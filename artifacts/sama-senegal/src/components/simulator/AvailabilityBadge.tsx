import { getAvailabilityStatus, AVAILABILITY_LABELS, AVAILABILITY_COLORS, AVAILABILITY_DOTS } from "@/lib/availability";

export function AvailabilityBadge({ capacity, travelers }: { capacity: number | null | undefined; travelers: number }) {
  const status = getAvailabilityStatus(capacity, travelers);
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${AVAILABILITY_COLORS[status]}`}>
      {AVAILABILITY_DOTS[status]} {AVAILABILITY_LABELS[status]}
    </span>
  );
}

export { getAvailabilityStatus };
