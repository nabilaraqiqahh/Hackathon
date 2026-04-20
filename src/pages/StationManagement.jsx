import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, MapPin, MoreVertical, Battery, PenTool, Trash, X } from 'lucide-react';

const StationManagement = () => {
  const { stations, addStation, deleteStation, updateStationStatus, updateBayStatus } = useData();
  const [showModal, setShowModal] = useState(false);
  const [activeBaySelector, setActiveBaySelector] = useState(null);
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
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {stn.bays.map(bay => {
                    const isSelected = activeBaySelector?.stationId === stn.id && activeBaySelector?.bayId === bay.id;
                    const bayIdStr = `B${String(bay.id).padStart(3, '0')}`;
                    
                    let color = '#ccc';
                    if (bay.status === 'available') color = '#2d8a27'; // Green
                    else if (bay.status === 'occupied') color = '#f5a623'; // Yellow
                    else if (bay.status === 'offline') color = '#d32f2f'; // Red

                    return (
                      <div key={bay.id} style={{ position: 'relative' }}>
                        <div 
                          onClick={() => setActiveBaySelector(isSelected ? null : { stationId: stn.id, bayId: bay.id })}
                          style={{ 
                            width: '40px', height: '40px', borderRadius: '8px', 
                            backgroundColor: color, cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                            boxShadow: isSelected ? `0 0 0 2px #fff, 0 0 0 4px ${color}, 0 4px 8px rgba(0,0,0,0.1)` : '0 2px 4px rgba(0,0,0,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          title={`Bay ${bayIdStr} - ${bay.status}`}
                          onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.transform = 'scale(1.08)'; }}
                          onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                           <span style={{color: 'white', fontSize: '0.7rem', fontWeight: 'bold'}}>{bay.id}</span>
                        </div>

                        {isSelected && (
                          <div style={{
                            position: 'absolute', top: '50px', left: '50%', transform: 'translateX(-50%)',
                            background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '16px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 50, minWidth: '180px',
                            animation: 'fadeIn 0.2s ease-out'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                              <div style={{ fontWeight: 600, fontSize: '1rem', color: '#333' }}>Bay {bayIdStr}</div>
                              <X size={16} style={{ cursor: 'pointer', color: '#999' }} onClick={(e) => { e.stopPropagation(); setActiveBaySelector(null); }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateBayStatus(stn.id, bay.id, 'available'); setActiveBaySelector(null); }}
                                style={{ 
                                  padding: '8px', fontSize: '0.85rem', color: '#2d8a27', background: 'transparent',
                                  border: '1px solid #2d8a27', borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(45, 138, 39, 0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                Set Available
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateBayStatus(stn.id, bay.id, 'offline'); setActiveBaySelector(null); }}
                                style={{ 
                                  padding: '8px', fontSize: '0.85rem', color: '#d32f2f', background: 'transparent',
                                  border: '1px solid #d32f2f', borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(211, 47, 47, 0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                Set Offline
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button 
                  onClick={() => deleteStation(stn.id)}
                  style={{ width: '40px', height: '40px', padding: '8px', border: '1px solid rgba(211, 47, 47, 0.2)', color: 'var(--color-danger)', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(211, 47, 47, 0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  title="Delete Station"
                >
                  <Trash size={16} />
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
