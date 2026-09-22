import { useFetch } from "../hooks/useFetch.js";
import { api } from "../lib/api.js";
import { LoadingState, ErrorState, EmptyState } from "../components/StateViews.jsx";
import { useAppAuth } from "../lib/auth.jsx";

export function ProfilePage() {
  const { isConfigured, isSignedIn, user, getToken } = useAppAuth();

  if (!isConfigured) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold">Login no configurado</h1>
        <p className="mt-2 text-sm text-earth">
          Configurá Clerk (ver frontend/.env.example) para habilitar perfiles de usuario.
        </p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold">Iniciá sesión</h1>
        <p className="mt-2 text-sm text-earth">Iniciá sesión para ver tu perfil y tus aportes.</p>
      </div>
    );
  }

  return <ProfileContent user={user} getToken={getToken} />;
}

function ProfileContent({ user, getToken }) {
  const { data, loading, error } = useFetch(async () => {
    const token = await getToken();
    return api.getMyContributions(token);
  }, [user?.id]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        {user?.imageUrl && (
          <img src={user.imageUrl} alt={user.fullName} className="h-16 w-16 rounded-full object-cover" />
        )}
        <div>
          <h1 className="font-serif text-2xl font-semibold text-carbon">{user?.fullName || "Tu perfil"}</h1>
          <p className="text-sm text-sepia">Tu aporte a la memoria</p>
        </div>
      </div>

      {loading && <LoadingState label="Cargando tus aportes..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && data && (
        <>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <StatCard label="Fotografías" value={data.photos.length} />
            <StatCard label="Lugares" value={data.places.length} />
            <StatCard label="Aportes históricos" value={data.contributions.length} />
          </div>

          <section className="mt-10">
            <h2 className="font-serif text-lg font-semibold text-carbon">Fotos aportadas</h2>
            {data.photos.length === 0 ? (
              <EmptyState message="Todavía no aportaste fotografías." />
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {data.photos.map((p) => (
                  <img key={p.id} src={p.imageUrl} alt={p.title} className="h-24 w-full rounded-lg object-cover" />
                ))}
              </div>
            )}
          </section>

          <section className="mt-10 pb-16">
            <h2 className="font-serif text-lg font-semibold text-carbon">Aportes históricos</h2>
            {data.contributions.length === 0 ? (
              <EmptyState message="Todavía no hiciste aportes históricos." />
            ) : (
              <ul className="mt-4 space-y-2">
                {data.contributions.map((c) => (
                  <li key={c.id} className="rounded-xl border border-earth/15 bg-white/60 p-3 text-sm text-earth">
                    {c.content}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-earth/15 bg-white/60 p-4">
      <p className="font-serif text-2xl font-semibold text-carbon">{value}</p>
      <p className="text-xs text-earth">{label}</p>
    </div>
  );
}
