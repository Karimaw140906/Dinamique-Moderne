import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Activity } from "@/lib/data/activities";

export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <Link href={`/activities/${activity.slug}`} className="group block">
      <Card className="overflow-hidden p-0">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={activity.images[0]}
            alt={activity.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-3 left-3 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-white">
            {activity.category}
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold">{activity.name}</h3>
          <p className="mt-1 text-sm text-text-secondary">{activity.duration}</p>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xl font-bold text-primary">{activity.price}€</span>
            <span className="text-xs text-text-secondary">★ {activity.rating}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
