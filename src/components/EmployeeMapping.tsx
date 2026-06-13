import React, { useState } from 'react';
import { Users, ShieldCheck, Lock, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import type { Employee, RoleRate, Project } from '../types';

interface EmployeeMappingProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  roleRates: RoleRate[];
  setRoleRates: React.Dispatch<React.SetStateAction<RoleRate[]>>;
  projects: Project[];
  isAdminMode: boolean;
}

export const EmployeeMapping: React.FC<EmployeeMappingProps> = ({
  employees,
  setEmployees,
  roleRates,
  setRoleRates,
  projects,
  isAdminMode
}) => {
  // Adding Employee State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState(roleRates[0]?.role || '');
  const [newProj, setNewProj] = useState('proj-pol');

  // Editing Rates State
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingRateValue, setEditingRateValue] = useState<number>(0);

  // Add Employee handler
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      primaryProjectId: newProj === 'none' ? undefined : newProj
    };

    setEmployees(prev => [...prev, newEmp]);
    setNewName('');
    setNewEmail('');
    setShowAddForm(false);
  };

  // Delete Employee handler
  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  // Save Role Rate
  const handleSaveRate = (role: string) => {
    setRoleRates(prev => 
      prev.map(r => r.role === role ? { ...r, hourlyRate: editingRateValue } : r)
    );
    setEditingRole(null);
  };

  // Change Employee Project directly
  const handleEmployeeProjectChange = (employeeId: string, projectId: string) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, primaryProjectId: projectId === 'none' ? undefined : projectId } 
          : emp
      )
    );
  };

  return (
    <div className="content-pane" style={styles.container}>
      <section style={styles.grid}>
        
        {/* Employees Table Directory */}
        <div className="glass-panel" style={{ ...styles.card, gridColumn: 'span 2' }}>
          <div className="glass-card-header">
            <div style={styles.headerTitleRow}>
              <Users size={20} color="var(--primary)" />
              <h3>Employee Directory & Primary Project</h3>
            </div>
            {isAdminMode && (
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn-primary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                <Plus size={14} />
                <span>Add Employee</span>
              </button>
            )}
          </div>

          {showAddForm && (
            <form onSubmit={handleAddEmployee} style={styles.addForm} className="glass-panel">
              <h4>Add New Employee</h4>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Jane Doe" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="jane.d@company.com" 
                    value={newEmail} 
                    onChange={e => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Designation / Role</label>
                  <select value={newRole} onChange={e => setNewRole(e.target.value)}>
                    {roleRates.map(r => (
                      <option key={r.role} value={r.role}>{r.role}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label>Primary Project</label>
                  <select value={newProj} onChange={e => setNewProj(e.target.value)}>
                    <option value="none">Operations / No Specific Project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Employee</button>
              </div>
            </form>
          )}

          <div className="glass-table-wrapper" style={{ marginTop: '0.5rem' }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email Address</th>
                  <th>Designation</th>
                  <th>Primary Project Attribution</th>
                  <th>Hourly Cost Rate</th>
                  {isAdminMode && <th style={{ width: '80px' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const rateObj = roleRates.find(r => r.role === emp.role);
                  const rateVal = rateObj ? rateObj.hourlyRate : 80;

                  return (
                    <tr key={emp.id}>
                      <td style={{ fontWeight: 600 }}>{emp.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{emp.email}</td>
                      <td>
                        <span className="badge badge-neutral" style={styles.roleBadge}>
                          {emp.role}
                        </span>
                      </td>
                      <td>
                        <select
                          value={emp.primaryProjectId || 'none'}
                          onChange={(e) => handleEmployeeProjectChange(emp.id, e.target.value)}
                          style={styles.tableSelect}
                        >
                          <option value="none">Operations / General Admin</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {isAdminMode ? (
                          <span style={styles.rateHighlight}>₹{rateVal}/hr</span>
                        ) : (
                          <div style={styles.lockedRate} title="Enable Admin Mode in Sidebar to view financial details">
                            <Lock size={12} color="var(--text-muted)" />
                            <span style={styles.lockedText}>Locked</span>
                          </div>
                        )}
                      </td>
                      {isAdminMode && (
                        <td>
                          <button 
                            onClick={() => handleDeleteEmployee(emp.id)} 
                            className="btn-danger"
                            style={styles.deleteBtn}
                            title="Delete Employee"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Roles & Salary Band Configuration */}
        <div className="glass-panel" style={styles.card}>
          <div className="glass-card-header">
            <div style={styles.headerTitleRow}>
              <ShieldCheck size={20} color="var(--secondary)" />
              <h3>Designation Hourly Rates</h3>
            </div>
          </div>
          
          <p style={styles.infoParagraph}>
            Configure the internal estimated hourly rate for each corporate title. Adjusting a rate automatically propagates cost reviews across all historical calendar syncs.
          </p>

          <div style={styles.ratesList}>
            {roleRates.map((r) => {
              const isEditing = editingRole === r.role;
              return (
                <div key={r.role} style={styles.rateItem}>
                  <div style={styles.rateLabelBlock}>
                    <span style={styles.rateRoleName}>{r.role}</span>
                  </div>

                  {isEditing ? (
                    <div style={styles.rateEditWrapper}>
                      <input 
                        type="number" 
                        value={editingRateValue} 
                        onChange={e => setEditingRateValue(parseInt(e.target.value) || 0)}
                        style={styles.rateInput}
                        min={100}
                        max={50000}
                        autoFocus
                      />
                      <button 
                        onClick={() => handleSaveRate(r.role)}
                        className="btn-primary"
                        style={styles.editRateActionBtn}
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        onClick={() => setEditingRole(null)}
                        className="btn-secondary"
                        style={styles.editRateActionBtn}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={styles.rateValBlock}>
                      {isAdminMode ? (
                        <>
                          <span style={styles.rateText}>₹{r.hourlyRate}/hr</span>
                          <button 
                            onClick={() => {
                              setEditingRole(r.role);
                              setEditingRateValue(r.hourlyRate);
                            }}
                            className="btn-secondary"
                            style={styles.editBtn}
                            title="Edit hourly rate"
                          >
                            <Edit2 size={12} />
                          </button>
                        </>
                      ) : (
                        <div style={styles.lockedRate}>
                          <Lock size={12} color="var(--text-muted)" />
                          <span style={styles.lockedText}>Locked</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!isAdminMode && (
            <div style={styles.lockBanner}>
              <Lock size={16} />
              <span>Unlock Admin Mode to edit salary bands and designation rates.</span>
            </div>
          )}
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
    gridTemplateColumns: '2fr 1.1fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  card: {
    minHeight: '400px',
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  addForm: {
    marginBottom: '1.5rem',
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
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  },
  tableSelect: {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--glass-border)',
    fontSize: '0.8rem',
    height: '32px',
    padding: '0.2rem 0.5rem',
    width: '100%',
  },
  roleBadge: {
    fontSize: '0.7rem',
    padding: '0.2rem 0.5rem',
    border: '1px solid var(--glass-border)',
  },
  lockedRate: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  lockedText: {
    fontSize: '0.725rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  rateHighlight: {
    color: '#34d399',
    fontWeight: 600,
  },
  deleteBtn: {
    padding: '0.35rem',
    borderRadius: '4px',
  },
  infoParagraph: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginBottom: '1.25rem',
  },
  ratesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.625rem',
  },
  rateItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.625rem 1rem',
    background: 'rgba(255, 255, 255, 0.01)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.03)',
  },
  rateLabelBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  rateRoleName: {
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  rateValBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  rateText: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#818cf8',
  },
  editBtn: {
    padding: '0.35rem',
    borderRadius: '4px',
  },
  rateEditWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  rateInput: {
    width: '70px',
    height: '30px',
    padding: '0.2rem 0.5rem',
    textAlign: 'center' as const,
  },
  editRateActionBtn: {
    padding: '0.35rem',
    height: '30px',
    width: '30px',
  },
  lockBanner: {
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
  }
};
