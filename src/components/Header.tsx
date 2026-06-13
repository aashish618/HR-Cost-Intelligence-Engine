import React from 'react';
import { Calendar, BrainCircuit, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  timeWindow: string;
  setTimeWindow: (window: string) => void;
  isSyncing: boolean;
  onSync: () => void;
  hasGeminiKey: boolean;
  anomalyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  timeWindow,
  setTimeWindow,
  isSyncing,
  onSync,
  hasGeminiKey,
  anomalyCount
}) => {
  return (
    <header style={styles.header}>
      <div style={styles.titleArea}>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.subtitle}>{subtitle}</p>
      </div>

      <div style={styles.controlsArea}>
        {/* AI Engine Status */}
        <div 
          style={{
            ...styles.aiStatus,
            border: hasGeminiKey ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
            background: hasGeminiKey ? 'rgba(168, 85, 247, 0.08)' : 'rgba(99, 102, 241, 0.08)',
          }}
          title={hasGeminiKey ? 'Gemini 1.5/2.5 Pro/Flash active' : 'Running local offline keywords and role mapping engine'}
        >
          {hasGeminiKey ? (
            <>
              <Sparkles size={14} color="#c084fc" />
              <span style={{ color: '#c084fc' }}>Gemini AI Active</span>
            </>
          ) : (
            <>
              <BrainCircuit size={14} color="#818cf8" />
              <span style={{ color: '#818cf8' }}>Local AI Engine</span>
            </>
          )}
        </div>

        {/* Anomaly quick flag */}
        {anomalyCount > 0 && (
          <div style={styles.anomalyBadge} title={`${anomalyCount} active anomalies flagged`}>
            <ShieldAlert size={14} />
            <span>{anomalyCount} Alerts</span>
          </div>
        )}

        {/* Time Window Selector */}
        <div style={styles.selectWrapper}>
          <Calendar size={15} color="var(--text-secondary)" style={styles.selectIcon} />
          <select 
            value={timeWindow} 
            onChange={(e) => setTimeWindow(e.target.value)}
            style={styles.select}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="thismonth">This Month</option>
            <option value="lastmonth">Last Month</option>
          </select>
        </div>

        {/* Sync Button */}
        <button 
          onClick={onSync} 
          disabled={isSyncing}
          className="btn-secondary"
          style={styles.syncButton}
        >
          <RefreshCw 
            size={16} 
            style={{ 
              animation: isSyncing ? 'spin 1.5s linear infinite' : 'none' 
            }} 
          />
          <span>{isSyncing ? 'Syncing...' : 'Sync Calendar'}</span>
        </button>
      </div>

      {/* Embedded CSS animation for sync button spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};

const styles = {
  header: {
    height: '70px',
    borderBottom: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    background: 'rgba(11, 15, 30, 0.5)',
    backdropFilter: 'blur(10px)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 9,
  },
  titleArea: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 600,
  },
  subtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  controlsArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
  },
  aiStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.35rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'help',
  },
  anomalyBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.35rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#fca5a5',
    fontSize: '0.75rem',
    fontWeight: 600,
    boxShadow: '0 0 10px rgba(239, 68, 68, 0.05)',
  },
  selectWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  selectIcon: {
    position: 'absolute' as const,
    left: '10px',
    pointerEvents: 'none' as const,
  },
  select: {
    paddingLeft: '32px',
    fontSize: '0.85rem',
    background: 'var(--bg-secondary)',
    height: '38px',
  },
  syncButton: {
    height: '38px',
    padding: '0 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
  }
};
