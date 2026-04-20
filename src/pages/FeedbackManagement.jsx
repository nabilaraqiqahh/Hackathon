import React, { useState } from 'react';
import { Search, Wrench, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';

const FeedbackManagement = () => {
  const { feedbacks, stations, assignMaintenance } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [maintenanceForm, setMaintenanceForm] = useState({
    scheduledDate: '',
    technician: '',
    notes: '',
    bayId: ''
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending': return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Pending</span>;
      case 'In Progress': return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Wrench size={12}/> In Progress</span>;
      case 'Resolved': return <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12}/> Resolved</span>;
      default: return <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{status}</span>;
    }
  };

  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchesSearch = fb.station?.toLowerCase().includes(searchTerm.toLowerCase()) || fb.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || fb.status === statusFilter;
    const matchesDistrict = districtFilter === 'All' || fb.district === districtFilter;
    return matchesSearch && matchesStatus && matchesDistrict;
  });

  const handleAssign = (e) => {
    e.preventDefault();
    assignMaintenance(selectedFeedback.id, maintenanceForm);
    setShowModal(false);
    setSelectedFeedback(null);
    setMaintenanceForm({ scheduledDate: '', technician: '', notes: '', bayId: '' });
  };

  return (
    <div className="feedback-management">
      <div className="mb-4">
        <h2>Feedback Management</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Review user feedback and assign maintenance actions.</p>
      </div>

      <div className="card">
        <div className="card-header" style={{ padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by Report ID or Station..." 
              style={{ padding: '10px 10px 10px 44px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', width: '100%', outline: 'none' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <select className="styled-input" style={{ width: '160px', margin: 0, padding: '10px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select className="styled-input" style={{ width: '170px', margin: 0, padding: '10px' }} value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
              <option value="All">All Districts</option>
              <option value="Melaka Tengah">Melaka Tengah</option>
              <option value="Alor Gajah">Alor Gajah</option>
              <option value="Jasin">Jasin</option>
            </select>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {searchTerm && (
            <div style={{ background: '#f4f7fb', padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: '0.9rem', color: '#1e3a8a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Showing results for <strong>"{searchTerm}"</strong></span>
              <span className="badge" style={{ background: 'var(--color-primary)', color: 'white' }}>{filteredFeedbacks.length} found</span>
            </div>
          )}
          <table className="styled-table">
          <thead>
            <tr>
              <th>Station / District</th>
              <th>Type</th>
              <th>Description</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedbacks.length > 0 ? filteredFeedbacks.map(fb => (
              <tr key={fb.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{fb.station || 'General System'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{fb.district || '-'}</div>
                </td>
                <td style={{ textTransform: 'capitalize' }}>
                  {fb.type === 'issue' ? (
                    <span style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 500 }}><AlertCircle size={16} /> Issue</span>
                  ) : (
                    <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 500 }}><CheckCircle size={16} /> General</span>
                  )}
                </td>
                <td>
                  <div style={{ maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fb.message}</div>
                </td>
                <td>{fb.createdAt}</td>
                <td>{getStatusBadge(fb.status)}</td>
                <td>
                  <button 
                    className="btn-export" 
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    onClick={() => { setSelectedFeedback(fb); setShowModal(true); }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#888' }}>No feedback reports found.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {showModal && selectedFeedback && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ width: '540px', margin: '4vh auto', padding: '24px' }}>
            <div className="card-header" style={{ padding: '0 0 16px 0', borderBottom: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Report Details: {selectedFeedback.id}</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>&times;</button>
              </div>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Station</div>
                  <div style={{ fontWeight: 600 }}>{selectedFeedback.station || 'General'}</div>
                </div>
                <div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Date Submitted</div>
                   <div style={{ fontWeight: 600 }}>{selectedFeedback.createdAt}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Issue Description</div>
                <div style={{ padding: '16px', background: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', lineHeight: '1.5' }}>
                  {selectedFeedback.message}
                </div>
              </div>
            </div>

            {selectedFeedback.status === 'Pending' && selectedFeedback.type === 'issue' ? (
              <form onSubmit={handleAssign} style={{ borderTop: '2px dashed rgba(0,0,0,0.1)', paddingTop: '24px' }}>
                <h4 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: 'var(--color-primary)' }}>Assign Maintenance</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600, color: 'var(--color-text-main)' }}>Scheduled Date <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                    <input type="date" className="styled-input" required value={maintenanceForm.scheduledDate} onChange={e => setMaintenanceForm({...maintenanceForm, scheduledDate: e.target.value})} style={{ width: '100%', margin: 0 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600, color: 'var(--color-text-main)' }}>Technician (Optional)</label>
                    <input type="text" className="styled-input" placeholder="e.g. John Doe" value={maintenanceForm.technician} onChange={e => setMaintenanceForm({...maintenanceForm, technician: e.target.value})} style={{ width: '100%', margin: 0 }} />
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600, color: 'var(--color-text-main)' }}>Target Bay (Optional) <span style={{color: 'var(--color-text-muted)', fontWeight: 'normal'}}> - Leave empty to take down entire station</span></label>
                  <select className="styled-input" value={maintenanceForm.bayId} onChange={e => setMaintenanceForm({...maintenanceForm, bayId: e.target.value})} style={{ width: '100%', margin: 0 }}>
                    <option value="">-- Apply to entire station --</option>
                    {stations.find(s => s.name.includes(selectedFeedback.station) || s.district === selectedFeedback.station)?.bays.map(bay => (
                      <option key={bay.id} value={bay.id}>Bay {bay.id} ({bay.status})</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600, color: 'var(--color-text-main)' }}>Action Notes</label>
                  <textarea className="styled-input" rows="3" placeholder="Instructions/Parts needed" value={maintenanceForm.notes} onChange={e => setMaintenanceForm({...maintenanceForm, notes: e.target.value})} style={{ width: '100%', resize: 'vertical', margin: 0 }}></textarea>
                </div>
                
                <div style={{ background: 'rgba(211, 47, 47, 0.05)', borderLeft: '4px solid var(--color-danger)', color: 'var(--color-danger)', padding: '16px', borderRadius: '0 8px 8px 0', fontSize: '0.9rem', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <AlertCircle size={20} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>Automated Status Update:</strong>
                    {maintenanceForm.bayId ? (
                      <span>Assigning maintenance will set <strong>Bay {maintenanceForm.bayId}</strong> at {selectedFeedback.station} to "Offline".</span>
                    ) : (
                      <span>Assigning maintenance will set the entire <strong>{selectedFeedback.station}</strong> to "Under Maintenance" with 0 available bays.</span>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-export" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                  <button type="submit" className="login-btn" style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <Wrench size={18} />
                    Confirm Assignment
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                <button onClick={() => setShowModal(false)} className="login-btn" style={{ width: '100%', padding: '14px' }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;
