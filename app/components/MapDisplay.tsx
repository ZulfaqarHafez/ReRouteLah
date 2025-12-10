'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for missing marker icons in Next.js
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

// Component to update map center when user moves
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

interface MapDisplayProps {
    userLat: number;
    userLng: number;
    destLat?: number;
    destLng?: number;
    routePath?: [number, number][];
}

export default function MapDisplay({ 
    userLat, 
    userLng, 
    destLat, 
    destLng,
    routePath = [] 
}: MapDisplayProps) {
    // Safety check for invalid coordinates
    if (!userLat || !userLng || isNaN(userLat) || isNaN(userLng)) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-gray-800 rounded-2xl">
                <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-lg">Waiting for GPS...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden shadow-2xl">
            <MapContainer 
                center={[userLat, userLng]} 
                zoom={16} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User position marker */}
                <Marker position={[userLat, userLng]} icon={userIcon}>
                    <Popup>
                        <div className="text-center font-semibold">
                            📍 You are here
                        </div>
                    </Popup>
                </Marker>

                {/* Destination marker */}
                {destLat && destLng && !isNaN(destLat) && !isNaN(destLng) && (
                    <Marker position={[destLat, destLng]} icon={destIcon}>
                        <Popup>
                            <div className="text-center font-semibold">
                                🎯 Destination
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Route path */}
                {routePath && routePath.length > 0 && (
                    <Polyline 
                        positions={routePath} 
                        color="#2563eb" 
                        weight={6} 
                        opacity={0.8} 
                    />
                )}

                <MapUpdater center={[userLat, userLng]} />
            </MapContainer>
        </div>
    );
}