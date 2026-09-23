import { NavLink, Link, useLocation } from "react-router-dom";
import { AuthAction, useAppAuth } from "../lib/auth.jsx";

// Por ahora Campana es la única ciudad cargada: "Mapa" lleva a su mapa.
const LINKS = [
  { to: "/", label: "Inicio", end: true },
  { to: "/#ciudades", label: "Explorar" },
  { to: "/ciudad/campana#mapa", label: "Mapa" },
  { to: "/aportar", label: "Aportar" },
];

function isActive(link, location) {
  if (link.to === "/") return location.pathname === "/" && !location.hash;
  if (link.to === "/#ciudades") return location.pathname === "/" && location.hash === "#ciudades";
  if (link.to.startsWith("/ciudad")) return location.pathname.startsWith("/ciudad");
  return location.pathname.startsWith(link.to);
}

export function Navbar() {
  const location = useLocation();
  const { isSignedIn } = useAppAuth();

  const linkClass = (link) =>
    `inline-flex min-h-[40px] items-center rounded-full px-3 text-sm font-medium transition-colors ${
      isActive(link, location) ? "bg-carbon text-bone" : "text-earth hover:bg-cream hover:text-carbon"
    }`;

  return (
    <header className="sticky top-0 z-[1100] border-b border-earth/15 bg-bone/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Link to="/" className="font-serif text-xl font-semibold tracking-[0.12em] text-carbon">
          MEMORIA
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <NavLink key={link.label} to={link.to} className={() => linkClass(link)}>
              {link.label}
            </NavLink>
          ))}
          {isSignedIn && (
            <NavLink to="/perfil" className={() => linkClass({ to: "/perfil" })}>
              Mi perfil
            </NavLink>
          )}
        </nav>
        <div className="flex items-center">
          <AuthAction />
        </div>
      </div>
      {/* En mobile los links van en una segunda fila, siempre visibles. */}
      <nav className="flex items-center justify-between gap-1 border-t border-earth/10 px-2 py-1 md:hidden">
        {LINKS.map((link) => (
          <NavLink key={link.label} to={link.to} className={() => `${linkClass(link)} flex-1 justify-center`}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
