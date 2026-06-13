import type { Employee, RoleRate, Project, Meeting, AppSettings } from './types';

export const INITIAL_ROLE_RATES: RoleRate[] = [
  { role: 'VP Engineering', hourlyRate: 4000 },
  { role: 'Principal Architect', hourlyRate: 3500 },
  { role: 'Lead Product Manager', hourlyRate: 2500 },
  { role: 'Senior Product Designer', hourlyRate: 2000 },
  { role: 'Senior Software Engineer', hourlyRate: 2200 },
  { role: 'Software Engineer', hourlyRate: 1500 },
  { role: 'Business Development Manager', hourlyRate: 1800 },
  { role: 'HR Manager', hourlyRate: 1200 }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Aarav Sharma', email: 'aarav.s@tcs.com', role: 'VP Engineering', primaryProjectId: 'proj-bhp' },
  { id: 'emp-2', name: 'Aditi Patel', email: 'aditi.p@tcs.com', role: 'Principal Architect', primaryProjectId: 'proj-adb' },
  { id: 'emp-3', name: 'Rohan Deshmukh', email: 'rohan.d@tcs.com', role: 'Lead Product Manager', primaryProjectId: 'proj-bhp' },
  { id: 'emp-4', name: 'Priya Nair', email: 'priya.n@tcs.com', role: 'Senior Software Engineer', primaryProjectId: 'proj-bhp' },
  { id: 'emp-5', name: 'Ananya Iyer', email: 'ananya.i@tcs.com', role: 'Senior Product Designer', primaryProjectId: 'proj-bhp' },
  { id: 'emp-6', name: 'Kabir Malhotra', email: 'kabir.m@tcs.com', role: 'Software Engineer', primaryProjectId: 'proj-adb' },
  { id: 'emp-7', name: 'Diya Sen', email: 'diya.s@tcs.com', role: 'Software Engineer', primaryProjectId: 'proj-ayl' },
  { id: 'emp-8', name: 'Neha Gupta', email: 'neha.g@tcs.com', role: 'HR Manager', primaryProjectId: 'proj-admin' },
  { id: 'emp-9', name: 'Amit Verma', email: 'amit.v@tcs.com', role: 'Business Development Manager', primaryProjectId: 'proj-ondc' },
  { id: 'emp-10', name: 'Vikram Rao', email: 'vikram.r@tcs.com', role: 'Software Engineer', primaryProjectId: 'proj-ondc' }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-bhp',
    name: 'Project BharatPay',
    code: 'PROJ-BHP',
    description: 'Scaling UPI merchant transaction portals, dynamic QR code scanners, and real-time settle APIs.',
    budget: 2500000,
    priority: 'high',
    status: 'active',
    color: '#6366f1' // Indigo
  },
  {
    id: 'proj-adb',
    name: 'Project AadhaarBridge',
    code: 'PROJ-ADB',
    description: 'Secure UIDAI biometric e-KYC validation gateway, consent logs, and regulatory compliance audit.',
    budget: 1200000,
    priority: 'high',
    status: 'active',
    color: '#a855f7' // Purple
  },
  {
    id: 'proj-ayl',
    name: 'Project AyushmanLink',
    code: 'PROJ-AYL',
    description: 'ABDM health locker stacks, clinical metadata templates, and electronic health records consent managers.',
    budget: 1800000,
    priority: 'medium',
    status: 'active',
    color: '#3b82f6' // Blue
  },
  {
    id: 'proj-ondc',
    name: 'Project ONDC-Connect',
    code: 'PROJ-ONDC',
    description: 'ONDC registry seller application protocol integration, catalog indexing, and logistics sync APIs.',
    budget: 800000,
    priority: 'low',
    status: 'active',
    color: '#eab308' // Yellow
  },
  {
    id: 'proj-admin',
    name: 'Internal Operations',
    code: 'ADMIN-OPS',
    description: 'General administrative tasks, HR functions, company-wide meetings, tea sessions, and non-billable syncs.',
    budget: 0,
    priority: 'low',
    status: 'active',
    color: '#64748b' // Slate
  }
];

// Seed meetings for the past 30 days. Base around June 2026.
const getPastDateStr = (daysAgo: number, hours: number, minutes: number): string => {
  const date = new Date('2026-06-13T12:00:00');
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

export const INITIAL_MEETINGS: Meeting[] = [
  // BharatPay (UPI project)
  {
    id: 'meet-1',
    title: 'BharatPay Merchant UPI Integration Kickoff',
    description: 'Reviewing settlement scripts, transaction callback routes, POS scanner integration, and settlement APIs.',
    startTime: getPastDateStr(12, 10, 0),
    endTime: getPastDateStr(12, 11, 30),
    durationMinutes: 90,
    organizerEmail: 'aarav.s@tcs.com',
    attendeeEmails: ['aarav.s@tcs.com', 'aditi.p@tcs.com', 'rohan.d@tcs.com', 'priya.n@tcs.com', 'ananya.i@tcs.com'],
    attributedProjectId: 'proj-bhp',
    attributionConfidence: 0.98,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-2',
    title: 'BharatPay QR Code onboarding flow',
    description: 'Walking through Figma files for merchant profiles and QR generation workflows.',
    startTime: getPastDateStr(11, 14, 0),
    endTime: getPastDateStr(11, 15, 0),
    durationMinutes: 60,
    organizerEmail: 'ananya.i@tcs.com',
    attendeeEmails: ['ananya.i@tcs.com', 'rohan.d@tcs.com', 'aarav.s@tcs.com'],
    attributedProjectId: 'proj-bhp',
    attributionConfidence: 0.95,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-3',
    title: 'BharatPay UPI Bug Triage',
    description: 'Daily sync to resolve merchant settlement delay logs on production.',
    startTime: getPastDateStr(10, 9, 30),
    endTime: getPastDateStr(10, 10, 0),
    durationMinutes: 30,
    organizerEmail: 'rohan.d@tcs.com',
    attendeeEmails: ['rohan.d@tcs.com', 'priya.n@tcs.com', 'ananya.i@tcs.com', 'aarav.s@tcs.com'],
    attributedProjectId: 'proj-bhp',
    attributionConfidence: 0.94,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-4',
    title: 'BharatPay UPI Sprint Review',
    description: 'Demos of settlement reconciliation scripts and merchant payouts ledger.',
    startTime: getPastDateStr(7, 15, 0),
    endTime: getPastDateStr(7, 16, 30),
    durationMinutes: 90,
    organizerEmail: 'rohan.d@tcs.com',
    attendeeEmails: ['rohan.d@tcs.com', 'priya.n@tcs.com', 'ananya.i@tcs.com', 'aarav.s@tcs.com', 'aditi.p@tcs.com'],
    attributedProjectId: 'proj-bhp',
    attributionConfidence: 0.96,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },

  // AadhaarBridge
  {
    id: 'meet-5',
    title: 'AadhaarBridge e-KYC Schema Review',
    description: 'Deciding on biometric e-KYC consent logs and verification flow via UIDAI APIs.',
    startTime: getPastDateStr(14, 11, 0),
    endTime: getPastDateStr(14, 12, 30),
    durationMinutes: 90,
    organizerEmail: 'aditi.p@tcs.com',
    attendeeEmails: ['aditi.p@tcs.com', 'kabir.m@tcs.com', 'priya.n@tcs.com'],
    attributedProjectId: 'proj-adb',
    attributionConfidence: 0.96,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-6',
    title: 'AadhaarBridge Security Runbook Audit',
    description: 'Going through compliance logs, biometrics consent security, and data storage policies.',
    startTime: getPastDateStr(9, 10, 0),
    endTime: getPastDateStr(9, 11, 0),
    durationMinutes: 60,
    organizerEmail: 'aditi.p@tcs.com',
    attendeeEmails: ['aditi.p@tcs.com', 'kabir.m@tcs.com', 'aarav.s@tcs.com'],
    attributedProjectId: 'proj-adb',
    attributionConfidence: 0.93,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },

  // AyushmanLink (Health Stack)
  {
    id: 'meet-7',
    title: 'ABDM Consent Manager Integration',
    description: 'Configuring health locker templates and electronic health record callbacks for health lockers.',
    startTime: getPastDateStr(8, 14, 0),
    endTime: getPastDateStr(8, 15, 0),
    durationMinutes: 60,
    organizerEmail: 'diya.s@tcs.com',
    attendeeEmails: ['diya.s@tcs.com', 'aditi.p@tcs.com', 'aarav.s@tcs.com'],
    attributedProjectId: 'proj-ayl',
    attributionConfidence: 0.91,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-8',
    title: 'AyushmanLink Health Stack Security Review',
    description: 'Audit session on clinical metadata encryption schemes and user identity checks.',
    startTime: getPastDateStr(5, 10, 0),
    endTime: getPastDateStr(5, 13, 0), // 3 hours! Expensive meeting.
    durationMinutes: 180,
    organizerEmail: 'diya.s@tcs.com',
    attendeeEmails: ['diya.s@tcs.com', 'aditi.p@tcs.com', 'priya.n@tcs.com', 'aarav.s@tcs.com'],
    attributedProjectId: 'proj-ayl',
    attributionConfidence: 0.95,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },

  // ONDC-Connect
  {
    id: 'meet-9',
    title: 'ONDC Catalogue Seller Integration',
    description: 'Adjusting ONDC registry schemas, buyer app seller catalog queries, and logistics endpoints.',
    startTime: getPastDateStr(13, 11, 0),
    endTime: getPastDateStr(13, 11, 45),
    durationMinutes: 45,
    organizerEmail: 'amit.v@tcs.com',
    attendeeEmails: ['amit.v@tcs.com', 'ananya.i@tcs.com'],
    attributedProjectId: 'proj-ondc',
    attributionConfidence: 0.89,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-10',
    title: 'ONDC seller protocol client pitch',
    description: 'Reviewing proposal details, milestones, and integration schedules for retail buyer apps.',
    startTime: getPastDateStr(6, 14, 0),
    endTime: getPastDateStr(6, 16, 0), // 2 hours
    durationMinutes: 120,
    organizerEmail: 'amit.v@tcs.com',
    attendeeEmails: ['amit.v@tcs.com', 'aarav.s@tcs.com', 'rohan.d@tcs.com'],
    attributedProjectId: 'proj-ondc',
    attributionConfidence: 0.94,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },

  // Company Operations
  {
    id: 'meet-11',
    title: 'Monthly Bangalore HQ All-Hands',
    description: 'TCS growth roadmap review, financial goals update, Q2 milestones, and general tea announcements.',
    startTime: getPastDateStr(15, 10, 0),
    endTime: getPastDateStr(15, 11, 0),
    durationMinutes: 60,
    organizerEmail: 'neha.g@tcs.com',
    attendeeEmails: [
      'aarav.s@tcs.com', 'aditi.p@tcs.com', 'rohan.d@tcs.com', 
      'priya.n@tcs.com', 'ananya.i@tcs.com', 'kabir.m@tcs.com', 
      'diya.s@tcs.com', 'neha.g@tcs.com', 'amit.v@tcs.com', 'vikram.r@tcs.com'
    ], // EVERYONE is here! Massive cost!
    attributedProjectId: 'proj-admin',
    attributionConfidence: 0.99,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-12',
    title: '1-on-1: Aarav / Aditi',
    description: 'Regular career alignment and architecture check-in.',
    startTime: getPastDateStr(4, 15, 30),
    endTime: getPastDateStr(4, 16, 0),
    durationMinutes: 30,
    organizerEmail: 'aarav.s@tcs.com',
    attendeeEmails: ['aarav.s@tcs.com', 'aditi.p@tcs.com'],
    attributedProjectId: 'proj-admin',
    attributionConfidence: 0.88,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },

  // Anomalous / Ambiguous / Low Confidence meetings
  {
    id: 'meet-13',
    title: 'Sync chat',
    description: 'Quick alignment chat',
    startTime: getPastDateStr(3, 10, 0),
    endTime: getPastDateStr(3, 10, 30),
    durationMinutes: 30,
    organizerEmail: 'kabir.m@tcs.com',
    attendeeEmails: ['kabir.m@tcs.com', 'diya.s@tcs.com'],
    attributedProjectId: 'unattributed',
    attributionConfidence: 0.22,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-14',
    title: 'Review and Brainstorming session',
    description: 'We need to talk about things related to the digital roadmap.',
    startTime: getPastDateStr(2, 14, 0),
    endTime: getPastDateStr(2, 15, 30),
    durationMinutes: 90,
    organizerEmail: 'vikram.r@tcs.com',
    attendeeEmails: ['vikram.r@tcs.com', 'kabir.m@tcs.com', 'ananya.i@tcs.com'],
    attributedProjectId: 'unattributed',
    attributionConfidence: 0.35,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-15',
    title: 'Weekly standup',
    description: 'Go over sprint updates.',
    startTime: getPastDateStr(1, 9, 0),
    endTime: getPastDateStr(1, 10, 0),
    durationMinutes: 60,
    organizerEmail: 'priya.n@tcs.com',
    attendeeEmails: ['priya.n@tcs.com', 'kabir.m@tcs.com', 'diya.s@tcs.com'],
    attributedProjectId: 'unattributed',
    attributionConfidence: 0.18,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-16',
    title: 'ONDC registry buyer app setup discussion',
    description: 'Let\'s run through what Vikram has compiled.',
    startTime: getPastDateStr(2, 11, 0),
    endTime: getPastDateStr(2, 12, 0),
    durationMinutes: 60,
    organizerEmail: 'amit.v@tcs.com',
    attendeeEmails: ['amit.v@tcs.com', 'vikram.r@tcs.com'],
    attributedProjectId: 'proj-ondc',
    attributionConfidence: 0.76,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-17',
    title: 'BharatPay payment settle review',
    description: 'Triage queries on bank settlements.',
    startTime: getPastDateStr(1, 13, 0),
    endTime: getPastDateStr(1, 14, 0),
    durationMinutes: 60,
    organizerEmail: 'rohan.d@tcs.com',
    attendeeEmails: ['rohan.d@tcs.com', 'priya.n@tcs.com'],
    attributedProjectId: 'proj-bhp',
    attributionConfidence: 0.82,
    attributionMethod: 'heuristic',
    isManualOverride: false
  },
  {
    id: 'meet-18',
    title: 'Chai alignment block', // Anomaly: scheduled but only 1 person attended
    description: 'Reviewing code alone on calendar block.',
    startTime: getPastDateStr(1, 15, 0),
    endTime: getPastDateStr(1, 16, 0),
    durationMinutes: 60,
    organizerEmail: 'aditi.p@tcs.com',
    attendeeEmails: ['aditi.p@tcs.com'], // Only 1 attendee
    attributedProjectId: 'proj-adb',
    attributionConfidence: 0.85,
    attributionMethod: 'heuristic',
    isManualOverride: false
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  geminiApiKey: '',
  adminPin: '1234',
  autoSyncMinutes: 15,
  hideSalaryDetails: true,
  companyName: 'TCS'
};
