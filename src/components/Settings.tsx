import React, { useState } from 'react';
import { Settings as SettingsIcon, Key, RotateCcw, ShieldAlert, Terminal } from 'lucide-react';
import type { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  onResetDatabase: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  setSettings,
  onResetDatabase
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(settings.geminiApiKey);
  const [pinInput, setPinInput] = useState(settings.adminPin);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Mocked backend system logs for high-fidelity realism
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] INFO: HR Cost Intelligence Engine successfully booted.`,
    `[${new Date().toLocaleTimeString()}] INFO: Loaded 6 active project schemas from storage.`,
    `[${new Date().toLocaleTimeString()}] INFO: Seeding employee designations: 8 categories indexed.`,
    `[${new Date().toLocaleTimeString()}] INFO: Local Heuristics string-distance parser compiled successfully.`,
    `[${new Date().toLocaleTimeString()}] INFO: Google Calendar OAuth client initialized in offline-simulation mode.`,
    `[${new Date().toLocaleTimeString()}] WARNING: No live Gemini API Key configured. Defaulting to local regex heuristic matching.`,
  ]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSettings = {
      ...settings,
      geminiApiKey: apiKeyInput,
      adminPin: pinInput
    };
    
    setSettings(newSettings);
    
    // Update logs
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] INFO: System configuration updated.`,
      apiKeyInput 
        ? `[${new Date().toLocaleTimeString()}] SUCCESS: Live Gemini API Key mapped. Zero-shot LLM endpoint active.`
        : `[${new Date().toLocaleTimeString()}] WARNING: Gemini Key removed. Reverting to local heuristic parser.`,
      ...prev
    ]);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const triggerReset = () => {
    if (window.confirm('WARNING: This will wipe all manual project overrides, custom employees, and customized rates. Reset to default seeder?')) {
      onResetDatabase();
      setApiKeyInput('');
      setPinInput('1234');
      setResetSuccess(true);
      setLogs(prev => [
        `[${new Date().toLocaleTimeString()}] WARNING: Database factory wipe triggered by user.`,
        `[${new Date().toLocaleTimeString()}] SUCCESS: Local storage cleared. Re-seeded 18 default calendar syncs and 10 employees.`,
        ...prev
      ]);
      setTimeout(() => setResetSuccess(false), 2000);
    }
  };

  return (
    <div className="content-pane" style={styles.container}>
      <section style={styles.grid}>
        
        {/* Configuration panel */}
        <div className="glass-panel" style={styles.card}>
          <div className="glass-card-header">
            <div style={styles.headerTitleRow}>
              <SettingsIcon size={20} color="var(--primary)" />
              <h3>Engine Configurations</h3>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} style={styles.form}>
            {/* API Key */}
            <div style={styles.formGroup}>
              <div style={styles.inputLabelRow}>
                <Key size={14} color="var(--text-secondary)" />
                <label>Gemini Pro API Key (Optional)</label>
              </div>
              <input 
                type="password" 
                placeholder="AIzaSy..." 
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                style={styles.apiInput}
              />
              <p style={styles.inputHelpText}>
                Entering your Google Gemini API key enables real-time zero-shot semantic matching. When empty, the engine falls back to the local keywords/team alignment scoring rules.
              </p>
            </div>

            {/* Admin PIN */}
            <div style={{ ...styles.formGroup, marginTop: '0.5rem' }}>
              <label>Admin Access PIN</label>
              <input 
                type="text" 
                maxLength={6} 
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                style={styles.pinInput}
              />
              <p style={styles.inputHelpText}>
                PIN code required to view individual employee payroll bands and configure corporate hourly rates.
              </p>
            </div>

            <div style={styles.formActions}>
              {saveSuccess && <span style={styles.successText}>Settings Saved!</span>}
              <button type="submit" className="btn-primary">Save Changes</button>
            </div>
          </form>
        </div>

        {/* Database wipes & actions */}
        <div className="glass-panel" style={styles.card}>
          <div className="glass-card-header">
            <div style={styles.headerTitleRow}>
              <RotateCcw size={20} color="var(--danger)" />
              <h3>Factory Actions</h3>
            </div>
          </div>

          <p style={styles.descText}>
            Reset the prototype database. This will restore the pre-seeded hackathon scenario ( Aarav, Aditi, project limits, and meeting logs ).
          </p>

          <div style={styles.actionCardBody}>
            <button 
              onClick={triggerReset} 
              className="btn-danger" 
              style={styles.resetBtn}
            >
              <RotateCcw size={16} />
              <span>Reset Database</span>
            </button>
            {resetSuccess && <span style={styles.resetSuccessText}>Database Reset Successful!</span>}
          </div>

          <div style={styles.warningCallout}>
            <ShieldAlert size={16} />
            <span>Wiping data will clear custom employee mapping.</span>
          </div>
        </div>

        {/* Terminal Logs */}
        <div className="glass-panel" style={{ ...styles.card, gridColumn: 'span 2' }}>
          <div className="glass-card-header">
            <div style={styles.headerTitleRow}>
              <Terminal size={20} color="var(--secondary)" />
              <h3>Active Engine Logs</h3>
            </div>
            <button 
              onClick={() => setLogs(prev => [`[${new Date().toLocaleTimeString()}] INFO: Logs cleared.`, ...prev])} 
              className="btn-secondary"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              Clear Feed
            </button>
          </div>

          <div style={styles.terminal}>
            {logs.map((log, index) => (
              <div 
                key={index} 
                style={{ 
                  ...styles.logLine,
                  color: log.includes('WARNING') ? '#f59e0b' : log.includes('SUCCESS') ? '#10b981' : '#9ca3af'
                }}
              >
                {log}
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  card: {
    minHeight: '280px',
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
    marginTop: '0.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.35rem',
    textAlign: 'left' as const,
  },
  inputLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  apiInput: {
    width: '100%',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
  },
  pinInput: {
    width: '120px',
    textAlign: 'center' as const,
    fontFamily: 'var(--font-mono)',
    fontWeight: 'bold',
  },
  inputHelpText: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    lineHeight: '1.35',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '1rem',
  },
  successText: {
    color: '#10b981',
    fontSize: '0.825rem',
    fontWeight: 500,
  },
  descText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
    marginBottom: '1.5rem',
  },
  actionCardBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  resetBtn: {
    padding: '0.625rem 1.25rem',
  },
  resetSuccessText: {
    color: '#10b981',
    fontSize: '0.825rem',
    fontWeight: 500,
  },
  warningCallout: {
    marginTop: '1.5rem',
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    padding: '0.75rem',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: '#fca5a5',
  },
  terminal: {
    background: '#040711',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '1rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.775rem',
    maxHeight: '180px',
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.35rem',
    textAlign: 'left' as const,
  },
  logLine: {
    lineHeight: '1.4',
  }
};
