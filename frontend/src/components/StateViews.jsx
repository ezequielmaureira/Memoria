export function LoadingState({ label = "Cargando..." }) {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-earth">
      <span className="animate-pulse">{label}</span>
    </div>
  );
}

export function ErrorState({ message = "Ocurrió un error." }) {
  return (
    <div className="rounded-xl border border-rust/30 bg-rust/5 px-4 py-6 text-center text-sm text-rust">
      {message}
    </div>
  );
}

export function EmptyState({ message = "Todavía no hay contenido acá." }) {
  return (
    <div className="rounded-xl border border-dashed border-earth/30 px-4 py-8 text-center text-sm text-earth">
      {message}
    </div>
  );
}
