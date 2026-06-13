import React, { useState } from 'react';
import { FolderKanban, Plus, AlertCircle, Edit2, Check, X, Info } from 'lucide-react';
import type { Project, Meeting, Employee, RoleRate } from '../types';

interface ProjectBudgetsProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  meetings: Meeting[];
  employees: Employee[];
  roleRates: RoleRate[];
  isAdminMode: boolean;
}

export const ProjectBudgets: React.FC<ProjectBudgetsProps> = ({
  projects,
  setProjects,
  meetings,
  employees,
  roleRates,
  isAdminMode
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBudget, setNewBudget] = useState(20000);
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newColor, setNewColor] = useState('#818cf8');

  // Inline edit state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingBudgetVal, setEditingBudgetVal] = useState<number>(0);

  // Helper: Get hourly rate for an attendee
  const getAttendeeRate = (email: string): number => {
    const emp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (!emp) return 1500;
    const rateObj = roleRates.find(r => r.role === emp.role);
    return rateObj ? rateObj.hourlyRate : 1500;
  };

  // Helper: Calculate cost of a single meeting
  const calculateMeetingCost = (meeting: Meeting): number => {
    const totalHourlyRate = meeting.attendeeEmails.reduce((sum, email) => sum + getAttendeeRate(email), 0);
    return (totalHourlyRate * meeting.durationMinutes) / 60;
  };

  // Helper: Get cost and hours for a project
  const getProjectMetrics = (projectId: string) => {
    const projMeetings = meetings.filter(m => m.attributedProjectId === projectId);
    const cost = projMeetings.reduce((sum, m) => sum + calculateMeetingCost(m), 0);
    const hours = projMeetings.reduce((sum, m) => sum + (m.durationMinutes * m.attendeeEmails.length) / 60, 0);
    return { cost, hours, count: projMeetings.length };
  };

  // Add Project
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: newName,
      code: newCode.toUpperCase(),
      description: newDesc,
      budget: newBudget,
      priority: newPriority,
      status: 'active',
      color: newColor
    };

    setProjects(prev => [...prev, newProj]);
    setNewName('');
    setNewCode('');
    setNewDesc('');
    setShowAddForm(false);
  };

  // Save edited budget
  const handleSaveBudget = (id: string) => {
    setProjects(prev => 
      prev.map(p => p.id === id ? { ...p, budget: editingBudgetVal } : p)
    );
    setEditingProjectId(null);
  };

  const projectColors = [
    '#6366f1', // Indigo
    '#a855f7', // Purple
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Rose
    '#ec4899', // Pink
    '#06b6d4', // Cyan
  ];

  return (
    <div className="content-pane" style={styles.container}>
      <div style={styles.headerRow}>
        <div style={styles.titleArea}>
          <FolderKanban size={20} color="var(--primary)" />
          <h3>Project Budget Tracker</h3>
        </div>
        {isAdminMode && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
          >
            <Plus size={16} />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProject} className="glass-panel" style={styles.addForm}>
          <h4>Create New Project Stream</h4>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label>Project Name</label>
              <input 
                type="text" 
                placeholder="Project Apollo" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label>Project Code</label>
              <input 
                type="text" 
                placeholder="PROJ-APO" 
                value={newCode} 
                onChange={e => setNewCode(e.target.value)}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label>Budget Limit (₹)</label>
              <input 
                type="number" 
                value={newBudget} 
                onChange={e => setNewBudget(parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label>Priority</label>
              <select 
                value={newPriority} 
                onChange={e => setNewPriority(e.target.value as any)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label>Project Color Theme</label>
              <div style={styles.colorPickerGrid}>
                {projectColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    style={{
                      ...styles.colorPickerDot,
                      backgroundColor: color,
                      border: newColor === color ? '2px solid white' : '2px solid transparent',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div style={{ ...styles.formGroup, marginTop: '0.5rem' }}>
            <label>Project Description</label>
            <textarea 
              rows={2} 
              placeholder="Provide context for AI keyword mapping and search engines..." 
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
            />
          </div>
          <div style={styles.formActions}>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Project</button>
          </div>
        </form>
      )}

      {/* Grid of Projects */}
      <section style={styles.projectGrid}>
        {projects.map((p) => {
          const { cost, hours, count } = getProjectMetrics(p.id);
          const isOperational = p.id === 'proj-admin';
          
          // Budget Calculations
          const budget = p.budget;
          const burnPercent = budget > 0 ? (cost / budget) * 100 : 0;
          
          let alertState: 'green' | 'amber' | 'red' = 'green';
          let alertLabel = 'Healthy';
          let accentColor = 'var(--success)';
          
          if (burnPercent >= 100) {
            alertState = 'red';
            alertLabel = 'Over Budget';
            accentColor = 'var(--danger)';
          } else if (burnPercent >= 80) {
            alertState = 'amber';
            alertLabel = 'Budget Warning';
            accentColor = 'var(--warning)';
          }

          const isEditing = editingProjectId === p.id;

          return (
            <div key={p.id} className="glass-panel" style={styles.projectCard}>
              {/* Card Header */}
              <div style={styles.cardHeader}>
                <div style={styles.projectHeaderMain}>
                  <div style={{ ...styles.projectColorGlow, backgroundColor: p.color }} />
                  <div>
                    <h4 style={styles.projectName}>{p.name}</h4>
                    <span style={styles.projectCode}>{p.code}</span>
                  </div>
                </div>
                
                <span className={`badge ${
                  p.priority === 'high' ? 'badge-danger' : p.priority === 'medium' ? 'badge-warning' : 'badge-neutral'
                }`} style={{ fontSize: '0.65rem' }}>
                  {p.priority} Priority
                </span>
              </div>

              {/* Description */}
              <p style={styles.projectDesc}>{p.description}</p>

              {/* Mid Statistics */}
              <div style={styles.projectStatsRow}>
                <div style={styles.statBox}>
                  <span style={styles.statLabel}>Accrued Cost</span>
                  <span style={styles.statVal}>₹{cost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div style={styles.statBox}>
                  <span style={styles.statLabel}>Person Hours</span>
                  <span style={styles.statVal}>{hours.toFixed(0)}h</span>
                </div>
                <div style={styles.statBox}>
                  <span style={styles.statLabel}>Meetings Ingested</span>
                  <span style={styles.statVal}>{count} syncs</span>
                </div>
              </div>

              {/* Progress and Budget controls */}
              {!isOperational ? (
                <div style={styles.budgetSection}>
                  <div style={styles.progressLabels}>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', color: accentColor }}>
                      {alertLabel} ({burnPercent.toFixed(0)}%)
                    </span>
                    
                    {isEditing ? (
                      <div style={styles.editBudgetRow}>
                        <input 
                          type="number" 
                          value={editingBudgetVal} 
                          onChange={e => setEditingBudgetVal(parseInt(e.target.value) || 0)}
                          style={styles.editBudgetInput}
                          min={0}
                        />
                        <button onClick={() => handleSaveBudget(p.id)} className="btn-primary" style={styles.budgetActionBtn}><Check size={12} /></button>
                        <button onClick={() => setEditingProjectId(null)} className="btn-secondary" style={styles.budgetActionBtn}><X size={12} /></button>
                      </div>
                    ) : (
                      <div style={styles.budgetDisplayRow}>
                        <span style={styles.budgetLimitText}>Limit: ₹{budget.toLocaleString('en-IN')}</span>
                        {isAdminMode && (
                          <button 
                            onClick={() => {
                              setEditingProjectId(p.id);
                              setEditingBudgetVal(p.budget);
                            }}
                            style={styles.editBudgetBtn}
                            title="Edit project budget limit"
                          >
                            <Edit2 size={11} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div style={styles.progressTrack}>
                    <div style={{
                      ...styles.progressFill,
                      width: `${Math.min(100, burnPercent)}%`,
                      backgroundColor: accentColor,
                      boxShadow: `0 0 10px ${accentColor}33`
                    }} />
                  </div>

                  {alertState !== 'green' && (
                    <div style={{ ...styles.alertCallout, borderColor: accentColor, backgroundColor: `${accentColor}11` }}>
                      <AlertCircle size={14} color={accentColor} />
                      <span style={{ fontSize: '0.725rem', color: accentColor }}>
                        {alertState === 'red' 
                          ? `Budget overspent by ₹${(cost - budget).toLocaleString('en-IN', { maximumFractionDigits: 0 })}!`
                          : `Approaching budget maximum. Burn rate is critical.`}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.operationalBanner}>
                  <Info size={14} color="var(--text-secondary)" />
                  <span>Operations and Admin has no strict budget limit.</span>
                </div>
              )}
            </div>
          );
        })}
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
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  addForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px dashed var(--glass-border)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.35rem',
    textAlign: 'left' as const,
  },
  colorPickerGrid: {
    display: 'flex',
    gap: '0.4rem',
    alignItems: 'center',
    height: '40px',
  },
  colorPickerDot: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    cursor: 'pointer',
    outline: 'none',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  },
  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '1.5rem',
  },
  projectCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    minHeight: '320px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  projectHeaderMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  projectColorGlow: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    boxShadow: '0 0 10px currentColor',
  },
  projectName: {
    fontSize: '1.05rem',
    fontWeight: 700,
  },
  projectCode: {
    fontSize: '0.725rem',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 500,
  },
  projectDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginBottom: '1.25rem',
    flex: 1,
  },
  projectStatsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    background: 'rgba(255, 255, 255, 0.015)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '0.625rem 0.875rem',
    marginBottom: '1.25rem',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  statLabel: {
    fontSize: '0.675rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  statVal: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  budgetSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  progressLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetDisplayRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  budgetLimitText: {
    fontSize: '0.775rem',
    color: 'var(--text-secondary)',
  },
  editBudgetBtn: {
    background: 'transparent',
    color: 'var(--text-muted)',
    padding: '0.2rem',
    borderRadius: '4px',
  },
  editBudgetRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  editBudgetInput: {
    width: '80px',
    height: '24px',
    padding: '0 0.4rem',
    fontSize: '0.75rem',
  },
  budgetActionBtn: {
    padding: '0.2rem',
    height: '24px',
    width: '24px',
  },
  progressTrack: {
    height: '6px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.5s ease',
  },
  alertCallout: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid transparent',
    marginTop: '0.25rem',
  },
  operationalBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--glass-border)',
    padding: '0.625rem 0.875rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  }
};
