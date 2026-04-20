import React from 'react';
import { Bell } from 'lucide-react';

const AnnouncementDisplay = ({ announcements }) => {
    // Filter active announcements
    const activeAnnouncements = announcements?.filter(a => a.isActive) || [];

    if (activeAnnouncements.length === 0) {
        return null;
    }

    return (
        <div className="announcement-section" style={{ marginBottom: '32px' }}>
            <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'var(--color-primary)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <Bell size={20} color="var(--color-danger)" />
                Announcements
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeAnnouncements.map((announcement) => (
                    <div
                        key={announcement.id}
                        className="announcement-card"
                        style={{
                            background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.05) 0%, rgba(31, 41, 55, 0.05) 100%)',
                            padding: '16px 20px',
                            borderRadius: '16px',
                            border: '1px solid rgba(211, 47, 47, 0.2)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                    >
                        <h4 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: 'var(--color-danger)',
                            marginBottom: '8px'
                        }}>
                            {announcement.title}
                        </h4>
                        <p style={{
                            color: 'var(--color-text-main)',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            marginBottom: '8px'
                        }}>
                            {announcement.message}
                        </p>
                        <div style={{
                            fontSize: '11px',
                            color: '#94a3b8',
                            fontWeight: '600'
                        }}>
                            Posted by {announcement.authorName} • {announcement.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnnouncementDisplay;
