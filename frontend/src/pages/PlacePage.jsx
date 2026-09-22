import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch.js";
import { api } from "../lib/api.js";
import { LoadingState, ErrorState, EmptyState } from "../components/StateViews.jsx";
import { MapView } from "../components/MapView.jsx";
import { Timeline } from "../components/Timeline.jsx";

export function PlacePage() {
  const { citySlug, placeSlug } = useParams();
  const navigate = useNavigate();
  const { data: place, loading, error } = useFetch(
    () => api.getPlaceBySlug(citySlug, placeSlug),
    [citySlug, placeSlug]
  );
  const {
    data: photos,
    loading: loadingPhotos,
    error: photosError,
  } = useFetch(() => (place ? api.getPlacePhotos(place.id) : Promise.resolve([])), [place?.id]);

  const [index, setIndex] = useState(0);

  if (loading) return <LoadingState label="Cargando lugar..." />;
  if (error) return <ErrorState message={error} />;
  if (!place) return null;

  const list = photos || [];
  const active = list[index];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link to={`/ciudad/${citySlug}`} className="text-xs text-earth hover:text-carbon">
        ← Volver a {place.city?.name}
      </Link>

      <div className="mt-2 flex flex-col gap-1">
        <h1 className="font-serif text-3xl font-semibold text-carbon">{place.name}</h1>
        {place.address && <p className="text-sm text-earth">{place.address}</p>}
        {place.description && <p className="mt-2 max-w-2xl text-sm text-earth">{place.description}</p>}
      </div>

      {loadingPhotos && <LoadingState label="Cargando fotografías..." />}
      {photosError && <ErrorState message={photosError} />}

      {!loadingPhotos && list.length === 0 && (
        <div className="mt-8">
          <EmptyState message="Todavía no hay fotografías de este lugar. ¡Sé la primera persona en aportar una!" />
          <div className="mt-4 text-center">
            <Link
              to={`/aportar?placeId=${place.id}`}
              className="rounded-full bg-rust px-5 py-2 text-sm font-medium text-bone"
            >
              Aportar foto
            </Link>
          </div>
        </div>
      )}

      {!loadingPhotos && list.length > 0 && active && (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-earth/15 bg-cream shadow-sm">
              <img
                src={active.imageUrl}
                alt={active.title || place.name}
                className="max-h-[520px] w-full object-cover"
              />
            </div>

            <Timeline photos={list} activeIndex={index} onSelect={setIndex} />

            <div className="flex items-center justify-between">
              <button
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                className="rounded-full border border-earth/30 px-4 py-2 text-xs font-medium text-earth disabled:opacity-30"
              >
                ← Anterior
              </button>
              <span className="font-serif text-lg text-sepia">{active.yearFrom ?? "s/f"}</span>
              <button
                onClick={() => setIndex((i) => Math.min(list.length - 1, i + 1))}
                disabled={index === list.length - 1}
                className="rounded-full border border-earth/30 px-4 py-2 text-xs font-medium text-earth disabled:opacity-30"
              >
                Siguiente →
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() =>
                  document.getElementById("place-map")?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-full border border-earth/30 px-4 py-2 text-xs font-medium text-earth"
              >
                Ver en mapa
              </button>
              <Link
                to={`/aportar?placeId=${place.id}`}
                className="rounded-full bg-rust px-4 py-2 text-xs font-medium text-bone"
              >
                Aportar foto
              </Link>
              <button
                onClick={() => navigate(`/foto/${active.id}`)}
                className="rounded-full border border-earth/30 px-4 py-2 text-xs font-medium text-earth"
              >
                Comentarios
              </button>
              <button
                onClick={() => navigate(`/foto/${active.id}#aportar-info`)}
                className="rounded-full border border-earth/30 px-4 py-2 text-xs font-medium text-earth"
              >
                Aportar información
              </button>
            </div>
          </div>

          <div>
            <div id="place-map" className="overflow-hidden rounded-2xl border border-earth/15">
              <MapView center={[place.latitude, place.longitude]} zoom={16} markers={[{ id: place.id, ...place }]} height="260px" />
            </div>

            {active.description && (
              <p className="mt-4 text-sm text-earth">{active.description}</p>
            )}
            {active.sourceText && (
              <p className="mt-2 text-xs text-sepia">Fuente: {active.sourceText}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
