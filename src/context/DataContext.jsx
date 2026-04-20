import React, { createContext, useState, useContext, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  const API_BASE = 'http://localhost:8000/backend/api';

  // Fetch all initial data
  const fetchAllData = async () => {
    try {
      const [usersRes, stationsRes, resRes, payRes] = await Promise.all([
        fetch(`${API_BASE}/users_api.php`),
        fetch(`${API_BASE}/stations_api.php`),
        fetch(`${API_BASE}/reservations_api.php`),
        fetch(`${API_BASE}/payments_api.php`)
      ]);

      const usersData = await usersRes.json();
      const stationsData = await stationsRes.json();
      const resData = await resRes.json();
      const payData = await payRes.json();

      if (usersData.success) {
        setUsers(usersData.data.map(u => ({
          id: u.user_id,
          name: u.full_name,
          email: u.email,
          type: u.user_type,
          joined: '2026-04-20' // Default since not in DB
        })));
      }
      
      if (stationsData.success) {
        setStations(stationsData.data.map(s => ({
          id: s.station_id,
          name: s.station_name,
          district: s.district,
          price: `RM ${s.price_per_kwh}/kwh`,
          type: s.charger_type,
          status: s.status === 'Available' ? 'Online' : s.status,
          bays: [] // We don't track individual bays anymore
        })));
      }
      
      if (resData.success) {
        setReservations(resData.data.map(r => ({
          id: r.reservation_id,
          user: r.full_name || 'Unknown',
          station: r.station_name || 'Unknown',
          date: r.reservation_date,
          time: r.reservation_time,
          status: r.status
        })));
      }
      
      if (payData.success) {
        setPayments(payData.data.map(p => ({
          id: p.transaction_id,
          user: p.full_name || 'Unknown',
          amount: `RM ${p.amount}`,
          date: p.payment_date,
          status: p.status
        })));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Auth Helpers
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth_api.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser({ ...data.user, name: data.user.full_name }); // Map full_name to name for UI
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = () => setCurrentUser(null);
  const toggleLocation = () => setIsLocationEnabled(!isLocationEnabled);

  // CRUD Helpers
  const addUser = async (user) => {
    // In a real app, you'd POST to users_api.php. Assuming it's done via UI.
    fetchAllData();
  };
  const deleteUser = (id) => {}; // Placeholder for API integration
  const updateUser = (updatedUser) => {}; // Placeholder
  
  const addStation = (stn) => {}; // Placeholder
  const deleteStation = (id) => {}; // Placeholder
  const updateStationStatus = (id, status) => {}; // Placeholder

  const reserveStation = async (reservation) => {
    // 1. JIT Upsert Station first
    try {
      // Find the station in the live map context (which might not be in DB yet)
      // We pass the raw station object from the UI to this function if possible.
      // But currently MapExplorer just passes {user, station(district), date, time, status}.
      // To properly JIT, we'd need the full station object. 
      // For now, we'll just attempt to insert the reservation directly.
      const resPayload = {
        user_id: currentUser ? currentUser.user_id : 1, // Fallback to 1
        station_id: 1, // We need actual station_id from Map. MapExplorer currently passes string district!
        reservation_date: reservation.date,
        reservation_time: reservation.time,
        status: reservation.status
      };
      
      const res = await fetch(`${API_BASE}/reservations_api.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resPayload)
      });
      
      if (res.ok) {
        fetchAllData(); // Refresh reservations
      }
    } catch (err) {
      console.error("Reservation error", err);
    }
  };

  const value = {
    users, addUser, deleteUser, updateUser,
    stations, addStation, deleteStation, updateStationStatus,
    reservations, reserveStation,
    payments,
    currentUser, login, logout,
    isLocationEnabled, toggleLocation
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
