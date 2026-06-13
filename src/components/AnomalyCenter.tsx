import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  UserMinus, 
  Flame, 
  Coins, 
  HelpCircle, 
  ArrowRight,
  Check
} from 'lucide-react';
import type { Meeting, Project, Employee, RoleRate, Anomaly } from '../types';

interface AnomalyCenterProps {
  meetings: Meeting[];
  projects: Project[];
  employees: Employee[];
  roleRates: RoleRate[];
  setActiveTab: (tab: string) => void;
}

export const AnomalyCenter: React.FC<AnomalyCenterProps> = ({
  meetings,
  projects,
  employees,
  roleRates,
  setActiveTab
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [dismissedAnomalyIds, setDismissedAnomalyIds] = useState<string[]>([]);

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

  // --- Real-time Anomaly Generator ---
  const generateAnomalies = (): Anomaly[] => {
    const list: Anomaly[] = [];

    // 1. Budget Overruns
    projects.forEach(p => {
      if (p.id === 'proj-admin') return;
      const projMeetings = meetings.filter(m => m.attributedProjectId === p.id);
      const totalCost = projMeetings.reduce((sum, m) => sum + calculateMeetingCost(m), 0);
      
      if (p.budget > 0 && totalCost > p.budget) {
        list.push({
          id: `anomaly-budget-${p.id}`,
          type: 'budget_overrun',
          severity: 'critical',
          title: `Budget Overrun: ${p.name}`,
          description: `Total meeting expenditure (₹${totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}) has exceeded the assigned project budget limit of ₹${p.budget.toLocaleString()} by ₹${(totalCost - p.budget).toLocaleString('en-US', { maximumFractionDigits: 0 })}.`,
          targetId: p.id,
          detectedAt: new Date().toISOString()
        });
      } else if (p.budget > 0 && totalCost > p.budget * 0.8) {
        list.push({
          id: `anomaly-budget-warn-${p.id}`,
          type: 'budget_overrun',
          severity: 'warning',
          title: `Budget Warning: ${p.name}`,
          description: `Project has spent ₹${totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })} (${((totalCost / p.budget) * 100).toFixed(0)}% of its ₹${p.budget.toLocaleString()} budget). Review recurrence patterns.`,
          targetId: p.id,
          detectedAt: new Date().toISOString()
        });
      }
    });

    // 2. Low confidence AI attribution / Unattributed meetings
    meetings.forEach(m => {
      if (m.attributedProjectId === 'unattributed') {
        list.push({
          id: `anomaly-unattrib-${m.id}`,
          type: 'unattributed_meeting',
          severity: 'warning',
          title: `Unattributed Meeting: "${m.title}"`,
          description: `This meeting has no project attribution. AI confidence is extremely low (${Math.round(m.attributionConfidence * 100)}%). Finance cannot attribute this cost.`,
          targetId: m.id,
          detectedAt: m.startTime
        });
      } else if (m.attributionConfidence < 0.55 && !m.isManualOverride) {
        list.push({
          id: `anomaly-lowconf-${m.id}`,
          type: 'unattributed_meeting',
          severity: 'info',
          title: `Low Confidence Attribution: "${m.title}"`,
          description: `AI attributed this to ${projects.find(p => p.id === m.attributedProjectId)?.name || m.attributedProjectId} but with low confidence (${Math.round(m.attributionConfidence * 100)}%). Needs human audit.`,
          targetId: m.id,
          detectedAt: m.startTime
        });
      }
    });

    // 3. Employee Meeting Burnout (Meetings > 20 Hours in a month)
    employees.forEach(emp => {
      const empMeetings = meetings.filter(m => 
        m.attendeeEmails.some(email => email.toLowerCase() === emp.email.toLowerCase())
      );
      
      const totalHours = empMeetings.reduce((sum, m) => sum + m.durationMinutes / 60, 0);
      
      if (totalHours > 20) {
        list.push({
          id: `anomaly-burnout-${emp.id}`,
          type: 'burnout',
          severity: 'warning',
          title: `Meeting Overload: ${emp.name}`,
          description: `${emp.name} (${emp.role}) has spent ${totalHours.toFixed(1)} hours in meetings this month. This exceeds corporate healthy collaboration limits.`,
          targetId: emp.id,
          detectedAt: new Date().toISOString()
        });
      }
    });

    // 4. High Cost / Low Priority Meetings
    meetings.forEach(m => {
      const cost = calculateMeetingCost(m);
      // If a single meeting costs more than ₹10,000
      if (cost > 10000) {
        const title = m.title.toLowerCase();
        const desc = m.description.toLowerCase();
        const isLowPriorityKeywords = 
          title.includes('chai') || title.includes('coffee') || title.includes('catchup') || 
          title.includes('chat') || title.includes('lunch') || title.includes('hangout') || desc.includes('casual');

        list.push({
          id: `anomaly-costly-${m.id}`,
          type: 'low_priority_leak',
          severity: isLowPriorityKeywords ? 'critical' : 'info',
          title: `High Cost Sync: "${m.title}"`,
          description: `This meeting cost the organization ₹${cost.toFixed(0)} for a single session. Attendees include multiple high-rate staff members. ${
            isLowPriorityKeywords ? 'Critically flagged as casual/low-priority context.' : 'Audit meeting frequency.'
          }`,
          targetId: m.id,
          detectedAt: m.startTime
        });
      }
    });

    // 5. Ghost Meetings (Only 1 attendee)
    meetings.forEach(m => {
      if (m.attendeeEmails.length <= 1) {
        list.push({
          id: `anomaly-ghost-${m.id}`,
          type: 'ghost_meeting',
          severity: 'info',
          title: `Potential Ghost Meeting: "${m.title}"`,
          description: `Only ${m.attendeeEmails.length} attendee participated in this scheduled block. This indicates an ignored calendar sync or a focus-time block configured as a meeting.`,
          targetId: m.id,
          detectedAt: m.startTime
        });
      }
    });

    return list.filter(a => !dismissedAnomalyIds.includes(a.id));
  };

  const anomalies = generateAnomalies();

  // Handle Ignore / Dismiss Anomaly
  const handleDismiss = (id: string) => {
    setDismissedAnomalyIds(prev => [...prev, id]);
  };

  // Filter anomalies
  const filteredAnomalies = anomalies.filter(a => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  const getSeverityIcon = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return <ShieldAlert size={20} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={20} color="#f59e0b" />;
      case 'info':
        return <HelpCircle size={20} color="#3b82f6" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget_overrun':
        return <Coins size={16} />;
      case 'unattributed_meeting':
        return <AlertTriangle size={16} />;
      case 'burnout':
        return <Flame size={16} />;
      case 'low_priority_leak':
        return <Coins size={16} />;
      case 'ghost_meeting':
        return <UserMinus size={16} />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  return (
    <div className="content-pane" style={styles.container}>
      {/* Category Tabs */}
      <div style={styles.tabFilters}>
        {[
          { id: 'all', name: 'All Alerts', count: anomalies.length },
          { id: 'budget_overrun', name: 'Budget Burn', count: anomalies.filter(a => a.type === 'budget_overrun').length },
          { id: 'unattributed_meeting', name: 'AI Attribution Issues', count: anomalies.filter(a => a.type === 'unattributed_meeting').length },
          { id: 'burnout', name: 'Employee Overload', count: anomalies.filter(a => a.type === 'burnout').length },
          { id: 'low_priority_leak', name: 'Time Leakage', count: anomalies.filter(a => a.type === 'low_priority_leak').length },
          { id: 'ghost_meeting', name: 'Ghost Meetings', count: anomalies.filter(a => a.type === 'ghost_meeting').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            style={{
              ...styles.filterTab,
              ...(filterType === tab.id ? styles.filterTabActive : {})
            }}
          >
            <span>{tab.name}</span>
            <span style={{
              ...styles.tabCount,
              backgroundColor: tab.count > 0 ? (tab.id === 'all' || tab.id === 'budget_overrun' ? '#ef4444' : '#f59e0b') : 'var(--bg-tertiary)'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Anomalies List */}
      <div style={styles.anomalyList}>
        {filteredAnomalies.map((a) => {
          let severityBorder = 'rgba(59, 130, 246, 0.2)';
          let severityBg = 'rgba(59, 130, 246, 0.03)';
          let badgeClass = 'badge-info';

          if (a.severity === 'critical') {
            severityBorder = 'rgba(239, 68, 68, 0.3)';
            severityBg = 'rgba(239, 68, 68, 0.05)';
            badgeClass = 'badge-danger';
          } else if (a.severity === 'warning') {
            severityBorder = 'rgba(245, 158, 11, 0.3)';
            severityBg = 'rgba(245, 158, 11, 0.05)';
            badgeClass = 'badge-warning';
          }

          return (
            <div 
              key={a.id} 
              className="glass-panel" 
              style={{ 
                ...styles.anomalyCard,
                borderColor: severityBorder,
                backgroundColor: severityBg
              }}
            >
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderLeft}>
                  {getSeverityIcon(a.severity)}
                  <h4 style={styles.cardTitle}>{a.title}</h4>
                </div>
                <div style={styles.cardHeaderRight}>
                  <span className={`badge ${badgeClass}`} style={{ fontSize: '0.65rem' }}>
                    {a.severity}
                  </span>
                  <span style={styles.typeTag}>
                    {getTypeIcon(a.type)}
                    <span style={{ fontSize: '0.725rem' }}>{a.type.replace('_', ' ')}</span>
                  </span>
                </div>
              </div>

              <p style={styles.cardDesc}>{a.description}</p>

              <div style={styles.cardFooter}>
                <div style={styles.detectedAt}>
                  Detected: {new Date(a.detectedAt).toLocaleDateString()}
                </div>
                
                <div style={styles.actionsGroup}>
                  <button 
                    onClick={() => handleDismiss(a.id)}
                    className="btn-secondary"
                    style={styles.actionBtn}
                  >
                    <Check size={14} />
                    <span>Dismiss Alert</span>
                  </button>

                  {a.type === 'unattributed_meeting' || a.type === 'low_priority_leak' || a.type === 'ghost_meeting' ? (
                    <button 
                      onClick={() => setActiveTab('calendar')}
                      className="btn-primary"
                      style={styles.actionBtn}
                    >
                      <span>Review Calendar</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : a.type === 'budget_overrun' ? (
                    <button 
                      onClick={() => setActiveTab('projects')}
                      className="btn-primary"
                      style={styles.actionBtn}
                    >
                      <span>Adjust Budget</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setActiveTab('employees')}
                      className="btn-primary"
                      style={styles.actionBtn}
                    >
                      <span>Check Allocations</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAnomalies.length === 0 && (
          <div className="glass-panel" style={styles.emptyCard}>
            <div style={{ fontSize: '2rem' }}>🎉</div>
            <h4>No Anomalies Flagged</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '0.5rem' }}>
              Your meeting allocations, project budgets, and employee collaboration bounds look perfectly clean!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  tabFilters: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '1rem',
  },
  filterTab: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-secondary)',
    padding: '0.5rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.825rem',
  },
  filterTabActive: {
    background: 'rgba(99, 102, 241, 0.08)',
    borderColor: 'var(--primary)',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  tabCount: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'white',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
  },
  anomalyList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  anomalyCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.85rem',
    padding: '1.25rem 1.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 700,
  },
  cardHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  typeTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase' as const,
    fontSize: '0.7rem',
    fontWeight: 500,
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.02)',
    paddingTop: '0.75rem',
  },
  detectedAt: {
    fontSize: '0.725rem',
    color: 'var(--text-muted)',
  },
  actionsGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtn: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.775rem',
    height: '32px',
  },
  emptyCard: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  }
};
