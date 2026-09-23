import { Link } from "react-router-dom";

export function LoadingState({ label = "Cargando..." }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-earth">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-earth/20 border-t-rust" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message = "Ocurrió un error.", onRetry }) {
  return (
    <div className="rounded-xl border border-rust/30 bg-rust/5 px-4 py-6 text-center text-sm text-rust">
      <p>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 min-h-[44px] rounded-full border border-rust/40 px-5 text-sm font-medium hover:bg-rust hover:text-bone"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = "Todavía no hay contenido acá.", children }) {
  return (
    <div className="rounded-xl border border-dashed border-earth/30 px-4 py-8 text-center text-sm text-earth">
      <p>{message}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

// Pantalla completa para un recurso que no existe (ciudad, lugar, foto).
export function NotFoundState({ title, message, backTo = "/", backLabel = "Volver al inicio" }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-serif text-sm uppercase tracking-[0.3em] text-sepia">Sin registro</p>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-carbon">{title}</h1>
      <p className="mt-3 text-earth">{message}</p>
      <Link
        to={backTo}
        className="mt-8 inline-flex min-h-[44px] items-center rounded-full bg-carbon px-6 text-sm font-medium text-bone hover:bg-earth"
      >
        {backLabel}
      </Link>
    </div>
  );
}

// Decide entre "no existe" y "falló la API" para el recurso principal de
// una página. Devuelve null si no hay error.
export function PageError({ error, errorStatus, onRetry, notFound }) {
  if (!error) return null;
  if (errorStatus === 404) return <NotFoundState {...notFound} />;
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <ErrorState message={error} onRetry={onRetry} />
    </div>
  );
}

export function DemoBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-carbon/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-bone ${className}`}
    >
      Contenido demo
    </span>
  );
}

export function ApproxBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-sepia/50 bg-cream px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-sepia ${className}`}
    >
      Fecha aproximada
    </span>
  );
}
