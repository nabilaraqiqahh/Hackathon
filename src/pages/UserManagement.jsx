import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { UserPlus, Trash2, Edit2, Search } from 'lucide-react';

const UserManagement = () => {
  const { users, addUser, deleteUser, updateUser } = useData();
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', type: 'Driver' });
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(newUser);
    } else {
      addUser(newUser);
    }
    setNewUser({ name: '', email: '', type: 'Driver' });
    setShowModal(false);
    setEditingUser(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>User Management</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Create and manage driver accounts and administrative profiles.</p>
        </div>
        <button className="btn-export" onClick={() => {
          setEditingUser(null);
          setNewUser({ name: '', email: '', type: 'Driver' });
          setShowModal(true);
        }}>
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search users..." 
              style={{ padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', width: '100%', outline: 'none' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {searchTerm && (
            <div style={{ background: '#f4f7fb', padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: '0.9rem', color: '#1e3a8a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Showing results for <strong>"{searchTerm}"</strong></span>
              <span className="badge" style={{ background: 'var(--color-primary)', color: 'white' }}>{filteredUsers.length} found</span>
            </div>
          )}
          <table className="styled-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>User Type</th>
                <th>Joined Date</th>
                <th className="text-center" style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600 }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.type === 'Admin' ? 'active' : 'completed'}`} style={{ color: user.type === 'Admin' ? 'var(--color-primary)' : 'var(--color-success)' }}>
                      {user.type}
                    </span>
                  </td>
                  <td>{user.joined}</td>
                  <td className="text-center" style={{ textAlign: 'center' }}>
                    <button 
                      style={{ background: 'transparent', color: 'var(--color-text-muted)', marginRight: '12px', cursor: 'pointer', border: 'none' }}
                      onClick={() => {
                        setEditingUser(user);
                        setNewUser(user);
                        setShowModal(true);
                      }}
                    >
                      <Edit2 size={18}/>
                    </button>
                    <button 
                      onClick={() => deleteUser(user.id)}
                      style={{ background: 'transparent', color: 'var(--color-danger)' }}
                    >
                      <Trash2 size={18}/>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No users found matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ width: '450px', margin: '10vh auto' }}>
            <div className="card-header">
              <h3 style={{ margin: 0 }}>{editingUser ? 'Edit User' : 'Add New User'}</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px' }}>Full Name</label>
                  <input 
                    className="styled-input"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div className="mb-2">
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px' }}>Email Address</label>
                  <input 
                    type="email"
                    className="styled-input"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px' }}>Role</label>
                  <select 
                    className="styled-input"
                    value={newUser.type}
                    onChange={(e) => setNewUser({...newUser, type: e.target.value})}
                  >
                    <option value="Driver">Driver</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn-export" style={{ flex: 1, justifyContent: 'center' }}>
                    {editingUser ? 'Update User' : 'Save User'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { 
                      setShowModal(false); 
                      setEditingUser(null); 
                      setNewUser({ name: '', email: '', type: 'Driver' }); 
                    }} 
                    style={{ flex: 1, background: '#eee', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
