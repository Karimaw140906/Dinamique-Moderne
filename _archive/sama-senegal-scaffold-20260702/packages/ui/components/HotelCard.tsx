type HotelCardProps = { slug: string; name: string; imageUrl: string; pricePerNight: number; rating: number; destinationName?: string; };

export default function HotelCard({ slug, name, imageUrl, pricePerNight, rating, destinationName }: HotelCardProps) {
  return (
    <a href={`/hotels/${slug}`} className="group block rounded-2xl overflow-hidden border border-sand hover:shadow-lg transition">
      <div className="aspect-[4/3] overflow-hidden"><img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" /></div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <span className="flex items-center gap-1 text-sm text-brand-600 font-medium">★ {rating.toFixed(1)}</span>
        </div>
        {destinationName && <p className="text-sm text-gray-500 mt-1">{destinationName}</p>}
        <p className="mt-2 text-sm"><span className="font-bold text-ocean">{pricePerNight.toLocaleString()} FCFA</span><span className="text-gray-500"> / nuit</span></p>
      </div>
    </a>
  );
}
