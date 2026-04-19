import React, { createContext, useState, useContext } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([
    { id: 'U001', name: 'Nabil Husni', email: 'nabil@melaka.gov.my', type: 'Admin', joined: '2025-01-10' },
    { id: 'D001', name: 'Ahmad Rafiq', email: 'rafiq@gmail.com', type: 'Driver', joined: '2025-02-15' },
    { id: 'D002', name: 'Siti Aminah', email: 'siti@outlook.com', type: 'Driver', joined: '2025-03-01' },
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
    { id: 'RES-101', user: 'Ahmad Rafiq', station: 'Melaka Tengah', date: '2026-04-19', time: '14:00', status: 'Confirmed' },
    { id: 'RES-102', user: 'Siti Aminah', station: 'Jasin', date: '2026-04-19', time: '16:30', status: 'Completed' },
  ]);

  const [payments, setPayments] = useState([
    { id: 'PAY-201', user: 'Siti Aminah', amount: 'RM 15.00', date: '2026-04-19', status: 'Success' },
    { id: 'PAY-202', user: 'Ahmad Rafiq', amount: 'RM 22.50', date: '2026-04-18', status: 'Success' },
  ]);

  // CRUD Helpers
  const addUser = (user) => setUsers([...users, { ...user, id: `U00${users.length + 1}`, joined: new Date().toISOString().split('T')[0] }]);
  const deleteUser = (id) => setUsers(users.filter(u => u.id !== id));
  const updateUser = (updatedUser) => setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  
  const addStation = (stn) => setStations([...stations, { ...stn, id: `STN-00${stations.length + 1}`, bays: [] }]);
  const deleteStation = (id) => setStations(stations.filter(s => s.id !== id));
  const updateStationStatus = (id, status) => {
    setStations(stations.map(s => s.id === id ? { ...s, status } : s));
  };

  const value = {
    users, addUser, deleteUser, updateUser,
    stations, addStation, deleteStation, updateStationStatus,
    reservations,
    payments
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
