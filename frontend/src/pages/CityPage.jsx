import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useFetch } from "../hooks/useFetch.js";
import { api } from "../lib/api.js";
import { LoadingState, ErrorState, EmptyState } from "../components/StateViews.jsx";
import { MapView } from "../components/MapView.jsx";

export function CityPage() {
  const { citySlug } = useParams();
  const { data: city, loading: loadingCity, error: cityError } = useFetch(
    () => api.getCity(citySlug),
    [citySlug]
  );
  const { data: places, loading: loadingPlaces, error: placesError } = useFetch(
    () => api.getCityPlaces(citySlug),
    [citySlug]
  );
  const [selected, setSelected] = useState(null);

  if (loadingCity) return <LoadingState label="Cargando ciudad..." />;
  if (cityError) return <ErrorState message={cityError} />;
  if (!city) return null;

  const markers = (places || []).map((p) => ({
    id: p.id,
    latitude: p.latitude,
    longitude: p.longitude,
    label: p.name,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl font-semibold text-carbon">{city.name}</h1>
        <p className="text-sm text-earth">
          {city.province ? `${city.province}, ` : ""}
          {city.country}
        </p>
        {city.description && <p className="mt-2 max-w-2xl text-sm text-earth">{city.description}</p>}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-earth/15">
        {loadingPlaces && <LoadingState label="Cargando mapa..." />}
        {!loadingPlaces && (
          <MapView
            center={[city.latitude, city.longitude]}
            markers={markers}
            height="420px"
            onMarkerClick={(m) => setSelected((places || []).find((p) => p.id === m.id))}
          />
        )}
      </div>

      {selected && (
        <div className="mt-4 flex items-center gap-4 rounded-2xl border border-earth/20 bg-white/70 p-4">
          {selected.photos?.[0] && (
            <img
              src={selected.photos[0].imageUrl}
              alt={selected.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="font-serif text-lg font-semibold">{selected.name}</h3>
            <p className="text-xs text-earth">{selected._count?.photos ?? 0} fotografías</p>
          </div>
          <Link
            to={`/ciudad/${citySlug}/${selected.slug}`}
            className="rounded-full bg-carbon px-4 py-2 text-xs font-medium text-bone"
          >
            Explorar lugar
          </Link>
        </div>
      )}

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold text-carbon">Lugares documentados</h2>

        <div className="mt-6">
          {placesError && <ErrorState message={placesError} />}
          {!loadingPlaces && !placesError && (places || []).length === 0 && (
            <EmptyState message="Todavía no hay lugares documentados en esta ciudad." />
          )}

          {!loadingPlaces && (places || []).length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((place) => {
                const photo = place.photos?.[0];
                const years = place.photos?.map((p) => p.yearFrom).filter(Boolean);
                return (
                  <Link
                    key={place.id}
                    to={`/ciudad/${citySlug}/${place.slug}`}
                    className="group overflow-hidden rounded-2xl border border-earth/15 bg-white/60 transition-shadow hover:shadow-lg"
                  >
                    {photo ? (
                      <img src={photo.imageUrl} alt={place.name} className="h-40 w-full object-cover" />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center bg-cream text-xs text-earth">
                        Sin fotos todavía
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-serif text-lg font-semibold text-carbon group-hover:text-rust">
                        {place.name}
                      </h3>
                      {place.category && <p className="text-xs text-sepia">{place.category}</p>}
                      <p className="mt-2 text-xs text-earth">
                        {place._count?.photos ?? 0} fotografías
                        {years?.length > 0 && ` · desde ${Math.min(...years)}`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
