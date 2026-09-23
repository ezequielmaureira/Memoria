import { Link } from "react-router-dom";

// items: [{ label, to? }] — el último se muestra como página actual.
export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Ruta de navegación" className="text-sm text-earth">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-2">
              {item.to && !last ? (
                <Link to={item.to} className="py-1 hover:text-rust hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="font-medium text-carbon">
                  {item.label}
                </span>
              )}
              {!last && <span className="text-earth/50">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
