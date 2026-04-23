import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { Play, Square, CheckCircle, Zap, Leaf, Clock } from 'lucide-react';

export const BookingHistory = () => {
  const { reservations, currentUser, updateReservation, stations, releaseHold, addPayment } = useData();
  const isAdmin = currentUser?.type === 'Admin';
  
  // Sort from newest to oldest
  const sortedReservations = [...reservations].sort((a, b) => {
    return (b.reservation_id || b.id) - (a.reservation_id || a.id);
  });
  
  const displayedReservations = isAdmin ? sortedReservations : sortedReservations.filter(r => r.user === currentUser?.name || r.user_id === currentUser?.id);

  const [activeSession, setActiveSession] = useState(null);
  const [completedSession, setCompletedSession] = useState(null);
  
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [energyDelivered, setEnergyDelivered] = useState(0);
  const [runningCost, setRunningCost] = useState(0);
  const [batterySoc, setBatterySoc] = useState(0);
  
  const tickRef = useRef(null);
  const statsRef = useRef({ time: 0, energy: 0, cost: 0, soc: 0 });

  useEffect(() => {
    if (activeSession) {
      // Parse exact rate from API text (e.g. "DC @ RM 1.70/kWh" -> 1.70)
      let numericRate = activeSession.connector?.includes('DC') ? 1.20 : 0.90;
      if (activeSession.rate) {
        const matches = activeSession.rate.match(/RM\s*(\d+\.\d+)/i) || activeSession.rate.match(/(\d+\.\d+)\s*\/kWh/i);
        if (matches) numericRate = parseFloat(matches[1]);
      }
      
      // Parse exact power from payload (e.g. "110kW" -> 110)
      let numericPower = activeSession.connector?.includes('DC') ? 120 : 11;
      if (activeSession.power) {
        const pMatch = activeSession.power.match(/(\d+)\s*kW/i);
        if (pMatch) numericPower = parseFloat(pMatch[1]);
      }

      const targetAmount = parseFloat(activeSession.targetAmount) || 0;

      tickRef.current = setInterval(() => {
        // 1 real second = 60 simulated seconds (1 minute)
        const energyPerTick = (numericPower / 3600) * 60; // dynamically calculated kWh based on API power
        const costPerTick = energyPerTick * numericRate; // dynamically calculated RM based on API rate
        
        statsRef.current.time += 60; // advance 60 simulated seconds
        statsRef.current.energy += energyPerTick;
        statsRef.current.cost += costPerTick;
        statsRef.current.soc += (energyPerTick / 80) * 100; // assuming 80kWh battery
        if (statsRef.current.soc > 100) statsRef.current.soc = 100;
        
        setElapsedSeconds(statsRef.current.time);
        setEnergyDelivered(statsRef.current.energy);
        setRunningCost(statsRef.current.cost);
        setBatterySoc(statsRef.current.soc);

        if ((targetAmount > 0 && statsRef.current.cost >= targetAmount) || statsRef.current.soc >= 100) {
          handleStop(activeSession, true);
        }
      }, 1000);
    }
    return () => clearInterval(tickRef.current);
  }, [activeSession]);

  const handleStart = (res) => {
    const stn = stations.find(s => s.district === res.station || s.name === res.station || s.id === res.station_id);
    if (stn && (stn.status === 'Maintenance' || stn.status === 'Offline')) {
      alert(`Cannot start charging. Station is currently under ${stn.status}.`);
      return;
    }
    
    const initialSoc = Math.floor(Math.random() * 30) + 10; // Start at 10-40%
    statsRef.current = { time: 0, energy: 0, cost: 0, soc: initialSoc };
    setElapsedSeconds(0);
    setEnergyDelivered(0);
    setRunningCost(0);
    setBatterySoc(initialSoc);
    
    updateReservation(res.reservation_id || res.id, { status: 'Active' });
    setActiveSession(res);
  };

  const handleStop = (res, isAuto = false) => {
    if (tickRef.current) clearInterval(tickRef.current);
    
    const finalEnergy = statsRef.current.energy.toFixed(1);
    const finalCost = statsRef.current.cost.toFixed(2);
    const m = Math.floor(statsRef.current.time / 60).toString().padStart(2, '0');
    const s = (statsRef.current.time % 60).toString().padStart(2, '0');
    const finalTime = `${m}:${s}`;

    const targetAmount = parseFloat(res.targetAmount) || 0;

    // Settlement
    const refundAmount = targetAmount > finalCost ? (targetAmount - finalCost).toFixed(2) : 0;
    releaseHold(targetAmount, finalCost);
    addPayment({
      user_id: currentUser.id,
      user: res.user,
      amount: `RM ${finalCost}`,
      date: new Date().toISOString().split('T')[0],
      method: res.paymentMethod || 'Visa •••• 4242',
      energy: `${finalEnergy} kWh`,
      receipt: `RCP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Success'
    });

    updateReservation(res.reservation_id || res.id, { 
      status: 'Completed', 
      actualDuration: finalTime,
      actualCost: finalCost,
      actualEnergy: finalEnergy
    });

    setActiveSession(null);
    setCompletedSession({ ...res, actualDuration: finalTime, actualEnergy: finalEnergy, refundAmount });
    
    // Redirect to payment history after a short delay
    setTimeout(() => {
      setCompletedSession(null);
      navigate('/payment');
    }, 2500);
  };

  return (
    <div>
      <div className="mb-4">
        <h2>{isAdmin ? 'All Reservations' : 'My Reservations'}</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          {isAdmin ? 'Monitor and track all user bookings across the EV network.' : 'View your upcoming and past charging station bookings.'}
        </p>
      </div>
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="styled-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>No.</th>
                {isAdmin && <th>Driver Name</th>}
                <th>Station</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Connector & Power</th>
                <th>Status</th>
                {!isAdmin && <th style={{ textAlign: 'center' }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {displayedReservations.map((res, index) => (
                <tr key={res.id || index}>
                  <td style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>{index + 1}</td>
                  {isAdmin && <td style={{ fontWeight: 500 }}>{res.user}</td>}
                  <td style={{ fontWeight: 600 }}>{res.station}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500 }}>{res.date}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{res.time}</span>
                    </div>
                  </td>
                  <td style={{ color: res.status === 'Active' ? 'var(--color-primary)' : 'inherit', fontWeight: res.status === 'Active' ? 600 : 400 }}>
                    {res.status === 'Confirmed' ? '-' : 
                     res.status === 'Active' ? 'Charging...' : 
                     (res.actualDuration || res.duration || 'N/A')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500 }}>{res.connector || 'Unknown'}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{res.power || '-'}</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      className={`badge ${res.status.toLowerCase() === 'confirmed' ? 'active' : (res.status.toLowerCase() === 'active' ? 'active' : 'completed')}`}
                      style={res.status.toLowerCase() === 'active' ? { background: 'rgba(46, 125, 50, 0.1)', color: '#2E7D32', animation: 'pulse 2s infinite' } : {}}
                    >
                      {res.status === 'Active' ? 'Charging' : res.status}
                    </span>
                  </td>
                  {!isAdmin && (
                    <td style={{ textAlign: 'center' }}>
                      {res.status === 'Confirmed' && (
                        <button onClick={() => handleStart(res)} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = 0.8} onMouseOut={e => e.currentTarget.style.opacity = 1}>
                          <Play size={14} /> Start
                        </button>
                      )}
                      {res.status === 'Active' && (
                        <button onClick={() => setActiveSession(res)} style={{ background: 'var(--color-warning)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = 0.8} onMouseOut={e => e.currentTarget.style.opacity = 1}>
                          <Zap size={14} /> View
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {displayedReservations.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    No reservations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeSession && (
        <div className="modal-overlay" style={{ zIndex: 999 }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', margin: '20px', padding: '0', overflow: 'hidden' }}>
            {runningCost >= activeSession.targetAmount - 5 && (
              <div style={{ background: '#F57C00', color: 'white', padding: '12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                ⚠️ Nearing limit. Session will stop at RM {activeSession.targetAmount}.00.
              </div>
            )}
            <div style={{ background: 'var(--color-primary)', color: 'white', padding: '24px', textAlign: 'center', position: 'relative' }}>
              <Zap size={48} style={{ opacity: 0.8, marginBottom: '12px', animation: 'pulse 2s infinite' }} />
              <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem' }}>Charging in Progress</h2>
              <p style={{ margin: '8px 0 0', opacity: 0.8 }}>{activeSession.station}</p>
            </div>
            
            <div style={{ padding: '32px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Energy</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{energyDelivered.toFixed(2)} <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>kWh</span></div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Battery</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{Math.floor(batterySoc)}%</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Time</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)', fontFamily: 'monospace' }}>
                    {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:{ (elapsedSeconds % 60).toString().padStart(2, '0') }
                  </div>
                </div>
              </div>
              
              <div style={{ background: '#f8f8f8', borderRadius: '12px', padding: '20px', marginBottom: '32px', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Running Cost</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>RM {runningCost.toFixed(2)}</div>
                  </div>
                  <div style={{ textAlign: 'right', paddingBottom: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Target Limit</div>
                    <div style={{ fontWeight: 600 }}>RM {activeSession.targetAmount}.00</div>
                  </div>
                </div>
                
                <div style={{ width: '100%', height: '8px', background: '#ddd', borderRadius: '4px', marginTop: '16px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (runningCost / activeSession.targetAmount) * 100)}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 1s linear' }}></div>
                </div>
              </div>

              <button 
                className="login-btn" 
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', background: 'var(--color-danger)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                onClick={() => handleStop(activeSession)}
              >
                <Square size={20} /> Stop Charging
              </button>
            </div>
          </div>
        </div>
      )}

      {completedSession && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '20px', overflow: 'hidden', textAlign: 'center' }}>
            <div style={{ background: 'rgba(45, 138, 39, 0.1)', padding: '30px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CheckCircle size={56} color="var(--color-success)" style={{ marginBottom: '16px' }} />
              <h3 style={{ margin: 0, color: 'var(--color-success)' }}>Charging Complete!</h3>
              <p style={{ margin: '8px 0 0 0', color: 'var(--color-text-main)', fontWeight: 500 }}>{completedSession.station}</p>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#f8f8f8', padding: '16px', borderRadius: '12px' }}>
                  <Zap size={24} color="var(--color-warning)" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Energy</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{completedSession.actualEnergy || '34.5'} kWh</div>
                </div>
                <div style={{ background: '#f8f8f8', padding: '16px', borderRadius: '12px' }}>
                  <Clock size={24} color="var(--color-primary)" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Time</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{completedSession.actualDuration || completedSession.duration}</div>
                </div>
              </div>
              <div style={{ background: 'rgba(46, 125, 50, 0.05)', border: '1px solid rgba(46, 125, 50, 0.1)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', textAlign: 'left' }}>
                <Leaf size={24} color="var(--color-success)" />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>Eco Impact</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>You saved ~{(Math.random() * 5 + 5).toFixed(1)}kg of CO2 today!</div>
                </div>
              </div>
              
              {completedSession.refundAmount > 0 && (
                <div style={{ background: 'rgba(46, 125, 50, 0.05)', border: '1px solid rgba(46, 125, 50, 0.1)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', textAlign: 'left' }}>
                  <CheckCircle size={24} color="var(--color-success)" />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>Refund Processed</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>RM {completedSession.refundAmount} has been released back to your card.</div>
                  </div>
                </div>
              )}

              <button className="login-btn" style={{ width: '100%', padding: '14px' }} onClick={() => setCompletedSession(null)}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export const PaymentHistory = () => {
  const { payments, currentUser } = useData();
  const isAdmin = currentUser?.type === 'Admin';
  
  // Sort from newest to oldest
  const sortedPayments = [...payments].sort((a, b) => {
    return (b.payment_id || b.id) - (a.payment_id || a.id);
  });
  
  const displayedPayments = isAdmin ? sortedPayments : sortedPayments.filter(p => p.user === currentUser?.name || p.user_id === currentUser?.id);

  return (
    <div>
      <div className="mb-4">
        <h2>{isAdmin ? 'All Payments' : 'Payment History'}</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          {isAdmin ? 'Financial overview and transaction history.' : 'Your past charging sessions and billing.'}
        </p>
      </div>
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="styled-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>No.</th>
                {isAdmin && <th>Driver Name</th>}
                <th>Date</th>
                <th>Energy Charged</th>
                <th>Payment Method</th>
                <th>Receipt No.</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedPayments.map((pay, index) => (
                <tr key={pay.id || index}>
                  <td style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>{index + 1}</td>
                  {isAdmin && <td style={{ fontWeight: 500 }}>{pay.user}</td>}
                  <td>{pay.date}</td>
                  <td>{pay.energy || 'N/A'}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                      {pay.method || 'Card'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{pay.receipt || `RCP-00${index+1}`}</td>
                  <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                    RM {typeof pay.amount === 'number' || !isNaN(parseFloat(pay.amount)) 
                      ? (parseFloat(pay.amount).toFixed(2)) 
                      : pay.amount}
                  </td>
                  <td>
                    <span className="badge completed">Success</span>
                  </td>
                </tr>
              ))}
              {displayedPayments.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    No payment history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
