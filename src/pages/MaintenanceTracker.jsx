import React, { useState } from 'react';
import { CheckCircle, Clock, CheckCircle2, ListTodo, Wrench } from 'lucide-react';
import { useData } from '../context/DataContext';

const MaintenanceTracker = () => {
  const { maintenanceTasks, completeMaintenance } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredTasks = maintenanceTasks.filter(task => {
    const matchesSearch = task.station?.toLowerCase().includes(searchTerm.toLowerCase()) || task.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Ongoing': return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Ongoing</span>;
      case 'Scheduled': return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ListTodo size={12}/> Scheduled</span>;
      case 'Completed': return <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12}/> Completed</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const handleComplete = (taskId, stationName) => {
    if(window.confirm(`Are you sure you want to mark maintenance at ${stationName} as completed? This will set the station back online and restore all bays.`)) {
      completeMaintenance(taskId);
    }
  };

  return (
    <div className="maintenance-tracker">
      <div className="mb-4">
        <h2>Maintenance Tracker</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Manage ongoing technical tasks and station repairs.</p>
      </div>

      <div className="card">
        <div className="card-header" style={{ padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Wrench size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by Task ID or Station..." 
              style={{ padding: '10px 10px 10px 44px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', width: '100%', outline: 'none' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <select className="styled-input" style={{ width: '160px', margin: 0, padding: '10px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {searchTerm && (
            <div style={{ background: '#f4f7fb', padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: '0.9rem', color: '#1e3a8a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Showing results for <strong>"{searchTerm}"</strong></span>
              <span className="badge" style={{ background: 'var(--color-primary)', color: 'white' }}>{filteredTasks.length} found</span>
            </div>
          )}
          <table className="styled-table">
          <thead>
            <tr>
              <th>Station Details</th>
              <th>Issue / Notes</th>
              <th>Date Assigned</th>
              <th>Technician</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? filteredTasks.map(task => (
              <tr key={task.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{task.station}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Ref: {task.feedbackId}</div>
                </td>
                <td>
                  <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>{task.issueDetails}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{task.notes || 'No extra notes'}</div>
                </td>
                <td>{task.scheduledDate}</td>
                <td>{task.technician || 'Not Assigned'}</td>
                <td>{getStatusBadge(task.status)}</td>
                <td>
                  {task.status !== 'Completed' ? (
                    <button 
                      className="login-btn" 
                      style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => handleComplete(task.id, task.station)}
                    >
                      <CheckCircle size={16} /> Complete Task
                    </button>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Completed</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#888' }}>No maintenance tasks found.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceTracker;
