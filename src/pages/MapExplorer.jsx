import React, { useState, useEffect } from 'react';
import { MapPin, Info, Navigation, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useData } from '../context/DataContext';

// Fix for default Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import shadowIcon from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: shadowIcon,
});

const StatusBadge = ({ status }) => {
  const colors = {
    'Online': '#2E7D32',
    'Maintenance': '#D32F2F',
    'Full': '#F57C00'
  };
  return (
    <span style={{ 
      padding: '4px 10px', 
      borderRadius: '20px', 
      fontSize: '0.75rem', 
      fontWeight: 600, 
      background: `${colors[status]}22`, 
      color: colors[status],
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors[status] }}></div>
      {status}
    </span>
  );
};

const MapExplorer = () => {
  const { stations, isLocationEnabled, toggleLocation } = useData();
  const [district, setDistrict] = useState('All Districts');
  const [selectedStation, setSelectedStation] = useState(null);
  const [filteredStations, setFilteredStations] = useState(stations);

  useEffect(() => {
    let result = stations;
    if (district !== 'All Districts') {
      result = result.filter(s => s.district === district);
    }
    setFilteredStations(result);
  }, [district, stations]);

  const mapCenter = [2.1896, 102.2501]; // Melaka City coordinates

  const getPos = (dist) => {
    if (dist === 'Jasin') return [2.3102, 102.4312];
    if (dist === 'Alor Gajah') return [2.3846, 102.2132];
    return [2.1896, 102.2501];
  };

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Map Explorer</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Interactive view of the Melaka EV Charging network.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '8px 16px', borderRadius: '30px', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isLocationEnabled ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
              Location {isLocationEnabled ? 'ON' : 'OFF'}
            </span>
            <button 
              onClick={toggleLocation}
              style={{ 
                width: '44px', 
                height: '24px', 
                borderRadius: '12px', 
                background: isLocationEnabled ? 'var(--color-success)' : '#ccc',
                position: 'relative',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ 
                width: '18px', 
                height: '18px', 
                background: 'white', 
                borderRadius: '50%', 
                position: 'absolute', 
                top: '3px',
                left: isLocationEnabled ? '23px' : '3px',
                transition: 'all 0.3s'
              }} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', position: 'relative' }}>
        <div className="card" style={{ padding: '0', position: 'relative', overflow: 'hidden', height: '100%' }}>
          <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%', zIndex: 1 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredStations.map((stn) => (
              <Marker 
                key={stn.id} 
                position={getPos(stn.district)}
                eventHandlers={{
                  click: () => setSelectedStation(stn),
                }}
              >
                <Popup>
                  <div style={{ padding: '5px' }}>
                    <strong style={{ fontSize: '1rem' }}>{stn.name}</strong>
                    <div style={{ marginTop: '5px' }}>
                      <StatusBadge status={stn.status} />
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {!isLocationEnabled && (
            <div style={{ 
              position: 'absolute', 
              top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(255,255,255,0.7)', 
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div className="card" style={{ maxWidth: '300px', textAlign: 'center', padding: '40px 30px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                <div style={{ color: 'var(--color-danger)', marginBottom: '15px' }}>
                  <Navigation size={56} />
                </div>
                <h3>Location Required</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
                  Please turn on your location to access the Melaka EV Network map and find nearby stations.
                </p>
                <button 
                  onClick={toggleLocation}
                  className="login-btn" 
                  style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                >
                  Enable Location Service
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>District Filter</h3>
            <select 
              className="styled-input"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option>All Districts</option>
              <option>Melaka Tengah</option>
              <option>Alor Gajah</option>
              <option>Jasin</option>
            </select>
          </div>

          <div className="card" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
            {selectedStation ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <img src="/logo.png" alt="Logo" style={{ height: '32px', width: 'auto' }} />
                  <StatusBadge status={selectedStation.status} />
                </div>
                <h3 style={{ margin: '0 0 4px 0' }}>{selectedStation.name}</h3>
                <p style={{ color: 'var(--color-text-muted)', margin: '0 0 20px 0', fontSize: '0.9rem' }}>{selectedStation.district}, Melaka</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ padding: '12px', background: '#f8f8f8', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Rate</div>
                    <div style={{ fontWeight: 700 }}>{selectedStation.price}</div>
                  </div>
                  <div style={{ padding: '12px', background: '#f8f8f8', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Type</div>
                    <div style={{ fontWeight: 700 }}>{selectedStation.type}</div>
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem' }}>Bay Availability</h4>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {selectedStation.bays?.map(bay => (
                      <div key={bay.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'white', border: '1px solid #eee', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Charging Bay #{bay.id}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: bay.status === 'available' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: bay.status === 'available' ? 'var(--color-success)' : 'var(--color-danger)' }}></div>
                          {bay.status === 'available' ? 'Available' : 'Occupied'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="login-btn" style={{ marginTop: '20px' }}>
                  Reserve Now
                </button>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <Search size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
                <p>Select a charging station on the map to view details and availability.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapExplorer;
