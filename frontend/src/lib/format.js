export const SOURCE_TYPE_LABELS = {
  PERSONAL: "Archivo personal",
  FAMILY_ARCHIVE: "Archivo familiar",
  PUBLIC_ARCHIVE: "Archivo público",
  MUSEUM: "Museo",
  NEWSPAPER: "Diario/revista",
  BOOK: "Libro",
  INTERNET: "Internet",
  OTHER: "Otro",
};

export const CONTRIBUTION_TYPES = [
  { value: "DATE", label: "Fecha" },
  { value: "LOCATION", label: "Ubicación" },
  { value: "IDENTIFICATION", label: "Identificación" },
  { value: "HISTORICAL_FACT", label: "Hecho histórico" },
  { value: "CORRECTION", label: "Corrección" },
  { value: "OTHER", label: "Otro" },
];

export const CONTRIBUTION_STATUS_LABELS = {
  PENDING: "En revisión",
  ACCEPTED: "Aceptado",
  REJECTED: "Descartado",
};

export function photoYear(photo) {
  if (!photo?.yearFrom) return "Fecha desconocida";
  if (photo.yearTo && photo.yearTo !== photo.yearFrom) return `${photo.yearFrom}–${photo.yearTo}`;
  return String(photo.yearFrom);
}

export function period(yearMin, yearMax) {
  if (!yearMin) return null;
  return yearMin === yearMax ? String(yearMin) : `${yearMin} — ${yearMax}`;
}

export function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

export function cityLocation(city) {
  return [city?.province, city?.country].filter(Boolean).join(", ");
}
