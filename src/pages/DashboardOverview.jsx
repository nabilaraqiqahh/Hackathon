import React from 'react';
import { useData } from '../context/DataContext';
import { Users, Zap, DollarSign, BatteryCharging, AlertTriangle } from 'lucide-react';

const DashboardOverview = () => {
  const { users, stations, payments } = useData();

  const totalRevenue = payments.reduce((acc, curr) => acc + parseFloat(curr.amount.replace('RM ', '')), 0).toFixed(2);
  const activeStations = stations.filter(s => s.status === 'Online').length;
  const maintenanceStations = stations.filter(s => s.status === 'Maintenance').length;

  return (
    <div>
      <div className="mb-4">
        <h2>Dashboard Overview</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Welcome back, Admin. Here's a summary of the EV network status.</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-content">
            <h3>Total Users</h3>
            <div className="value">{users.length}</div>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Registered accounts</p>
          </div>
          <div className="kpi-icon"><Users size={24} /></div>
        </div>
        <div className="kpi-card" style={{ borderTopColor: 'var(--color-success)' }}>
          <div className="kpi-content">
            <h3>Active Chargers</h3>
            <div className="value">{activeStations}</div>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Units currently online</p>
          </div>
          <div className="kpi-icon" style={{ color: 'var(--color-success)', background: 'rgba(45, 138, 39, 0.1)' }}>
            <Zap size={24} />
          </div>
        </div>
        <div className="kpi-card" style={{ borderTopColor: 'var(--color-accent)' }}>
          <div className="kpi-content">
            <h3>Total Revenue</h3>
            <div className="value">RM {totalRevenue}</div>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Accumulated earnings</p>
          </div>
          <div className="kpi-icon"><DollarSign size={24} /></div>
        </div>
        <div className="kpi-card" style={{ borderTopColor: 'var(--color-danger)' }}>
          <div className="kpi-content">
            <h3>Maintenance</h3>
            <div className="value">{maintenanceStations}</div>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Units requiring attention</p>
          </div>
          <div className="kpi-icon" style={{ color: 'var(--color-danger)', background: 'rgba(211, 47, 47, 0.1)' }}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>System Activity</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stations.map(stn => (
                <div key={stn.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', background: stn.status === 'Online' ? 'rgba(45, 138, 39, 0.1)' : 'rgba(211, 47, 47, 0.1)', color: stn.status === 'Online' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      <BatteryCharging size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{stn.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{stn.district}</p>
                    </div>
                  </div>
                  <span className={`badge ${stn.status.toLowerCase() === 'online' ? 'completed' : 'active'}`}>
                    {stn.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
