import { Link } from "react-router-dom";
import { AuthAction } from "../lib/auth.jsx";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-earth/15 bg-bone/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="font-serif text-xl font-semibold tracking-tight text-carbon">
          MEMORIA
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            to="/ciudad/campana"
            className="hidden text-sm font-medium text-earth hover:text-carbon sm:inline"
          >
            Explorar
          </Link>
          <Link
            to="/perfil"
            className="hidden text-sm font-medium text-earth hover:text-carbon sm:inline"
          >
            Mi perfil
          </Link>
          <AuthAction />
        </nav>
      </div>
    </header>
  );
}
