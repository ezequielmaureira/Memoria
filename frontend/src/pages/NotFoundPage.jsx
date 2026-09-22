import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-3xl font-semibold">Página no encontrada</h1>
      <p className="mt-2 text-earth">Este lugar todavía no tiene memoria registrada.</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-carbon px-5 py-2 text-sm text-bone">
        Volver al inicio
      </Link>
    </div>
  );
}
