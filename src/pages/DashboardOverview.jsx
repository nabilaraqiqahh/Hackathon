import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Users, Zap, DollarSign, BatteryCharging, AlertTriangle, MessageSquare, Wrench, Info, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AnnouncementDisplay from '../components/AnnouncementDisplay';
import AnnouncementManager from '../components/AnnouncementManager';

const DashboardOverview = () => {
  const { users, stations, payments, announcements, feedbacks, maintenanceTasks, updateBayStatus } = useData();

  const [activeBaySelector, setActiveBaySelector] = useState(null);

  const totalRevenue = payments.reduce((acc, curr) => acc + parseFloat(curr.amount.replace('RM ', '')), 0).toFixed(2);
  const activeStations = stations.filter(s => s.status === 'Online').length;
  const maintenanceStations = stations.filter(s => s.status === 'Maintenance').length;

  // New KPI Calculations
  const pendingIssues = feedbacks?.filter(fb => fb.status === 'Pending').length || 0;
  
  const districtCount = {};
  feedbacks?.forEach(fb => {
    if(fb.district) {
      districtCount[fb.district] = (districtCount[fb.district] || 0) + 1;
    }
  });
  const mostReportedDistrict = Object.keys(districtCount).sort((a,b) => districtCount[b] - districtCount[a])[0] || 'None';

  // Chart Data
  const barData = Object.keys(districtCount).map(district => ({
    name: district,
    Issues: districtCount[district]
  }));

  const typeCount = {};
  feedbacks?.forEach(fb => {
    const t = fb.type === 'issue' ? 'Station Issue' : 'General Feedback';
    typeCount[t] = (typeCount[t] || 0) + 1;
  });
  const pieData = Object.keys(typeCount).map(type => ({
    name: type,
    value: typeCount[type]
  }));
  const COLORS = ['#d32f2f', '#1976d2'];

  return (
    <div>
      <div className="mb-4">
        <h2>Dashboard Overview</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Welcome back. Here's a summary of the EV network status.</p>
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

      {mostReportedDistrict !== 'None' && (
        <div style={{ background: '#f4f7fb', borderLeft: '4px solid var(--color-primary)', padding: '16px', borderRadius: '0 8px 8px 0', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <Info size={24} color="var(--color-primary)" />
          <div>
            <strong>Smart Insight:</strong> {mostReportedDistrict} has the highest number of reported issues, indicating higher maintenance demand or older infrastructure.
          </div>
        </div>
      )}

      <AnnouncementManager />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Reported Issues by District</h3>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                <Bar dataKey="Issues" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Feedback Categories</h3>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>System Activity & Station Bays</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stations.map(stn => {
                const availableBays = stn.bays?.filter(b => b.status === 'available').length || 0;
                const totalBays = stn.bays?.length || 0;
                
                return (
                  <div key={stn.id} style={{ display: 'flex', flexDirection: 'column', padding: '16px', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: stn.status === 'Online' ? 'rgba(45, 138, 39, 0.1)' : 'rgba(211, 47, 47, 0.1)', color: stn.status === 'Online' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          <BatteryCharging size={20} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{stn.name}</h4>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{stn.district}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {availableBays} / {totalBays} Available
                        </div>
                        <span className={`badge ${stn.status.toLowerCase() === 'online' ? 'completed' : 'active'}`} style={{ marginTop: '4px', display: 'inline-block' }}>
                          {stn.status}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {stn.bays?.map(bay => {
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
                                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>Bay {bayIdStr}</div>
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
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
