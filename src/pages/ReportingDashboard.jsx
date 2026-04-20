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

const FormalReportTemplate = React.forwardRef(({ data, tableData }, ref) => {
  return (
    <div ref={ref} className="formal-report">
      <div className="report-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img src="/logo.png" alt="Volt-Park Logo" style={{ width: '180px', height: 'auto', objectFit: 'contain' }} />
              <div style={{ borderLeft: '2px solid #ddd', paddingLeft: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p style={{ margin: 0, fontSize: '1rem', color: '#444', fontWeight: 600, letterSpacing: '0.5px' }}>Melaka EV Charging Network</p>
              </div>
            </div>
            <div style={{ marginTop: '20px', fontSize: '0.85rem', color: '#444' }}>
              <p style={{ margin: '2px 0' }}>Suite 15-B, Menara Stadthuys</p>
              <p style={{ margin: '2px 0' }}>Bandar Hilir, 75000 Melaka, Malaysia</p>
              <p style={{ margin: '2px 0' }}>Contact: +60 6-282 1234 | support@voltpark.my</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, color: '#800000', fontSize: '1.2rem', letterSpacing: '1px' }}>OFFICIAL NETWORK REPORT</h2>
            <div style={{ marginTop: '15px', fontSize: '0.85rem' }}>
              <p style={{ margin: '4px 0' }}><strong>Report ID:</strong> RPT-{new Date().getFullYear()}-{(Math.random() * 10000).toFixed(0)}</p>
              <p style={{ margin: '4px 0' }}><strong>Date:</strong> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p style={{ margin: '4px 0' }}><strong>Status:</strong> FINALIZED</p>
            </div>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h3 className="section-title">Network Performance Summary</h3>
        <table className="formal-table">
          <thead>
            <tr>
              <th>Metric Description</th>
              <th>Current Usage</th>
              <th>Evaluation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Power Dispensed (Network-wide)</td>
              <td><strong>14.2 MWh</strong></td>
              <td style={{ color: 'var(--color-success)' }}>+12% vs Previous Period</td>
            </tr>
            <tr>
              <td>Total Active Charging Sessions</td>
              <td><strong>42 Units</strong></td>
              <td>Nominal Capacity</td>
            </tr>
            <tr>
              <td>Highest Demand District</td>
              <td><strong>Melaka Tengah</strong></td>
              <td>64% System Load</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="report-section">
        <h3 className="section-title">Weekly Energy Consumption Analysis</h3>
        <div style={{ marginTop: '20px' }}>
          <BarChart width={700} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Legend />
            <Bar dataKey="MelakaTengah" name="Melaka Tengah" fill="#800000" isAnimationActive={false} />
            <Bar dataKey="Jasin" name="Jasin" fill="#D4AF37" isAnimationActive={false} />
            <Bar dataKey="AlorGajah" name="Alor Gajah" fill="#2E7D32" isAnimationActive={false} />
          </BarChart>
        </div>
      </div>

      <div className="report-section" style={{ pageBreakBefore: 'always', paddingTop: '20px' }}>
        <h3 className="section-title">Detailed Transaction Records</h3>
        <table className="formal-table">
          <thead>
            <tr>
              <th>Station / Location</th>
              <th>District</th>
              <th>Power (kWh)</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map(log => (
              <tr key={log.id}>
                <td>{log.station}</td>
                <td>{log.district}</td>
                <td>{log.power}</td>
                <td>{log.duration}</td>
                <td style={{ textTransform: 'capitalize' }}>{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="report-footer">
        <p>This is a computer-generated report for the Melaka EV Charging Network. No physical signature is required.</p>
        <p style={{ marginTop: '5px' }}>© {new Date().getFullYear()} Volt-Park Malaysia. Confidential Information.</p>
      </div>
    </div>
  );
});

const ReportingDashboard = () => {
  const componentRef = useRef();
  const printRef = useRef();
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `VoltPark_Network_Report_${new Date().toISOString().split('T')[0]}`,
    pageStyle: `
      @page { size: A4; margin: 15mm; }
      @media print { 
        body { background: white !important; -webkit-print-color-adjust: exact; } 
        .formal-report { display: block !important; }
      }
    `
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>Reporting Dashboard</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Monitor power and station utilization with heritage context.</p>
        </div>
        <button className="btn-export" onClick={handlePrint}>
          <Download size={18} />
          Export Formal Report
        </button>
      </div>

      {/* Visible Dashboard UI - Targets componentRef */}
      <div ref={componentRef}>
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

        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Recent Charging Logs</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="styled-table">
              <thead>
                <tr>
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

      {/* Hidden Formal Template - For Print Only - Uses off-screen positioning and zero opacity so it takes up space/renders but stays invisible */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '800px', opacity: 0, pointerEvents: 'none' }}>
        <FormalReportTemplate ref={printRef} data={mockChartData} tableData={mockTableData} />
      </div>
    </div>
  );
};

export default ReportingDashboard;
