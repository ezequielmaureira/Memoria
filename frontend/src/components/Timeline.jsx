export function Timeline({ photos, activeIndex, onSelect }) {
  if (photos.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-4">
      {photos.map((photo, i) => (
        <div key={photo.id} className="flex items-center gap-2">
          <button
            onClick={() => onSelect(i)}
            className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full border text-xs font-medium transition-colors ${
              i === activeIndex
                ? "border-rust bg-rust text-bone"
                : "border-earth/30 bg-white/70 text-earth hover:border-sepia"
            }`}
          >
            {photo.yearFrom ?? "?"}
          </button>
          {i < photos.length - 1 && <div className="h-px w-8 bg-earth/30 sm:w-14" />}
        </div>
      ))}
    </div>
  );
}
