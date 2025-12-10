import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapDisplayProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
}

const MapDisplay = ({
  center = [1.3521, 103.8198], // Singapore
  zoom = 15,
  className = "",
}: MapDisplayProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    });

    // Add tile layer with a clean style
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    // Add current location marker
    const currentLocationIcon = L.divIcon({
      className: "current-location-marker",
      html: `
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, hsl(175, 60%, 40%) 0%, hsl(185, 55%, 50%) 100%);
          border: 4px solid white;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        "></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    L.marker(center, { icon: currentLocationIcon }).addTo(map);

    // Add zoom control in a better position
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;
    setIsLoaded(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [center, zoom]);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <div ref={mapRef} className="h-full w-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Loading map...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
