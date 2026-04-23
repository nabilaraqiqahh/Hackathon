import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Send, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';

const SendFeedback = () => {
  const { addFeedback, currentUser, stations } = useData();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    type: 'general',
    station: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    addFeedback({
      user_id: currentUser?.id || currentUser?.user_id || 1, // Fallback to 1 for guest or dev
      feedback_type: formData.type,
      station_name: formData.station || 'General',
      message: formData.message
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ type: 'general', station: '', message: '' });
    }, 4000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ paddingBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0' }}>Send Feedback</h2>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Help us improve the charging network by reporting issues or sharing your thoughts.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Feedback Form</h3>
        </div>
        <div className="card-body">
          {isSubmitted ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ display: 'inline-flex', background: 'rgba(45, 138, 39, 0.1)', color: 'var(--color-success)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                <CheckCircle size={48} />
              </div>
              <h3 style={{ marginBottom: '8px' }}>Thank you for your feedback!</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Your report has been successfully sent to the admin team for review.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <label style={{ flex: 1, cursor: 'pointer' }}>
                  <input type="radio" name="type" value="general" checked={formData.type === 'general'} onChange={e => setFormData({...formData, type: e.target.value})} style={{ display: 'none' }} />
                  <div style={{ padding: '16px', border: `2px solid ${formData.type === 'general' ? 'var(--color-primary)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: formData.type === 'general' ? 'rgba(128,0,0,0.02)' : 'white', transition: 'all 0.2s' }}>
                    <MessageSquare size={24} color={formData.type === 'general' ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                    <div>
                      <div style={{ fontWeight: 600, color: formData.type === 'general' ? 'var(--color-primary)' : 'var(--color-text-main)' }}>General Feedback</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Suggestions or general app issues</div>
                    </div>
                  </div>
                </label>
                <label style={{ flex: 1, cursor: 'pointer' }}>
                  <input type="radio" name="type" value="issue" checked={formData.type === 'issue'} onChange={e => setFormData({...formData, type: e.target.value})} style={{ display: 'none' }} />
                  <div style={{ padding: '16px', border: `2px solid ${formData.type === 'issue' ? 'var(--color-primary)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: formData.type === 'issue' ? 'rgba(128,0,0,0.02)' : 'white', transition: 'all 0.2s' }}>
                    <AlertTriangle size={24} color={formData.type === 'issue' ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                    <div>
                      <div style={{ fontWeight: 600, color: formData.type === 'issue' ? 'var(--color-primary)' : 'var(--color-text-main)' }}>Station Issue</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Report broken chargers or offline stations</div>
                    </div>
                  </div>
                </label>
              </div>

              {formData.type === 'issue' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Which station?</label>
                  <select className="styled-input" value={formData.station} onChange={e => setFormData({...formData, station: e.target.value})} required>
                    <option value="">Select a station</option>
                    {(stations || []).map(stn => (
                      <option key={stn.id} value={stn.name}>{stn.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Message</label>
                <textarea 
                  className="styled-input" 
                  rows="5" 
                  required
                  placeholder="Please describe your issue or feedback in detail..."
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>

              <button type="submit" className="login-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}>
                <Send size={18} />
                Submit Report
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendFeedback;
