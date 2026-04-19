import React from 'react';
import { useData } from '../context/DataContext';
import { Calendar, Clock, MapPin, Search } from 'lucide-react';

export const BookingHistory = () => {
  const { reservations, currentUser } = useData();
  const isAdmin = currentUser?.type === 'Admin';
  const displayedReservations = isAdmin ? reservations : reservations.filter(r => r.user === currentUser?.name);

  return (
    <div>
      <div className="mb-4">
        <h2>Reservations</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Monitor and track all user bookings across the EV network.</p>
      </div>
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Driver Name</th>
                <th>Station</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedReservations.map(res => (
                <tr key={res.id}>
                  <td style={{ fontWeight: 600 }}>{res.id}</td>
                  <td>{res.user}</td>
                  <td>{res.station}</td>
                  <td>{res.date}</td>
                  <td>{res.time}</td>
                  <td>
                    <span className={`badge ${res.status.toLowerCase() === 'confirmed' ? 'active' : 'completed'}`}>
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const PaymentHistory = () => {
  const { payments, currentUser } = useData();
  const isAdmin = currentUser?.type === 'Admin';
  const displayedPayments = isAdmin ? payments : payments.filter(p => p.user === currentUser?.name);

  return (
    <div>
      <div className="mb-4">
        <h2>Payments & Billing</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Financial overview and transaction history for the charging network.</p>
      </div>
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User / Driver</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedPayments.map(pay => (
                <tr key={pay.id}>
                  <td style={{ fontWeight: 600 }}>{pay.id}</td>
                  <td>{pay.user}</td>
                  <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{pay.amount}</td>
                  <td>{pay.date}</td>
                  <td>
                    <span className="badge completed">Success</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
