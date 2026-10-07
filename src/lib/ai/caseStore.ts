import { ConsultationCase, DoctorStats } from '../types';
import { calculateCompleteness } from './adaptiveEngine';

// Seed demo cases with realistic clinical data
const SEED_CASES: ConsultationCase[] = [
  {
    id: 'DR-2048',
    patient: {
      name: 'Akash Singh',
      age: 20,
      gender: 'Male',
      language: 'English',
      consentGiven: true,
      consentTimestamp: '2026-09-30T19:40:00.000Z',
    },
    createdAt: '2026-09-30T19:45:00.000Z',
    updatedAt: '2026-09-30T19:50:00.000Z',
    status: 'Pending',
    messages: [
      {
        id: 'msg-1',
        sender: 'ai',
        text: "Hello Akash. I'm here to collect some information before your consultation. Please describe what is bothering you today.",
        timestamp: '19:45',
        quickReplies: ['Headache for 3 days', 'Stomach pain', 'Fever', 'Other'],
      },
      {
        id: 'msg-2',
        sender: 'patient',
        text: "I've been having headaches for 3 days.",
        timestamp: '19:46',
      },
      {
        id: 'msg-3',
        sender: 'ai',
        text: 'I understand. How would you describe the headache and where is it located?',
        timestamp: '19:46',
        quickReplies: ['Throbbing', 'Dull pressure', 'Sharp / Stabbing', 'Forehead & temples'],
      },
      {
        id: 'msg-4',
        sender: 'patient',
        text: 'It is a throbbing ache mostly across my forehead and temples.',
        timestamp: '19:47',
      },
      {
        id: 'msg-5',
        sender: 'ai',
        text: 'On a scale from 1 to 10, how severe is the headache?',
        timestamp: '19:47',
        quickReplies: ['3/10', '6/10', '8/10', '10/10'],
      },
      {
        id: 'msg-6',
        sender: 'patient',
        text: '6/10',
        timestamp: '19:48',
      },
      {
        id: 'msg-7',
        sender: 'ai',
        text: 'Have you experienced nausea, dizziness, vision changes, or sensitivity to light?',
        timestamp: '19:48',
        quickReplies: ['Mild nausea & light sensitivity', 'Dizziness', 'None'],
      },
      {
        id: 'msg-8',
        sender: 'patient',
        text: 'Mild nausea and sensitivity to light when looking at screens.',
        timestamp: '19:49',
      },
      {
        id: 'msg-9',
        sender: 'ai',
        text: 'Have you taken any medication for this, or do you have any drug allergies?',
        timestamp: '19:49',
        quickReplies: ['Took Paracetamol', 'No medications', 'No known allergies'],
      },
      {
        id: 'msg-10',
        sender: 'patient',
        text: 'I took one Paracetamol yesterday which gave slight relief. No allergies.',
        timestamp: '19:50',
      },
    ],
    extractedData: {
      chiefComplaint: 'Headache (Cephalea)',
      symptoms: ['Headache', 'Throbbing pain', 'Light sensitivity'],
      duration: '3 days',
      severity: '6/10 (Moderate)',
      location: 'Forehead and bilateral temples',
      onset: 'Gradual onset 3 days ago',
      frequency: 'Persistent, worsens with screen exposure',
      associatedSymptoms: ['Mild nausea', 'Photophobia (Light sensitivity)'],
      medicalHistory: ['No chronic conditions reported'],
      medications: ['Paracetamol (1 dose yesterday, partial relief)'],
      allergies: ['NKDA (No known drug allergies)'],
      familyHistory: ['None noted'],
      lifestyle: ['High screen time (student)'],
      missingInformation: ['Family history of migraines'],
      urgencyLevel: 'routine',
    },
    completeness: {
      percentage: 82,
      checklist: [
        { key: 'chiefComplaint', label: 'Chief Complaint', completed: true, required: true },
        { key: 'duration', label: 'Duration & Onset', completed: true, required: true },
        { key: 'severity', label: 'Severity Rating', completed: true, required: true },
        { key: 'location', label: 'Location / Quality', completed: true, required: true },
        { key: 'associatedSymptoms', label: 'Associated Symptoms', completed: true, required: false },
        { key: 'medications', label: 'Current Medications', completed: true, required: false },
        { key: 'allergies', label: 'Allergies & History', completed: true, required: false },
      ],
    },
    aiSummary:
      'Patient Akash Singh (20 y/o male) reports a 3-day history of moderate throbbing headache (severity 6/10) localized to the forehead and bilateral temples. Accompanied by mild nausea and photophobia, exacerbated by screen use. Took one dose of Paracetamol with mild relief. NKDA reported. AI summary generated for clinical verification.',
  },
  {
    id: 'DR-2049',
    patient: {
      name: 'Priya Sharma',
      age: 34,
      gender: 'Female',
      language: 'Hinglish',
      consentGiven: true,
      consentTimestamp: '2026-09-30T18:15:00.000Z',
    },
    createdAt: '2026-09-30T18:20:00.000Z',
    updatedAt: '2026-09-30T18:35:00.000Z',
    status: 'In Review',
    messages: [
      {
        id: 'msg-p1',
        sender: 'ai',
        text: 'Hello Priya. Please describe your health concern today.',
        timestamp: '18:20',
      },
      {
        id: 'msg-p2',
        sender: 'patient',
        text: 'Mujhe 2 din se lower right side pet me sharp dard ho raha hai.',
        timestamp: '18:22',
      },
      {
        id: 'msg-p3',
        sender: 'ai',
        text: 'Dard kitna severe hai scale 1-10 par? Aur kya ulti ya fever hai?',
        timestamp: '18:23',
      },
      {
        id: 'msg-p4',
        sender: 'patient',
        text: 'Severity around 7/10. Mild fever feel ho raha hai aur khana khane par nausea hota hai.',
        timestamp: '18:25',
      },
    ],
    extractedData: {
      chiefComplaint: 'Abdominal Pain (RLQ)',
      symptoms: ['Right lower quadrant pain', 'Mild fever', 'Nausea'],
      duration: '2 days',
      severity: '7/10 (Severe)',
      location: 'Lower right abdomen (RLQ)',
      onset: 'Acute onset 48 hours ago',
      frequency: 'Persistent, worsens with movement',
      associatedSymptoms: ['Mild fever / Chills', 'Nausea on food intake'],
      medicalHistory: ['No prior abdominal surgeries'],
      medications: ['None reported'],
      allergies: ['Sulfa drugs'],
      familyHistory: ['Not reported'],
      lifestyle: ['Non-smoker'],
      missingInformation: ['Last menstrual period', 'Bowel movement changes'],
      urgencyLevel: 'priority',
      urgencyRationale: 'Right lower quadrant tenderness with low fever requires appendicitis rule-out.',
    },
    completeness: {
      percentage: 76,
      checklist: [
        { key: 'chiefComplaint', label: 'Chief Complaint', completed: true, required: true },
        { key: 'duration', label: 'Duration & Onset', completed: true, required: true },
        { key: 'severity', label: 'Severity Rating', completed: true, required: true },
        { key: 'location', label: 'Location / Quality', completed: true, required: true },
        { key: 'associatedSymptoms', label: 'Associated Symptoms', completed: true, required: false },
        { key: 'medications', label: 'Current Medications', completed: false, required: false },
        { key: 'allergies', label: 'Allergies & History', completed: true, required: false },
      ],
    },
    aiSummary:
      'Patient Priya Sharma (34 y/o female) presents with 2-day history of acute right lower quadrant abdominal pain (7/10 severity). Associated with low-grade fever sensation and post-prandial nausea. Known Sulfa allergy. Physician physical examination and ultrasound indicated to assess RLQ tenderness.',
  },
  {
    id: 'DR-2050',
    patient: {
      name: 'Rahul Verma',
      age: 45,
      gender: 'Male',
      language: 'Hindi',
      consentGiven: true,
      consentTimestamp: '2026-09-30T16:00:00.000Z',
    },
    createdAt: '2026-09-30T16:05:00.000Z',
    updatedAt: '2026-09-30T17:10:00.000Z',
    status: 'Doctor Verified',
    doctorNotes: 'Chest auscultation reveals mild bilateral expiratory rhonchi. Prescribed Azithromycin 500mg OD x 3d and Levocetirizine. Advised hydration and follow-up in 4 days if fever persists.',
    verifiedAt: '2026-09-30T17:10:00.000Z',
    verifiedBy: 'Dr. Arvind Sharma, MD',
    messages: [
      {
        id: 'msg-r1',
        sender: 'ai',
        text: 'नमस्ते राहुल जी। कृपया बताइए आज आपको क्या समस्या है?',
        timestamp: '16:05',
      },
      {
        id: 'msg-r2',
        sender: 'patient',
        text: '4 din se tez bukhar hai aur peeli khansi nikal rahi hai.',
        timestamp: '16:08',
      },
    ],
    extractedData: {
      chiefComplaint: 'Fever with Productive Cough',
      symptoms: ['Fever (101°F)', 'Productive yellowish sputum cough', 'Body aches'],
      duration: '4 days',
      severity: '5/10 (Moderate)',
      location: 'Chest & throat congestion',
      onset: 'Started with sore throat 4 days ago',
      frequency: 'Frequent paroxysmal cough',
      associatedSymptoms: ['Generalized myalgia', 'Mild fatigue'],
      medicalHistory: ['Hypertension (on Telmisartan 40mg)'],
      medications: ['Telmisartan 40mg OD', 'Dolo 650mg as needed'],
      allergies: ['NKDA'],
      familyHistory: ['Father had CAD'],
      lifestyle: ['Smoker (5 cigarettes/day)'],
      missingInformation: [],
      urgencyLevel: 'routine',
    },
    completeness: {
      percentage: 95,
      checklist: [
        { key: 'chiefComplaint', label: 'Chief Complaint', completed: true, required: true },
        { key: 'duration', label: 'Duration & Onset', completed: true, required: true },
        { key: 'severity', label: 'Severity Rating', completed: true, required: true },
        { key: 'location', label: 'Location / Quality', completed: true, required: true },
        { key: 'associatedSymptoms', label: 'Associated Symptoms', completed: true, required: false },
        { key: 'medications', label: 'Current Medications', completed: true, required: false },
        { key: 'allergies', label: 'Allergies & History', completed: true, required: false },
      ],
    },
    aiSummary:
      'Rahul Verma (45 y/o male, hypertensive, active smoker) reports a 4-day history of pyrexia with productive cough containing yellowish sputum. Moderate severity (5/10). Regularly taking Telmisartan 40mg for hypertension. NKDA.',
  },
  {
    id: 'DR-2051',
    patient: {
      name: 'Sunita Patel',
      age: 58,
      gender: 'Female',
      language: 'English',
      consentGiven: true,
      consentTimestamp: '2026-09-30T14:30:00.000Z',
    },
    createdAt: '2026-09-30T14:35:00.000Z',
    updatedAt: '2026-09-30T15:20:00.000Z',
    status: 'Doctor Verified',
    doctorNotes: 'Straight leg raise test positive on right at 45 degrees. Suspected L4-L5 lumbar radiculopathy. Prescribed Pregabalin + Methylcobalamin, Physiotherapy referral, Lumbo-sacral X-ray ordered.',
    verifiedAt: '2026-09-30T15:20:00.000Z',
    verifiedBy: 'Dr. Neha Kapoor, Orthopedics',
    messages: [
      {
        id: 'msg-s1',
        sender: 'ai',
        text: 'Hello Sunita. Please tell me about your symptoms.',
        timestamp: '14:35',
      },
      {
        id: 'msg-s2',
        sender: 'patient',
        text: 'Severe lower back pain radiating down my right leg for 2 weeks.',
        timestamp: '14:38',
      },
    ],
    extractedData: {
      chiefComplaint: 'Lumbar Spine Radiculopathy',
      symptoms: ['Lower back pain', 'Right thigh numbness / tingling', 'Difficulty sitting'],
      duration: '2 weeks',
      severity: '8/10 (Severe)',
      location: 'Lumbosacral region radiating to right posterior thigh',
      onset: 'Gradual worsening after lifting heavy groceries',
      frequency: 'Constant, sharp shooting pain on walking',
      associatedSymptoms: ['Paresthesia (pins & needles in right foot)'],
      medicalHistory: ['Type 2 Diabetes Mellitus (HbA1c 7.2%)'],
      medications: ['Metformin 500mg BD'],
      allergies: ['NKDA'],
      familyHistory: ['Osteoarthritis in mother'],
      lifestyle: ['Sedentary office work'],
      missingInformation: [],
      urgencyLevel: 'priority',
      urgencyRationale: 'Radicular shooting pain with paresthesia requires neurological motor/sensory examination.',
    },
    completeness: {
      percentage: 90,
      checklist: [
        { key: 'chiefComplaint', label: 'Chief Complaint', completed: true, required: true },
        { key: 'duration', label: 'Duration & Onset', completed: true, required: true },
        { key: 'severity', label: 'Severity Rating', completed: true, required: true },
        { key: 'location', label: 'Location / Quality', completed: true, required: true },
        { key: 'associatedSymptoms', label: 'Associated Symptoms', completed: true, required: false },
        { key: 'medications', label: 'Current Medications', completed: true, required: false },
        { key: 'allergies', label: 'Allergies & History', completed: true, required: false },
      ],
    },
    aiSummary:
      'Sunita Patel (58 y/o female, known diabetic on Metformin) presents with a 2-week history of severe lower back pain (8/10) with sharp radicular pain and paresthesia extending down the right leg. Triggered post heavy lifting. Neurological evaluation recommended.',
  },
];

// In-memory cases map (persists in Node.js server lifecycle)
let memoryCases: Map<string, ConsultationCase> = new Map(
  SEED_CASES.map((c) => [c.id, JSON.parse(JSON.stringify(c))])
);

export function getAllCases(): ConsultationCase[] {
  // Sort with newest first
  return Array.from(memoryCases.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getCaseById(id: string): ConsultationCase | undefined {
  return memoryCases.get(id);
}

export function saveCase(caseData: ConsultationCase): ConsultationCase {
  // Ensure completeness is computed
  if (!caseData.completeness || caseData.completeness.percentage === 0) {
    caseData.completeness = calculateCompleteness(caseData.extractedData);
  }
  memoryCases.set(caseData.id, caseData);
  return caseData;
}

export function updateCase(
  id: string,
  updates: Partial<ConsultationCase>
): ConsultationCase | null {
  const existing = memoryCases.get(id);
  if (!existing) return null;

  const updated: ConsultationCase = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
    extractedData: {
      ...existing.extractedData,
      ...(updates.extractedData || {}),
    },
  };

  if (updates.extractedData) {
    updated.completeness = calculateCompleteness(updated.extractedData);
  }

  memoryCases.set(id, updated);
  return updated;
}

export function verifyCase(
  id: string,
  doctorName: string,
  notes?: string
): ConsultationCase | null {
  const existing = memoryCases.get(id);
  if (!existing) return null;

  const verified: ConsultationCase = {
    ...existing,
    status: 'Doctor Verified',
    doctorNotes: notes !== undefined ? notes : existing.doctorNotes,
    verifiedAt: new Date().toISOString(),
    verifiedBy: doctorName || 'Attending Physician',
    updatedAt: new Date().toISOString(),
  };

  memoryCases.set(id, verified);
  return verified;
}

export function getDoctorStats(): DoctorStats {
  const cases = Array.from(memoryCases.values());
  const pending = cases.filter((c) => c.status === 'Pending').length;
  const inReview = cases.filter((c) => c.status === 'In Review').length;
  const verified = cases.filter((c) => c.status === 'Doctor Verified').length;
  const urgent = cases.filter((c) => c.extractedData.urgencyLevel === 'urgent' || c.extractedData.urgencyLevel === 'priority').length;

  const totalCompleteness = cases.reduce(
    (sum, c) => sum + (c.completeness?.percentage || 0),
    0
  );
  const avgCompleteness = cases.length > 0 ? Math.round(totalCompleteness / cases.length) : 80;

  return {
    newCasesCount: cases.length,
    pendingReviewCount: pending + inReview,
    reviewedTodayCount: verified,
    averageCompleteness: avgCompleteness,
    urgentCasesCount: urgent,
  };
}

export function resetToSeedCases(): void {
  memoryCases = new Map(SEED_CASES.map((c) => [c.id, JSON.parse(JSON.stringify(c))]));
}
