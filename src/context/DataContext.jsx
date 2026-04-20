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

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('voltpark_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
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

  const [feedbacks, setFeedbacks] = useState([
    { id: 'FB-001', authorName: 'Ahmad Rafiq', station: 'Alor Gajah', district: 'Alor Gajah', type: 'issue', message: 'Charger 1 is completely dead, screen not turning on.', status: 'Pending', createdAt: '2026-04-19' },
  ]);

  const [maintenanceTasks, setMaintenanceTasks] = useState([
    { id: 'MT-101', feedbackId: 'FB-000', station: 'Stesen EV Melaka Tengah', issueDetails: 'Screen frozen', scheduledDate: '2026-04-21', technician: 'Ah Chong', notes: 'Take spare screen', status: 'Scheduled' }
  ]);

  // Auth Helpers
  const login = (email) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('voltpark_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('voltpark_user');
  };

  const toggleLocation = () => setIsLocationEnabled(!isLocationEnabled);

  // CRUD Helpers
  const addUser = (user) => setUsers([...users, { ...user, id: `U00${users.length + 1}`, joined: new Date().toISOString().split('T')[0] }]);
  const deleteUser = (id) => setUsers(users.filter(u => u.id !== id));
  const updateUser = (updatedUser) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('voltpark_user', JSON.stringify(updatedUser));
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
    setStations(stations.map(s => {
      if (s.id === id) {
        const updatedBays = status === 'Maintenance' 
          ? s.bays.map(b => ({ ...b, status: 'offline' })) 
          : s.bays.map(b => ({ ...b, status: b.status === 'offline' ? 'available' : b.status }));
        return { ...s, status, bays: updatedBays };
      }
      return s;
    }));
  };

  const updateBayStatus = (stationId, bayId, forcedStatus = null) => {
    setStations(stations.map(s => {
      if (s.id === stationId) {
        const updatedBays = s.bays.map(b => {
          if (b.id === bayId) {
            const newStatus = forcedStatus ? forcedStatus : (b.status === 'offline' ? 'available' : 'offline');
            return { ...b, status: newStatus };
          }
          return b;
        });

        const allOffline = updatedBays.length > 0 && updatedBays.every(b => b.status === 'offline');
        const newStationStatus = allOffline ? 'Maintenance' : 'Online';

        return { ...s, bays: updatedBays, status: newStationStatus };
      }
      return s;
    }));
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

  const addFeedback = (feedback) => {
    const newFb = {
      ...feedback,
      id: `FB-${String(feedbacks.length + 1).padStart(3, '0')}`,
      authorName: currentUser?.name || 'Anonymous',
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setFeedbacks([newFb, ...feedbacks]);
  };

  const assignMaintenance = (feedbackId, details) => {
    const feedback = feedbacks.find(fb => fb.id === feedbackId);
    if (!feedback) return;

    const updatedFeedbacks = feedbacks.map(fb => fb.id === feedbackId ? { ...fb, status: 'In Progress' } : fb);
    setFeedbacks(updatedFeedbacks);

    const targetBay = details.bayId ? `(Bay ${details.bayId})` : '';

    const newTask = {
      id: `MT-${Date.now()}`,
      feedbackId,
      station: `${feedback.station} ${targetBay}`.trim(),
      issueDetails: feedback.message,
      scheduledDate: details.scheduledDate,
      technician: details.technician,
      notes: details.notes,
      status: 'Ongoing',
      linkedBayId: details.bayId,
      originalStationName: feedback.station
    };
    setMaintenanceTasks([newTask, ...maintenanceTasks]);

    const matchingStation = stations.find(s => s.name.includes(feedback.station) || s.district === feedback.station);
    if (matchingStation) {
      if (details.bayId) {
        // Just take down the specific bay
        const updatedBays = matchingStation.bays.map(b => b.id === parseInt(details.bayId) ? { ...b, status: 'offline' } : b);
        const allOffline = updatedBays.every(b => b.status === 'offline');
        const updatedStation = { ...matchingStation, status: allOffline ? 'Maintenance' : 'Online', bays: updatedBays };
        setStations(stations.map(s => s.id === matchingStation.id ? updatedStation : s));
      } else {
        // Take down the whole station
        const updatedStation = {
          ...matchingStation,
          status: 'Maintenance',
          bays: matchingStation.bays.map(bay => ({ ...bay, status: 'offline' }))
        };
        setStations(stations.map(s => s.id === matchingStation.id ? updatedStation : s));
      }
    }
  };

  const completeMaintenance = (taskId) => {
    const task = maintenanceTasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTasks = maintenanceTasks.map(t => t.id === taskId ? { ...t, status: 'Completed' } : t);
    setMaintenanceTasks(updatedTasks);

    const updatedFeedbacks = feedbacks.map(fb => fb.id === task.feedbackId ? { ...fb, status: 'Resolved' } : fb);
    setFeedbacks(updatedFeedbacks);

    const matchingStation = stations.find(s => s.name.includes(task.originalStationName || task.station.split(' (')[0]) || s.district === (task.originalStationName || task.station.split(' (')[0]));
    if (matchingStation) {
      if (task.linkedBayId) {
        const updatedBays = matchingStation.bays.map(b => b.id === parseInt(task.linkedBayId) ? { ...b, status: 'available' } : b);
        const allOffline = updatedBays.every(b => b.status === 'offline');
        const updatedStation = { ...matchingStation, status: allOffline ? 'Maintenance' : 'Online', bays: updatedBays };
        setStations(stations.map(s => s.id === matchingStation.id ? updatedStation : s));
      } else {
        const updatedStation = {
          ...matchingStation,
          status: 'Online',
          bays: matchingStation.bays.map(bay => ({ ...bay, status: 'available' }))
        };
        setStations(stations.map(s => s.id === matchingStation.id ? updatedStation : s));
      }
    }
  };

  const value = {
    users, addUser, deleteUser, updateUser,
    stations, addStation, deleteStation, updateStationStatus, updateBayStatus,
    reservations, reserveStation, updateReservation,
    payments, addPayment, releaseHold,
    currentUser, login, logout,
    isLocationEnabled, toggleLocation,
    announcements, addAnnouncement, deleteAnnouncement, toggleAnnouncementStatus,
    addVehicle, updateVehicle, deleteVehicle,
    feedbacks, addFeedback,
    maintenanceTasks, assignMaintenance, completeMaintenance
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
