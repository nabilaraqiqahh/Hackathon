import React from 'react';
import { useData } from '../context/DataContext';
import { MapPin, Navigation, Info } from 'lucide-react';

const MapExplorer = () => {
  const { stations } = useData();

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Map Explorer</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Visual overview of the Melaka EV Charging network.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <div className="bay-indicator available"></div> Available
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <div className="bay-indicator occupied"></div> Busy
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <div className="bay-indicator offline"></div> Maintenance
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        <div className="card" style={{ padding: '0', position: 'relative', overflow: 'hidden', background: '#e0dfdb' }}>
          {/* Mock Map Background avec pattern Melaka-ish */}
          <div style={{ 
            width: '100%', height: '100%', 
            backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', 
            backgroundSize: '20px 20px', 
            position: 'absolute', opacity: 0.5 
          }} />
          
          <div style={{ position: 'absolute', top: '10%', left: '10%', padding: '10px', background: 'white', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ margin: 0 }}>Alor Gajah</h4>
          </div>
          <div style={{ position: 'absolute', bottom: '20%', left: '40%', padding: '10px', background: 'white', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ margin: 0 }}>Melaka Tengah</h4>
          </div>
          <div style={{ position: 'absolute', bottom: '40%', right: '15%', padding: '10px', background: 'white', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ margin: 0 }}>Jasin</h4>
          </div>

          {/* Station Pins */}
          {stations.map((stn, i) => {
            const positions = [
              { top: '60%', left: '45%' },
              { top: '55%', left: '80%' },
              { top: '25%', left: '20%' },
              { top: '40%', left: '50%' }
            ];
            const pos = positions[i % positions.length];
            return (
              <div 
                key={stn.id}
                style={{ 
                  position: 'absolute', 
                  ...pos, 
                  transform: 'translate(-50%, -100%)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{ 
                  background: stn.status === 'Online' ? 'white' : '#f8d7da', 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginBottom: '4px',
                  whiteSpace: 'nowrap',
                  border: `2px solid ${stn.status === 'Online' ? 'var(--color-success)' : 'var(--color-danger)'}`
                }}>
                  {stn.name.split(' ').pop()}
                </div>
                <MapPin size={32} fill={stn.status === 'Online' ? 'var(--color-success)' : 'var(--color-danger)'} color="white" />
              </div>
            );
          })}
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Station Details</h3>
          </div>
          <div className="card-body" style={{ flex: 1, overflowY: 'auto' }}>
            <div className="mb-3" style={{ padding: '16px', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', background: 'white' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--color-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifySelf: 'center', color: 'white', padding: '8px' }}>
                  <Navigation size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>Stesen EV Melaka Tengah</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Bandar Hilir, Melaka</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>AVAILABILITY</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-success)' }}>2 / 4 Units</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>CHARGER TYPE</div>
                  <div style={{ fontWeight: 700 }}>Fast DC (60kW)</div>
                </div>
              </div>
              <button className="btn-export" style={{ width: '100%', justifyContent: 'center' }}>Book Now</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-accent)' }}>
              <Info size={16} />
              <div style={{ fontSize: '0.85rem' }}>Select a pin on the map to view detailed availability and technical specs.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapExplorer;
