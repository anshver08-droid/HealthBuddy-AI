import { ConsultationCase, PatientProfile } from './types';

const STORAGE_KEY_PATIENT = 'darkrai_active_patient';
const STORAGE_KEY_CASE = 'darkrai_active_case';
const STORAGE_KEY_ROLE = 'darkrai_user_role';
const STORAGE_KEY_SETTINGS = 'darkrai_settings';

export interface AppSettings {
  demoMode: boolean;
  language: string;
  enableVoice: boolean;
  doctorSpecialty: string;
  doctorName: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  demoMode: true,
  language: 'English',
  enableVoice: true,
  doctorSpecialty: 'General Medicine',
  doctorName: 'Dr. Arvind Sharma, MD',
};

export const DEFAULT_DEMO_PATIENT: PatientProfile = {
  name: 'Akash Singh',
  age: 20,
  gender: 'Male',
  language: 'English',
  consentGiven: false,
};

export function getStoredPatient(): PatientProfile {
  if (typeof window === 'undefined') return DEFAULT_DEMO_PATIENT;
  try {
    const data = localStorage.getItem(STORAGE_KEY_PATIENT);
    return data ? JSON.parse(data) : DEFAULT_DEMO_PATIENT;
  } catch {
    return DEFAULT_DEMO_PATIENT;
  }
}

export function setStoredPatient(patient: PatientProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PATIENT, JSON.stringify(patient));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export function getStoredCase(): ConsultationCase | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY_CASE);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setStoredCase(caseData: ConsultationCase): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CASE, JSON.stringify(caseData));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export function clearActiveConsultation(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_PATIENT);
    localStorage.removeItem(STORAGE_KEY_CASE);
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export function getStoredSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function setStoredSettings(settings: Partial<AppSettings>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export function getUserRole(): 'patient' | 'doctor' {
  if (typeof window === 'undefined') return 'patient';
  return (localStorage.getItem(STORAGE_KEY_ROLE) as 'patient' | 'doctor') || 'patient';
}

export function setUserRole(role: 'patient' | 'doctor'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ROLE, role);
}
