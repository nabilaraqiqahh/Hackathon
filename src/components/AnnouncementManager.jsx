import React, { useState } from 'react';
import { Bell, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useData } from '../context/DataContext';

const AnnouncementManager = () => {
    const { currentUser, announcements, addAnnouncement, deleteAnnouncement, toggleAnnouncementStatus } = useData();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Only allow Admins to manage announcements
    if (currentUser?.type !== 'Admin') {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !message) {
            alert('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await addAnnouncement(title, message, currentUser.id, currentUser.name);
            setTitle('');
            setMessage('');
            setShowForm(false);
        } catch (error) {
            alert('Failed to create announcement: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        if (!confirm('Delete this announcement?')) return;
        deleteAnnouncement(id);
    };

    const handleToggle = (id, currentStatus) => {
        toggleAnnouncementStatus(id, !currentStatus);
    };

    return (
        <div className="announcement-manager" style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Bell size={24} color="var(--color-danger)" />
                    Network Announcement Manager
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="main-btn"
                    style={{ padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={16} />
                    {showForm ? 'Cancel' : 'Create New Alert'}
                </button>
            </div>

            {showForm && (
                <div style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '20px',
                    border: '2px solid var(--color-danger)',
                    marginBottom: '24px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-main)', marginBottom: '8px' }}>
                                Alert Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Scheduled Maintenance"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e4e4e7',
                                    borderRadius: '12px',
                                    outline: 'none',
                                    fontSize: '14px'
                                }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-main)', marginBottom: '8px' }}>
                                Alert Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe the notification details..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e4e4e7',
                                    borderRadius: '12px',
                                    outline: 'none',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="main-btn"
                            style={{ width: '100%', padding: '14px' }}
                        >
                            {loading ? 'Posting...' : 'Post Network Alert'}
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {announcements && announcements.length > 0 ? (
                    announcements.map((announcement) => (
                        <div
                            key={announcement.id}
                            style={{
                                background: announcement.isActive ? 'white' : '#f9fafb',
                                padding: '20px',
                                borderRadius: '16px',
                                border: announcement.isActive ? '2px solid var(--color-danger)' : '1px solid #e4e4e7',
                                boxShadow: announcement.isActive ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
                                opacity: announcement.isActive ? 1 : 0.6,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'start'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '8px' }}>
                                    {announcement.title}
                                </h3>
                                <p style={{ color: 'var(--color-text-main)', fontSize: '14px', lineHeight: '1.6' }}>
                                    {announcement.message}
                                </p>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
                                    By {announcement.authorName} • {
                                        announcement.createdAt instanceof Date 
                                            ? announcement.createdAt.toLocaleDateString() 
                                            : announcement.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'
                                    }
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                                <button
                                    onClick={() => handleToggle(announcement.id, announcement.isActive)}
                                    style={{
                                        padding: '8px',
                                        background: 'transparent',
                                        border: '1px solid #e4e4e7',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        color: announcement.isActive ? '#10b981' : '#94a3b8',
                                    }}
                                    title={announcement.isActive ? 'Hide' : 'Show'}
                                >
                                    {announcement.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                <button
                                    onClick={() => handleDelete(announcement.id)}
                                    style={{
                                        padding: '8px',
                                        background: 'transparent',
                                        border: '1px solid #e4e4e7',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        color: 'var(--color-danger)',
                                    }}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        background: '#f9fafb',
                        borderRadius: '16px',
                        border: '1px dashed #e4e4e7'
                    }}>
                        <Bell size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>No announcements yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnouncementManager;
