import { Link, useParams, useSearchParams } from "react-router-dom";
import { useFetchWithRefetch } from "../hooks/useFetch.js";
import { api } from "../lib/api.js";
import { LoadingState, ErrorState, EmptyState, PageError } from "../components/StateViews.jsx";
import { MapView } from "../components/MapView.jsx";
import { Breadcrumbs } from "../components/Breadcrumbs.jsx";
import { cityLocation, period, plural } from "../lib/format.js";

export function CityPage() {
  const { citySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const city = useFetchWithRefetch(() => api.getCity(citySlug), [citySlug]);
  const placesQuery = useFetchWithRefetch(() => api.getCityPlaces(citySlug), [citySlug]);

  if (city.loading) return <LoadingState label="Cargando ciudad..." />;
  if (city.error)
    return (
      <PageError
        error={city.error}
        errorStatus={city.errorStatus}
        onRetry={city.refetch}
        notFound={{
          title: "Ciudad no encontrada",
          message: `Todavía no hay registros de “${citySlug}” en MEMORIA.`,
          backLabel: "Volver al inicio",
        }}
      />
    );
  if (!city.data) return null;

  const c = city.data;
  const places = placesQuery.data || [];
  // El lugar seleccionado vive en la URL (?lugar=slug) para poder volver
  // desde la página de un lugar con su marcador ya abierto.
  const selected = places.find((p) => p.slug === searchParams.get("lugar")) || null;

  function select(place) {
    const next = new URLSearchParams(searchParams);
    if (place) next.set("lugar", place.slug);
    else next.delete("lugar");
    setSearchParams(next, { replace: true });
  }

  const markers = places.map((p) => ({
    id: p.id,
    latitude: p.latitude,
    longitude: p.longitude,
    label: p.name,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs items={[{ label: "Inicio", to: "/" }, { label: c.name }]} />

      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-semibold text-carbon sm:text-5xl">{c.name}</h1>
          <p className="mt-1 text-base text-earth">{cityLocation(c)}</p>
        </div>
        {!placesQuery.loading && !placesQuery.error && (
          <p className="text-sm text-sepia">
            {plural(places.length, "lugar documentado", "lugares documentados")} ·{" "}
            {plural(
              places.reduce((s, p) => s + p.photoCount, 0),
              "fotografía",
              "fotografías"
            )}
          </p>
        )}
      </header>
      {c.description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-earth">{c.description}</p>}

      {/* MAPA PRINCIPAL */}
      <section id="mapa" aria-label={`Mapa de ${c.name}`} className="relative mt-6 overflow-hidden rounded-2xl border border-earth/15">
        {placesQuery.loading && <LoadingState label="Cargando mapa..." />}
        {placesQuery.error && (
          <div className="p-4">
            <ErrorState message={placesQuery.error} onRetry={placesQuery.refetch} />
          </div>
        )}
        {!placesQuery.loading && !placesQuery.error && (
          <>
            <MapView
              center={[c.latitude, c.longitude]}
              zoom={15}
              markers={markers}
              activeId={selected?.id}
              fitToMarkers
              height="clamp(360px, 62vh, 560px)"
              onMarkerClick={(m) => select(places.find((p) => p.id === m.id))}
            />
            {!selected && places.length > 0 && (
              <p className="pointer-events-none absolute left-1/2 top-3 z-[1000] -translate-x-1/2 whitespace-nowrap rounded-full bg-carbon/80 px-4 py-2 text-xs font-medium text-bone">
                Tocá un marcador para ver el lugar
              </p>
            )}
            {selected && <PlaceMapCard place={selected} citySlug={citySlug} onClose={() => select(null)} />}
          </>
        )}
      </section>

      {/* LUGARES DOCUMENTADOS */}
      <section className="mt-12 pb-16">
        <h2 className="font-serif text-2xl font-semibold text-carbon sm:text-3xl">Lugares documentados</h2>

        <div className="mt-6">
          {placesQuery.loading && <LoadingState label="Cargando lugares..." />}
          {!placesQuery.loading && !placesQuery.error && places.length === 0 && (
            <EmptyState message="Todavía no hay lugares documentados en esta ciudad." />
          )}

          {places.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} citySlug={citySlug} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function PlaceMapCard({ place, citySlug, onClose }) {
  const photo = place.photos?.[0];
  return (
    <div className="fade-in absolute bottom-3 left-3 right-3 z-[1000] flex gap-3 rounded-2xl border border-earth/15 bg-bone p-3 shadow-2xl sm:right-auto sm:w-[380px]">
      {photo ? (
        <img src={photo.imageUrl} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover sm:h-28 sm:w-28" />
      ) : (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-cream text-center text-xs text-earth">
          Sin fotos
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg font-semibold leading-tight text-carbon">{place.name}</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-earth hover:bg-cream"
          >
            ×
          </button>
        </div>
        <p className="mt-0.5 text-sm text-earth">{plural(place.photoCount, "fotografía", "fotografías")}</p>
        {place.yearMin && <p className="text-sm font-medium text-sepia">{period(place.yearMin, place.yearMax)}</p>}
        <Link
          to={`/ciudad/${citySlug}/${place.slug}`}
          className="mt-auto inline-flex min-h-[40px] items-center justify-center rounded-full bg-carbon px-4 text-sm font-medium text-bone hover:bg-rust"
        >
          Explorar lugar →
        </Link>
      </div>
    </div>
  );
}

function PlaceCard({ place, citySlug }) {
  const photo = place.photos?.[0];
  return (
    <Link
      to={`/ciudad/${citySlug}/${place.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-earth/15 bg-white/60 transition-shadow hover:shadow-lg"
    >
      {photo ? (
        <img src={photo.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-cream text-sm text-earth">
          Sin fotos todavía
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        {place.category && (
          <p className="text-xs font-semibold uppercase tracking-wider text-sepia">{place.category}</p>
        )}
        <h3 className="mt-1 font-serif text-xl font-semibold text-carbon group-hover:text-rust">{place.name}</h3>
        <p className="mt-2 text-sm text-earth">
          {plural(place.photoCount, "fotografía", "fotografías")}
          {place.yearMin && ` · ${period(place.yearMin, place.yearMax)}`}
        </p>
      </div>
    </Link>
  );
}
