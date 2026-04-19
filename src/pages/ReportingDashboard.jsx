import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Download, Zap, BatteryCharging, TrendingUp, Anchor } from 'lucide-react';

const mockChartData = [
  { name: 'Mon', MelakaTengah: 4000, Jasin: 2400, AlorGajah: 2400 },
  { name: 'Tue', MelakaTengah: 3000, Jasin: 1398, AlorGajah: 2210 },
  { name: 'Wed', MelakaTengah: 2000, Jasin: 9800, AlorGajah: 2290 },
  { name: 'Thu', MelakaTengah: 2780, Jasin: 3908, AlorGajah: 2000 },
  { name: 'Fri', MelakaTengah: 1890, Jasin: 4800, AlorGajah: 2181 },
  { name: 'Sat', MelakaTengah: 2390, Jasin: 3800, AlorGajah: 2500 },
  { name: 'Sun', MelakaTengah: 3490, Jasin: 4300, AlorGajah: 2100 },
];

const mockTableData = [
  { id: 'TRX-001', station: 'Stesen EV Melaka Tengah', district: 'Melaka Tengah', duration: '1h 30m', power: '22 kWh', status: 'completed' },
  { id: 'TRX-002', station: 'Stesen EV Jasin', district: 'Jasin', duration: '45m', power: '15 kWh', status: 'completed' },
  { id: 'TRX-003', station: 'Stesen EV Alor Gajah', district: 'Alor Gajah', duration: '2h 10m', power: '40 kWh', status: 'active' },
  { id: 'TRX-004', station: 'Stesen EV Melaka Tengah', district: 'Melaka Tengah', duration: '---', power: '5 kWh', status: 'active' },
  { id: 'TRX-005', station: 'Stesen EV Jasin', district: 'Jasin', duration: '30m', power: '12 kWh', status: 'completed' }
];

const ReportingDashboard = () => {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'District-Demand-Report',
    pageStyle: `
      @page { size: auto; margin: 20mm; }
      @media print { body { -webkit-print-color-adjust: exact; } }
    `
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>District Demand Report</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Overview of power usage and station utilization across Melaka.</p>
        </div>
        <button className="btn-export" onClick={handlePrint}>
          <Download size={18} />
          Export to PDF
        </button>
      </div>

      {/* This ref wraps the content that will be printed */}
      <div ref={componentRef} style={{ background: 'var(--color-background)', padding: '16px' }}>
        {/* KPI Section */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-content">
              <h3>Total Power Dispensed</h3>
              <div className="value">14.2 MWh</div>
              <p style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', marginTop: '8px' }}>
                <TrendingUp size={14}/> +12% from last week
              </p>
            </div>
            <div className="kpi-icon"><Zap size={24} /></div>
          </div>
          <div className="kpi-card">
            <div className="kpi-content">
              <h3>Active Sessions</h3>
              <div className="value">42</div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>
                Across 15 stations
              </p>
            </div>
            <div className="kpi-icon"><BatteryCharging size={24} /></div>
          </div>
          <div className="kpi-card">
            <div className="kpi-content">
              <h3>Highest Demand District</h3>
              <div className="value" style={{ fontSize: '1.5rem', marginTop: '8px' }}>Melaka Tengah</div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>
                64% of total usage
              </p>
            </div>
            <div className="kpi-icon"><Anchor size={24} /></div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Weekly Energy Demand (kWh)</h3>
          </div>
          <div className="card-body" style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="MelakaTengah" name="Melaka Tengah" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Jasin" name="Jasin" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="AlorGajah" name="Alor Gajah" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table Section */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Recent Charging Logs</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Station</th>
                  <th>District</th>
                  <th>Duration</th>
                  <th>Power (kWh)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockTableData.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 500 }}>{log.id}</td>
                    <td>{log.station}</td>
                    <td>{log.district}</td>
                    <td>{log.duration}</td>
                    <td><span style={{ color: 'var(--color-primary-dark)', fontWeight: 600 }}>{log.power}</span></td>
                    <td>
                      <span className={`badge ${log.status}`}>
                        {log.status === 'completed' ? 'Completed' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportingDashboard;
