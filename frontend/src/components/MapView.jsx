// Encapsula el proveedor de mapas (Leaflet + OpenStreetMap para el MVP).
// El resto de la app solo debería importar este componente, nunca
// react-leaflet directamente, para poder cambiar de proveedor más adelante.

import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

// Marcador propio (HTML + CSS en index.css) en lugar del PNG por defecto
// de Leaflet: se integra con la paleta y permite resaltar el activo.
function markerIcon(active) {
  return L.divIcon({
    className: "",
    html: `<span class="memoria-marker${active ? " is-active" : ""}"><span></span></span>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    tooltipAnchor: [0, -38],
  });
}

function Recenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom ?? map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.[0], center?.[1], map]);
  return null;
}

function FitToMarkers({ markers }) {
  const map = useMap();
  const key = markers.map((m) => m.id).join(",");
  useEffect(() => {
    if (markers.length < 2) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.latitude, m.longitude]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

function ClickCapture({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

export function MapView({
  center,
  zoom = 14,
  markers = [],
  height = "400px",
  activeId,
  fitToMarkers = false,
  onMarkerClick,
  onMapClick,
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height, width: "100%" }}
      className="shadow-inner"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {fitToMarkers ? <FitToMarkers markers={markers} /> : <Recenter center={center} zoom={zoom} />}
      {onMapClick && <ClickCapture onClick={onMapClick} />}
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.latitude, m.longitude]}
          icon={markerIcon(m.id === activeId)}
          zIndexOffset={m.id === activeId ? 1000 : 0}
          keyboard
          eventHandlers={onMarkerClick ? { click: () => onMarkerClick(m) } : undefined}
        >
          {m.label && (
            <Tooltip direction="top" offset={[0, 0]}>
              {m.label}
            </Tooltip>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
