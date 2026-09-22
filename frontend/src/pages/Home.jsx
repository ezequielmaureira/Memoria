import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch.js";
import { api } from "../lib/api.js";
import { LoadingState, ErrorState, EmptyState } from "../components/StateViews.jsx";

export function Home() {
  const { data: cities, loading, error } = useFetch(() => api.getCities(), []);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = (cities || []).filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  function handleSearchSubmit(e) {
    e.preventDefault();
    const match = filtered[0];
    if (match) navigate(`/ciudad/${match.slug}`);
  }

  return (
    <div>
      <section className="border-b border-earth/15 bg-gradient-to-b from-cream to-bone px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-serif text-sm uppercase tracking-[0.3em] text-sepia">MEMORIA</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-carbon sm:text-5xl">
            Cada lugar tiene memoria.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-earth sm:text-lg">
            Explorá la historia visual de tu ciudad: fotografías de distintas épocas,
            documentadas por la propia comunidad sobre un mapa interactivo.
          </p>

          <form onSubmit={handleSearchSubmit} className="mx-auto mt-8 flex max-w-md gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar una ciudad..."
              className="w-full rounded-full border border-earth/30 bg-white/80 px-5 py-3 text-sm outline-none focus:border-sepia"
            />
            <button
              type="submit"
              className="whitespace-nowrap rounded-full bg-carbon px-5 py-3 text-sm font-medium text-bone hover:bg-earth transition-colors"
            >
              Explorar
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/ciudad/campana"
              className="rounded-full border border-carbon px-5 py-2 text-sm font-medium text-carbon hover:bg-carbon hover:text-bone transition-colors"
            >
              Explorar Campana
            </Link>
            <Link
              to="/aportar"
              className="rounded-full bg-rust px-5 py-2 text-sm font-medium text-bone hover:bg-rust/90 transition-colors"
            >
              Aportar una foto
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-serif text-2xl font-semibold text-carbon">Ciudades destacadas</h2>
        <p className="mt-1 text-sm text-earth">
          Empezá por una ciudad con lugares ya documentados.
        </p>

        <div className="mt-8">
          {loading && <LoadingState label="Cargando ciudades..." />}
          {error && <ErrorState message={`No pudimos conectar con el backend: ${error}`} />}
          {!loading && !error && filtered.length === 0 && (
            <EmptyState message="Todavía no hay ciudades cargadas." />
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((city) => (
                <Link
                  key={city.id}
                  to={`/ciudad/${city.slug}`}
                  className="group overflow-hidden rounded-2xl border border-earth/15 bg-white/60 transition-shadow hover:shadow-lg"
                >
                  <div
                    className="h-36 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${city.coverImageUrl})` }}
                  />
                  <div className="p-4">
                    <h3 className="font-serif text-lg font-semibold text-carbon group-hover:text-rust">
                      {city.name}
                    </h3>
                    <p className="text-xs text-earth">
                      {city.province ? `${city.province}, ` : ""}
                      {city.country}
                    </p>
                    <p className="mt-2 text-xs text-sepia">
                      {city._count?.places ?? 0} lugares documentados
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-earth/15 bg-cream/60 px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-serif text-lg font-semibold">Un mapa de memoria</h3>
            <p className="mt-2 text-sm text-earth">
              Cada plaza, esquina o edificio puede tener imágenes de distintas décadas,
              ubicadas sobre un mapa real.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold">Aportes de la comunidad</h3>
            <p className="mt-2 text-sm text-earth">
              Cualquier persona puede sumar fotografías, comentarios y datos históricos
              sobre un lugar.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold">Preparado para el futuro</h3>
            <p className="mt-2 text-sm text-earth">
              La arquitectura ya contempla reconstrucción con IA, restauración de fotos
              y recorridos históricos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
