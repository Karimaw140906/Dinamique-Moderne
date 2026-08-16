import { ArrowRight } from "lucide-react";
import type { Catalogue } from "@/lib/useCatalogues";

export interface CatalogueLayoutProps {
  catalogues: Catalogue[];
  layoutProps?: Record<string, any>;
}

function CatalogueCard({ catalogue, variant }: { catalogue: Catalogue; variant: "grid" | "big" | "small" | "list" }) {
  const content = (
    <>
      {catalogue.image && (
        <img
          src={catalogue.image}
          alt={catalogue.name}
          className={
            variant === "list"
              ? "w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl shrink-0"
              : "w-full h-full object-cover absolute inset-0"
          }
        />
      )}
      <div className={variant === "list" ? "flex-1 min-w-0" : "relative z-10 mt-auto p-4 sm:p-5"}>
        {variant !== "list" && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />}
        <div className={variant !== "list" ? "relative z-10" : ""}>
          {catalogue.icon && <span className="text-xl mr-2">{catalogue.icon}</span>}
          <span className={`font-bold ${variant === "list" ? "text-gray-900 text-base" : "text-white text-lg sm:text-xl"}`}>
            {catalogue.name}
          </span>
          {catalogue.description && (
            <p className={`mt-1 text-sm ${variant === "list" ? "text-gray-500 line-clamp-2" : "text-white/80 line-clamp-2"}`}>
              {catalogue.description}
            </p>
          )}
        </div>
      </div>
      {variant === "list" && (
        <ArrowRight className="w-5 h-5 text-gray-300 shrink-0 self-center" />
      )}
    </>
  );

  const baseClasses =
    variant === "list"
      ? "flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
      : "relative flex flex-col overflow-hidden rounded-2xl bg-gray-200 group hover:shadow-lg transition-shadow";

  const sizeClasses =
    variant === "big" ? "aspect-[4/3]" : variant === "small" ? "aspect-square" : variant === "grid" ? "aspect-[4/5]" : "";

  const wrapperClasses = `${baseClasses} ${sizeClasses}`.trim();

  return catalogue.link ? (
    <a href={catalogue.link} className={wrapperClasses}>{content}</a>
  ) : (
    <div className={wrapperClasses}>{content}</div>
  );
}

export function GridClassicLayout({ catalogues }: CatalogueLayoutProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {catalogues.map((c) => <CatalogueCard key={c.id} catalogue={c} variant="grid" />)}
    </div>
  );
}

export function BigCardsLayout({ catalogues }: CatalogueLayoutProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
      {catalogues.map((c) => <CatalogueCard key={c.id} catalogue={c} variant="big" />)}
    </div>
  );
}

export function SmallCardsLayout({ catalogues }: CatalogueLayoutProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {catalogues.map((c) => <CatalogueCard key={c.id} catalogue={c} variant="small" />)}
    </div>
  );
}

export function ListLayout({ catalogues }: CatalogueLayoutProps) {
  return (
    <div className="flex flex-col gap-3 max-w-3xl mx-auto">
      {catalogues.map((c) => <CatalogueCard key={c.id} catalogue={c} variant="list" />)}
    </div>
  );
}

export function CarouselLayout({ catalogues }: CatalogueLayoutProps) {
  return (
    <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
      {catalogues.map((c) => (
        <div key={c.id} className="snap-start shrink-0 w-64 sm:w-72">
          <CatalogueCard catalogue={c} variant="grid" />
        </div>
      ))}
    </div>
  );
}

export function MasonryLayout({ catalogues }: CatalogueLayoutProps) {
  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
      {catalogues.map((c, i) => (
        <div key={c.id} className="mb-4 break-inside-avoid" style={{ marginTop: i % 3 === 1 ? "1.5rem" : 0 }}>
          <CatalogueCard catalogue={c} variant={i % 2 === 0 ? "grid" : "big"} />
        </div>
      ))}
    </div>
  );
}

export function MagazineLayout({ catalogues }: CatalogueLayoutProps) {
  if (catalogues.length === 0) return null;
  const [featured, ...rest] = catalogues;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="lg:row-span-2">
        <CatalogueCard catalogue={featured} variant="big" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {rest.slice(0, 4).map((c) => <CatalogueCard key={c.id} catalogue={c} variant="small" />)}
      </div>
    </div>
  );
}
