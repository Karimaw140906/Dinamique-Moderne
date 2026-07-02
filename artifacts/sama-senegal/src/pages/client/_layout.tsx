import { useLocation, Link } from "wouter";
import { NAV_ITEMS, COLORS } from "./_shared";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen" style={{ background: "#2B1B4D" }}>

      {/* Header mobile */}
      <header className="sticky top-0 z-40 bg-white shadow-sm px-4 py-3 flex items-center justify-between md:hidden">
        <Link href="/">
          <span className="font-bold text-lg" style={{ color: COLORS.vert, fontFamily: "Playfair Display, serif" }}>
            Sama Senegal
          </span>
        </Link>
        <span className="text-sm font-medium" style={{ color: COLORS.noir }}>
          Mon Espace
        </span>
      </header>

      <div className="flex">

        {/* Sidebar desktop */}
        <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white shadow-sm pt-8 px-4 fixed top-0 left-0">
          <Link href="/">
            <span className="font-bold text-xl mb-8 block" style={{ color: COLORS.vert, fontFamily: "Playfair Display, serif" }}>
              Sama Senegal
            </span>
          </Link>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <span
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
                    style={{
                      background: active ? COLORS.vert : "transparent",
                      color: active ? "#fff" : COLORS.noir,
                    }}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 md:ml-64 px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8">
          {children}
        </main>

      </div>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 flex justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const active = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <span className="flex flex-col items-center gap-0.5 px-2 py-1 cursor-pointer">
                <span className="text-xl">{item.icon}</span>
                <span
                  className="text-xs"
                  style={{ color: active ? COLORS.vert : "#9ca3af", fontWeight: active ? 600 : 400 }}
                >
                  {item.label.split(" ")[0]}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
