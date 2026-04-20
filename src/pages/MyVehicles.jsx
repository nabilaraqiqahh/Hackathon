import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Car, Hash, Plus, Edit2, Trash2, X, Save } from 'lucide-react';

const MyVehicles = () => {
  const { currentUser, addVehicle, updateVehicle, deleteVehicle } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ platNo: '', carModel: '' });

  const resetForm = () => {
    setFormData({ platNo: '', carModel: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (vehicle) => {
    setFormData({ platNo: vehicle.platNo, carModel: vehicle.carModel });
    setEditingId(vehicle.id);
    setIsAdding(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateVehicle(currentUser.id, { id: editingId, ...formData });
    } else {
      addVehicle(currentUser.id, formData);
    }
    resetForm();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ paddingBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0' }}>My Vehicles</h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Manage your EV fleet</p>
        </div>
        {(!isAdding && !editingId) && (
          <button 
            onClick={() => setIsAdding(true)}
            className="btn-export" 
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            <Plus size={16} />
            Add Vehicle
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="card" style={{ marginBottom: '24px', border: '1px solid var(--color-primary)' }}>
          <div className="card-header" style={{ background: 'rgba(128,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="grid-3" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Plat No</label>
                  <div className="input-with-icon" style={{ position: 'relative' }}>
                    <Hash className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input type="text" value={formData.platNo} onChange={e => setFormData({...formData, platNo: e.target.value})} className="styled-input" style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }} required placeholder="e.g. VFD 1234" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Car Model</label>
                  <div className="input-with-icon" style={{ position: 'relative' }}>
                    <Car className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input type="text" value={formData.carModel} onChange={e => setFormData({...formData, carModel: e.target.value})} className="styled-input" style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }} required placeholder="e.g. BYD Seal" />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="login-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
                  <Save size={18} />
                  Save Vehicle
                </button>
                <button type="button" onClick={resetForm} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}>
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {(!currentUser?.vehicles || currentUser.vehicles.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
              <Car size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
              <p>No vehicles added yet.</p>
            </div>
          ) : (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Plat No</th>
                  <th>Car Model</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUser.vehicles.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600 }}>{v.platNo}</td>
                    <td>{v.carModel}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEdit(v)} style={{ background: 'transparent', color: 'var(--color-primary)', padding: '6px', borderRadius: '6px', border: '1px solid var(--color-primary)' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteVehicle(currentUser.id, v.id)} style={{ background: 'transparent', color: 'var(--color-danger)', padding: '6px', borderRadius: '6px', border: '1px solid var(--color-danger)' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyVehicles;
