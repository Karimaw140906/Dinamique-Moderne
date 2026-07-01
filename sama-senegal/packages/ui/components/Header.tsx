export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-sand shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-ocean">Sama <span className="text-brand-600">Senegal</span></a>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
          <a href="/destinations" className="hover:text-brand-600">Destinations</a>
          <a href="/hotels" className="hover:text-brand-600">Hôtels</a>
          <a href="/activities" className="hover:text-brand-600">Activités</a>
          <a href="/explore" className="hover:text-brand-600">Explore</a>
        </nav>
        <a href="/auth/login" className="rounded-full bg-brand-600 text-white text-sm font-semibold px-4 py-2 hover:bg-brand-700 transition">Connexion</a>
      </div>
    </header>
  );
}
