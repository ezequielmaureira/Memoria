const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, { method = "GET", body, token, isFormData } = {}) {
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch solo falla así cuando no hay conexión con el backend.
    const error = new Error("No pudimos conectar con el servidor de MEMORIA.");
    error.status = 0;
    throw error;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const error = new Error(data.error || `Error ${res.status}`);
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getCities: () => request("/cities"),
  getCity: (slug) => request(`/cities/${slug}`),
  getCityPlaces: (slug) => request(`/cities/${slug}/places`),

  getPlaceBySlug: (citySlug, placeSlug) =>
    request(`/places/city/${citySlug}/place/${placeSlug}`),
  getPlace: (id) => request(`/places/${id}`),
  getPlacePhotos: (id) => request(`/places/${id}/photos`),
  createPlace: (data, token) =>
    request("/places", { method: "POST", body: data, token }),

  getPhoto: (id) => request(`/photos/${id}`),
  createPhoto: (formData, token) =>
    request("/photos", { method: "POST", body: formData, token, isFormData: true }),

  getComments: (photoId) => request(`/photos/${photoId}/comments`),
  addComment: (photoId, content, token) =>
    request(`/photos/${photoId}/comments`, { method: "POST", body: { content }, token }),

  getContributions: (photoId) => request(`/photos/${photoId}/contributions`),
  addContribution: (photoId, data, token) =>
    request(`/photos/${photoId}/contributions`, { method: "POST", body: data, token }),

  getMe: (token) => request("/users/me", { token }),
  getMyContributions: (token) => request("/users/me/contributions", { token }),
};
