import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { BrainCircuit } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Fix for default Leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getCustomIcon = (priority) => {
  const color = priority === 'High' ? '#EF4444' : priority === 'Medium' ? '#F59E0B' : '#10B981';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const MapView = () => {
  const { t } = useTranslation();
  const visits = useLiveQuery(() => db.visits.toArray()) || [];

  if (visits.length === 0) return <div style={{ color: 'white', padding: '20px' }}>Loading map...</div>;

  const center = [visits[0].lat, visits[0].lng];
  const routePositions = visits.map(v => [v.lat, v.lng]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {visits.map(visit => (
            <Marker key={visit.id} position={[visit.lat, visit.lng]} icon={getCustomIcon(visit.priority)}>
              <Popup>
                <div style={{ color: '#000' }}>
                  <strong>{visit.name}</strong><br/>
                  Priority: {visit.priority}
                </div>
              </Popup>
            </Marker>
          ))}
          <Polyline 
            positions={routePositions} 
            color="var(--accent-primary)" 
            weight={4} 
            dashArray="10, 10" 
            className="animated-route"
          />
        </MapContainer>
      </div>

      <div className="glass-panel" style={{ padding: '16px' }}>
        <div className="ai-route-header">
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Route Summary</h3>
          <div className="ai-route-badge">
            <BrainCircuit size={12} /> AI Optimized
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
          <span>Total Stops: {visits.length}</span>
          <span>Est. Distance: 18.4 km</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
