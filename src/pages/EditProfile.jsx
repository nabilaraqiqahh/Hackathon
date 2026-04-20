import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { User, Mail, Phone, Save, CheckCircle } from 'lucide-react';

const EditProfile = () => {
  const { currentUser, updateUser } = useData();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const hasChanges = () => {
    return (
      formData.name !== (currentUser?.name || '') ||
      formData.email !== (currentUser?.email || '') ||
      formData.phone !== (currentUser?.phone || '')
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentUser && hasChanges()) {
      updateUser({ ...currentUser, ...formData });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ paddingBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0' }}>Personal Information</h2>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Update your personal details below.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Profile Details</h3>
        </div>
        <div className="card-body">
          {showSuccess && (
            <div style={{
              background: 'rgba(45, 138, 39, 0.1)',
              color: 'var(--color-success)',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              fontWeight: 500
            }}>
              <CheckCircle size={18} />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid-3" style={{ gridTemplateColumns: '1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Full Name</label>
                <div className="input-with-icon" style={{ position: 'relative' }}>
                  <User className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="styled-input" style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }} required />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email Address</label>
                <div className="input-with-icon" style={{ position: 'relative' }}>
                  <Mail className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="styled-input" style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }} required />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Phone Number</label>
                <div className="input-with-icon" style={{ position: 'relative' }}>
                  <Phone className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="styled-input" style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }} placeholder="e.g. 012-3456789" />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="login-btn" 
              disabled={!hasChanges()}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px', 
                padding: '12px',
                marginTop: '16px',
                opacity: hasChanges() ? 1 : 0.5,
                cursor: hasChanges() ? 'pointer' : 'not-allowed',
                background: hasChanges() ? 'var(--color-primary)' : 'var(--color-text-muted)'
              }}
            >
              <Save size={18} />
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
