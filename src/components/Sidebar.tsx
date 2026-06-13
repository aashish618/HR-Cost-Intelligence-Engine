import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarRange, 
  UsersRound, 
  FolderKanban, 
  AlertTriangle, 
  Settings, 
  Lock, 
  Unlock 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
  adminPin: string;
  companyName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isAdminMode, 
  setIsAdminMode,
  adminPin,
  companyName
}) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', name: 'Calendar Sync', icon: CalendarRange },
    { id: 'employees', name: 'Cost Mapping', icon: UsersRound },
    { id: 'projects', name: 'Project Budgets', icon: FolderKanban },
    { id: 'anomalies', name: 'Anomaly Center', icon: AlertTriangle },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleAdminToggle = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
    } else {
      setShowPinModal(true);
      setPinInput('');
      setPinError('');
    }
  };

  const verifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === adminPin) {
      setIsAdminMode(true);
      setShowPinModal(false);
    } else {
      setPinError('Incorrect PIN. Please try again.');
    }
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>🪙</div>
        <div>
          <h1 style={styles.logoTitle}>{companyName || 'TCS'}</h1>
          <p style={styles.logoSubtitle}>Cost Intelligence</p>
        </div>
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navButton,
                ...(isActive ? styles.navButtonActive : {})
              }}
              className="interactive"
            >
              <Icon size={20} color={isActive ? '#6366f1' : '#9ca3af'} />
              <span>{item.name}</span>
              {item.id === 'anomalies' && (
                <div style={styles.anomalyNotificationDot}></div>
              )}
            </button>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <button 
          onClick={handleAdminToggle}
          style={{
            ...styles.adminToggle,
            ...(isAdminMode ? styles.adminToggleActive : {})
          }}
        >
          {isAdminMode ? <Unlock size={16} /> : <Lock size={16} />}
          <span>{isAdminMode ? 'Admin Active' : 'Enable Admin'}</span>
        </button>
        <div style={styles.footerVersion}>Hackathon v1.0.0</div>
      </div>

      {showPinModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modalContent}>
            <h3>Enter Admin PIN</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1rem' }}>
              Authentication is required to view individual salaries and adjust hourly billing rates (Default: 1234).
            </p>
            <form onSubmit={verifyPin}>
              <input
                type="password"
                placeholder="••••"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                style={styles.pinInput}
                autoFocus
              />
              {pinError && <p style={styles.errorText}>{pinError}</p>}
              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setShowPinModal(false)}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    background: 'rgba(11, 15, 30, 0.9)',
    borderRight: '1px solid var(--glass-border)',
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    padding: '1.5rem',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2.5rem',
  },
  logoIcon: {
    fontSize: '2rem',
  },
  logoTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    lineHeight: 1,
    background: 'linear-gradient(135deg, #f3f4f6 0%, #9ca3af 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  logoSubtitle: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '2px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    flex: 1,
  },
  navButton: {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.925rem',
    textAlign: 'left' as const,
    border: '1px solid transparent',
    transition: 'all 0.2s ease',
  },
  navButtonActive: {
    background: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  anomalyNotificationDot: {
    marginLeft: 'auto',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    boxShadow: '0 0 8px #ef4444',
  },
  footer: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  adminToggle: {
    width: '100%',
    padding: '0.625rem',
    borderRadius: 'var(--radius-sm)',
    background: 'rgba(31, 41, 55, 0.5)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
  },
  adminToggleActive: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    boxShadow: '0 0 10px rgba(16, 185, 129, 0.1)',
  },
  footerVersion: {
    fontSize: '0.7rem',
    color: '#4b5563',
    textAlign: 'center' as const,
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center' as const,
  },
  pinInput: {
    width: '120px',
    textAlign: 'center' as const,
    fontSize: '1.5rem',
    letterSpacing: '0.5em',
    marginBottom: '1rem',
    display: 'block',
    margin: '0 auto 1rem',
  },
  errorText: {
    color: '#f87171',
    fontSize: '0.8rem',
    marginBottom: '1rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
  }
};
