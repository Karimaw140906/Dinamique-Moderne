export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-sand flex justify-around py-2 z-50">
      <a href="/" className="text-xs text-gray-600 flex flex-col items-center gap-1"><span>🏠</span>Accueil</a>
      <a href="/search" className="text-xs text-gray-600 flex flex-col items-center gap-1"><span>🔍</span>Recherche</a>
      <a href="/account/wishlist" className="text-xs text-gray-600 flex flex-col items-center gap-1"><span>❤️</span>Favoris</a>
      <a href="/account/bookings" className="text-xs text-gray-600 flex flex-col items-center gap-1"><span>📋</span>Réservations</a>
      <a href="/account" className="text-xs text-gray-600 flex flex-col items-center gap-1"><span>👤</span>Compte</a>
    </nav>
  );
}
