import React, { useState } from 'react';
import { 
  DollarSign, 
  Clock, 
  Bot, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import type { Meeting, Project, Employee, RoleRate, Anomaly } from '../types';

interface DashboardOverviewProps {
  meetings: Meeting[];
  projects: Project[];
  employees: Employee[];
  roleRates: RoleRate[];
  anomalies: Anomaly[];
  setActiveTab: (tab: string) => void;
  timeWindow: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  meetings,
  projects,
  employees,
  roleRates,
  anomalies,
  setActiveTab,
  timeWindow
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; date: string; value: number } | null>(null);

  // Helper: Get hourly rate for an attendee
  const getAttendeeRate = (email: string): number => {
    const emp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (!emp) return 80; // default rate
    const rateObj = roleRates.find(r => r.role === emp.role);
    return rateObj ? rateObj.hourlyRate : 80;
  };

  // Helper: Calculate cost of a single meeting
  const calculateMeetingCost = (meeting: Meeting): number => {
    const totalHourlyRate = meeting.attendeeEmails.reduce((sum, email) => sum + getAttendeeRate(email), 0);
    return (totalHourlyRate * meeting.durationMinutes) / 60;
  };

  // Filter meetings by time window
  const getFilteredMeetings = (): Meeting[] => {
    const now = new Date('2026-06-13T12:00:00');
    let daysLimit = 30;
    
    if (timeWindow === '7days') daysLimit = 7;
    else if (timeWindow === '30days') daysLimit = 30;
    else if (timeWindow === 'thismonth') {
      // Meetings in current month (June 2026)
      return meetings.filter(m => {
        const mDate = new Date(m.startTime);
        return mDate.getMonth() === now.getMonth() && mDate.getFullYear() === now.getFullYear();
      });
    } else if (timeWindow === 'lastmonth') {
      // Meetings in last month (May 2026)
      return meetings.filter(m => {
        const mDate = new Date(m.startTime);
        return mDate.getMonth() === now.getMonth() - 1 && mDate.getFullYear() === now.getFullYear();
      });
    }

    const limitDate = new Date(now.getTime() - daysLimit * 24 * 60 * 60 * 1000);
    return meetings.filter(m => new Date(m.startTime) >= limitDate);
  };

  const filteredMeetings = getFilteredMeetings();

  // Calculations
  const totalCost = filteredMeetings.reduce((sum, m) => sum + calculateMeetingCost(m), 0);
  const totalHours = filteredMeetings.reduce((sum, m) => sum + (m.durationMinutes * m.attendeeEmails.length) / 60, 0);
  
  const attributedMeetings = filteredMeetings.filter(m => m.attributedProjectId !== 'unattributed');
  const attributionRate = filteredMeetings.length > 0 
    ? (attributedMeetings.length / filteredMeetings.length) * 100 
    : 0;

  // 1. Calculate project cost allocation
  const projectCosts = projects.reduce((acc, p) => {
    acc[p.id] = { project: p, cost: 0, hours: 0, count: 0 };
    return acc;
  }, {} as Record<string, { project: Project | undefined; cost: number; hours: number; count: number }>);

  // Add a placeholder for unattributed
  projectCosts['unattributed'] = {
    project: {
      id: 'unattributed',
      name: 'Unattributed Meetings',
      code: 'UNATTRIB',
      description: 'Meetings waiting for manual review or better details.',
      budget: 0,
      priority: 'low',
      status: 'active',
      color: '#6b7280' // slate
    },
    cost: 0,
    hours: 0,
    count: 0
  };

  filteredMeetings.forEach(m => {
    const projId = m.attributedProjectId;
    const cost = calculateMeetingCost(m);
    const hours = (m.durationMinutes * m.attendeeEmails.length) / 60;
    
    if (projectCosts[projId]) {
      projectCosts[projId].cost += cost;
      projectCosts[projId].hours += hours;
      projectCosts[projId].count += 1;
    } else {
      projectCosts['unattributed'].cost += cost;
      projectCosts['unattributed'].hours += hours;
      projectCosts['unattributed'].count += 1;
    }
  });

  const projectCostsList = Object.values(projectCosts)
    .filter(p => p.cost > 0)
    .sort((a, b) => b.cost - a.cost);

  // 2. Daily Cost Trend Chart Data
  // Group by date
  const dailyCosts: Record<string, number> = {};
  filteredMeetings.forEach(m => {
    const dateStr = new Date(m.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyCosts[dateStr] = (dailyCosts[dateStr] || 0) + calculateMeetingCost(m);
  });

  // Sort dates chronologically
  const sortedDates = Object.keys(dailyCosts).sort((a, b) => new Date(a + ' 2026').getTime() - new Date(b + ' 2026').getTime());
  const chartPoints = sortedDates.map(date => ({ date, value: dailyCosts[date] }));

  // 3. Cost by Role / Designation
  const roleCosts: Record<string, { cost: number; hours: number }> = {};
  filteredMeetings.forEach(m => {
    m.attendeeEmails.forEach(email => {
      const emp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
      if (emp) {
        const rate = getAttendeeRate(email);
        const shareCost = (rate * m.durationMinutes) / 60;
        const shareHours = m.durationMinutes / 60;
        
        if (!roleCosts[emp.role]) {
          roleCosts[emp.role] = { cost: 0, hours: 0 };
        }
        roleCosts[emp.role].cost += shareCost;
        roleCosts[emp.role].hours += shareHours;
      }
    });
  });

  const roleCostsList = Object.entries(roleCosts)
    .map(([role, data]) => ({ role, ...data }))
    .sort((a, b) => b.cost - a.cost);

  // Donut chart calculation
  const totalAttributedAndUnattributedCost = projectCostsList.reduce((sum, p) => sum + p.cost, 0);
  let accumulatedPercent = 0;
  const donutRadius = 38;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~238.76

  return (
    <div className="content-pane" style={styles.container}>
      {/* KPI Section */}
      <section style={styles.kpiGrid}>
        {/* KPI 1 */}
        <div className="glass-panel" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total Meeting Spend</span>
            <div style={{ ...styles.kpiIcon, background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <h2 style={styles.kpiValue}>₹{totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h2>
          <div style={styles.kpiFooter}>
            <TrendingUp size={14} color="#10b981" />
            <span style={{ color: '#10b981', fontWeight: 600 }}>+12%</span>
            <span style={styles.kpiSubtext}>vs last month</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Person Hours Invested</span>
            <div style={{ ...styles.kpiIcon, background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc' }}>
              <Clock size={20} />
            </div>
          </div>
          <h2 style={styles.kpiValue}>{totalHours.toLocaleString('en-US', { maximumFractionDigits: 0 })}h</h2>
          <div style={styles.kpiFooter}>
            <TrendingUp size={14} color="#10b981" />
            <span style={{ color: '#10b981', fontWeight: 600 }}>+8.4%</span>
            <span style={styles.kpiSubtext}>vs last month</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>AI Attribution Rate</span>
            <div style={{ ...styles.kpiIcon, background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
              <Bot size={20} />
            </div>
          </div>
          <h2 style={{ ...styles.kpiValue, color: '#34d399' }}>{attributionRate.toFixed(1)}%</h2>
          <div style={styles.kpiFooter}>
            <TrendingUp size={14} color="#10b981" />
            <span style={{ color: '#10b981', fontWeight: 600 }}>+5.2%</span>
            <span style={styles.kpiSubtext}>target: &ge;85%</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Cost Anomaly Alerts</span>
            <div style={{ 
              ...styles.kpiIcon, 
              background: anomalies.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
              color: anomalies.length > 0 ? '#ef4444' : '#10b981' 
            }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <h2 style={{ 
            ...styles.kpiValue, 
            color: anomalies.length > 0 ? '#ef4444' : '#10b981' 
          }}>{anomalies.length}</h2>
          <div style={styles.kpiFooter}>
            {anomalies.length > 0 ? (
              <>
                <TrendingUp size={14} color="#ef4444" />
                <span style={{ color: '#ef4444', fontWeight: 600 }}>Attention</span>
                <span style={styles.kpiSubtext}>Action required</span>
              </>
            ) : (
              <>
                <TrendingDown size={14} color="#10b981" />
                <span style={{ color: '#10b981', fontWeight: 600 }}>Stable</span>
                <span style={styles.kpiSubtext}>Healthy boundaries</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section style={styles.chartsGrid}>
        {/* Project Cost Share - Donut Chart */}
        <div className="glass-panel" style={styles.chartPanelLarge}>
          <div className="glass-card-header">
            <h3>Project Cost Allocation</h3>
            <span style={styles.chartHeaderSubtitle}>Expenditure by project</span>
          </div>

          <div style={styles.donutContainer}>
            {/* SVG Donut */}
            <div style={styles.svgDonutWrapper}>
              <svg width="220" height="220" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r={donutRadius} 
                  fill="transparent" 
                  stroke="rgba(255, 255, 255, 0.03)" 
                  strokeWidth="8"
                />
                
                {projectCostsList.map((p, idx) => {
                  const percent = (p.cost / totalAttributedAndUnattributedCost) * 100;
                  const dashoffset = donutCircumference - (percent * donutCircumference) / 100;
                  const rotation = (accumulatedPercent / 100) * 360 - 90;
                  accumulatedPercent += percent;

                  const color = p.project?.color || '#9ca3af';
                  const isHovered = hoveredSlice === idx;

                  return (
                    <circle
                      key={p.project?.id || idx}
                      cx="50"
                      cy="50"
                      r={donutRadius}
                      fill="transparent"
                      stroke={color}
                      strokeWidth={isHovered ? "11" : "8"}
                      strokeDasharray={donutCircumference}
                      strokeDashoffset={dashoffset}
                      transform={`rotate(${rotation} 50 50)`}
                      style={{ 
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                        cursor: 'pointer',
                        filter: isHovered ? `drop-shadow(0 0 8px ${color})` : 'none'
                      }}
                      onMouseEnter={() => setHoveredSlice(idx)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })}
                
                <text x="50" y="47" textAnchor="middle" fill="var(--text-secondary)" fontSize="5.5" fontWeight="500">
                  TOTAL COST
                </text>
                <text x="50" y="58" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="bold" fontFamily="var(--font-display)">
                  {totalCost >= 100000 ? `₹${(totalCost / 100000).toFixed(1)}L` : `₹${(totalCost / 1000).toFixed(0)}k`}
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div style={styles.legendContainer}>
              {projectCostsList.map((p, idx) => {
                const percent = (p.cost / totalAttributedAndUnattributedCost) * 100;
                const color = p.project?.color || '#9ca3af';
                const isHovered = hoveredSlice === idx;

                return (
                  <div 
                    key={p.project?.id || idx} 
                    style={{
                      ...styles.legendItem,
                      background: isHovered ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                      borderLeft: `4px solid ${color}`
                    }}
                    onMouseEnter={() => setHoveredSlice(idx)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  >
                    <div style={styles.legendMain}>
                      <span style={{ fontWeight: 600 }}>{p.project?.name}</span>
                      <span style={styles.legendSec}>{p.project?.code} • {p.count} meetings</span>
                    </div>
                    <div style={styles.legendStats}>
                      <span style={styles.legendCost}>₹{p.cost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                      <span style={styles.legendPercent}>{percent.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Daily Cost Trend - Area Line Chart */}
        <div className="glass-panel" style={styles.chartPanelLarge}>
          <div className="glass-card-header">
            <h3>Meeting Cost Trend</h3>
            <span style={styles.chartHeaderSubtitle}>Cumulative daily cost breakdown</span>
          </div>

          <div style={styles.lineChartWrapper}>
            {chartPoints.length > 1 ? (
              <svg width="100%" height="220" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Draw background grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
                  <line 
                    key={i}
                    x1="40" 
                    y1={20 + r * 150} 
                    x2="95%" 
                    y2={20 + r * 150} 
                    stroke="rgba(255, 255, 255, 0.03)" 
                    strokeWidth="1" 
                  />
                ))}

                {(() => {
                  // Find min/max values
                  const values = chartPoints.map(p => p.value);
                  const maxValue = Math.max(...values, 500) * 1.1; // pad max value

                  // Compute coordinates
                  const pointsCount = chartPoints.length;
                  const svgWidth = 500; // viewBox width logic
                  const svgHeight = 190;
                  
                  const coords = chartPoints.map((p, idx) => {
                    const x = 40 + (idx / (pointsCount - 1)) * (svgWidth - 60);
                    const y = svgHeight - 20 - (p.value / maxValue) * (svgHeight - 50);
                    return { x, y, ...p };
                  });

                  // Build SVG path
                  const linePath = coords.map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
                  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${svgHeight - 20} L ${coords[0].x} ${svgHeight - 20} Z`;

                  return (
                    <>
                      {/* Gradient Area */}
                      <path d={areaPath} fill="url(#areaGradient)" />
                      
                      {/* Trend Line */}
                      <path 
                        d={linePath} 
                        fill="none" 
                        stroke="#6366f1" 
                        strokeWidth="2.5" 
                        style={{ filter: 'drop-shadow(0 2px 6px rgba(99, 102, 241, 0.3))' }}
                      />

                      {/* Circles for interactive points */}
                      {coords.map((c, idx) => (
                        <circle
                          key={idx}
                          cx={c.x}
                          cy={c.y}
                          r={hoveredPoint?.date === c.date ? "6" : "3.5"}
                          fill={hoveredPoint?.date === c.date ? "#c084fc" : "#6366f1"}
                          stroke="var(--bg-primary)"
                          strokeWidth="1.5"
                          style={{ transition: 'all 0.1s ease', cursor: 'pointer' }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredPoint({
                              x: rect.left - rect.width / 2,
                              y: rect.top - rect.height - 40,
                              date: c.date,
                              value: c.value
                            });
                          }}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      ))}

                      {/* Date Labels (X Axis) */}
                      {coords.filter((_, idx) => idx % Math.ceil(pointsCount / 5) === 0 || idx === pointsCount - 1).map((c, idx) => (
                        <text
                          key={idx}
                          x={c.x}
                          y={svgHeight}
                          fill="var(--text-muted)"
                          fontSize="8"
                          textAnchor="middle"
                        >
                          {c.date}
                        </text>
                      ))}

                      {/* Y Axis Labels */}
                      {[0, 0.5, 1].map((r, i) => (
                        <text
                          key={i}
                          x="32"
                          y={svgHeight - 20 - r * (svgHeight - 50)}
                          fill="var(--text-muted)"
                          fontSize="8"
                          textAnchor="end"
                        >
                          ₹{Math.round((maxValue * r) / 100) * 100}
                        </text>
                      ))}
                    </>
                  );
                })()}
              </svg>
            ) : (
              <div style={styles.chartEmpty}>Generating trend chart... Sync more calendar meetings.</div>
            )}

            {/* Custom Tooltip */}
            {hoveredPoint && (
              <div style={{
                ...styles.lineChartTooltip,
                position: 'fixed',
                left: `${hoveredPoint.x}px`,
                top: `${hoveredPoint.y}px`
              }} className="glass-panel">
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{hoveredPoint.date}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  ₹{Math.round(hoveredPoint.value).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lower Details Grid */}
      <section style={styles.detailsGrid}>
        {/* Role Cost Distribution */}
        <div className="glass-panel" style={styles.detailsPanel}>
          <div className="glass-card-header">
            <h3>Cost by Role / Designation</h3>
            <span style={styles.chartHeaderSubtitle}>Where is payroll going?</span>
          </div>

          <div style={styles.barList}>
            {roleCostsList.slice(0, 5).map((r, idx) => {
              const maxRoleCost = Math.max(...roleCostsList.map(c => c.cost), 1);
              const barPercent = (r.cost / maxRoleCost) * 100;
              return (
                <div key={idx} style={styles.barItem}>
                  <div style={styles.barLabels}>
                    <span style={styles.barName}>{r.role}</span>
                    <span style={styles.barValue}>
                      ₹{r.cost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'normal' }}>
                        {' '}({r.hours.toFixed(0)} hrs)
                      </span>
                    </span>
                  </div>
                  <div style={styles.progressBarBg}>
                    <div style={{
                      ...styles.progressBarFill,
                      width: `${barPercent}%`,
                      background: `linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)`
                    }} />
                  </div>
                </div>
              );
            })}
            {roleCostsList.length === 0 && (
              <div style={styles.emptyText}>No role-cost tracking active.</div>
            )}
          </div>
        </div>

        {/* Project Health / Budget Status */}
        <div className="glass-panel" style={styles.detailsPanel}>
          <div className="glass-card-header">
            <h3>Project Budget Health</h3>
            <button 
              onClick={() => setActiveTab('projects')} 
              style={styles.cardHeaderLink}
            >
              <span>View Budgets</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={styles.projectList}>
            {projects.filter(p => p.id !== 'proj-admin').slice(0, 4).map((p) => {
              const projCostObj = projectCosts[p.id];
              const cost = projCostObj ? projCostObj.cost : 0;
              const burnPercent = Math.min(100, (cost / p.budget) * 100);

              let statusColor = '#10b981'; // Green
              if (burnPercent >= 90) statusColor = '#ef4444'; // Red
              else if (burnPercent >= 75) statusColor = '#f59e0b'; // Amber

              return (
                <div key={p.id} style={styles.projectHealthItem}>
                  <div style={styles.projectHealthLabels}>
                    <div style={styles.projectTitleRow}>
                      <div style={{ ...styles.projectColorDot, backgroundColor: p.color }} />
                      <span style={styles.projectName}>{p.name}</span>
                    </div>
                    <span style={{ ...styles.projectBurnText, color: statusColor }}>
                      {burnPercent.toFixed(0)}% burned
                    </span>
                  </div>
                  
                  <div style={styles.progressBarBg}>
                    <div style={{
                      ...styles.progressBarFill,
                      width: `${burnPercent}%`,
                      backgroundColor: statusColor,
                      boxShadow: `0 0 8px ${statusColor}44`
                    }} />
                  </div>

                  <div style={styles.projectBudgetStats}>
                    <span>₹{cost.toLocaleString('en-US', { maximumFractionDigits: 0 })} spent</span>
                    <span style={{ color: 'var(--text-muted)' }}>Budget: ₹{p.budget.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
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
    gap: '2rem',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.25rem',
  },
  kpiCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '1.25rem 1.5rem',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  kpiLabel: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  kpiIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: '1.85rem',
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
    lineHeight: '1.2',
    marginBottom: '0.5rem',
  },
  kpiFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
  },
  kpiSubtext: {
    color: 'var(--text-muted)',
    marginLeft: '0.25rem',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
    gap: '1.5rem',
  },
  chartPanelLarge: {
    minHeight: '300px',
  },
  chartHeaderSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  donutContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexWrap: 'wrap' as const,
    gap: '1.5rem',
    marginTop: '0.5rem',
  },
  svgDonutWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    flex: 1,
    minWidth: '220px',
    maxHeight: '220px',
    overflowY: 'auto' as const,
    paddingRight: '0.5rem',
  },
  legendItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },
  legendMain: {
    display: 'flex',
    flexDirection: 'column' as const,
    fontSize: '0.85rem',
  },
  legendSec: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  legendStats: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    fontSize: '0.85rem',
  },
  legendCost: {
    fontWeight: 600,
  },
  legendPercent: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
  },
  lineChartWrapper: {
    position: 'relative' as const,
    marginTop: '1.5rem',
  },
  chartEmpty: {
    height: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
  lineChartTooltip: {
    padding: '0.4rem 0.6rem',
    borderRadius: '4px',
    pointerEvents: 'none' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
    zIndex: 100,
    boxShadow: 'var(--shadow-lg)',
    backgroundColor: 'rgba(10, 15, 30, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
  },
  detailsPanel: {
    minHeight: '280px',
  },
  cardHeaderLink: {
    background: 'transparent',
    color: '#818cf8',
    fontSize: '0.8rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  barList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.15rem',
    marginTop: '0.5rem',
  },
  barItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.375rem',
  },
  barLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
  },
  barName: {
    fontWeight: 500,
  },
  barValue: {
    fontWeight: 600,
  },
  progressBarBg: {
    height: '8px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  emptyText: {
    textAlign: 'center' as const,
    color: 'var(--text-muted)',
    marginTop: '2rem',
    fontSize: '0.85rem',
  },
  projectList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  projectHealthItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.35rem',
  },
  projectHealthLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  projectColorDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  projectName: {
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  projectBurnText: {
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  projectBudgetStats: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.725rem',
    color: 'var(--text-secondary)',
  }
};
