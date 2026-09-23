// Línea temporal de un lugar: un punto por fotografía, en orden cronológico.
export function Timeline({ photos, activeIndex, onSelect }) {
  if (photos.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <ol
        className="relative flex min-w-max items-start justify-between gap-2 px-1 pb-1 pt-2 sm:min-w-0"
        aria-label="Línea temporal de fotografías"
      >
        {/* Línea de fondo que une los años */}
        <span aria-hidden className="absolute left-6 right-6 top-[1.35rem] h-px bg-earth/30" />
        {photos.map((photo, i) => {
          const active = i === activeIndex;
          return (
            <li key={photo.id} className="relative flex min-w-[52px] flex-1 justify-center">
              <button
                onClick={() => onSelect(i)}
                aria-current={active ? "true" : undefined}
                aria-label={`Ver fotografía de ${photo.yearFrom ?? "fecha desconocida"}`}
                className="group flex min-h-[44px] flex-col items-center gap-1.5 px-1"
              >
                <span
                  className={`block rounded-full border-2 transition-all ${
                    active
                      ? "h-5 w-5 border-rust bg-rust ring-4 ring-rust/20"
                      : "mt-0.5 h-4 w-4 border-earth/50 bg-bone group-hover:border-rust"
                  }`}
                />
                <span
                  className={`font-serif text-sm tabular-nums sm:text-base ${
                    active ? "font-semibold text-rust" : "text-earth group-hover:text-carbon"
                  }`}
                >
                  {photo.yearFrom ?? "s/f"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
