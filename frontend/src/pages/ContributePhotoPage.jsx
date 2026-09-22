import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFetch } from "../hooks/useFetch.js";
import { api } from "../lib/api.js";
import { LoadingState, ErrorState } from "../components/StateViews.jsx";
import { useAppAuth } from "../lib/auth.jsx";
import { MapView } from "../components/MapView.jsx";

const SOURCE_TYPES = [
  { value: "PERSONAL", label: "Archivo personal" },
  { value: "FAMILY_ARCHIVE", label: "Archivo familiar" },
  { value: "PUBLIC_ARCHIVE", label: "Archivo público" },
  { value: "MUSEUM", label: "Museo" },
  { value: "NEWSPAPER", label: "Diario/revista" },
  { value: "BOOK", label: "Libro" },
  { value: "INTERNET", label: "Internet" },
  { value: "OTHER", label: "Otro" },
];

export function ContributePhotoPage() {
  const { isConfigured, isSignedIn, getToken } = useAppAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: cities, loading: loadingCities } = useFetch(() => api.getCities(), []);
  const [cityId, setCityId] = useState("");
  const { data: places, loading: loadingPlaces } = useFetch(
    () => (cityId ? api.getCityPlaces(cities.find((c) => c.id === cityId)?.slug) : Promise.resolve([])),
    [cityId, cities]
  );

  const [placeId, setPlaceId] = useState(searchParams.get("placeId") || "");
  const [newPlaceName, setNewPlaceName] = useState("");
  const [creatingPlace, setCreatingPlace] = useState(false);
  const [location, setLocation] = useState(null);

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [sourceType, setSourceType] = useState("PERSONAL");
  const [sourceText, setSourceText] = useState("");
  const [photographer, setPhotographer] = useState("");
  const [privacyOption, setPrivacyOption] = useState("original");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isConfigured) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold">Login no configurado</h1>
        <p className="mt-2 text-sm text-earth">
          Para aportar fotos hace falta configurar Clerk (ver frontend/.env.example).
        </p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold">Iniciá sesión para aportar</h1>
        <p className="mt-2 text-sm text-earth">Usá el botón de la barra superior para iniciar sesión.</p>
      </div>
    );
  }

  async function handleCreatePlace(e) {
    e.preventDefault();
    if (!newPlaceName.trim() || !cityId || !location) {
      setError("Completá ciudad, nombre del lugar y ubicación en el mapa.");
      return;
    }
    setCreatingPlace(true);
    setError(null);
    try {
      const token = await getToken();
      const place = await api.createPlace(
        {
          cityId,
          name: newPlaceName.trim(),
          latitude: location.lat,
          longitude: location.lng,
        },
        token
      );
      setPlaceId(place.id);
      setNewPlaceName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingPlace(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!placeId) return setError("Elegí o creá un lugar.");
    if (!file) return setError("Seleccioná una imagen.");

    setSubmitting(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("image", file);
      formData.append("placeId", placeId);
      if (title) formData.append("title", title);
      if (description) formData.append("description", description);
      if (yearFrom) formData.append("yearFrom", yearFrom);
      formData.append("sourceType", sourceType);
      if (sourceText) formData.append("sourceText", sourceText);
      if (photographer) formData.append("photographer", photographer);

      const photo = await api.createPhoto(formData, token);
      setSuccess("¡Foto publicada!");
      setTimeout(() => navigate(`/foto/${photo.id}`), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-carbon">Aportar una fotografía</h1>
      <p className="mt-1 text-sm text-earth">
        Sumá una imagen a la memoria colectiva de tu ciudad.
      </p>

      <div className="mt-8 space-y-6 rounded-2xl border border-earth/15 bg-white/60 p-6">
        <div>
          <label className="text-sm font-medium text-carbon">1. Ciudad</label>
          {loadingCities ? (
            <LoadingState label="Cargando ciudades..." />
          ) : (
            <select
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value);
                setPlaceId("");
              }}
              className="mt-1 w-full rounded-lg border border-earth/30 px-3 py-2 text-sm"
            >
              <option value="">Elegí una ciudad...</option>
              {(cities || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {cityId && (
          <div>
            <label className="text-sm font-medium text-carbon">2. Lugar</label>
            {loadingPlaces ? (
              <LoadingState label="Cargando lugares..." />
            ) : (
              <select
                value={placeId}
                onChange={(e) => setPlaceId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-earth/30 px-3 py-2 text-sm"
              >
                <option value="">Elegí un lugar existente...</option>
                {(places || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-sepia">O proponer un lugar nuevo</summary>
              <div className="mt-3 space-y-3">
                <input
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  placeholder="Nombre del lugar"
                  className="w-full rounded-lg border border-earth/30 px-3 py-2 text-sm"
                />
                <div className="overflow-hidden rounded-lg">
                  <MapView
                    center={[cities?.find((c) => c.id === cityId)?.latitude || -34.6, cities?.find((c) => c.id === cityId)?.longitude || -58.4]}
                    zoom={13}
                    height="240px"
                    markers={location ? [{ id: "new", latitude: location.lat, longitude: location.lng }] : []}
                    onMapClick={(latlng) => setLocation(latlng)}
                  />
                </div>
                <MapClickHint />
                <button
                  onClick={handleCreatePlace}
                  disabled={creatingPlace}
                  className="rounded-full bg-earth px-4 py-2 text-xs font-medium text-bone disabled:opacity-50"
                >
                  {creatingPlace ? "Creando..." : "Crear lugar"}
                </button>
              </div>
            </details>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 border-t border-earth/15 pt-6">
          <div>
            <label className="text-sm font-medium text-carbon">3. Imagen</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-carbon">Título (opcional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-earth/30 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-carbon">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-earth/30 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-carbon">Año (aprox.)</label>
              <input
                type="number"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-earth/30 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-carbon">Fuente</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-earth/30 px-3 py-2 text-sm"
              >
                {SOURCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-carbon">Detalle de la fuente (opcional)</label>
            <input
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-earth/30 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-carbon">Fotógrafo/a (si se conoce)</label>
            <input
              value={photographer}
              onChange={(e) => setPhotographer(e.target.value)}
              className="mt-1 w-full rounded-lg border border-earth/30 px-3 py-2 text-sm"
            />
          </div>

          <fieldset className="rounded-xl border border-earth/20 p-4">
            <legend className="px-1 text-sm font-medium text-carbon">Privacidad de personas</legend>
            <div className="mt-2 space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="privacy"
                  checked={privacyOption === "original"}
                  onChange={() => setPrivacyOption("original")}
                />
                Publicar fotografía original
              </label>
              <label className="flex items-center gap-2 text-earth/50">
                <input type="radio" name="privacy" disabled />
                Ocultar personas — Próximamente
              </label>
              <label className="flex items-center gap-2 text-earth/50">
                <input type="radio" name="privacy" disabled />
                Eliminar personas y reconstruir el entorno con IA — Próximamente
              </label>
            </div>
            <p className="mt-3 text-xs text-sepia">
              El archivo original siempre se conserva separado de cualquier versión modificada.
            </p>
          </fieldset>

          {error && <ErrorState message={error} />}
          {success && <p className="text-sm text-green-700">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-carbon px-5 py-3 text-sm font-medium text-bone disabled:opacity-50"
          >
            {submitting ? "Publicando..." : "Publicar fotografía"}
          </button>
        </form>
      </div>
    </div>
  );
}

function MapClickHint() {
  return <p className="text-xs text-earth">Tocá el mapa de arriba para marcar la ubicación exacta.</p>;
}
