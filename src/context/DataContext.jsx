import React, { createContext, useState, useContext } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([
    { id: 'U001', name: 'Nabil Husni', email: 'nabil@melaka.gov.my', phone: '012-3456789', vehicles: [{ id: 'V1', platNo: 'MCU 1234', carModel: 'BYD Seal' }], type: 'Admin', joined: '2025-01-10' },
    { id: 'D001', name: 'Ahmad Rafiq', email: 'rafiq@gmail.com', phone: '013-9876543', vehicles: [{ id: 'V2', platNo: 'VFD 5678', carModel: 'Tesla Model 3' }], type: 'Driver', joined: '2025-02-15' },
    { id: 'D002', name: 'Siti Aminah', email: 'siti@outlook.com', phone: '019-1122334', vehicles: [{ id: 'V3', platNo: 'JQQ 9999', carModel: 'Ora Good Cat' }], type: 'Driver', joined: '2025-03-01' },
  ]);

  const [stations, setStations] = useState([
    { 
      id: 'STN-001', 
      name: 'Stesen EV Melaka Tengah', 
      district: 'Melaka Tengah', 
      price: 'RM 15/hour', 
      type: 'Fast DC', 
      status: 'Online',
      bays: [
        { id: 1, status: 'occupied' },
        { id: 2, status: 'available' },
        { id: 3, status: 'available' },
        { id: 4, status: 'occupied' },
      ]
    },
    { 
      id: 'STN-002', 
      name: 'Stesen EV Jasin', 
      district: 'Jasin', 
      price: 'RM 10/hour', 
      type: 'AC Standard', 
      status: 'Online',
      bays: [
        { id: 1, status: 'available' },
        { id: 2, status: 'available' },
      ]
    },
    { 
      id: 'STN-003', 
      name: 'Stesen EV Alor Gajah', 
      district: 'Alor Gajah', 
      price: 'RM 12/hour', 
      type: 'Fast DC', 
      status: 'Maintenance',
      bays: [
        { id: 1, status: 'offline' },
        { id: 2, status: 'offline' },
      ]
    },
  ]);

  const [reservations, setReservations] = useState([
    { id: 'RES-101', user: 'Ahmad Rafiq', station: 'Melaka Tengah', date: '2026-04-19', time: '14:00', duration: '2 Hours', connector: 'Type 2 AC', power: '22 kW', status: 'Confirmed' },
    { id: 'RES-102', user: 'Siti Aminah', station: 'Jasin', date: '2026-04-19', time: '16:30', duration: '1 Hour', connector: 'CCS2 DC', power: '60 kW', status: 'Completed' },
  ]);

  const [payments, setPayments] = useState([
    { id: 'PAY-201', user: 'Siti Aminah', amount: 'RM 15.00', date: '2026-04-19', method: 'TNG eWallet', energy: '12.5 kWh', receipt: 'RCP-8832', status: 'Success' },
    { id: 'PAY-202', user: 'Ahmad Rafiq', amount: 'RM 22.50', date: '2026-04-18', method: 'Visa •••• 4242', energy: '18.0 kWh', receipt: 'RCP-8831', status: 'Success' },
  ]);

  const [currentUser, setCurrentUser] = useState(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [announcements, setAnnouncements] = useState([
    { 
      id: 'ANN-001', 
      title: 'Maintenance Alert', 
      message: 'Charging stations in Alor Gajah will be offline for maintenance on April 22nd.', 
      isActive: true, 
      authorName: 'Admin',
      createdAt: { toDate: () => new Date('2026-04-18') }
    },
    { 
      id: 'ANN-002', 
      title: 'New Fast DC Available', 
      message: 'A new high-speed DC charger is now operational at Melaka Tengah Station!', 
      isActive: true, 
      authorName: 'System',
      createdAt: { toDate: () => new Date('2026-04-19') }
    }
  ]);

  // Auth Helpers
  const login = (email) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const toggleLocation = () => setIsLocationEnabled(!isLocationEnabled);

  // CRUD Helpers
  const addUser = (user) => setUsers([...users, { ...user, id: `U00${users.length + 1}`, joined: new Date().toISOString().split('T')[0] }]);
  const deleteUser = (id) => setUsers(users.filter(u => u.id !== id));
  const updateUser = (updatedUser) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const addVehicle = (userId, vehicle) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newVehicle = { ...vehicle, id: `V${Date.now()}` };
    const updatedUser = { ...user, vehicles: [...(user.vehicles || []), newVehicle] };
    updateUser(updatedUser);
  };

  const updateVehicle = (userId, updatedVehicle) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const updatedUser = { ...user, vehicles: user.vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v) };
    updateUser(updatedUser);
  };

  const deleteVehicle = (userId, vehicleId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const updatedUser = { ...user, vehicles: user.vehicles.filter(v => v.id !== vehicleId) };
    updateUser(updatedUser);
  };
  
  const addStation = (stn) => setStations([...stations, { ...stn, id: `STN-00${stations.length + 1}`, bays: [] }]);
  const deleteStation = (id) => setStations(stations.filter(s => s.id !== id));
  const updateStationStatus = (id, status) => {
    setStations(stations.map(s => s.id === id ? { ...s, status } : s));
  };

  const addAnnouncement = (title, message, authorId, authorName) => {
    const newAnn = {
      id: `ANN-${Date.now()}`,
      title,
      message,
      isActive: true,
      authorName,
      createdAt: { toDate: () => new Date() }
    };
    setAnnouncements([newAnn, ...announcements]);
  };

  const deleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const toggleAnnouncementStatus = (id, isActive) => {
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, isActive } : a));
  };

  const reserveStation = (reservation) => {
    setReservations([{ ...reservation, id: `RES-${100 + reservations.length + 1}` }, ...reservations]);
  };

  const updateReservation = (id, updates) => {
    setReservations(reservations.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addPayment = (payment) => {
    setPayments([{ ...payment, id: `PAY-${200 + payments.length + 1}` }, ...payments]);
  };

  const releaseHold = (holdAmount, finalAmount) => {
    const refund = holdAmount - finalAmount;
    if (refund > 0) {
      console.log(`Releasing pre-authorization hold of RM ${holdAmount}. Final cost: RM ${finalAmount}. Refunding unused RM ${refund.toFixed(2)}.`);
    } else {
      console.log(`Releasing pre-authorization hold of RM ${holdAmount}. Charging final amount of RM ${finalAmount}.`);
    }
  };

  const value = {
    users, addUser, deleteUser, updateUser,
    stations, addStation, deleteStation, updateStationStatus,
    reservations, reserveStation, updateReservation,
    payments, addPayment, releaseHold,
    currentUser, login, logout,
    isLocationEnabled, toggleLocation,
    announcements, addAnnouncement, deleteAnnouncement, toggleAnnouncementStatus,
    addVehicle, updateVehicle, deleteVehicle
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
