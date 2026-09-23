import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useFetch, useFetchWithRefetch } from "../hooks/useFetch.js";
import { api } from "../lib/api.js";
import {
  LoadingState,
  ErrorState,
  EmptyState,
  PageError,
  DemoBadge,
  ApproxBadge,
} from "../components/StateViews.jsx";
import { MapView } from "../components/MapView.jsx";
import { Timeline } from "../components/Timeline.jsx";
import { Breadcrumbs } from "../components/Breadcrumbs.jsx";
import { SOURCE_TYPE_LABELS, photoYear, plural } from "../lib/format.js";

export function PlacePage() {
  const { citySlug, placeSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const placeQuery = useFetchWithRefetch(() => api.getPlaceBySlug(citySlug, placeSlug), [citySlug, placeSlug]);
  const place = placeQuery.data;
  const photosQuery = useFetchWithRefetch(
    () => (place ? api.getPlacePhotos(place.id) : Promise.resolve([])),
    [place?.id]
  );

  const photos = photosQuery.data || [];
  // La época activa vive en la URL (?anio=1948): se puede compartir y
  // "Volver al álbum" desde una foto regresa al mismo año.
  const yearParam = Number(searchParams.get("anio"));
  const found = photos.findIndex((p) => p.yearFrom === yearParam);
  const index = found >= 0 ? found : 0;
  const active = photos[index];

  function goTo(i) {
    const photo = photos[Math.max(0, Math.min(photos.length - 1, i))];
    if (!photo) return;
    const next = new URLSearchParams(searchParams);
    next.set("anio", photo.yearFrom);
    setSearchParams(next, { replace: true });
  }

  // Flechas del teclado para recorrer las épocas.
  useEffect(() => {
    function onKey(e) {
      if (e.target.closest("input, textarea, select")) return;
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (placeQuery.loading) return <LoadingState label="Cargando lugar..." />;
  if (placeQuery.error)
    return (
      <PageError
        error={placeQuery.error}
        errorStatus={placeQuery.errorStatus}
        onRetry={placeQuery.refetch}
        notFound={{
          title: "Lugar no encontrado",
          message: "Este lugar todavía no tiene memoria registrada en MEMORIA.",
          backTo: `/ciudad/${citySlug}`,
          backLabel: "Volver a la ciudad",
        }}
      />
    );
  if (!place) return null;

  const city = place.city;
  const crumbs = [
    { label: city.name, to: `/ciudad/${city.slug}` },
    { label: place.name, to: active ? `/ciudad/${city.slug}/${place.slug}` : undefined },
  ];
  if (active?.yearFrom) crumbs.push({ label: String(active.yearFrom) });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs items={crumbs} />

      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {place.category && (
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sepia">{place.category}</p>
          )}
          <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight text-carbon sm:text-5xl">{place.name}</h1>
          <p className="mt-1 text-base text-earth">
            {city.name} · {city.province || city.country}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="#mapa-lugar"
            className="inline-flex min-h-[44px] items-center rounded-full border border-earth/30 px-5 text-sm font-medium text-carbon hover:bg-cream"
          >
            Ver en mapa
          </a>
          <Link
            to={`/aportar?placeId=${place.id}`}
            className="inline-flex min-h-[44px] items-center rounded-full bg-rust px-5 text-sm font-medium text-bone hover:bg-rust/90"
          >
            + Aportar foto
          </Link>
        </div>
      </header>

      <div className="mt-8">
        {photosQuery.loading && <LoadingState label="Cargando fotografías..." />}
        {photosQuery.error && <ErrorState message={photosQuery.error} onRetry={photosQuery.refetch} />}
        {!photosQuery.loading && !photosQuery.error && photos.length === 0 && (
          <EmptyState message="Todavía no hay fotografías de este lugar. ¡Podés ser la primera persona en aportar una!">
            <Link
              to={`/aportar?placeId=${place.id}`}
              className="inline-flex min-h-[44px] items-center rounded-full bg-rust px-5 text-sm font-medium text-bone"
            >
              Aportar foto
            </Link>
          </EmptyState>
        )}
        {active && (
          <Album
            place={place}
            photos={photos}
            index={index}
            active={active}
            onSelect={goTo}
          />
        )}
      </div>

      <div className="mt-12 grid gap-6 pb-16 lg:grid-cols-[1.4fr_1fr]">
        <PlaceHistory stats={place.stats} />
        <section id="mapa-lugar" className="rounded-3xl border border-earth/15 bg-white/60 p-5 sm:p-6">
          <h2 className="font-serif text-xl font-semibold text-carbon">Ubicación</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-earth/15">
            <MapView
              center={[place.latitude, place.longitude]}
              zoom={16}
              markers={[{ id: place.id, latitude: place.latitude, longitude: place.longitude, label: place.name }]}
              activeId={place.id}
              height="240px"
            />
          </div>
          <Link
            to={`/ciudad/${city.slug}?lugar=${place.slug}#mapa`}
            className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-carbon/70 px-5 text-sm font-medium text-carbon hover:bg-carbon hover:text-bone"
          >
            Ver mapa de {city.name}
          </Link>
        </section>
      </div>
    </div>
  );
}

// Libro abierto: foto a la izquierda, información y comentarios a la
// derecha, línea temporal abajo (ver .book en index.css).
function Album({ place, photos, index, active, onSelect }) {
  const photoUrl = `/foto/${active.id}`;
  return (
    <article className="book overflow-hidden rounded-3xl border border-earth/20 shadow-[0_20px_50px_-20px_rgba(28,26,23,0.35)]">
      {/* PÁGINA IZQUIERDA — fotografía */}
      <div className="book-photo paper p-4 sm:p-8">
        <Link to={photoUrl} className="group relative block bg-white p-2 shadow-lg sm:p-3" aria-label="Abrir fotografía">
          <img
            key={active.id}
            src={active.imageUrl}
            alt={active.title || place.name}
            className="fade-in aspect-[4/3] w-full bg-cream object-cover"
          />
          <span className="absolute bottom-5 right-5 rounded-full bg-carbon/80 px-3 py-1.5 text-xs font-medium text-bone opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            Abrir fotografía ↗
          </span>
        </Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <p className="font-serif text-5xl font-semibold leading-none text-carbon sm:text-6xl">
            {active.yearFrom ?? "s/f"}
          </p>
          <div className="flex flex-wrap gap-2">
            {active.dateIsApproximate && <ApproxBadge />}
            {active.isDemo && <DemoBadge />}
          </div>
        </div>
      </div>

      {/* PÁGINA DERECHA — información */}
      <div className="book-info paper border-t border-earth/15 p-5 sm:p-8 lg:border-t-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sepia">
          Fotografía {index + 1} de {photos.length}
        </p>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-carbon">{active.title || place.name}</h2>
        {active.description && <p className="mt-3 text-base leading-relaxed text-earth">{active.description}</p>}
        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Meta label="Fecha" value={`${photoYear(active)}${active.dateIsApproximate ? " (aprox.)" : ""}`} />
          <Meta
            label="Fuente"
            value={active.sourceText || SOURCE_TYPE_LABELS[active.sourceType]}
          />
          {active.photographer && <Meta label="Fotógrafo/a" value={active.photographer} />}
          {active.uploadedBy && <Meta label="Aportada por" value={active.uploadedBy.displayName} />}
        </dl>
        <Link
          to={photoUrl}
          className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-carbon px-5 text-sm font-medium text-bone hover:bg-rust"
        >
          Ver ficha completa →
        </Link>
      </div>

      {/* LÍNEA TEMPORAL */}
      <div className="book-timeline border-t border-earth/15 bg-cream/70 px-3 py-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <NavButton onClick={() => onSelect(index - 1)} disabled={index === 0} label="Anterior" dir="prev" />
          <div className="min-w-0 flex-1">
            <Timeline photos={photos} activeIndex={index} onSelect={onSelect} />
          </div>
          <NavButton
            onClick={() => onSelect(index + 1)}
            disabled={index === photos.length - 1}
            label="Siguiente"
            dir="next"
          />
        </div>
      </div>

      {/* PÁGINA DERECHA — comentarios */}
      <div className="book-comments paper border-t border-earth/15 p-5 sm:p-8">
        <CommentsPreview photoId={active.id} photoUrl={photoUrl} />
      </div>
    </article>
  );
}

function NavButton({ onClick, disabled, label, dir }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-full border border-earth/30 bg-bone px-3 text-sm font-medium text-carbon hover:border-rust hover:text-rust disabled:opacity-30 disabled:hover:border-earth/30 disabled:hover:text-carbon sm:px-4"
    >
      {dir === "prev" && <span aria-hidden>←</span>}
      <span className="hidden sm:inline">{label}</span>
      {dir === "next" && <span aria-hidden>→</span>}
    </button>
  );
}

function Meta({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-sepia">{label}</dt>
      <dd className="text-carbon">{value}</dd>
    </div>
  );
}

function CommentsPreview({ photoId, photoUrl }) {
  const { data, loading, error } = useFetch(() => api.getComments(photoId), [photoId]);
  const comments = data || [];

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-lg font-semibold text-carbon">Comentarios</h3>
        {!loading && !error && <span className="text-sm text-earth">{comments.length}</span>}
      </div>
      <div className="mt-3">
        {loading && <p className="text-sm text-earth">Cargando comentarios...</p>}
        {error && <p className="text-sm text-rust">No se pudieron cargar los comentarios.</p>}
        {!loading && !error && comments.length === 0 && (
          <p className="text-sm text-earth">Todavía nadie comentó esta fotografía.</p>
        )}
        {comments.length > 0 && (
          <ul className="space-y-3">
            {comments.slice(0, 2).map((c) => (
              <li key={c.id} className="border-l-2 border-sepia/40 pl-3">
                <p className="text-sm text-carbon">“{c.content}”</p>
                <p className="mt-0.5 text-xs text-earth">— {c.user.displayName}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
        <Link to={`${photoUrl}#comentarios`} className="inline-flex min-h-[40px] items-center text-rust hover:underline">
          {comments.length > 2 ? `Ver los ${comments.length} comentarios` : "Comentar"} →
        </Link>
        <Link to={`${photoUrl}#aportes`} className="inline-flex min-h-[40px] items-center text-rust hover:underline">
          Aportes históricos →
        </Link>
      </div>
    </section>
  );
}

function PlaceHistory({ stats }) {
  return (
    <section className="paper rounded-3xl border border-earth/15 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sepia">Historia de este lugar</p>
      <p className="mt-3 max-w-xl font-serif text-xl leading-relaxed text-carbon sm:text-2xl">
        Estamos reconstruyendo esta historia con fotografías, documentos y recuerdos aportados por la comunidad.
      </p>
      <h3 className="mt-8 text-sm font-semibold text-carbon">Fuentes disponibles</h3>
      <dl className="mt-3 grid grid-cols-3 gap-3">
        <SourceStat value={stats?.photos ?? 0} one="fotografía" many="fotografías" />
        <SourceStat value={stats?.contributions ?? 0} one="aporte" many="aportes" />
        <SourceStat value={stats?.comments ?? 0} one="comentario" many="comentarios" />
      </dl>
    </section>
  );
}

function SourceStat({ value, one, many }) {
  const [n, ...rest] = plural(value, one, many).split(" ");
  return (
    <div className="rounded-2xl border border-earth/15 bg-bone/80 p-3 text-center sm:p-4">
      <dd className="font-serif text-2xl font-semibold text-carbon sm:text-3xl">{n}</dd>
      <dt className="text-xs text-earth sm:text-sm">{rest.join(" ")}</dt>
    </div>
  );
}
