export type LanguageOption = 'English' | 'Hindi' | 'Hinglish' | 'Spanish' | 'Tamil' | 'Bengali' | 'Marathi' | 'Telugu';
export type GenderOption = 'Male' | 'Female' | 'Other' | 'Prefer not to say';
export type CaseStatus = 'Pending' | 'In Review' | 'Doctor Verified';
export type TriageUrgency = 'routine' | 'priority' | 'urgent';

export interface PatientProfile {
  name: string;
  age: number;
  gender: GenderOption;
  language: LanguageOption;
  phone?: string;
  consentGiven: boolean;
  consentTimestamp?: string;
}

export interface CompletenessItem {
  key: string;
  label: string;
  completed: boolean;
  required: boolean;
}

export interface CaseCompleteness {
  percentage: number;
  checklist: CompletenessItem[];
}

export interface ClinicalExtraction {
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  severity: string; // e.g. "6/10" or "Moderate"
  location: string;
  onset: string;
  frequency: string;
  associatedSymptoms: string[];
  medicalHistory: string[];
  medications: string[];
  allergies: string[];
  familyHistory: string[];
  lifestyle: string[];
  missingInformation: string[];
  urgencyLevel: TriageUrgency;
  urgencyRationale?: string;
  summary?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'patient' | 'system';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  isUrgentAlert?: boolean;
}

export interface ConsultationCase {
  id: string; // e.g. "DR-2048"
  patient: PatientProfile;
  createdAt: string;
  updatedAt: string;
  status: CaseStatus;
  messages: ChatMessage[];
  extractedData: ClinicalExtraction;
  completeness: CaseCompleteness;
  aiSummary: string;
  doctorNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  editedFields?: Record<string, string>;
}

export interface DoctorStats {
  newCasesCount: number;
  pendingReviewCount: number;
  reviewedTodayCount: number;
  averageCompleteness: number;
  urgentCasesCount: number;
}
