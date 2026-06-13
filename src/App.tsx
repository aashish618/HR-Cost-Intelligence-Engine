import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { CalendarSync } from './components/CalendarSync';
import { EmployeeMapping } from './components/EmployeeMapping';
import { ProjectBudgets } from './components/ProjectBudgets';
import { AnomalyCenter } from './components/AnomalyCenter';
import { Settings } from './components/Settings';

import type { Meeting, Project, Employee, RoleRate, AppSettings } from './types';
import { storageService } from './services/storageService';

function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [timeWindow, setTimeWindow] = useState<string>('30days');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Core Entity State
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roleRates, setRoleRates] = useState<RoleRate[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    geminiApiKey: '',
    adminPin: '1234',
    autoSyncMinutes: 15,
    hideSalaryDetails: true
  });

  // Load state on mount
  useEffect(() => {
    setMeetings(storageService.getMeetings());
    setProjects(storageService.getProjects());
    setEmployees(storageService.getEmployees());
    setRoleRates(storageService.getRoleRates());
    setSettings(storageService.getSettings());
  }, []);

  // Save states to local storage on mutation
  useEffect(() => {
    if (meetings.length > 0) storageService.saveMeetings(meetings);
  }, [meetings]);

  useEffect(() => {
    if (projects.length > 0) storageService.saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (employees.length > 0) storageService.saveEmployees(employees);
  }, [employees]);

  useEffect(() => {
    if (roleRates.length > 0) storageService.saveRoleRates(roleRates);
  }, [roleRates]);

  useEffect(() => {
    if (settings.adminPin) storageService.saveSettings(settings);
  }, [settings]);

  // Sync Calendar action
  const handleCalendarSync = () => {
    setIsSyncing(true);
    
    // Simulate API fetch delay
    setTimeout(() => {
      // Ingest 2 new events
      const now = new Date();
      const newMeetings: Meeting[] = [
        {
          id: `meet-synced-${Date.now()}-1`,
          title: 'Polaris Sprint Triage Review',
          description: 'Reviewing Android and iOS builds, aligning on open blocker logs and priorities.',
          startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          endTime: new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString(),
          durationMinutes: 60,
          organizerEmail: 'maya.p@company.com',
          attendeeEmails: ['maya.p@company.com', 'chen.w@company.com', 'emily.b@company.com', 'sarah.j@company.com'],
          attributedProjectId: 'proj-pol',
          attributionConfidence: 0.96,
          attributionMethod: 'heuristic',
          isManualOverride: false
        },
        {
          id: `meet-synced-${Date.now()}-2`,
          title: 'Zenith Query Optimisation Audit',
          description: 'Analyzing slow queries in logs and partitioning PG clusters.',
          startTime: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12h ago
          endTime: new Date(now.getTime() - 10.5 * 60 * 60 * 1000).toISOString(),
          durationMinutes: 90,
          organizerEmail: 'alex.r@company.com',
          attendeeEmails: ['alex.r@company.com', 'marcus.v@company.com'],
          attributedProjectId: 'proj-zen',
          attributionConfidence: 0.94,
          attributionMethod: 'heuristic',
          isManualOverride: false
        }
      ];

      setMeetings(prev => {
        // Prevent duplicate simulation injections
        const filtered = prev.filter(m => !m.title.startsWith('Polaris Sprint Triage Review'));
        return [...newMeetings, ...filtered];
      });

      setIsSyncing(false);
    }, 2000);
  };

  // Reset database back to factory mock settings
  const handleResetDatabase = () => {
    storageService.clearAll();
    setMeetings(storageService.getMeetings());
    setProjects(storageService.getProjects());
    setEmployees(storageService.getEmployees());
    setRoleRates(storageService.getRoleRates());
    setSettings(storageService.getSettings());
    setIsAdminMode(false);
  };

  // Calculate rate helper for anomalies count
  const getAttendeeRate = (email: string): number => {
    const emp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (!emp) return 80;
    const rateObj = roleRates.find(r => r.role === emp.role);
    return rateObj ? rateObj.hourlyRate : 80;
  };

  // Real-time Anomaly count for indicator badge
  const getAnomalyCount = (): number => {
    let count = 0;

    // 1. Budget Overruns
    projects.forEach(p => {
      if (p.id === 'proj-admin') return;
      const projMeetings = meetings.filter(m => m.attributedProjectId === p.id);
      const totalCost = projMeetings.reduce((sum, m) => {
        const totalHourlyRate = m.attendeeEmails.reduce((s, email) => s + getAttendeeRate(email), 0);
        return sum + (totalHourlyRate * m.durationMinutes) / 60;
      }, 0);
      if (p.budget > 0 && totalCost > p.budget) count++;
    });

    // 2. Unattributed Meetings
    meetings.forEach(m => {
      if (m.attributedProjectId === 'unattributed') count++;
    });

    // 3. Burnout (Meetings > 20 Hours)
    employees.forEach(emp => {
      const empMeetings = meetings.filter(m => 
        m.attendeeEmails.some(email => email.toLowerCase() === emp.email.toLowerCase())
      );
      const totalHours = empMeetings.reduce((sum, m) => sum + m.durationMinutes / 60, 0);
      if (totalHours > 20) count++;
    });

    return count;
  };

  // Resolve Header Details
  const getHeaderDetails = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Expenditure Dashboard', subtitle: 'Real-time overview of meeting hours & project budget burns.' };
      case 'calendar':
        return { title: 'Calendar Audit Ledger', subtitle: 'Manage meeting logs, upload custom schedules, and audit AI attributions.' };
      case 'employees':
        return { title: 'Cost Mapping Directory', subtitle: 'Map team designations to estimated hourly salary rates.' };
      case 'projects':
        return { title: 'Active Project Budgets', subtitle: 'Monitor billable limits and run rates per initiative.' };
      case 'anomalies':
        return { title: 'Anomaly Investigation Center', subtitle: 'Review flagged cost overruns, burnout, or untracked leakage.' };
      case 'settings':
        return { title: 'Engine Configuration', subtitle: 'Configure live Gemini integrations and control localized caches.' };
      default:
        return { title: 'HR Cost Intelligence Engine', subtitle: 'Calendar-to-cost attribution.' };
    }
  };

  const headerDetails = getHeaderDetails();

  // Render Page Content
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            meetings={meetings}
            projects={projects}
            employees={employees}
            roleRates={roleRates}
            anomalies={[]} // anomalies computed real-time inside anomaly center
            setActiveTab={setActiveTab}
            timeWindow={timeWindow}
          />
        );
      case 'calendar':
        return (
          <CalendarSync 
            meetings={meetings}
            setMeetings={setMeetings}
            projects={projects}
            employees={employees}
            roleRates={roleRates}
            geminiApiKey={settings.geminiApiKey}
          />
        );
      case 'employees':
        return (
          <EmployeeMapping 
            employees={employees}
            setEmployees={setEmployees}
            roleRates={roleRates}
            setRoleRates={setRoleRates}
            projects={projects}
            isAdminMode={isAdminMode}
          />
        );
      case 'projects':
        return (
          <ProjectBudgets 
            projects={projects}
            setProjects={setProjects}
            meetings={meetings}
            employees={employees}
            roleRates={roleRates}
            isAdminMode={isAdminMode}
          />
        );
      case 'anomalies':
        return (
          <AnomalyCenter 
            meetings={meetings}
            projects={projects}
            employees={employees}
            roleRates={roleRates}
            setActiveTab={setActiveTab}
          />
        );
      case 'settings':
        return (
          <Settings 
            settings={settings}
            setSettings={setSettings}
            onResetDatabase={handleResetDatabase}
          />
        );
      default:
        return <div>Tab not found.</div>;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
        adminPin={settings.adminPin}
      />

      {/* Main Page Area */}
      <div className="main-content">
        <Header 
          title={headerDetails.title}
          subtitle={headerDetails.subtitle}
          timeWindow={timeWindow}
          setTimeWindow={setTimeWindow}
          isSyncing={isSyncing}
          onSync={handleCalendarSync}
          hasGeminiKey={!!settings.geminiApiKey}
          anomalyCount={getAnomalyCount()}
        />
        
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
