import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Search, 
  Bot, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  AlertCircle, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import type { Meeting, Project, Employee, RoleRate } from '../types';
import { aiService } from '../services/aiService';

interface CalendarSyncProps {
  meetings: Meeting[];
  setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
  projects: Project[];
  employees: Employee[];
  roleRates: RoleRate[];
  geminiApiKey: string;
}

export const CalendarSync: React.FC<CalendarSyncProps> = ({
  meetings,
  setMeetings,
  projects,
  employees,
  roleRates,
  geminiApiKey
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);
  
  // Modals / Sync States
  const [isSyncingModal, setIsSyncingModal] = useState(false);
  const [syncPlatform, setSyncPlatform] = useState<'Google' | 'Outlook' | null>(null);
  const [syncStep, setSyncStep] = useState(0); // 0: init, 1: connecting, 2: importing, 3: completed
  const [recalculatingId, setRecalculatingId] = useState<string | null>(null);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Rate Helper
  const getAttendeeRate = (email: string): number => {
    const emp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (!emp) return 80;
    const rateObj = roleRates.find(r => r.role === emp.role);
    return rateObj ? rateObj.hourlyRate : 80;
  };

  const calculateMeetingCost = (meeting: Meeting): number => {
    const totalHourlyRate = meeting.attendeeEmails.reduce((sum, email) => sum + getAttendeeRate(email), 0);
    return (totalHourlyRate * meeting.durationMinutes) / 60;
  };

  // 1. Simulated Sync Operations
  const startSyncSimulation = (platform: 'Google' | 'Outlook') => {
    setSyncPlatform(platform);
    setIsSyncingModal(true);
    setSyncStep(0);

    // Timeline of simulated OAuth / Ingestion
    setTimeout(() => setSyncStep(1), 1200); // Connecting to calendar API
    setTimeout(() => setSyncStep(2), 2400); // Fetching events & analyzing
    setTimeout(() => {
      // Create and inject 2 new meetings
      const now = new Date();
      const newMeetings: Meeting[] = [
        {
          id: `meet-new-1`,
          title: 'Polaris Android UI Integration',
          description: 'Working on native wrapper for Android push notifications and UI components.',
          startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          endTime: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
          durationMinutes: 60,
          organizerEmail: 'chen.w@company.com',
          attendeeEmails: ['chen.w@company.com', 'sarah.j@company.com', 'emily.b@company.com'],
          attributedProjectId: 'proj-pol',
          attributionConfidence: 0.94,
          attributionMethod: 'heuristic',
          isManualOverride: false
        },
        {
          id: `meet-new-2`,
          title: 'Cloud Security Compliance Sync',
          description: 'Preparing IAM templates and checking audit exceptions.',
          startTime: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
          durationMinutes: 60,
          organizerEmail: 'jordan.l@company.com',
          attendeeEmails: ['jordan.l@company.com', 'alex.r@company.com'],
          attributedProjectId: 'proj-sec',
          attributionConfidence: 0.88,
          attributionMethod: 'heuristic',
          isManualOverride: false
        }
      ];

      // Insert new meetings if they don't exist
      setMeetings(prev => {
        const filtered = prev.filter(m => !m.id.startsWith('meet-new-'));
        return [...newMeetings, ...filtered];
      });

      setSyncStep(3);
    }, 4200);
  };

  // 2. Custom CSV / JSON File Ingestion
  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        let importedData: any[] = [];

        if (file.name.endsWith('.json')) {
          importedData = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          // Simplistic CSV Parser (header: Title, Description, Organizer, Attendees, Duration)
          const lines = content.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          importedData = lines.slice(1).map((line, idx) => {
            if (!line.trim()) return null;
            // Simple split handling quotes (not perfect, but functional for hackathon)
            const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const entry: any = {};
            
            headers.forEach((h, i) => {
              let val = parts[i]?.trim().replace(/^"|"$/g, '') || '';
              entry[h] = val;
            });

            return {
              id: `imported-csv-${Date.now()}-${idx}`,
              title: entry.title || 'Untitled Meeting',
              description: entry.description || 'No description provided',
              startTime: entry.starttime || new Date().toISOString(),
              endTime: entry.endtime || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
              durationMinutes: parseInt(entry.duration) || 60,
              organizerEmail: entry.organizer || 'admin@company.com',
              attendeeEmails: entry.attendees ? entry.attendees.split(';').map((a: string) => a.trim()) : ['admin@company.com']
            };
          }).filter(Boolean);
        } else {
          throw new Error('Unsupported file format. Please upload JSON or CSV.');
        }

        if (!Array.isArray(importedData)) {
          throw new Error('Data format error. Expected an array of events.');
        }

        // Process imported data and run AI attribution
        const processedMeetings: Meeting[] = [];
        
        for (const [idx, item] of importedData.entries()) {
          const rawMeeting = {
            title: item.title || 'Imported Meeting',
            description: item.description || '',
            attendeeEmails: Array.isArray(item.attendeeEmails) ? item.attendeeEmails : [item.organizerEmail || 'admin@company.com'],
            durationMinutes: parseInt(item.durationMinutes) || 60,
          };

          // Run AI heuristic or LLM
          let attribution;
          if (geminiApiKey) {
            attribution = await aiService.runGemini(rawMeeting, projects, employees, geminiApiKey);
          } else {
            attribution = aiService.runHeuristic(rawMeeting, projects, employees);
          }

          processedMeetings.push({
            id: item.id || `imported-${Date.now()}-${idx}`,
            title: rawMeeting.title,
            description: rawMeeting.description,
            startTime: item.startTime || new Date().toISOString(),
            endTime: item.endTime || new Date(Date.now() + rawMeeting.durationMinutes * 60000).toISOString(),
            durationMinutes: rawMeeting.durationMinutes,
            organizerEmail: item.organizerEmail || 'admin@company.com',
            attendeeEmails: rawMeeting.attendeeEmails,
            attributedProjectId: attribution.projectId,
            attributionConfidence: attribution.confidence,
            attributionMethod: attribution.method,
            isManualOverride: false,
            notes: attribution.explanation
          });
        }

        setMeetings(prev => [...processedMeetings, ...prev]);
        setUploadSuccess(`Successfully imported and AI-attributed ${processedMeetings.length} meetings!`);
      } catch (err: any) {
        setUploadError(err.message || 'Error parsing file. Please check syntax.');
      }
    };

    reader.readAsText(file);
  };

  // 3. Trigger manual override from list dropdown
  const handleProjectOverride = (meetingId: string, projectId: string) => {
    setMeetings(prev => 
      prev.map(m => {
        if (m.id === meetingId) {
          return {
            ...m,
            attributedProjectId: projectId,
            isManualOverride: true,
            attributionConfidence: 1.0,
            attributionMethod: 'manual'
          };
        }
        return m;
      })
    );
  };

  // 4. Force AI Attribution Recalculate
  const handleRecalculate = async (meeting: Meeting) => {
    setRecalculatingId(meeting.id);
    
    // Simulate thinking delay
    setTimeout(async () => {
      let result;
      if (geminiApiKey) {
        result = await aiService.runGemini(meeting, projects, employees, geminiApiKey);
      } else {
        result = aiService.runHeuristic(meeting, projects, employees);
      }

      setMeetings(prev => 
        prev.map(m => {
          if (m.id === meeting.id) {
            return {
              ...m,
              attributedProjectId: result.projectId,
              attributionConfidence: result.confidence,
              attributionMethod: result.method,
              isManualOverride: false,
              notes: result.explanation
            };
          }
          return m;
        })
      );
      setRecalculatingId(null);
    }, 800);
  };

  // Filter meetings
  const getFilteredMeetings = () => {
    return meetings.filter(m => {
      const matchSearch = 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.attendeeEmails.some(email => email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchProj = filterProject === 'all' || m.attributedProjectId === filterProject;

      return matchSearch && matchProj;
    });
  };

  const filteredMeetings = getFilteredMeetings();

  return (
    <div className="content-pane" style={styles.container}>
      {/* Top Banner: Sync & Import Zone */}
      <section style={styles.syncPanelGrid}>
        {/* Google / Outlook Sync Block */}
        <div className="glass-panel" style={styles.syncSourceCard}>
          <h3>Ingest Meetings from Calendars</h3>
          <p style={styles.panelDesc}>Connect corporate resource accounts to stream calendar audits.</p>
          
          <div style={styles.syncButtonsRow}>
            <button 
              onClick={() => startSyncSimulation('Google')}
              style={styles.googleSyncBtn}
              className="interactive"
            >
              <span style={styles.btnIconBig}>📅</span>
              <div style={styles.syncBtnLabel}>
                <span style={styles.btnLabelPrimary}>Sync Google Calendar</span>
                <span style={styles.btnLabelSec}>Requires Workspaces OAuth</span>
              </div>
            </button>

            <button 
              onClick={() => startSyncSimulation('Outlook')}
              style={styles.outlookSyncBtn}
              className="interactive"
            >
              <span style={styles.btnIconBig}>📧</span>
              <div style={styles.syncBtnLabel}>
                <span style={styles.btnLabelPrimary}>Sync Outlook 365</span>
                <span style={styles.btnLabelSec}>Requires Exchange Tenant API</span>
              </div>
            </button>
          </div>
        </div>

        {/* Custom Importer Zone */}
        <div className="glass-panel" style={styles.syncSourceCard}>
          <h3>File Ingest & Import</h3>
          <p style={styles.panelDesc}>Upload custom meeting logs using JSON or CSV schemas to check AI parsing.</p>
          
          <div 
            onClick={triggerFileSelect} 
            style={styles.dropZone}
            className="interactive"
          >
            <Upload size={24} color="var(--text-secondary)" />
            <span>Click to upload or drag JSON / CSV calendar</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Schema: Title, Description, Attendees, Duration</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".json,.csv"
              onChange={handleFileUpload}
            />
          </div>

          {uploadError && <p style={styles.uploadError}><AlertCircle size={14} /> {uploadError}</p>}
          {uploadSuccess && <p style={styles.uploadSuccess}><CheckCircle2 size={14} /> {uploadSuccess}</p>}
        </div>
      </section>

      {/* Main Table Filters */}
      <div style={styles.tableControls}>
        <div style={styles.searchWrapper}>
          <Search size={16} color="var(--text-secondary)" style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search meetings, descriptions, or attendees..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Project Filter:</span>
          <select 
            value={filterProject} 
            onChange={(e) => setFilterProject(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Attributed & Unattributed</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
            ))}
            <option value="unattributed">Unattributed Only</option>
          </select>
        </div>
      </div>

      {/* Meeting Audits Table */}
      <section className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="glass-table-wrapper">
          <table className="glass-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Meeting Details</th>
                <th>Attendees</th>
                <th>Duration & Cost</th>
                <th>AI Project Attribution</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeetings.map((m) => {
                const isExpanded = expandedMeetingId === m.id;
                const cost = calculateMeetingCost(m);
                const project = projects.find(p => p.id === m.attributedProjectId);
                const confidence = m.attributionConfidence;

                // Confidence badge
                let confColor = 'badge-neutral';
                let confText = 'Low';
                if (confidence >= 0.8) {
                  confColor = 'badge-success';
                  confText = `${(confidence * 100).toFixed(0)}% High`;
                } else if (confidence >= 0.5) {
                  confColor = 'badge-warning';
                  confText = `${(confidence * 100).toFixed(0)}% Mid`;
                } else {
                  confColor = 'badge-danger';
                  confText = `${(confidence * 100).toFixed(0)}% Low`;
                }

                if (m.isManualOverride) {
                  confColor = 'badge-info';
                  confText = 'Override';
                }

                const dateStr = new Date(m.startTime).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                });
                const timeStr = new Date(m.startTime).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });

                return (
                  <React.Fragment key={m.id}>
                    <tr>
                      <td>
                        <button 
                          onClick={() => setExpandedMeetingId(isExpanded ? null : m.id)}
                          style={styles.expandRowBtn}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                      <td>
                        <div style={styles.meetingTitleRow}>
                          <span style={styles.meetingTitle}>{m.title}</span>
                          <span style={styles.meetingDateTime}>{dateStr} @ {timeStr}</span>
                        </div>
                        <p style={styles.meetingDescTrunc}>{m.description}</p>
                      </td>
                      <td>
                        <div style={styles.attendeesCount} title={m.attendeeEmails.join(', ')}>
                          <span>👥 {m.attendeeEmails.length} Attendees</span>
                        </div>
                      </td>
                      <td>
                        <div style={styles.meetingCostCell}>
                          <span style={styles.meetingCost}>₹{cost.toLocaleString('en-US', { maximumFractionDigits: 1 })}</span>
                          <span style={styles.meetingDuration}>{m.durationMinutes} mins</span>
                        </div>
                      </td>
                      <td>
                        {/* Attribution Selector / Override Dropdown */}
                        <div style={styles.attributionSelectWrapper}>
                          {m.attributionMethod === 'llm' && <Sparkles size={12} color="#c084fc" style={styles.aiSelectorIcon} />}
                          {m.attributionMethod === 'heuristic' && <Bot size={12} color="#818cf8" style={styles.aiSelectorIcon} />}
                          {m.attributionMethod === 'manual' && <UserCheck size={12} color="#34d399" style={styles.aiSelectorIcon} />}
                          
                          <select
                            value={m.attributedProjectId}
                            onChange={(e) => handleProjectOverride(m.id, e.target.value)}
                            style={{
                              ...styles.attributionSelect,
                              borderLeft: `3px solid ${project?.color || '#9ca3af'}`,
                              paddingLeft: '24px'
                            }}
                          >
                            <option value="unattributed">⚠️ Unattributed</option>
                            {projects.map(p => (
                              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${confColor}`} style={styles.confBadge}>
                          {confText}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleRecalculate(m)}
                          disabled={recalculatingId === m.id}
                          className="btn-secondary"
                          style={styles.recalcBtn}
                          title="Force AI engine to run attribution review"
                        >
                          <RefreshCw 
                            size={12} 
                            style={{ 
                              animation: recalculatingId === m.id ? 'spin 1.5s linear infinite' : 'none' 
                            }} 
                          />
                        </button>
                      </td>
                    </tr>

                    {/* Expandable row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} style={styles.expandedRowBg}>
                          <div style={styles.expandedContent}>
                            <div style={styles.expandedGrid}>
                              {/* Left block */}
                              <div style={styles.expandedDetailsBlock}>
                                <h4>Meeting Description</h4>
                                <p style={styles.expandedDescText}>{m.description || 'No description provided.'}</p>
                                
                                <h4 style={{ marginTop: '1rem' }}>AI Decision Log</h4>
                                <div style={styles.aiDecisionPanel}>
                                  <div style={styles.aiDecisionHeader}>
                                    {m.attributionMethod === 'llm' ? (
                                      <>
                                        <Sparkles size={14} color="#c084fc" />
                                        <span>Attributed via Gemini LLM Engine</span>
                                      </>
                                    ) : m.attributionMethod === 'heuristic' ? (
                                      <>
                                        <Bot size={14} color="#818cf8" />
                                        <span>Attributed via Local Keyword Rules Engine</span>
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck size={14} color="#34d399" />
                                        <span>Attributed manually by Admin override</span>
                                      </>
                                    )}
                                  </div>
                                  <p style={styles.aiDecisionNotes}>
                                    {m.notes || `Confidence: ${Math.round(confidence * 100)}%. System matched organizer [${m.organizerEmail}] and description context against ${project?.name || 'project taxonomies'}.`}
                                  </p>
                                </div>
                              </div>

                              {/* Right block: Attendee list */}
                              <div style={styles.expandedDetailsBlock}>
                                <h4>Attendee Breakdown & Costs</h4>
                                <div style={styles.attendeeCostList}>
                                  {m.attendeeEmails.map((email, eIdx) => {
                                    const emp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
                                    const rate = getAttendeeRate(email);
                                    const shareCost = (rate * m.durationMinutes) / 60;
                                    
                                    return (
                                      <div key={eIdx} style={styles.attendeeCostItem}>
                                        <div style={styles.attendeeInfo}>
                                          <span style={styles.attendeeName}>{emp ? emp.name : email.split('@')[0]}</span>
                                          <span style={styles.attendeeRole}>{emp ? emp.role : 'Guest'}</span>
                                        </div>
                                        <div style={styles.attendeeCostBreakdown}>
                                          <span style={styles.attendeeCostVal}>₹{shareCost.toFixed(0)}</span>
                                          <span style={styles.attendeeRateVal}>₹{rate}/hr</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredMeetings.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No meeting audits match your search queries or filters. Try clicking "Sync Calendar" or importing files.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Simulated Sync Modal Overlay */}
      {isSyncingModal && syncPlatform && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.syncModalContent}>
            <h3>Calendar Synchronization</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Communicating with {syncPlatform} Calendar resources...
            </p>

            <div style={styles.syncStatusTimeline}>
              <div style={{ ...styles.syncTimelineStep, color: syncStep >= 1 ? '#34d399' : 'var(--text-muted)' }}>
                <span>{syncStep >= 1 ? '✅' : '⏳'}</span>
                <span>Connecting securely to resource tenant client...</span>
              </div>
              <div style={{ ...styles.syncTimelineStep, color: syncStep >= 2 ? '#34d399' : 'var(--text-muted)' }}>
                <span>{syncStep >= 2 ? '✅' : '⏳'}</span>
                <span>Ingesting active meeting titles & descriptions...</span>
              </div>
              <div style={{ ...styles.syncTimelineStep, color: syncStep >= 3 ? '#34d399' : 'var(--text-muted)' }}>
                <span>{syncStep >= 3 ? '✅' : '⏳'}</span>
                <span>Applying AI project attributions and calculating meeting costs...</span>
              </div>
            </div>

            {syncStep === 3 ? (
              <button 
                onClick={() => setIsSyncingModal(false)}
                className="btn-primary"
                style={{ width: '100%', marginTop: '1.5rem' }}
              >
                Incorporate Audited Meetings (+2)
              </button>
            ) : (
              <div style={styles.loadingSpinnerContainer}>
                <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite' }} color="var(--primary)" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  syncPanelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
  },
  syncSourceCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '200px',
  },
  panelDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
  },
  syncButtonsRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    flex: 1,
    justifyContent: 'center',
  },
  googleSyncBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'rgba(219, 68, 85, 0.1)',
    border: '1px solid rgba(219, 68, 85, 0.3)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    textAlign: 'left' as const,
    cursor: 'pointer',
    color: '#fca5a5',
  },
  outlookSyncBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'rgba(0, 120, 215, 0.1)',
    border: '1px solid rgba(0, 120, 215, 0.3)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    textAlign: 'left' as const,
    cursor: 'pointer',
    color: '#93c5fd',
  },
  btnIconBig: {
    fontSize: '1.5rem',
  },
  syncBtnLabel: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  btnLabelPrimary: {
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  btnLabelSec: {
    fontSize: '0.7rem',
    opacity: 0.8,
  },
  dropZone: {
    border: '2px dashed var(--glass-border)',
    borderRadius: '10px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    flex: 1,
    cursor: 'pointer',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  uploadError: {
    color: '#f87171',
    fontSize: '0.8rem',
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  uploadSuccess: {
    color: '#34d399',
    fontSize: '0.8rem',
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  tableControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '1rem',
    marginTop: '0.5rem',
  },
  searchWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: '280px',
    maxWidth: '500px',
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '12px',
  },
  searchInput: {
    paddingLeft: '36px',
    width: '100%',
    height: '40px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  filterLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  filterSelect: {
    height: '40px',
    background: 'var(--bg-secondary)',
    fontSize: '0.85rem',
  },
  expandRowBtn: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    padding: '0.25rem',
  },
  meetingTitleRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.75rem',
    marginBottom: '2px',
  },
  meetingTitle: {
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontSize: '0.925rem',
  },
  meetingDateTime: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap' as const,
  },
  meetingDescTrunc: {
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    maxWidth: '360px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  attendeesCount: {
    background: 'var(--bg-tertiary)',
    padding: '0.35rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    border: '1px solid var(--glass-border)',
    display: 'inline-flex',
    cursor: 'help',
  },
  meetingCostCell: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  meetingCost: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
  },
  meetingDuration: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  attributionSelectWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  aiSelectorIcon: {
    position: 'absolute' as const,
    left: '8px',
    pointerEvents: 'none' as const,
  },
  attributionSelect: {
    height: '34px',
    background: 'var(--bg-secondary)',
    fontSize: '0.8rem',
    padding: '0.25rem 0.5rem 0.25rem 1.75rem',
    width: '180px',
  },
  confBadge: {
    fontSize: '0.65rem',
    padding: '0.2rem 0.5rem',
    width: '75px',
    textAlign: 'center' as const,
    justifyContent: 'center',
  },
  recalcBtn: {
    padding: '0.4rem',
    borderRadius: '4px',
  },
  expandedRowBg: {
    backgroundColor: 'rgba(11, 15, 30, 0.4)',
  },
  expandedContent: {
    padding: '1.25rem 2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
  },
  expandedGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '2.5rem',
  },
  expandedDetailsBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  expandedDescText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  aiDecisionPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
  },
  aiDecisionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '0.35rem',
  },
  aiDecisionNotes: {
    fontSize: '0.775rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.35',
  },
  attendeeCostList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    maxHeight: '180px',
    overflowY: 'auto' as const,
    paddingRight: '0.25rem',
  },
  attendeeCostItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.4rem 0.625rem',
    background: 'rgba(255, 255, 255, 0.01)',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.03)',
  },
  attendeeInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  attendeeName: {
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  attendeeRole: {
    fontSize: '0.675rem',
    color: 'var(--text-muted)',
  },
  attendeeCostBreakdown: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
  },
  attendeeCostVal: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#818cf8',
  },
  attendeeRateVal: {
    fontSize: '0.675rem',
    color: 'var(--text-muted)',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  syncModalContent: {
    width: '100%',
    maxWidth: '460px',
    padding: '2rem',
  },
  syncStatusTimeline: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    margin: '1.5rem 0',
  },
  syncTimelineStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.825rem',
    lineHeight: '1.35',
  },
  loadingSpinnerContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1.5rem',
  }
};
