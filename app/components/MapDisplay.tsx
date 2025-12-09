'use client';

// Fix for Leaflet in Next.js
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for missing marker icons
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

// Setup Icons
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const destIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function MapDisplay({ 
    userLat, 
    userLng, 
    destLat, 
    destLng,
    routePath = [] 
}: { 
    userLat: number, 
    userLng: number, 
    destLat?: number, 
    destLng?: number,
    routePath?: [number, number][] 
}) {
    // Safety check for invalid coordinates
    if (!userLat || !userLng) return <div style={{color: 'white'}}>Waiting for GPS...</div>;

    return (
        <MapContainer 
            center={[userLat, userLng]} 
            zoom={15} 
            style={{ height: '100%', width: '100%', borderRadius: '15px' }}
        >
            {/* 🟢 CHANGED: Switched to OpenStreetMap for reliability */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={[userLat, userLng]} icon={userIcon}>
                <Popup>You are here</Popup>
            </Marker>

            {destLat && destLng && (
                <Marker position={[destLat, destLng]} icon={destIcon}>
                    <Popup>Destination</Popup>
                </Marker>
            )}

            {routePath && routePath.length > 0 && (
                <Polyline 
                    positions={routePath} 
                    color="#0070f3" 
                    weight={5} 
                    opacity={0.7} 
                />
            )}

            <MapUpdater center={[userLat, userLng]} />
        </MapContainer>
    );
}