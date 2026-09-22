import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar.jsx";
import { Home } from "./pages/Home.jsx";
import { CityPage } from "./pages/CityPage.jsx";
import { PlacePage } from "./pages/PlacePage.jsx";
import { PhotoPage } from "./pages/PhotoPage.jsx";
import { ContributePhotoPage } from "./pages/ContributePhotoPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-bone">
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
