export default function Footer() {
  return (
    <footer className="bg-ocean text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div><h4 className="font-semibold mb-3">Sama Senegal</h4><p className="text-white/70">Découvrez et réservez vos séjours au Sénégal.</p></div>
        <div><h4 className="font-semibold mb-3">Explorer</h4><ul className="space-y-2 text-white/70"><li><a href="/destinations">Destinations</a></li><li><a href="/hotels">Hôtels</a></li><li><a href="/activities">Activités</a></li></ul></div>
        <div><h4 className="font-semibold mb-3">Support</h4><ul className="space-y-2 text-white/70"><li><a href="/help">Aide</a></li><li><a href="/contact">Contact</a></li></ul></div>
        <div><h4 className="font-semibold mb-3">Légal</h4><ul className="space-y-2 text-white/70"><li><a href="/legal/terms">CGU</a></li><li><a href="/legal/privacy">Confidentialité</a></li></ul></div>
      </div>
    </footer>
  );
}
