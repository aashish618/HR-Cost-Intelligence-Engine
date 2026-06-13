import type { Employee, RoleRate, Project, Meeting, AppSettings } from './types';

export const INITIAL_ROLE_RATES: RoleRate[] = [
  { role: 'VP Engineering', hourlyRate: 200 },
  { role: 'Principal Architect', hourlyRate: 175 },
  { role: 'Lead Product Manager', hourlyRate: 130 },
  { role: 'Senior Product Designer', hourlyRate: 110 },
  { role: 'Senior Software Engineer', hourlyRate: 120 },
  { role: 'Software Engineer', hourlyRate: 90 },
  { role: 'Business Development Manager', hourlyRate: 100 },
  { role: 'HR Manager', hourlyRate: 80 }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Sarah Jenkins', email: 'sarah.j@company.com', role: 'VP Engineering', primaryProjectId: 'proj-pol' },
  { id: 'emp-2', name: 'Alex Rivera', email: 'alex.r@company.com', role: 'Principal Architect', primaryProjectId: 'proj-zen' },
  { id: 'emp-3', name: 'Maya Patel', email: 'maya.p@company.com', role: 'Lead Product Manager', primaryProjectId: 'proj-pol' },
  { id: 'emp-4', name: 'Chen Wei', email: 'chen.w@company.com', role: 'Senior Software Engineer', primaryProjectId: 'proj-pol' },
  { id: 'emp-5', name: 'Emily Brooks', email: 'emily.b@company.com', role: 'Senior Product Designer', primaryProjectId: 'proj-pol' },
  { id: 'emp-6', name: 'Marcus Vance', email: 'marcus.v@company.com', role: 'Software Engineer', primaryProjectId: 'proj-zen' },
  { id: 'emp-7', name: 'Jordan Lee', email: 'jordan.l@company.com', role: 'Software Engineer', primaryProjectId: 'proj-sec' },
  { id: 'emp-8', name: 'Clara Diaz', email: 'clara.d@company.com', role: 'HR Manager', primaryProjectId: 'proj-admin' },
  { id: 'emp-9', name: 'David Kim', email: 'david.k@company.com', role: 'Business Development Manager', primaryProjectId: 'proj-bd' },
  { id: 'emp-10', name: 'Liam Murphy', email: 'liam.m@company.com', role: 'Software Engineer', primaryProjectId: 'proj-hel' }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-pol',
    name: 'Project Polaris',
    code: 'PROJ-POL',
    description: 'Rebuilding the core mobile application framework and user onboarding flow.',
    budget: 45000,
    priority: 'high',
    status: 'active',
    color: '#6366f1' // Indigo
  },
  {
    id: 'proj-zen',
    name: 'Project Zenith',
    code: 'PROJ-ZEN',
    description: 'Migration of database clusters to multi-region cloud services and query optimization.',
    budget: 30000,
    priority: 'medium',
    status: 'active',
    color: '#a855f7' // Purple
  },
  {
    id: 'proj-sec',
    name: 'Project CyberShield',
    code: 'PROJ-SEC',
    description: 'Security penetration testing, vulnerability remediation, and SOC2 certification readiness.',
    budget: 15000,
    priority: 'high',
    status: 'active',
    color: '#3b82f6' // Blue
  },
  {
    id: 'proj-hel',
    name: 'Project Helios',
    code: 'PROJ-HEL',
    description: 'Upgrading the internal intranet employee portal and expense submission workflow.',
    budget: 8000,
    priority: 'low',
    status: 'active',
    color: '#eab308' // Yellow
  },
  {
    id: 'proj-bd',
    name: 'Nexus Corp Bid',
    code: 'BD-NEXUS',
    description: 'Preparing the technical proposal, architecture plans, and cost estimates for Nexus Corp RFP.',
    budget: 10000,
    priority: 'medium',
    status: 'active',
    color: '#10b981' // Emerald
  },
  {
    id: 'proj-admin',
    name: 'Internal Operations',
    code: 'ADMIN-OPS',
    description: 'General administrative tasks, HR functions, company-wide meetings, and non-billable syncs.',
    budget: 0, // Incurred cost here is operational overhead
    priority: 'low',
    status: 'active',
    color: '#64748b' // Slate
  }
];

// Seed meetings for the past 30 days. Let's base them around June 2026.
const getPastDateStr = (daysAgo: number, hours: number, minutes: number): string => {
  const date = new Date('2026-06-13T12:00:00');
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

export const INITIAL_MEETINGS: Meeting[] = [
  // Polaris meetings (High budget, high cost)
  {
    id: 'meet-1',
    title: 'Polaris Mobile App Architecture Kickoff',
    description: 'Reviewing the system architecture design, React Native integration steps, and state management strategies.',
    startTime: getPastDateStr(12, 10, 0),
    endTime: getPastDateStr(12, 11, 30),
    durationMinutes: 90,
    organizerEmail: 'sarah.j@company.com',
    attendeeEmails: ['sarah.j@company.com', 'alex.r@company.com', 'maya.p@company.com', 'chen.w@company.com', 'emily.b@company.com'],
    attributedProjectId: 'proj-pol',
    attributionConfidence: 0.98,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-2',
    title: 'Polaris UX Wireframes Review',
    description: 'Walking through Figma files for onboarding screens, profile setup, and checkout flow.',
    startTime: getPastDateStr(11, 14, 0),
    endTime: getPastDateStr(11, 15, 0),
    durationMinutes: 60,
    organizerEmail: 'emily.b@company.com',
    attendeeEmails: ['emily.b@company.com', 'maya.p@company.com', 'sarah.j@company.com'],
    attributedProjectId: 'proj-pol',
    attributionConfidence: 0.95,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-3',
    title: 'Polaris Sprint Standup & Bug Triage',
    description: 'Daily standup to resolve blockers for release candidate RC-1 and allocate priority bug fixes.',
    startTime: getPastDateStr(10, 9, 30),
    endTime: getPastDateStr(10, 10, 0),
    durationMinutes: 30,
    organizerEmail: 'maya.p@company.com',
    attendeeEmails: ['maya.p@company.com', 'chen.w@company.com', 'emily.b@company.com', 'sarah.j@company.com'],
    attributedProjectId: 'proj-pol',
    attributionConfidence: 0.92,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-4',
    title: 'Polaris Sprint Review & Retrospective',
    description: 'Demo of core workflows built in Sprint 4. Discussing what went well and areas of improvement.',
    startTime: getPastDateStr(7, 15, 0),
    endTime: getPastDateStr(7, 16, 30),
    durationMinutes: 90,
    organizerEmail: 'maya.p@company.com',
    attendeeEmails: ['maya.p@company.com', 'chen.w@company.com', 'emily.b@company.com', 'sarah.j@company.com', 'alex.r@company.com'],
    attributedProjectId: 'proj-pol',
    attributionConfidence: 0.96,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },

  // Zenith meetings
  {
    id: 'meet-5',
    title: 'Zenith Database Schema Planning',
    description: 'Deciding on partitioning key, indexing strategies, and migration steps for PG clusters.',
    startTime: getPastDateStr(14, 11, 0),
    endTime: getPastDateStr(14, 12, 30),
    durationMinutes: 90,
    organizerEmail: 'alex.r@company.com',
    attendeeEmails: ['alex.r@company.com', 'marcus.v@company.com', 'chen.w@company.com'],
    attributedProjectId: 'proj-zen',
    attributionConfidence: 0.94,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-6',
    title: 'Zenith Cloud Infra Review',
    description: 'Discussing multi-region deployment costs and replication delays across AWS regions.',
    startTime: getPastDateStr(9, 10, 0),
    endTime: getPastDateStr(9, 11, 0),
    durationMinutes: 60,
    organizerEmail: 'alex.r@company.com',
    attendeeEmails: ['alex.r@company.com', 'marcus.v@company.com', 'sarah.j@company.com'],
    attributedProjectId: 'proj-zen',
    attributionConfidence: 0.91,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },

  // CyberShield meetings
  {
    id: 'meet-7',
    title: 'SOC2 Compliance Audit Prep',
    description: 'Gathering evidence for access control lists, key management policies, and database encryption audits.',
    startTime: getPastDateStr(8, 14, 0),
    endTime: getPastDateStr(8, 15, 0),
    durationMinutes: 60,
    organizerEmail: 'jordan.l@company.com',
    attendeeEmails: ['jordan.l@company.com', 'alex.r@company.com', 'sarah.j@company.com'],
    attributedProjectId: 'proj-sec',
    attributionConfidence: 0.89,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-8',
    title: 'Vulnerability Remediation War Room',
    description: 'Resolving high-severity issues reported in recent penetration test of api gateways.',
    startTime: getPastDateStr(5, 10, 0),
    endTime: getPastDateStr(5, 13, 0), // 3 hours! Expensive meeting.
    durationMinutes: 180,
    organizerEmail: 'jordan.l@company.com',
    attendeeEmails: ['jordan.l@company.com', 'alex.r@company.com', 'chen.w@company.com', 'sarah.j@company.com'],
    attributedProjectId: 'proj-sec',
    attributionConfidence: 0.95,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },

  // Helios meetings
  {
    id: 'meet-9',
    title: 'Helios Intranet Layout Redesign',
    description: 'Updating navbar navigation and stylesheet tweaks for intranet portal.',
    startTime: getPastDateStr(13, 11, 0),
    endTime: getPastDateStr(13, 11, 45),
    durationMinutes: 45,
    organizerEmail: 'liam.m@company.com',
    attendeeEmails: ['liam.m@company.com', 'emily.b@company.com'],
    attributedProjectId: 'proj-hel',
    attributionConfidence: 0.87,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },

  // BD meetings
  {
    id: 'meet-10',
    title: 'Nexus Corp RFP Proposal Review',
    description: 'Reviewing pricing spreadsheet, statement of work, and delivery milestones for Nexus Corp contract pitch.',
    startTime: getPastDateStr(6, 14, 0),
    endTime: getPastDateStr(6, 16, 0), // 2 hours
    durationMinutes: 120,
    organizerEmail: 'david.k@company.com',
    attendeeEmails: ['david.k@company.com', 'sarah.j@company.com', 'maya.p@company.com'],
    attributedProjectId: 'proj-bd',
    attributionConfidence: 0.94,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },

  // Company Operations
  {
    id: 'meet-11',
    title: 'Monthly Company All-Hands',
    description: 'Company performance updates, Q2 roadmap review, employee milestones, and general announcements.',
    startTime: getPastDateStr(15, 10, 0),
    endTime: getPastDateStr(15, 11, 0),
    durationMinutes: 60,
    organizerEmail: 'clara.d@company.com',
    attendeeEmails: [
      'sarah.j@company.com', 'alex.r@company.com', 'maya.p@company.com', 
      'chen.w@company.com', 'emily.b@company.com', 'marcus.v@company.com', 
      'jordan.l@company.com', 'clara.d@company.com', 'david.k@company.com', 'liam.m@company.com'
    ], // EVERYONE is here! Massive cost!
    attributedProjectId: 'proj-admin',
    attributionConfidence: 0.99,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-12',
    title: '1-on-1: Sarah / Alex',
    description: 'Regular catch up on career goals, architecture blockers, and technical leadership tasks.',
    startTime: getPastDateStr(4, 15, 30),
    endTime: getPastDateStr(4, 16, 0),
    durationMinutes: 30,
    organizerEmail: 'sarah.j@company.com',
    attendeeEmails: ['sarah.j@company.com', 'alex.r@company.com'],
    attributedProjectId: 'proj-admin',
    attributionConfidence: 0.88,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },

  // Anomalous / Ambiguous / Low Confidence meetings
  {
    id: 'meet-13',
    title: 'Sync',
    description: 'Quick alignment chat',
    startTime: getPastDateStr(3, 10, 0),
    endTime: getPastDateStr(3, 10, 30),
    durationMinutes: 30,
    organizerEmail: 'marcus.v@company.com',
    attendeeEmails: ['marcus.v@company.com', 'jordan.l@company.com'],
    attributedProjectId: 'unattributed', // Ambiguous title, description, and attendees work on diff projects
    attributionConfidence: 0.22,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-14',
    title: 'Review and Brainstorming session',
    description: 'We need to talk about things related to the project.',
    startTime: getPastDateStr(2, 14, 0),
    endTime: getPastDateStr(2, 15, 30),
    durationMinutes: 90,
    organizerEmail: 'liam.m@company.com',
    attendeeEmails: ['liam.m@company.com', 'marcus.v@company.com', 'emily.b@company.com'],
    attributedProjectId: 'unattributed', // Ambiguous project
    attributionConfidence: 0.35,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-15',
    title: 'Weekly Standup',
    description: 'Go over weekly updates.',
    startTime: getPastDateStr(1, 9, 0),
    endTime: getPastDateStr(1, 10, 0),
    durationMinutes: 60,
    organizerEmail: 'chen.w@company.com',
    attendeeEmails: ['chen.w@company.com', 'marcus.v@company.com', 'jordan.l@company.com'],
    attributedProjectId: 'unattributed', // Standup with developers from 3 different projects
    attributionConfidence: 0.18,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-16',
    title: 'Intranet Portal Portal Updates Discussion', // Intranet -> Helios
    description: 'Let\'s run through what Liam has done with Clara.',
    startTime: getPastDateStr(2, 11, 0),
    endTime: getPastDateStr(2, 12, 0),
    durationMinutes: 60,
    organizerEmail: 'clara.d@company.com',
    attendeeEmails: ['clara.d@company.com', 'liam.m@company.com'],
    attributedProjectId: 'proj-hel',
    attributionConfidence: 0.65, // Medium confidence
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-17',
    title: 'Technical Pitch Prep',
    description: 'Setting up slides and architecture drawings for BD.',
    startTime: getPastDateStr(1, 13, 0),
    endTime: getPastDateStr(1, 14, 0),
    durationMinutes: 60,
    organizerEmail: 'david.k@company.com',
    attendeeEmails: ['david.k@company.com', 'alex.r@company.com'],
    attributedProjectId: 'proj-bd',
    attributionConfidence: 0.72, // Medium-high confidence
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-18',
    title: 'Ghost Sync', // Anomaly: scheduled but only 1 person attended
    description: 'Reviewing code alone on calendar block.',
    startTime: getPastDateStr(1, 15, 0),
    endTime: getPastDateStr(1, 16, 0),
    durationMinutes: 60,
    organizerEmail: 'alex.r@company.com',
    attendeeEmails: ['alex.r@company.com'], // Only 1 attendee
    attributedProjectId: 'proj-zen',
    attributionConfidence: 0.85,
    attributionMethod: 'heuristic',
    isManualOverride: false
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  geminiApiKey: '',
  adminPin: '1234',
  autoSyncMinutes: 15,
  hideSalaryDetails: true
};
