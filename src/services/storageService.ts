import type { Employee, RoleRate, Project, Meeting, AppSettings } from '../types';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_MEETINGS, 
  INITIAL_PROJECTS, 
  INITIAL_ROLE_RATES, 
  INITIAL_SETTINGS 
} from '../mockData';

const KEYS = {
  EMPLOYEES: 'hr_cost_employees',
  MEETINGS: 'hr_cost_meetings',
  PROJECTS: 'hr_cost_projects',
  ROLE_RATES: 'hr_cost_role_rates',
  SETTINGS: 'hr_cost_settings'
};

export const storageService = {
  getEmployees(): Employee[] {
    const data = localStorage.getItem(KEYS.EMPLOYEES);
    if (!data) {
      this.saveEmployees(INITIAL_EMPLOYEES);
      return INITIAL_EMPLOYEES;
    }
    return JSON.parse(data);
  },

  saveEmployees(employees: Employee[]): void {
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(employees));
  },

  getMeetings(): Meeting[] {
    const data = localStorage.getItem(KEYS.MEETINGS);
    if (!data) {
      this.saveMeetings(INITIAL_MEETINGS);
      return INITIAL_MEETINGS;
    }
    return JSON.parse(data);
  },

  saveMeetings(meetings: Meeting[]): void {
    localStorage.setItem(KEYS.MEETINGS, JSON.stringify(meetings));
  },

  getProjects(): Project[] {
    const data = localStorage.getItem(KEYS.PROJECTS);
    if (!data) {
      this.saveProjects(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }
    return JSON.parse(data);
  },

  saveProjects(projects: Project[]): void {
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
  },

  getRoleRates(): RoleRate[] {
    const data = localStorage.getItem(KEYS.ROLE_RATES);
    if (!data) {
      this.saveRoleRates(INITIAL_ROLE_RATES);
      return INITIAL_ROLE_RATES;
    }
    return JSON.parse(data);
  },

  saveRoleRates(rates: RoleRate[]): void {
    localStorage.setItem(KEYS.ROLE_RATES, JSON.stringify(rates));
  },

  getSettings(): AppSettings {
    const data = localStorage.getItem(KEYS.SETTINGS);
    if (!data) {
      this.saveSettings(INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    return JSON.parse(data);
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  clearAll(): void {
    localStorage.removeItem(KEYS.EMPLOYEES);
    localStorage.removeItem(KEYS.MEETINGS);
    localStorage.removeItem(KEYS.PROJECTS);
    localStorage.removeItem(KEYS.ROLE_RATES);
    localStorage.removeItem(KEYS.SETTINGS);
  }
};
