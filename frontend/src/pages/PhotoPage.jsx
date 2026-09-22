import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useFetch, useFetchWithRefetch } from "../hooks/useFetch.js";
import { api } from "../lib/api.js";
import { LoadingState, ErrorState, EmptyState } from "../components/StateViews.jsx";
import { useAppAuth } from "../lib/auth.jsx";

const CONTRIBUTION_TYPES = [
  { value: "DATE", label: "Sobre la fecha" },
  { value: "LOCATION", label: "Sobre la ubicación" },
  { value: "IDENTIFICATION", label: "Identificación (personas, comercios)" },
  { value: "HISTORICAL_FACT", label: "Dato histórico" },
  { value: "CORRECTION", label: "Corrección" },
  { value: "OTHER", label: "Otro" },
];

export function PhotoPage() {
  const { photoId } = useParams();
  const { data: photo, loading, error } = useFetch(() => api.getPhoto(photoId), [photoId]);
  const { isConfigured, isSignedIn, getToken } = useAppAuth();

  if (loading) return <LoadingState label="Cargando fotografía..." />;
  if (error) return <ErrorState message={error} />;
  if (!photo) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        to={`/ciudad/${photo.place.city.slug}/${photo.place.slug}`}
        className="text-xs text-earth hover:text-carbon"
      >
        ← Volver a {photo.place.name}
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-earth/15 bg-cream">
        <img src={photo.imageUrl} alt={photo.title || photo.place.name} className="w-full object-cover" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-[2fr_1fr]">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-carbon">
            {photo.title || photo.place.name}
          </h1>
          <p className="text-sm text-sepia">
            {photo.yearFrom ? (photo.yearTo && photo.yearTo !== photo.yearFrom ? `${photo.yearFrom}–${photo.yearTo}` : photo.yearFrom) : "Fecha desconocida"}
            {photo.dateIsApproximate && " (aproximado)"}
          </p>
          {photo.description && <p className="mt-3 text-sm text-earth">{photo.description}</p>}
        </div>
        <div className="text-xs text-earth">
          <p><span className="font-medium text-carbon">Lugar:</span> {photo.place.name}</p>
          {photo.uploadedBy && (
            <p className="mt-1">
              <span className="font-medium text-carbon">Aportado por:</span> {photo.uploadedBy.displayName}
            </p>
          )}
          {photo.sourceText && (
            <p className="mt-1"><span className="font-medium text-carbon">Fuente:</span> {photo.sourceText}</p>
          )}
          {photo.photographer && (
            <p className="mt-1"><span className="font-medium text-carbon">Fotógrafo/a:</span> {photo.photographer}</p>
          )}
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-earth/15 bg-white/60 p-5">
        <h2 className="font-serif text-lg font-semibold text-carbon">Historia de este lugar</h2>
        <p className="mt-2 text-sm text-earth">
          Todavía estamos reconstruyendo esta historia con los aportes de la comunidad.
        </p>
      </section>

      <CommentsSection photoId={photo.id} isConfigured={isConfigured} isSignedIn={isSignedIn} getToken={getToken} />

      <ContributionsSection
        photoId={photo.id}
        isConfigured={isConfigured}
        isSignedIn={isSignedIn}
        getToken={getToken}
      />
    </div>
  );
}

function CommentsSection({ photoId, isConfigured, isSignedIn, getToken }) {
  const { data: comments, loading, error, refetch } = useFetchWithRefetch(
    () => api.getComments(photoId),
    [photoId]
  );
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
    <section className="mt-10">
      <h2 className="font-serif text-lg font-semibold text-carbon">Comentarios</h2>

      <div className="mt-4">
        {loading && <LoadingState label="Cargando comentarios..." />}
        {error && <ErrorState message={error} />}
        {!loading && !error && (comments || []).length === 0 && (
          <EmptyState message="Todavía no hay comentarios." />
        )}
        {!loading && (comments || []).length > 0 && (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="rounded-xl border border-earth/15 bg-white/60 p-3 text-sm">
                <p className="font-medium text-carbon">{c.user.displayName}</p>
                <p className="text-earth">{c.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isConfigured && isSignedIn ? (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribí un comentario..."
            className="flex-1 rounded-full border border-earth/30 px-4 py-2 text-sm outline-none focus:border-sepia"
          />
          <button
            disabled={submitting}
            className="rounded-full bg-carbon px-4 py-2 text-xs font-medium text-bone disabled:opacity-50"
          >
            Publicar
          </button>
        </form>
      ) : (
        <p className="mt-4 text-xs text-earth">Iniciá sesión para comentar.</p>
      )}
      {formError && <p className="mt-2 text-xs text-rust">{formError}</p>}
    </section>
  );
}

function ContributionsSection({ photoId, isConfigured, isSignedIn, getToken }) {
  const { data: contributions, loading, error, refetch } = useFetchWithRefetch(
    () => api.getContributions(photoId),
    [photoId]
  );
  const [type, setType] = useState("HISTORICAL_FACT");
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
      refetch();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="aportar-info" className="mt-10 pb-16">
      <h2 className="font-serif text-lg font-semibold text-carbon">Aportes históricos</h2>

      <div className="mt-4">
        {loading && <LoadingState label="Cargando aportes..." />}
        {error && <ErrorState message={error} />}
        {!loading && !error && (contributions || []).length === 0 && (
          <EmptyState message="Todavía no hay aportes históricos para esta foto." />
        )}
        {!loading && (contributions || []).length > 0 && (
          <ul className="space-y-3">
            {contributions.map((c) => (
              <li key={c.id} className="rounded-xl border border-earth/15 bg-white/60 p-3 text-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-sepia">
                  {CONTRIBUTION_TYPES.find((t) => t.value === c.type)?.label || c.type}
                </p>
                <p className="text-earth">{c.content}</p>
                <p className="mt-1 text-xs text-earth/70">— {c.user.displayName}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isConfigured && isSignedIn ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-full border border-earth/30 px-4 py-2 text-sm"
          >
            {CONTRIBUTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Compartí lo que sepas sobre esta foto..."
            rows={3}
            className="w-full rounded-2xl border border-earth/30 px-4 py-2 text-sm outline-none focus:border-sepia"
          />
          <button
            disabled={submitting}
            className="rounded-full bg-carbon px-4 py-2 text-xs font-medium text-bone disabled:opacity-50"
          >
            Enviar aporte
          </button>
        </form>
      ) : (
        <p className="mt-4 text-xs text-earth">Iniciá sesión para aportar información.</p>
      )}
      {formError && <p className="mt-2 text-xs text-rust">{formError}</p>}
    </section>
  );
}
