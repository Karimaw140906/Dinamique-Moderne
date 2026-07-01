type DestinationCardProps = { slug: string; name: string; imageUrl: string; region?: string; };

export default function DestinationCard({ slug, name, imageUrl, region }: DestinationCardProps) {
  return (
    <a href={`/destinations/${slug}`} className="group relative block rounded-2xl overflow-hidden aspect-[3/4]">
      <img src={imageUrl} alt={name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4 text-white"><h3 className="text-lg font-bold">{name}</h3>{region && <p className="text-sm text-white/80">{region}</p>}</div>
    </a>
  );
}
