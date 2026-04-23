import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, MapPin, MoreVertical, Battery, PenTool, Trash } from 'lucide-react';

const StationManagement = () => {
  const { stations, addStation, deleteStation, updateStationStatus, updateBayStatus } = useData();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newStation, setNewStation] = useState({ name: '', district: 'Melaka Tengah', type: 'Fast DC', price: 'RM 15/hour' });

  const filteredStations = stations.filter(stn => 
    stn.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    stn.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    addStation({ ...newStation, status: 'Online' });
    setShowModal(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Stations Tracker</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Monitor station health, manage charging bays, and expand the network.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flex: 1, justifyContent: 'flex-end', minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <input 
              type="text" 
              placeholder="Search stations or districts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 16px', borderRadius: '8px', 
                border: '1px solid rgba(0,0,0,0.1)', background: 'white',
                fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s'
              }}
            />
          </div>
          <button className="btn-export" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Add Station
          </button>
        </div>
      </div>

      <div className="grid-3">
        {filteredStations.map(stn => (
          <div key={stn.id} className="card station-card">
            <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', border: 'none' }}>
              <h3 style={{ margin: 0, color: 'white' }}>{stn.name}</h3>
              <MoreVertical size={20} style={{ color: 'white', cursor: 'pointer' }} />
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                <MapPin size={16} />
                {stn.district}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>Type</div>
                  <div style={{ fontWeight: 600 }}>{stn.type}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>Rate</div>
                  <div style={{ fontWeight: 600 }}>{stn.price}</div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Manage Ports</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {stn.bays.filter(b => b.status === 'available').length} / {stn.bays.length} Live
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {stn.bays.map(bay => {
                    const statusColors = {
                      available: 'var(--color-success)',
                      maintenance: '#f59e0b',
                      occupied: 'var(--color-danger)',
                      full: 'var(--color-danger)'
                    };
                    
                    const cycleStatus = () => {
                      const order = ['available', 'maintenance', 'occupied'];
                      const currentIndex = order.indexOf(bay.status === 'full' ? 'occupied' : bay.status);
                      const nextStatus = order[(currentIndex + 1) % order.length];
                      // Map frontend status back to DB status (Capitalized)
                      const dbStatus = nextStatus === 'available' ? 'Available' : nextStatus === 'maintenance' ? 'Maintenance' : 'Occupied';
                      updateBayStatus(stn.id, bay.id, dbStatus);
                    };

                    return (
                      <button 
                        key={bay.id} 
                        onClick={cycleStatus}
                        title={`Click to cycle status: ${bay.name || 'Port ' + bay.id}`}
                        style={{ 
                          flex: 1,
                          minWidth: '60px',
                          padding: '6px 4px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'white',
                          backgroundColor: statusColors[bay.status] || '#ccc',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                        onMouseOut={e => e.currentTarget.style.filter = 'none'}
                      >
                        {bay.name ? bay.name.replace('Port ', 'P') : `P${bay.id}`}
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.65rem', color: '#888', fontStyle: 'italic' }}>
                  💡 Click port to cycle: Green (Available) → Yellow (Maint.) → Red (Close)
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => deleteStation(stn.id)}
                  className="nav-link" 
                  style={{ flex: 1, padding: '8px', border: '1px solid rgba(211, 47, 47, 0.2)', color: 'var(--color-danger)', justifyContent: 'center' }}
                >
                  <Trash size={14} style={{ marginRight: '6px' }} />
                  Remove Station
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ width: '450px' }}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}>Create New Site</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px' }}>Station Name</label>
                  <input 
                    className="styled-input"
                    required
                    placeholder="e.g. Melaka Gateway Hub"
                    value={newStation.name}
                    onChange={(e) => setNewStation({...newStation, name: e.target.value})}
                  />
                </div>
                <div className="mb-2">
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px' }}>District</label>
                  <select 
                    className="styled-input"
                    value={newStation.district}
                    onChange={(e) => setNewStation({...newStation, district: e.target.value})}
                  >
                    <option value="Melaka Tengah">Melaka Tengah</option>
                    <option value="Jasin">Jasin</option>
                    <option value="Alor Gajah">Alor Gajah</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px' }}>Charging Type</label>
                  <select 
                    className="styled-input"
                    value={newStation.type}
                    onChange={(e) => setNewStation({...newStation, type: e.target.value})}
                  >
                    <option value="Fast DC">Fast DC (60kW+)</option>
                    <option value="AC Standard">AC Standard (22kW)</option>
                    <option value="Ultra Fast">Ultra Fast (150kW+)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn-export" style={{ flex: 1, justifyContent: 'center' }}>Deploy Station</button>
                  <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: '#eee', borderRadius: '8px', fontWeight: 600 }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationManagement;
