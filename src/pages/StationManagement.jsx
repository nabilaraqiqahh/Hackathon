import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, MapPin, MoreVertical, Battery, PenTool, Trash } from 'lucide-react';

const StationManagement = () => {
  const { stations, addStation, deleteStation, updateStationStatus } = useData();
  const [showModal, setShowModal] = useState(false);
  const [newStation, setNewStation] = useState({ name: '', district: 'Melaka Tengah', type: 'Fast DC', price: 'RM 15/hour' });

  const handleSubmit = (e) => {
    e.preventDefault();
    addStation({ ...newStation, status: 'Online' });
    setShowModal(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Stations Tracker</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Monitor station health, manage charging bays, and expand the network.</p>
        </div>
        <button className="btn-export" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Station
        </button>
      </div>

      <div className="grid-3">
        {stations.map(stn => (
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
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Bay Availability</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {stn.bays.filter(b => b.status === 'available').length} / {stn.bays.length} Available
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {stn.bays.map(bay => (
                    <div 
                      key={bay.id} 
                      title={`Bay ${bay.id}: ${bay.status}`}
                      style={{ 
                        flex: 1, 
                        height: '8px', 
                        borderRadius: '4px',
                        backgroundColor: bay.status === 'available' ? 'var(--color-success)' : bay.status === 'occupied' ? 'var(--color-danger)' : '#ccc'
                      }} 
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => updateStationStatus(stn.id, stn.status === 'Online' ? 'Maintenance' : 'Online')}
                  className="nav-link" 
                  style={{ flex: 1, padding: '8px', fontSize: '0.85rem', border: '1px solid rgba(0,0,0,0.1)', justifyContent: 'center' }}
                >
                  <PenTool size={14} style={{ marginRight: '6px' }} />
                  {stn.status === 'Online' ? 'Set Offline' : 'Set Online'}
                </button>
                <button 
                  onClick={() => deleteStation(stn.id)}
                  className="nav-link" 
                  style={{ width: '40px', padding: '8px', border: '1px solid rgba(211, 47, 47, 0.2)', color: 'var(--color-danger)', justifyContent: 'center' }}
                >
                  <Trash size={14} />
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
