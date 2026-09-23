import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFetch, useFetchWithRefetch } from "../hooks/useFetch.js";
import { api } from "../lib/api.js";
import { LoadingState, ErrorState, EmptyState } from "../components/StateViews.jsx";
import { cityLocation, period } from "../lib/format.js";

const FEATURED_CITY = "campana";

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function Home() {
  const { data: cities, loading, error, refetch } = useFetchWithRefetch(() => api.getCities(), []);
  const { data: featuredPlaces } = useFetch(
    () => api.getCityPlaces(FEATURED_CITY).catch(() => []),
    []
  );

  const featured = (cities || []).find((c) => c.slug === FEATURED_CITY);
  const places = featuredPlaces || [];
  const photoTotal = places.reduce((sum, p) => sum + p.photoCount, 0);
  const years = places.flatMap((p) => [p.yearMin, p.yearMax]).filter(Boolean);
  const featuredPeriod = years.length ? period(Math.min(...years), Math.max(...years)) : null;
  const collage = places.filter((p) => p.photos?.[0]).slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-earth/15 bg-gradient-to-b from-cream to-bone">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="font-serif text-sm uppercase tracking-[0.4em] text-sepia">Archivo visual colaborativo</p>
            <h1 className="mt-4 font-serif text-5xl font-semibold tracking-[0.08em] text-carbon sm:text-7xl">
              MEMORIA
            </h1>
            <p className="mt-4 font-serif text-2xl italic text-earth sm:text-3xl">Cada lugar tiene memoria.</p>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-earth">
              Recorré plazas, calles y edificios a través del tiempo. Fotografías de distintas épocas,
              ordenadas sobre un mapa y documentadas por la propia comunidad.
            </p>

            <CitySearch cities={cities || []} disabled={loading || !!error} />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/ciudad/${FEATURED_CITY}`}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-carbon px-6 text-sm font-medium text-bone transition-colors hover:bg-earth"
              >
                Explorar Campana →
              </Link>
              <Link
                to="/aportar"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-carbon/70 px-6 text-sm font-medium text-carbon transition-colors hover:bg-carbon hover:text-bone"
              >
                + Aportar una foto
              </Link>
            </div>
          </div>

          <AlbumCollage places={collage} />
        </div>
      </section>

      {/* CIUDADES */}
      <section id="ciudades" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sepia">Ciudad destacada</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-carbon">Empezá por Campana</h2>

        <div className="mt-8">
          {loading && <LoadingState label="Cargando ciudades..." />}
          {error && <ErrorState message={error} onRetry={refetch} />}
          {!loading && !error && (cities || []).length === 0 && (
            <EmptyState message="Todavía no hay ciudades cargadas. Corré el seed del backend para ver datos demo." />
          )}

          {featured && (
            <Link
              to={`/ciudad/${featured.slug}`}
              className="group grid overflow-hidden rounded-3xl border border-earth/15 bg-white/70 shadow-sm transition-shadow hover:shadow-xl md:grid-cols-[1.2fr_1fr]"
            >
              <div
                className="min-h-[220px] bg-cover bg-center sm:min-h-[280px]"
                style={{ backgroundImage: `url(${featured.coverImageUrl})` }}
                role="img"
                aria-label={`Imagen de ${featured.name}`}
              />
              <div className="paper flex flex-col justify-center gap-4 p-6 sm:p-8">
                <div>
                  <h3 className="font-serif text-3xl font-semibold text-carbon group-hover:text-rust">
                    {featured.name}
                  </h3>
                  <p className="text-sm text-earth">{cityLocation(featured)}</p>
                </div>
                <dl className="grid grid-cols-3 gap-3 border-y border-earth/15 py-4 text-center">
                  <Stat value={featured._count?.places ?? 0} label="lugares" />
                  <Stat value={photoTotal} label="fotografías" />
                  <Stat value={featuredPeriod ?? "—"} label="período" small />
                </dl>
                <span className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-rust px-5 text-sm font-medium text-bone">
                  Explorar Campana →
                </span>
              </div>
            </Link>
          )}

          {(cities || []).filter((c) => c.slug !== FEATURED_CITY).length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cities
                .filter((c) => c.slug !== FEATURED_CITY)
                .map((city) => (
                  <Link
                    key={city.id}
                    to={`/ciudad/${city.slug}`}
                    className="rounded-2xl border border-earth/15 bg-white/60 p-5 hover:shadow-lg"
                  >
                    <h3 className="font-serif text-lg font-semibold">{city.name}</h3>
                    <p className="text-xs text-earth">{cityLocation(city)}</p>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* CONCEPTO */}
      <section className="border-t border-earth/15 bg-cream/60 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-xl font-serif text-3xl font-semibold text-carbon">
            Un álbum de la ciudad, escrito entre todos.
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Concept n="01" title="Mapa" text="Cada lugar está ubicado sobre un mapa real. Tocá un punto y entrá a su historia." />
            <Concept n="02" title="Álbum" text="Las fotografías de un lugar se ordenan por fecha: pasá de una época a otra." />
            <Concept n="03" title="Libro" text="Cada imagen tiene su página: quién la aportó, de dónde viene, qué se sabe." />
            <Concept n="04" title="Archivo" text="Vecinos y vecinas suman recuerdos, fechas y correcciones que enriquecen el registro." />
          </div>
          <p className="mt-10 text-xs text-earth">
            Las fotografías, fechas, comentarios y aportes que ves en esta versión son contenido demo.
          </p>
        </div>
      </section>
    </div>
  );
}

function CitySearch({ cities, disabled }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const q = normalize(query.trim());
  const matches = q ? cities.filter((c) => normalize(`${c.name} ${c.province ?? ""}`).includes(q)) : cities;
  const showNoResults = q && matches.length === 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (matches[0]) navigate(`/ciudad/${matches[0].slug}`);
    else setOpen(true);
  }

  return (
    <form onSubmit={handleSubmit} className="relative mt-8 max-w-lg" role="search">
      <label htmlFor="city-search" className="sr-only">
        Buscar una ciudad
      </label>
      <div className="flex gap-2 rounded-full border border-earth/30 bg-white/90 p-1.5 shadow-sm focus-within:border-sepia">
        <input
          id="city-search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Buscar una ciudad o pueblo..."
          autoComplete="off"
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent px-4 text-base outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled}
          className="min-h-[44px] whitespace-nowrap rounded-full bg-carbon px-5 text-sm font-medium text-bone hover:bg-earth disabled:opacity-60"
        >
          Buscar
        </button>
      </div>

      {open && (matches.length > 0 || showNoResults) && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-earth/15 bg-white shadow-xl">
          {matches.slice(0, 6).map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => navigate(`/ciudad/${c.slug}`)}
                className="flex min-h-[48px] w-full items-center justify-between px-5 text-left hover:bg-cream"
              >
                <span className="font-medium text-carbon">{c.name}</span>
                <span className="text-xs text-earth">{cityLocation(c)}</span>
              </button>
            </li>
          ))}
          {showNoResults && (
            <li className="px-5 py-4 text-sm text-earth">
              Todavía no hay registros de “{query.trim()}”. Por ahora podés explorar Campana.
            </li>
          )}
        </ul>
      )}
    </form>
  );
}

// Fotos apiladas como en un álbum, con una ficha de archivo y un pin de mapa.
function AlbumCollage({ places }) {
  const frames = [
    "left-0 top-6 -rotate-6 z-10",
    "right-0 top-0 rotate-3 z-20",
    "left-[14%] top-[34%] -rotate-1 z-30",
  ];

  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[520px]" aria-hidden>
      {places.length === 0 && (
        <div className="absolute inset-6 rotate-2 rounded-sm bg-white p-3 shadow-xl">
          <div className="h-full w-full bg-cream" />
        </div>
      )}
      {places.map((p, i) => (
        <figure key={p.id} className={`absolute w-[62%] bg-white p-2 pb-8 shadow-xl sm:p-3 sm:pb-10 ${frames[i]}`}>
          <img src={p.photos[0].imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
          <figcaption className="absolute bottom-2 left-3 font-serif text-xs italic text-earth sm:bottom-3 sm:text-sm">
            {p.name}, {p.photos[0].yearFrom}
          </figcaption>
        </figure>
      ))}
      <div className="paper absolute -bottom-2 right-2 z-40 w-40 rotate-3 rounded-sm border border-earth/20 p-3 shadow-lg sm:w-48">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-sepia">Ficha de archivo</p>
        <p className="mt-1 font-serif text-sm text-carbon">Campana · Buenos Aires</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-earth">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-bone bg-rust shadow" />
          -34.17, -58.96
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, small }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className={`font-serif font-semibold text-carbon ${small ? "text-base sm:text-lg" : "text-2xl"}`}>{value}</dd>
      <dd className="text-xs text-earth">{label}</dd>
    </div>
  );
}

function Concept({ n, title, text }) {
  return (
    <div className="rounded-2xl border border-earth/15 bg-bone/70 p-6">
      <p className="font-serif text-sm text-sepia">{n}</p>
      <h3 className="mt-2 font-serif text-xl font-semibold text-carbon">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-earth">{text}</p>
    </div>
  );
}
