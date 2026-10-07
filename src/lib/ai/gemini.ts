import { GoogleGenAI } from '@google/genai';
import { ClinicalExtraction, ChatMessage, PatientProfile } from '../types';

// Safely instantiate Google GenAI if key is present
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn('Failed to initialize GoogleGenAI client:', error);
    return null;
  }
}

export const CLINICAL_INTAKE_SYSTEM_PROMPT = `
You are the pre-consultation clinical intake AI for "Health Buddy" — a warm, patient, and highly accessible medical intake assistant.
Your purpose is to assist healthcare professionals by engaging with a patient BEFORE their doctor's appointment.
You gather structured symptom information, relevant history, and prepare an organized case summary.

CRITICAL SAFETY PRINCIPLES (Non-negotiable):
1. You are NOT a doctor and do NOT diagnose diseases. Never say "You have X condition".
2. NEVER prescribe medications, recommend specific drug dosages, or say the patient doesn't need a doctor.
3. Always frame the interaction as collecting information for the doctor's review.
4. Ask ONE clear, targeted follow-up question at a time to avoid overwhelming the patient.
5. If you detect emergency red-flag symptoms (severe chest pain radiating to arm/jaw, sudden "thunderclap" headache, stroke symptoms, acute respiratory distress, coughing large amounts of blood), immediately set urgencyLevel to "urgent" and urgently recommend emergency services.

LANGUAGE & TONE:
6. Detect and strictly match the patient's language preference:
   - English → Respond in clear, plain English (6th-8th grade reading level)
   - Hindi → Respond entirely in Hindi using Devanagari script (हिंदी में)
   - Hinglish → Respond in natural Hindi-English mix using Roman script
   - Spanish → Responda completamente en español claro
   - Tamil → தமிழில் பதில் அளிக்கவும்
   - Bengali → বাংলায় উত্তর দিন
   - For any other language the patient uses → switch to that language
7. Be warm, gentle, reassuring — never cold or clinical. The patient may be anxious.
8. Use simple everyday words. Avoid medical jargon; if you must use a term, explain it in plain language.

OUTPUT FORMAT:
9. Return ONLY valid JSON conforming to this exact schema (no markdown, no commentary):
{
  "aiResponse": "Your next conversational question or acknowledgement in the patient's language",
  "quickReplies": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "extractedData": {
    "chiefComplaint": "string",
    "symptoms": ["string"],
    "duration": "string",
    "severity": "string",
    "location": "string",
    "onset": "string",
    "frequency": "string",
    "associatedSymptoms": ["string"],
    "medicalHistory": ["string"],
    "medications": ["string"],
    "allergies": ["string"],
    "familyHistory": ["string"],
    "lifestyle": ["string"],
    "missingInformation": ["string"],
    "urgencyLevel": "routine",
    "urgencyRationale": ""
  },
  "isUrgentAlert": false,
  "urgentNotice": ""
}
`;


export interface GeminiTurnResult {
  aiResponse: string;
  quickReplies: string[];
  extractedData: ClinicalExtraction;
  isUrgentAlert: boolean;
  urgentNotice?: string;
}

export async function runGeminiConsultationTurn(
  messages: ChatMessage[],
  patient: PatientProfile,
  currentExtraction: ClinicalExtraction
): Promise<GeminiTurnResult | null> {
  const client = getGeminiClient();
  if (!client) return null;

  try {
    const prompt = `
Current Patient:
- Name: ${patient.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- Language: ${patient.language}

Current Extracted Clinical Data:
${JSON.stringify(currentExtraction, null, 2)}

Full Conversation History:
${messages.map((m) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}

Task:
1. Analyze the latest patient message.
2. Extract any newly provided medical details (chief complaint, duration, severity, location, onset, associated symptoms, medical history, medications, allergies, family history, lifestyle). DO NOT invent or assume any unstated information.
3. Determine the NEXT most relevant adaptive question to ask the patient. Ask only ONE clear question.
4. Provide 3-5 intuitive quick-reply options (short pills) that help the patient respond easily.
5. Check for emergency red flags.
6. Format the response strictly as a JSON object:
{
  "aiResponse": "Your next conversational question or acknowledgement in the patient's language",
  "quickReplies": ["Option 1", "Option 2", "Option 3"],
  "extractedData": {
    "chiefComplaint": "string",
    "symptoms": ["string"],
    "duration": "string",
    "severity": "string",
    "location": "string",
    "onset": "string",
    "frequency": "string",
    "associatedSymptoms": ["string"],
    "medicalHistory": ["string"],
    "medications": ["string"],
    "allergies": ["string"],
    "familyHistory": ["string"],
    "lifestyle": ["string"],
    "missingInformation": ["string"],
    "urgencyLevel": "routine" | "priority" | "urgent",
    "urgencyRationale": "string if urgent"
  },
  "isUrgentAlert": boolean,
  "urgentNotice": "string if urgent"
}
`;

    // Using gemini-3.5-flash-lite with models.generateContent for ultra-fast, high-throughput intake
    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: CLINICAL_INTAKE_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText) as GeminiTurnResult;
    return parsed;
  } catch (error) {
    console.error('Gemini API call failed, falling back to local adaptive engine:', error);
    return null;
  }
}

export async function runGeminiCaseSummary(
  extraction: ClinicalExtraction,
  patient: PatientProfile
): Promise<string | null> {
  const client = getGeminiClient();
  if (!client) return null;

  try {
    const prompt = `
Generate a concise, factual, doctor-ready clinical intake summary for:
Patient: ${patient.name}, ${patient.age} y/o ${patient.gender}.
Extracted Clinical Data:
${JSON.stringify(extraction, null, 2)}

Rules:
- Write 2 to 4 factual sentences summarizing chief complaint, duration, severity, location, associated symptoms, and relevant history.
- DO NOT provide a medical diagnosis.
- DO NOT invent information. State "None reported" for unmentioned items.
- Mention that this summary was compiled via pre-consultation intake for physician verification.
`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: CLINICAL_INTAKE_SYSTEM_PROMPT,
      },
    });

    return response.text || null;
  } catch (error) {
    console.error('Gemini summary generation failed:', error);
    return null;
  }
}

export async function testGeminiConnection(): Promise<{
  success: boolean;
  model: string;
  message: string;
  latencyMs: number;
}> {
  const start = Date.now();
  const client = getGeminiClient();
  if (!client) {
    return {
      success: false,
      model: 'gemini-3.5-flash-lite',
      message: 'GEMINI_API_KEY is not configured or is empty in .env.local',
      latencyMs: 0,
    };
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: 'Respond with exactly the word "OPERATIONAL"',
    });

    const latencyMs = Date.now() - start;
    const text = response.text?.trim() || '';
    return {
      success: true,
      model: 'Google Gemini 3.5 Flash (Lite)',
      message: `Operational and ready for live consultation (${text})`,
      latencyMs,
    };
  } catch (error: any) {
    return {
      success: false,
      model: 'gemini-3.5-flash-lite',
      message: error?.message || 'Failed to connect to Google Gemini API',
      latencyMs: Date.now() - start,
    };
  }
}

