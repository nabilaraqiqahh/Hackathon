import React, { createContext, useState, useContext, useEffect } from 'react';

const DataContext = createContext();
export const useData = () => useContext(DataContext);

const API_BASE = 'http://localhost/hackathon/backend/api';

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  
  // Try to load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch all initial data
  const fetchData = async () => {
    try {
      const [uRes, sRes, rRes, pRes] = await Promise.all([
        fetch(`${API_BASE}/users_api.php`),
        fetch(`${API_BASE}/stations_api.php`),
        fetch(`${API_BASE}/reservations_api.php`), // Assuming this exists or returns []
        fetch(`${API_BASE}/payments_api.php`)      // Assuming this exists or returns []
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData.success) {
          // Fetch vehicles for all drivers
          const usersWithVehicles = await Promise.all(uData.data.map(async (u) => {
             const vRes = await fetch(`${API_BASE}/vehicles_api.php?user_id=${u.user_id}`);
             let vehicles = [];
             if (vRes.ok) {
               const vData = await vRes.json();
               if(vData.success) vehicles = vData.data;
             }
             return {
               id: u.user_id,
               name: u.full_name,
               email: u.email,
               phone: u.phone_no,
               type: u.user_type,
               vehicles: vehicles
             };
          }));
          setUsers(usersWithVehicles);
        }
      }

      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.success) setStations(sData.data);
      }
      
      // We will assume reservations and payments API endpoints exist, 
      // if they fail we catch it
      try {
        if (rRes.ok) {
          const rData = await rRes.json();
          if (rData.success) {
            setReservations(rData.data.map(r => ({
              ...r,
              id: r.reservation_id,
              user: r.full_name,
              station: r.station_name,
              date: r.reservation_date,
              time: r.reservation_time
            })));
          }
        }
      } catch(e) {}
      
      try {
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.success) {
            setPayments(pData.data.map(p => ({
              ...p,
              id: p.payment_id,
              user: p.full_name,
              date: p.payment_date,
              method: p.payment_method,
              receipt: p.receipt_no
            })));
          }
        }
      } catch(e) {}

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll reservations every 10 seconds to keep MapExplorer accurate
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email) => {
    // We already fetched users, so we can check local state
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const toggleLocation = () => setIsLocationEnabled(!isLocationEnabled);

  // Users
  const addUser = async (user) => {
    // Mocked for hackathon simplicity, just update state
    setUsers([...users, { ...user, id: `U00${users.length + 1}` }]);
  };
  const deleteUser = (id) => setUsers(users.filter(u => u.id !== id));
  const updateUser = (updatedUser) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  // Vehicles
  const addVehicle = async (userId, vehicle) => {
    try {
      const res = await fetch(`${API_BASE}/vehicles_api.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          plat_no: vehicle.platNo,
          car_model: vehicle.carModel
        })
      });
      if (res.ok) fetchData(); // refresh data
    } catch(e) { console.error(e); }
  };

  const updateVehicle = async (userId, updatedVehicle) => {
    try {
      const res = await fetch(`${API_BASE}/vehicles_api.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: updatedVehicle.id || updatedVehicle.vehicle_id,
          plat_no: updatedVehicle.platNo || updatedVehicle.plat_no,
          car_model: updatedVehicle.carModel || updatedVehicle.car_model
        })
      });
      if (res.ok) fetchData();
    } catch(e) { console.error(e); }
  };

  const deleteVehicle = async (userId, vehicleId) => {
    try {
      const res = await fetch(`${API_BASE}/vehicles_api.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_id: vehicleId })
      });
      if (res.ok) fetchData();
    } catch(e) { console.error(e); }
  };

  // Stations
  const addStation = (stn) => setStations([...stations, { ...stn, id: `STN-00${stations.length + 1}` }]);
  const deleteStation = (id) => setStations(stations.filter(s => s.id !== id));
  const updateStationStatus = (id, status) => {
    setStations(stations.map(s => s.id === id ? { ...s, status } : s));
  };

  // Reservations
  const reserveStation = async (reservation) => {
    // 1. JIT Upsert the Station if it's from OCM
    try {
      if (reservation.station_id) {
        await fetch(`${API_BASE}/stations_api.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            station_id: reservation.station_id,
            station_name: reservation.station,
            address: reservation.address,
            operator_name: reservation.operator,
            charger_type: reservation.charger_type,
            district: reservation.district,
            total_bays: reservation.connections,
            connectors: reservation.connections
          })
        });
      }
    } catch(e) { console.error("JIT Error:", e); }

    // 2. Add to local state immediately for fast UI
    const tempId = `RES-${Date.now()}`;
    const newRes = { ...reservation, id: tempId, reservation_id: tempId };
    setReservations([newRes, ...reservations]);
    
    // 3. POST to database
    try {
      const resResponse = await fetch(`${API_BASE}/reservations_api.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: reservation.user_id,
          station_id: reservation.station_id,
          station_name: reservation.station, // store name directly
          district: reservation.district,
          charger_type: reservation.charger_type,
          reservation_date: reservation.date,
          reservation_time: reservation.time,
          status: reservation.status,
          duration: reservation.duration,
          connector: reservation.connector,
          power: reservation.power
        })
      });
      const resJson = await resResponse.json();
      console.log('[DB] Reservation save result:', resJson);
      if (resJson.success) {
        // 4. Fetch fresh data to sync real ID from DB
        await fetchData();
      } else {
        console.error('[DB] Reservation save FAILED:', resJson.message);
        // Remove the temporary reservation if the API call failed
        setReservations(reservations.filter(r => r.id !== tempId));
      }
    } catch(e) { 
      console.error("Reservation Error:", e);
      // Remove the temporary reservation if an error occurred
      setReservations(reservations.filter(r => r.id !== tempId));
    }
  };

  const updateReservation = async (id, updates) => {
    setReservations(reservations.map(r => (r.id === id || r.reservation_id === id) ? { ...r, ...updates } : r));
    
    // Attempt to update in DB
    try {
      await fetch(`${API_BASE}/reservations_api.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservation_id: id,
          status: updates.status
        })
      });
      fetchData();
    } catch(e) {}
  };

  // Payments
  const addPayment = async (payment) => {
    const shortTime = Date.now().toString().slice(-8);
    const tempId = `PAY-${shortTime}-${Math.floor(Math.random() * 100)}`;
    const newPayment = { ...payment, id: tempId, transaction_id: tempId };
    setPayments([newPayment, ...payments]);

    try {
      await fetch(`${API_BASE}/payments_api.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: tempId,
          user_id: payment.user_id || currentUser?.id,
          amount: payment.amount,
          payment_method: payment.method,
          energy: payment.energy || null,
          receipt_no: `RCP-${Math.floor(Math.random() * 9000) + 1000}`
        })
      });
      fetchData();
    } catch(e) { console.error("Payment Error:", e); }
  };

  const releaseHold = (holdAmount, finalAmount) => {
    console.log(`Releasing pre-authorization hold of RM ${holdAmount}. Charging final amount of RM ${finalAmount}.`);
  };

  const value = {
    users, addUser, deleteUser, updateUser,
    stations, addStation, deleteStation, updateStationStatus,
    reservations, reserveStation, updateReservation,
    payments, addPayment, releaseHold,
    currentUser, login, logout,
    isLocationEnabled, toggleLocation,
    addVehicle, updateVehicle, deleteVehicle,
    feedbacks
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
