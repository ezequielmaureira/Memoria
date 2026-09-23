import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar.jsx";
import { Home } from "./pages/Home.jsx";
import { CityPage } from "./pages/CityPage.jsx";
import { PlacePage } from "./pages/PlacePage.jsx";
import { PhotoPage } from "./pages/PhotoPage.jsx";
import { ContributePhotoPage } from "./pages/ContributePhotoPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";

// React Router no maneja scroll: vuelve arriba al cambiar de página y, si
// hay #ancla, espera a que el elemento exista (el contenido carga async).
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    let tries = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(hash.slice(1));
      if (el || ++tries > 40) {
        clearInterval(timer);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
    return () => clearInterval(timer);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <div className="min-h-screen bg-bone">
      <ScrollManager />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ciudad/:citySlug" element={<CityPage />} />
          <Route path="/ciudad/:citySlug/:placeSlug" element={<PlacePage />} />
          <Route path="/foto/:photoId" element={<PhotoPage />} />
          <Route path="/aportar" element={<ContributePhotoPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
