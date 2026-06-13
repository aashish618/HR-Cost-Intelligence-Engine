export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string; // e.g. "Software Engineer", "Product Manager", "UI Designer", "VP Engineering"
  primaryProjectId?: string; // ID of the project they primarily work on
  avatarUrl?: string;
}

export interface RoleRate {
  role: string;
  hourlyRate: number;
}

export interface Project {
  id: string;
  name: string;
  code: string; // e.g. "PROJ-ALPHA"
  description: string;
  budget: number;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'archived';
  color: string; // hex or tailwind-like color string for charting
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  durationMinutes: number;
  organizerEmail: string;
  attendeeEmails: string[];
  attributedProjectId: string; // Project ID or 'unattributed'
  attributionConfidence: number; // 0.0 to 1.0
  attributionMethod: 'heuristic' | 'llm' | 'manual';
  isManualOverride: boolean;
  notes?: string;
}

export interface Anomaly {
  id: string;
  type: 'budget_overrun' | 'unattributed_meeting' | 'burnout' | 'low_priority_leak' | 'ghost_meeting';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  targetId: string; // project ID, employee ID, or meeting ID
  detectedAt: string; // ISO String
}

export interface AppSettings {
  geminiApiKey: string;
  adminPin: string;
  autoSyncMinutes: number;
  hideSalaryDetails: boolean;
}
