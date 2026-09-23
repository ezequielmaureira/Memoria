import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SignInButton } from "@clerk/clerk-react";
import { useFetchWithRefetch } from "../hooks/useFetch.js";
import { api } from "../lib/api.js";
import {
  LoadingState,
  ErrorState,
  EmptyState,
  PageError,
  DemoBadge,
  ApproxBadge,
} from "../components/StateViews.jsx";
import { Breadcrumbs } from "../components/Breadcrumbs.jsx";
import { useAppAuth } from "../lib/auth.jsx";
import {
  CONTRIBUTION_TYPES,
  CONTRIBUTION_STATUS_LABELS,
  SOURCE_TYPE_LABELS,
  cityLocation,
  photoYear,
} from "../lib/format.js";

export function PhotoPage() {
  const { photoId } = useParams();
  const { data: photo, loading, error, errorStatus, refetch } = useFetchWithRefetch(
    () => api.getPhoto(photoId),
    [photoId]
  );

  if (loading) return <LoadingState label="Cargando fotografía..." />;
  if (error)
    return (
      <PageError
        error={error}
        errorStatus={errorStatus}
        onRetry={refetch}
        notFound={{
          title: "Fotografía no encontrada",
          message: "La fotografía que buscás no existe o fue retirada del archivo.",
        }}
      />
    );
  if (!photo) return null;

  const { place } = photo;
  const city = place.city;
  const albumUrl = `/ciudad/${city.slug}/${place.slug}${photo.yearFrom ? `?anio=${photo.yearFrom}` : ""}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: city.name, to: `/ciudad/${city.slug}` },
          { label: place.name, to: albumUrl },
          { label: photo.yearFrom ? String(photo.yearFrom) : "Sin fecha" },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <figure className="self-start bg-white p-2 shadow-xl sm:p-4">
          <img
            src={photo.imageUrl}
            alt={photo.title || place.name}
            className="w-full bg-cream object-contain"
          />
        </figure>

        <aside className="paper rounded-3xl border border-earth/15 p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            {photo.dateIsApproximate && <ApproxBadge />}
            {photo.isDemo && <DemoBadge />}
          </div>
          <p className="mt-4 font-serif text-5xl font-semibold leading-none text-carbon">
            {photoYear(photo)}
          </p>
          <h1 className="mt-3 font-serif text-2xl font-semibold text-carbon">{photo.title || place.name}</h1>
          {photo.description && <p className="mt-3 text-base leading-relaxed text-earth">{photo.description}</p>}

          <dl className="mt-6 space-y-3 border-t border-earth/15 pt-5 text-sm">
            <Meta label="Lugar">
              <Link to={albumUrl} className="text-rust hover:underline">
                {place.name}
              </Link>
            </Meta>
            <Meta label="Ciudad">
              <Link to={`/ciudad/${city.slug}`} className="text-rust hover:underline">
                {city.name}
              </Link>
              <span className="text-earth"> · {cityLocation(city)}</span>
            </Meta>
            <Meta label="Fuente">{photo.sourceText || SOURCE_TYPE_LABELS[photo.sourceType]}</Meta>
            {photo.photographer && <Meta label="Fotógrafo/a">{photo.photographer}</Meta>}
            {photo.uploadedBy && <Meta label="Aportada por">{photo.uploadedBy.displayName}</Meta>}
          </dl>

          <Link
            to={albumUrl}
            className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-carbon/70 px-5 text-sm font-medium text-carbon hover:bg-carbon hover:text-bone"
          >
            ← Volver al álbum de {place.name}
          </Link>
        </aside>
      </div>

      <div className="mt-12 grid gap-8 pb-16 lg:grid-cols-2">
        <CommentsSection photoId={photo.id} />
        <ContributionsSection photoId={photo.id} />
      </div>
    </div>
  );
}

function Meta({ label, children }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2">
      <dt className="text-xs uppercase tracking-wider text-sepia">{label}</dt>
      <dd className="text-carbon">{children}</dd>
    </div>
  );
}

// Aviso cuando el usuario no puede publicar: pide login o explica que el
// login todavía no está habilitado en este entorno.
function LoginPrompt({ action }) {
  const { isConfigured } = useAppAuth();
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-earth/30 p-4 text-sm text-earth">
      {isConfigured ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>Iniciá sesión para {action}.</span>
          <SignInButton mode="modal">
            <button className="min-h-[44px] rounded-full bg-carbon px-5 text-sm font-medium text-bone hover:bg-earth">
              Iniciar sesión
            </button>
          </SignInButton>
        </div>
      ) : (
        <span>Para {action} hace falta iniciar sesión. El login todavía no está habilitado en este entorno.</span>
      )}
    </div>
  );
}

function CommentsSection({ photoId }) {
  const { isSignedIn, getToken } = useAppAuth();
  const { data, loading, error, refetch } = useFetchWithRefetch(() => api.getComments(photoId), [photoId]);
  const comments = data || [];
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const token = await getToken();
      await api.addComment(photoId, text.trim(), token);
      setText("");
      refetch();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="comentarios" className="rounded-3xl border border-earth/15 bg-white/60 p-5 sm:p-7">
      <header>
        <h2 className="font-serif text-2xl font-semibold text-carbon">
          Comentarios {!loading && !error && <span className="text-earth">({comments.length})</span>}
        </h2>
        <p className="mt-1 text-sm text-earth">Recuerdos, impresiones y preguntas sobre esta fotografía.</p>
      </header>

      <div className="mt-5">
        {loading && <LoadingState label="Cargando comentarios..." />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && comments.length === 0 && (
          <EmptyState message="Todavía no hay comentarios. ¿Te trae algún recuerdo esta imagen?" />
        )}
        {comments.length > 0 && (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="rounded-2xl border border-earth/10 bg-bone/80 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Avatar name={c.user.displayName} />
                  <p className="font-medium text-carbon">{c.user.displayName}</p>
                  {c.isDemo && <span className="text-[11px] uppercase tracking-wider text-sepia">· demo</span>}
                </div>
                <p className="mt-2 text-base text-earth">{c.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isSignedIn ? (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="comment" className="sr-only">
            Comentario
          </label>
          <input
            id="comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribí un comentario..."
            className="min-h-[44px] flex-1 rounded-full border border-earth/30 bg-white px-4 text-base outline-none focus:border-sepia"
          />
          <button
            disabled={submitting || !text.trim()}
            className="min-h-[44px] rounded-full bg-carbon px-5 text-sm font-medium text-bone disabled:opacity-50"
          >
            {submitting ? "Publicando..." : "Publicar"}
          </button>
        </form>
      ) : (
        <LoginPrompt action="comentar" />
      )}
      {formError && <p className="mt-2 text-sm text-rust">{formError}</p>}
    </section>
  );
}

function ContributionsSection({ photoId }) {
  const { isSignedIn, getToken } = useAppAuth();
  const { data, loading, error, refetch } = useFetchWithRefetch(() => api.getContributions(photoId), [photoId]);
  const contributions = data || [];
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("DATE");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const token = await getToken();
      await api.addContribution(photoId, { type, content: content.trim() }, token);
      setContent("");
      setOpen(false);
      refetch();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="aportes" className="paper rounded-3xl border border-sepia/30 p-5 sm:p-7">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-carbon">
            Aportes históricos {!loading && !error && <span className="text-earth">({contributions.length})</span>}
          </h2>
          <p className="mt-1 text-sm text-earth">
            Datos concretos para documentar la imagen: fecha, ubicación, identificación o correcciones. Se revisan
            antes de incorporarse.
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="min-h-[44px] shrink-0 rounded-full bg-rust px-5 text-sm font-medium text-bone hover:bg-rust/90"
        >
          {open ? "Cancelar" : "+ Aportar información"}
        </button>
      </header>

      {open &&
        (isSignedIn ? (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3 rounded-2xl border border-earth/15 bg-white/80 p-4">
            <fieldset>
              <legend className="text-sm font-medium text-carbon">Tipo de aporte</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {CONTRIBUTION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    aria-pressed={type === t.value}
                    className={`min-h-[40px] rounded-full border px-4 text-sm ${
                      type === t.value
                        ? "border-carbon bg-carbon text-bone"
                        : "border-earth/30 text-earth hover:border-carbon"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <label htmlFor="contribution" className="sr-only">
              Aporte
            </label>
            <textarea
              id="contribution"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="¿Qué sabés sobre esta fotografía? Si podés, indicá de dónde viene el dato."
              rows={4}
              className="w-full rounded-2xl border border-earth/30 px-4 py-3 text-base outline-none focus:border-sepia"
            />
            <button
              disabled={submitting || !content.trim()}
              className="min-h-[44px] rounded-full bg-carbon px-5 text-sm font-medium text-bone disabled:opacity-50"
            >
              {submitting ? "Enviando..." : "Enviar aporte"}
            </button>
          </form>
        ) : (
          <LoginPrompt action="aportar información" />
        ))}
      {formError && <p className="mt-2 text-sm text-rust">{formError}</p>}

      <div className="mt-5">
        {loading && <LoadingState label="Cargando aportes..." />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && contributions.length === 0 && (
          <EmptyState message="Todavía no hay aportes históricos para esta fotografía." />
        )}
        {contributions.length > 0 && (
          <ul className="space-y-3">
            {contributions.map((c) => (
              <li key={c.id} className="rounded-2xl border border-earth/15 bg-bone/80 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sepia/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-sepia">
                    {CONTRIBUTION_TYPES.find((t) => t.value === c.type)?.label || c.type}
                  </span>
                  <span className="text-xs text-earth">{CONTRIBUTION_STATUS_LABELS[c.status]}</span>
                  {c.isDemo && <span className="text-[11px] uppercase tracking-wider text-sepia">· demo</span>}
                </div>
                <p className="mt-2 text-base text-carbon">{c.content}</p>
                {c.proposedYearFrom && (
                  <p className="mt-1 text-sm text-earth">Año propuesto: {c.proposedYearFrom}</p>
                )}
                <p className="mt-2 text-xs text-earth">— {c.user.displayName}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Avatar({ name }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream font-serif text-sm font-semibold text-sepia">
      {name?.[0]?.toUpperCase() ?? "?"}
    </span>
  );
}
