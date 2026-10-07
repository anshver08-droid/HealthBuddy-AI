import {
  ChatMessage,
  ClinicalExtraction,
  PatientProfile,
  CaseCompleteness,
  CompletenessItem,
  TriageUrgency,
} from '../types';
import { runGeminiCaseSummary, runGeminiConsultationTurn } from './gemini';

export interface TurnResponse {
  aiResponse: string;
  quickReplies: string[];
  extractedData: ClinicalExtraction;
  completeness: CaseCompleteness;
  isUrgentAlert: boolean;
  urgentNotice?: string;
  isAiGenerated: boolean;
  modelUsed: string;
}

// Initial empty extraction state
export function createInitialExtraction(): ClinicalExtraction {
  return {
    chiefComplaint: '',
    symptoms: [],
    duration: '',
    severity: '',
    location: '',
    onset: '',
    frequency: '',
    associatedSymptoms: [],
    medicalHistory: [],
    medications: [],
    allergies: [],
    familyHistory: [],
    lifestyle: [],
    missingInformation: [
      'Chief Complaint',
      'Duration',
      'Severity',
      'Location / Character',
      'Associated Symptoms',
      'Medications',
      'Allergies',
    ],
    urgencyLevel: 'routine',
  };
}

// Calculate factual completeness based on gathered clinical parameters
export function calculateCompleteness(data: ClinicalExtraction): CaseCompleteness {
  const checklist: CompletenessItem[] = [
    {
      key: 'chiefComplaint',
      label: 'Chief Complaint',
      completed: Boolean(data.chiefComplaint && data.chiefComplaint.trim().length > 0),
      required: true,
    },
    {
      key: 'duration',
      label: 'Duration & Onset',
      completed: Boolean(data.duration && data.duration.trim().length > 0),
      required: true,
    },
    {
      key: 'severity',
      label: 'Severity Rating',
      completed: Boolean(data.severity && data.severity.trim().length > 0),
      required: true,
    },
    {
      key: 'location',
      label: 'Location / Quality',
      completed: Boolean(data.location && data.location.trim().length > 0),
      required: true,
    },
    {
      key: 'associatedSymptoms',
      label: 'Associated Symptoms',
      completed: Boolean(data.associatedSymptoms && data.associatedSymptoms.length > 0),
      required: false,
    },
    {
      key: 'medications',
      label: 'Current Medications',
      completed: Boolean(data.medications && data.medications.length > 0),
      required: false,
    },
    {
      key: 'allergies',
      label: 'Allergies & History',
      completed: Boolean(
        (data.allergies && data.allergies.length > 0) ||
          (data.medicalHistory && data.medicalHistory.length > 0)
      ),
      required: false,
    },
  ];

  const totalPoints = 100;
  const weights: Record<string, number> = {
    chiefComplaint: 25,
    duration: 15,
    severity: 15,
    location: 15,
    associatedSymptoms: 15,
    medications: 7,
    allergies: 8,
  };

  let earnedPoints = 0;
  checklist.forEach((item) => {
    if (item.completed) {
      earnedPoints += weights[item.key] || 10;
    }
  });

  return {
    percentage: Math.min(100, Math.round(earnedPoints)),
    checklist,
  };
}

// Red flag detection keywords
export function evaluateUrgency(text: string): { isUrgent: boolean; rationale?: string } {
  const lower = text.toLowerCase();
  
  if (
    lower.includes('chest pain') ||
    lower.includes('chhati me dard') ||
    lower.includes('left arm') ||
    lower.includes('crushing pain') ||
    lower.includes('heart attack') ||
    lower.includes('heart pain')
  ) {
    return {
      isUrgent: true,
      rationale: 'Reported chest pain or radiation. Requires immediate clinical evaluation to exclude acute coronary syndrome.',
    };
  }

  if (
    lower.includes('thunderclap') ||
    lower.includes('worst headache of my life') ||
    lower.includes('sudden severe headache') ||
    (lower.includes('headache') && lower.includes('10/10'))
  ) {
    return {
      isUrgent: true,
      rationale: 'Severe acute onset headache ("thunderclap") warrants immediate neurological evaluation.',
    };
  }

  if (
    lower.includes('trouble breathing') ||
    lower.includes('cannot breathe') ||
    lower.includes('saans lene me takleef') ||
    lower.includes('shortness of breath') ||
    lower.includes('gasping')
  ) {
    return {
      isUrgent: true,
      rationale: 'Acute shortness of breath reported. Prompt respiratory evaluation recommended.',
    };
  }

  if (lower.includes('coughing blood') || lower.includes('blood in vomit') || lower.includes('black stool')) {
    return {
      isUrgent: true,
      rationale: 'Active bleeding symptoms reported. Requires urgent medical assessment.',
    };
  }

  return { isUrgent: false };
}

// Local adaptive heuristic processor for Demo Mode and offline reliability
export function processLocalConsultation(
  messages: ChatMessage[],
  patient: PatientProfile,
  prevExtraction: ClinicalExtraction
): TurnResponse {
  const lastPatientMsg = [...messages].reverse().find((m) => m.sender === 'patient');
  const userText = lastPatientMsg ? lastPatientMsg.text.trim() : '';
  const lowerText = userText.toLowerCase();

  // Clone extraction
  const updated: ClinicalExtraction = {
    ...prevExtraction,
    symptoms: [...prevExtraction.symptoms],
    associatedSymptoms: [...prevExtraction.associatedSymptoms],
    medicalHistory: [...prevExtraction.medicalHistory],
    medications: [...prevExtraction.medications],
    allergies: [...prevExtraction.allergies],
    familyHistory: [...prevExtraction.familyHistory],
    lifestyle: [...prevExtraction.lifestyle],
    missingInformation: [...prevExtraction.missingInformation],
  };

  // 1. Urgency / Red Flag Check
  const urgencyCheck = evaluateUrgency(userText);
  let isUrgentAlert = false;
  let urgentNotice: string | undefined;

  if (urgencyCheck.isUrgent) {
    updated.urgencyLevel = 'urgent';
    updated.urgencyRationale = urgencyCheck.rationale;
    isUrgentAlert = true;
    urgentNotice =
      'Some symptoms you reported may require immediate emergency medical care. Please contact emergency services (112 / 911) or visit the nearest emergency room immediately. This assistant cannot diagnose or treat emergencies.';
  }

  // 2. Multilingual & Medical Entity Extraction
  // A. Chief Complaint & Symptoms
  if (!updated.chiefComplaint) {
    if (lowerText.includes('headache') || lowerText.includes('sir dard') || lowerText.includes('sar dard') || lowerText.includes('head')) {
      updated.chiefComplaint = 'Headache (Cephalea)';
      if (!updated.symptoms.includes('Headache')) updated.symptoms.push('Headache');
    } else if (lowerText.includes('stomach') || lowerText.includes('abdomen') || lowerText.includes('pet') || lowerText.includes('belly')) {
      updated.chiefComplaint = 'Abdominal Pain';
      if (!updated.symptoms.includes('Abdominal pain')) updated.symptoms.push('Abdominal pain');
    } else if (lowerText.includes('fever') || lowerText.includes('bukhar') || lowerText.includes('temperature') || lowerText.includes('garam')) {
      updated.chiefComplaint = 'Fever (Pyrexia)';
      if (!updated.symptoms.includes('Fever')) updated.symptoms.push('Fever');
    } else if (lowerText.includes('cough') || lowerText.includes('khansi') || lowerText.includes('congestion')) {
      updated.chiefComplaint = 'Cough & Respiratory Discomfort';
      if (!updated.symptoms.includes('Cough')) updated.symptoms.push('Cough');
    } else if (lowerText.includes('back') || lowerText.includes('kamar') || lowerText.includes('spine')) {
      updated.chiefComplaint = 'Lower Back Pain (Lumbago)';
      if (!updated.symptoms.includes('Back pain')) updated.symptoms.push('Back pain');
    } else if (lowerText.includes('chest') || lowerText.includes('chhati') || lowerText.includes('heart')) {
      updated.chiefComplaint = 'Chest Pain / Discomfort';
      if (!updated.symptoms.includes('Chest discomfort')) updated.symptoms.push('Chest discomfort');
    } else if (lowerText.includes('throat') || lowerText.includes('gala') || lowerText.includes('sore throat')) {
      updated.chiefComplaint = 'Sore Throat (Pharyngitis)';
      if (!updated.symptoms.includes('Sore throat')) updated.symptoms.push('Sore throat');
    } else if (userText.length > 3) {
      // General complaint capture
      updated.chiefComplaint = userText.length > 40 ? userText.slice(0, 40) + '...' : userText;
      if (!updated.symptoms.includes(updated.chiefComplaint)) updated.symptoms.push(updated.chiefComplaint);
    }
  }

  // B. Duration & Onset
  const durationMatch = userText.match(/(\d+)\s*(days?|din|hours?|ghante|weeks?|haft|months?)/i);
  if (durationMatch) {
    const num = durationMatch[1];
    const unit = durationMatch[2].toLowerCase();
    if (unit.startsWith('d') || unit === 'din') updated.duration = `${num} days`;
    else if (unit.startsWith('h') || unit.startsWith('g')) updated.duration = `${num} hours`;
    else if (unit.startsWith('w') || unit.startsWith('h')) updated.duration = `${num} weeks`;
    else if (unit.startsWith('m')) updated.duration = `${num} months`;
  } else if (lowerText.includes('yesterday') || lowerText.includes('kal se')) {
    updated.duration = '1 day (since yesterday)';
  } else if (lowerText.includes('today') || lowerText.includes('aaj se') || lowerText.includes('subah se')) {
    updated.duration = '1 day (since this morning)';
  } else if (lowerText.includes('few days') || lowerText.includes('kuch din')) {
    updated.duration = '3-4 days';
  }

  // C. Severity
  const numMatch = userText.match(/\b([1-9]|10)\b(?:\s*\/\s*10)?/);
  if (numMatch && (lowerText.includes('pain') || lowerText.includes('scale') || lowerText.includes('/10') || !updated.severity || /^\d+$/.test(userText))) {
    updated.severity = `${numMatch[1]}/10`;
  } else if (lowerText.includes('severe') || lowerText.includes('bahut tez') || lowerText.includes('intense') || lowerText.includes('unbearable')) {
    updated.severity = 'Severe (8-9/10)';
  } else if (lowerText.includes('moderate') || lowerText.includes('beech ka') || lowerText.includes('medium')) {
    updated.severity = 'Moderate (5-6/10)';
  } else if (lowerText.includes('mild') || lowerText.includes('halka') || lowerText.includes('thoda')) {
    updated.severity = 'Mild (2-3/10)';
  }

  // D. Location & Character
  if (lowerText.includes('throbbing') || lowerText.includes('dhak dhak')) {
    updated.location = updated.location ? `${updated.location}, Throbbing quality` : 'Throbbing quality';
  } else if (lowerText.includes('sharp') || lowerText.includes('stabbing') || lowerText.includes('chubhan')) {
    updated.location = updated.location ? `${updated.location}, Sharp stabbing sensation` : 'Sharp / Stabbing';
  } else if (lowerText.includes('dull') || lowerText.includes('heavy') || lowerText.includes('bhaari')) {
    updated.location = updated.location ? `${updated.location}, Dull pressure` : 'Dull pressure / Band-like';
  } else if (lowerText.includes('lower right') || lowerText.includes('right side')) {
    updated.location = 'Lower right abdomen (RLQ)';
  } else if (lowerText.includes('lower left') || lowerText.includes('left side')) {
    updated.location = 'Lower left abdomen (LLQ)';
  } else if (lowerText.includes('upper') || lowerText.includes('epigastric')) {
    updated.location = 'Upper abdomen / Epigastric';
  } else if (lowerText.includes('forehead') || lowerText.includes('frontal') || lowerText.includes('aage')) {
    updated.location = 'Frontal / Forehead';
  } else if (lowerText.includes('temple') || lowerText.includes('sides')) {
    updated.location = 'Bilateral Temples';
  } else if (lowerText.includes('back of head') || lowerText.includes('occipital') || lowerText.includes('piche')) {
    updated.location = 'Occipital / Back of head';
  }

  // E. Associated Symptoms
  const assocCheck = [
    { terms: ['nausea', 'vomit', 'ulti', 'ghabrahat'], label: 'Mild Nausea' },
    { terms: ['light', 'photophobia', 'roshni'], label: 'Photophobia (Light sensitivity)' },
    { terms: ['sound', 'phonophobia', 'aawaz'], label: 'Phonophobia (Sound sensitivity)' },
    { terms: ['dizzy', 'dizziness', 'chhakkar'], label: 'Dizziness' },
    { terms: ['vision', 'blur', 'dhundhla'], label: 'Visual blurriness' },
    { terms: ['fever', 'chills', 'thand', 'kaamp'], label: 'Chills / Shivering' },
    { terms: ['diarrhea', 'loose motion', 'dast'], label: 'Loose stools' },
    { terms: ['fatigue', 'weakness', 'kamzori'], label: 'Generalized fatigue' },
  ];

  assocCheck.forEach(({ terms, label }) => {
    if (terms.some((t) => lowerText.includes(t)) && !updated.associatedSymptoms.includes(label)) {
      updated.associatedSymptoms.push(label);
    }
  });

  // F. Medications
  if (lowerText.includes('paracetamol') || lowerText.includes('crocin') || lowerText.includes('dolo')) {
    if (!updated.medications.includes('Paracetamol / Dolo (OTC)')) {
      updated.medications.push('Paracetamol / Dolo (OTC)');
    }
  } else if (lowerText.includes('disprin') || lowerText.includes('aspirin')) {
    if (!updated.medications.includes('Aspirin')) updated.medications.push('Aspirin');
  } else if (lowerText.includes('ibuprofen') || lowerText.includes('combiflam') || lowerText.includes('brufen')) {
    if (!updated.medications.includes('Combiflam / Ibuprofen')) updated.medications.push('Combiflam / Ibuprofen');
  } else if (lowerText.includes('metformin') || lowerText.includes('sugar tablet')) {
    if (!updated.medications.includes('Metformin')) updated.medications.push('Metformin');
  } else if (lowerText.includes('bp medicine') || lowerText.includes('amlodipine') || lowerText.includes('telmisartan')) {
    if (!updated.medications.includes('Anti-hypertensive medication')) updated.medications.push('Anti-hypertensive medication');
  } else if (lowerText.includes('no medicine') || lowerText.includes('none') || lowerText.includes('kuch nahi') || lowerText.includes('nothing taken')) {
    if (!updated.medications.includes('No current medications reported')) {
      updated.medications.push('No current medications reported');
    }
  }

  // G. Allergies
  if (lowerText.includes('no allergy') || lowerText.includes('no allergies') || lowerText.includes('kisi se nahi') || lowerText.includes('none')) {
    if (!updated.allergies.includes('NKDA (No known drug allergies)')) {
      updated.allergies.push('NKDA (No known drug allergies)');
    }
  } else if (lowerText.includes('penicillin') || lowerText.includes('sulfa') || lowerText.includes('dust') || lowerText.includes('pollen')) {
    const allergen = lowerText.includes('penicillin') ? 'Penicillin' : lowerText.includes('sulfa') ? 'Sulfa drugs' : 'Environmental / Dust';
    if (!updated.allergies.includes(allergen)) updated.allergies.push(allergen);
  }

  // H. Medical History
  if (lowerText.includes('hypertension') || lowerText.includes('bp') || lowerText.includes('blood pressure')) {
    if (!updated.medicalHistory.includes('Hypertension')) updated.medicalHistory.push('Hypertension');
  }
  if (lowerText.includes('diabetes') || lowerText.includes('sugar')) {
    if (!updated.medicalHistory.includes('Type 2 Diabetes')) updated.medicalHistory.push('Type 2 Diabetes');
  }
  if (lowerText.includes('migraine')) {
    if (!updated.medicalHistory.includes('History of Migraines')) updated.medicalHistory.push('History of Migraines');
  }
  if (lowerText.includes('asthma') || lowerText.includes('dama')) {
    if (!updated.medicalHistory.includes('Asthma')) updated.medicalHistory.push('Asthma');
  }
  if (lowerText.includes('no history') || lowerText.includes('healthy') || lowerText.includes('fit') || lowerText.includes('koi bimari nahi')) {
    if (!updated.medicalHistory.includes('No significant past medical history')) {
      updated.medicalHistory.push('No significant past medical history');
    }
  }

  // Recompute missing checklist items
  const missing: string[] = [];
  if (!updated.chiefComplaint) missing.push('Chief Complaint');
  if (!updated.duration) missing.push('Duration');
  if (!updated.severity) missing.push('Severity');
  if (!updated.location) missing.push('Location / Character');
  if (updated.associatedSymptoms.length === 0) missing.push('Associated Symptoms');
  if (updated.medications.length === 0) missing.push('Medications');
  if (updated.allergies.length === 0) missing.push('Allergies');
  updated.missingInformation = missing;

  // 3. Determine Adaptive Next Question & Quick Reply Pills
  let nextQuestion = '';
  let quickReplies: string[] = [];
  const lang = patient.language || 'English';

  if (!updated.chiefComplaint) {
    if (lang === 'Hindi') {
      nextQuestion = `नमस्ते ${patient.name} जी। मैं डॉक्टर से मिलने से पहले आपके स्वास्थ्य के बारे में जानकारी एकत्र कर रहा हूँ। कृपया बताइए कि आज आपको क्या समस्या या तकलीफ हो रही है?`;
      quickReplies = ['सिर दर्द हो रहा है', 'पेट में दर्द है', 'बुखार और कमजोरी', 'खांसी और जुकाम', 'कमर में तेज दर्द'];
    } else if (lang === 'Hinglish') {
      nextQuestion = `Hello ${patient.name}! Main doctor consultation se pehle aapki information record kar raha hoon. Please bataiye aaj aapko kya issue ho raha hai?`;
      quickReplies = ['Sir dard ho raha hai', 'Pet me dard hai', 'Fever aur weakness', 'Khansi aur cold', 'Back pain ho raha hai'];
    } else if (lang === 'Spanish') {
      nextQuestion = `Hola ${patient.name}. Estoy aquí para recopilar información antes de su consulta médica. ¿Puede decirme qué problema de salud le trajo hoy?`;
      quickReplies = ['Dolor de cabeza', 'Dolor de estómago', 'Fiebre y cansancio', 'Tos y congestión', 'Dolor de espalda'];
    } else if (lang === 'Tamil') {
      nextQuestion = `வணக்கம் ${patient.name}. மருத்துவர் சந்திப்பிற்கு முன்பாக உங்கள் உடல்நலம் பற்றிய தகவல்களை சேகரிக்கிறேன். இன்று உங்களுக்கு என்ன பிரச்சனை?`;
      quickReplies = ['தலைவலி', 'வயிற்று வலி', 'காய்ச்சல்', 'இருமல்', 'முதுகு வலி'];
    } else if (lang === 'Bengali') {
      nextQuestion = `নমস্কার ${patient.name}। ডাক্তারের সাথে দেখা করার আগে আপনার স্বাস্থ্য সম্পর্কে তথ্য সংগ্রহ করছি। আজ আপনার কী সমস্যা হচ্ছে?`;
      quickReplies = ['মাথাব্যথা', 'পেটে ব্যথা', 'জ্বর ও দুর্বলতা', 'কাশি ও সর্দি', 'পিঠে ব্যথা'];
    } else {
      nextQuestion = `Hello ${patient.name}. I'm here to collect some information before your doctor consultation. Please describe what health concern or symptoms are bothering you today.`;
      quickReplies = ['Headache for a few days', 'Stomach pain', 'Fever and body ache', 'Cough and chest congestion', 'Back pain'];
    }
  } else if (!updated.location) {
    if (updated.chiefComplaint.toLowerCase().includes('headache')) {
      if (lang === 'Hindi') {
        nextQuestion = 'दर्द किस तरह का महसूस हो रहा है और सिर के किस हिस्से में है? (जैसे धड़कता हुआ, चुभन भरा या दोनों तरफ दबाव)';
        quickReplies = ['धड़कता हुआ (Throbbing)', 'तेज चुभन (Sharp)', 'दबाव जैसा भारीपन (Dull pressure)', 'माथे के आगे (Forehead)', 'कनपटी पर (Temples)'];
      } else if (lang === 'Hinglish') {
        nextQuestion = 'Dard kis type ka feel ho raha hai aur exact kahan par hai? Jaise throbbing, sharp chubhan, ya dono taraf pressure?';
        quickReplies = ['Throbbing dhak-dhak', 'Sharp stabbing', 'Heavy pressure / band', 'Forehead ke aage', 'Sides / Temples'];
      } else {
        nextQuestion = 'I understand. How would you describe the headache, and where is it primarily located?';
        quickReplies = ['Throbbing / Pulsing', 'Heavy dull pressure', 'Sharp / Stabbing', 'Forehead & temples', 'Back of head'];
      }
    } else if (updated.chiefComplaint.toLowerCase().includes('abdom') || updated.chiefComplaint.toLowerCase().includes('pain')) {
      if (lang === 'Hindi') {
        nextQuestion = 'पेट में दर्द ठीक किस जगह पर है? क्या यह दाहिनी तरफ, बाईं तरफ या नाभि के आसपास है?';
        quickReplies = ['दाहिनी तरफ नीचे (Lower right)', 'बाईं तरफ (Left side)', 'ऊपर पेट में (Upper abdomen)', 'मरोड़ जैसा दर्द (Cramping)'];
      } else if (lang === 'Hinglish') {
        nextQuestion = 'Pet me exact kis location par dard hai? Lower right side, left side ya naabhi ke paas?';
        quickReplies = ['Lower right side', 'Left side', 'Upper stomach', 'Cramping / Marod jaisa'];
      } else {
        nextQuestion = 'Where specifically is the discomfort located, and does it feel sharp, cramping, or a constant dull ache?';
        quickReplies = ['Lower right abdomen', 'Lower left side', 'Upper abdomen / stomach', 'Cramping sensation', 'Constant dull ache'];
      }
    } else {
      if (lang === 'Hindi') {
        nextQuestion = 'यह तकलीफ किस जगह अधिक है और इसका अहसास कैसा है?';
        quickReplies = ['अचानक शुरू हुआ', 'लगातार बना हुआ है', 'हल्का दबाव', 'रुक-रुक कर होता है'];
      } else {
        nextQuestion = 'Can you describe where this is felt most and how the sensation feels?';
        quickReplies = ['Constant discomfort', 'Sharp when moving', 'Dull heavy sensation', 'Intermittent episodes'];
      }
    }
  } else if (!updated.duration) {
    if (lang === 'Hindi') {
      nextQuestion = 'यह समस्या आपको कितने दिनों या समय से हो रही है? क्या यह अचानक शुरू हुई थी या धीरे-धीरे?';
      quickReplies = ['आज सुबह से (1 day)', '2 से 3 दिनों से', 'करीब 1 हफ्ते से', '2 हफ्तों से अधिक समय से'];
    } else if (lang === 'Hinglish') {
      nextQuestion = 'Yeh problem kitne time se chal rahi hai? Sudden start hui thi ya gradually badh rahi hai?';
      quickReplies = ['Aaj subah se', '2-3 din se', '1 week se', 'Kafi hafton se'];
    } else {
      nextQuestion = 'How long have you been experiencing this, and did it start suddenly or gradually?';
      quickReplies = ['Since this morning', 'For about 2-3 days', 'About 1 week', 'Over 2 weeks'];
    }
  } else if (!updated.severity) {
    if (lang === 'Hindi') {
      nextQuestion = '1 से 10 के पैमाने पर आप इस दर्द या तकलीफ की तीव्रता (Severity) को कितना आँकेंगे? (1 = बहुत हल्का, 10 = असहनीय)';
      quickReplies = ['3/10 (हल्का - Mild)', '6/10 (मध्यम - Moderate)', '8/10 (गंभीर - Severe)', '10/10 (असहनीय - Extreme)'];
    } else if (lang === 'Hinglish') {
      nextQuestion = '1 se 10 ke scale par aap is discomfort/dard ko kitna score denge? (1 = very mild, 10 = unbearable)';
      quickReplies = ['3/10 Mild', '6/10 Moderate', '8/10 Severe', '10/10 Very Intense'];
    } else {
      nextQuestion = 'On a scale from 1 to 10, how severe would you rate this discomfort right now?';
      quickReplies = ['3/10 (Mild)', '6/10 (Moderate)', '8/10 (Severe)', '10/10 (Unbearable)'];
    }
  } else if (updated.associatedSymptoms.length === 0) {
    if (lang === 'Hindi') {
      nextQuestion = 'क्या आपको इसके साथ उल्टी, जी मिचलाना, चक्कर आना, रोशनी से परेशानी, या बुखार जैसा कोई अन्य लक्षण महसूस हुआ है?';
      quickReplies = ['जी मिचलाना (Mild nausea)', 'रोशनी से परेशानी (Light sensitivity)', 'चक्कर आना (Dizziness)', 'कोई अन्य लक्षण नहीं'];
    } else if (lang === 'Hinglish') {
      nextQuestion = 'Kya aapko iske sath nausea (ulti jaisa), dizziness (chakkar), light sensitivity, ya fever feel hua hai?';
      quickReplies = ['Mild nausea & ulti', 'Light & sound sensitivity', 'Chakkar / dizziness', 'Koi aur symptom nahi'];
    } else {
      nextQuestion = 'Have you experienced any other associated symptoms such as nausea, dizziness, vision changes, light sensitivity, or fever?';
      quickReplies = ['Mild nausea & light sensitivity', 'Dizziness / fatigue', 'Low fever / chills', 'No associated symptoms'];
    }
  } else if (updated.medications.length === 0) {
    if (lang === 'Hindi') {
      nextQuestion = 'क्या आपने इस तकलीफ के लिए कोई दवाई (जैसे पैरासिटामोल) ली है, या वर्तमान में नियमित कोई अन्य दवाई ले रहे हैं?';
      quickReplies = ['पैरासिटामोल / डोलो ली थी', 'कोई दवाई नहीं ली', 'बीपी की नियमित दवाई', 'शुगर (डायबिटीज) की दवाई'];
    } else if (lang === 'Hinglish') {
      nextQuestion = 'Kya aapne is takleef ke liye koi dawai li hai (jaise Paracetamol), ya regular koi medicine chal rahi hai?';
      quickReplies = ['Paracetamol / Dolo li thi', 'Koi medicine nahi li', 'Regular BP medicines', 'Diabetes medicine'];
    } else {
      nextQuestion = 'Have you taken any medication (such as Paracetamol or pain relievers) for this, or do you take regular prescription medicines?';
      quickReplies = ['Took Paracetamol / OTC', 'No medications taken', 'Regular BP / cardiac meds', 'Metformin / Diabetes meds'];
    }
  } else if (updated.allergies.length === 0 || updated.medicalHistory.length === 0) {
    if (lang === 'Hindi') {
      nextQuestion = 'क्या आपको किसी दवाई से एलर्जी है (जैसे पेनिसिलिन)? और क्या आपको पहले से बीपी, डायबिटीज या माइग्रेन जैसी कोई स्थिति रही है?';
      quickReplies = ['कोई ज्ञात एलर्जी नहीं (NKDA)', 'पेनिसिलिन से एलर्जी है', 'बीपी / हाइपरटेंशन है', 'पहले से कोई बीमारी नहीं'];
    } else if (lang === 'Hinglish') {
      nextQuestion = 'Kya aapko kisi medicine se allergy hai (like Penicillin)? Aur kya past me BP, diabetes ya migraine ki history hai?';
      quickReplies = ['Koi allergy nahi hai', 'Penicillin allergy', 'BP / Hypertension', 'Bilkul healthy, no history'];
    } else {
      nextQuestion = 'Do you have any known drug allergies (e.g., Penicillin), or any chronic health conditions like hypertension, diabetes, or asthma?';
      quickReplies = ['No known drug allergies (NKDA)', 'Allergic to Penicillin', 'History of Hypertension', 'No prior chronic conditions'];
    }
  } else {
    // Consultation interview complete!
    if (lang === 'Hindi') {
      nextQuestion = `धन्यवाद ${patient.name} जी। मैंने आपकी मुख्य समस्याएं और स्वास्थ्य विवरण दर्ज कर लिया है। आपका केस शीट डॉक्टर के समीक्षा के लिए तैयार है। डॉक्टर परामर्श के दौरान इन सभी विवरणों की पुष्टि करेंगे।`;
      quickReplies = ['केस शीट की समीक्षा करें (Review Case)', 'कुछ और जोड़ना है'];
    } else if (lang === 'Hinglish') {
      nextQuestion = `Thank you ${patient.name}! Aapki complete case information record ho chuki hai. Doctor review ke liye structured case sheet ready hai. Doctor consultation ke waqt sab verify karenge.`;
      quickReplies = ['Review Case Sheet', 'Add more information'];
    } else {
      nextQuestion = `Thank you ${patient.name}. I have gathered the key details of your symptoms and history. Your structured case sheet is now prepared for clinical review. The doctor will verify all details during your consultation.`;
      quickReplies = ['Review Case Sheet', 'Add additional details'];
    }
  }

  const completeness = calculateCompleteness(updated);

  return {
    aiResponse: nextQuestion,
    quickReplies,
    extractedData: updated,
    completeness,
    isUrgentAlert,
    urgentNotice,
    isAiGenerated: false,
    modelUsed: 'Health Buddy Clinical Engine (Offline Mode)',
  };
}

// Unified master coordinator: invokes Gemini if available (and demoMode is false), or seamlessly uses the local adaptive engine
export async function processConsultationTurn(params: {
  messages: ChatMessage[];
  patient: PatientProfile;
  currentExtraction: ClinicalExtraction;
  demoMode?: boolean;
}): Promise<TurnResponse> {
  const { messages, patient, currentExtraction, demoMode = false } = params;

  // If user selected Demo Mode (offline), use local engine directly
  if (demoMode) {
    return processLocalConsultation(messages, patient, currentExtraction);
  }

  // Attempt live Gemini call if in Live Gemini mode
  try {
    const geminiResult = await runGeminiConsultationTurn(messages, patient, currentExtraction);
    if (geminiResult) {
      const completeness = calculateCompleteness(geminiResult.extractedData);
      return {
        aiResponse: geminiResult.aiResponse,
        quickReplies: geminiResult.quickReplies || ['Yes', 'No', 'Not sure'],
        extractedData: geminiResult.extractedData,
        completeness,
        isUrgentAlert: geminiResult.isUrgentAlert,
        urgentNotice: geminiResult.urgentNotice,
        isAiGenerated: true,
        modelUsed: 'Google Gemini 3.5 Flash (Live API)',
      };
    }
  } catch (err) {
    console.warn('Gemini inference failed, executing local adaptive engine:', err);
  }

  // Fallback to high-fidelity local engine
  return processLocalConsultation(messages, patient, currentExtraction);
}

// Generate concise doctor-ready clinical summary
export async function generateDoctorCaseSummary(
  extraction: ClinicalExtraction,
  patient: PatientProfile,
  demoMode: boolean = false
): Promise<string> {
  // Try Gemini if not in demo mode
  if (!demoMode) {
    try {
      const geminiSummary = await runGeminiCaseSummary(extraction, patient);
      if (geminiSummary && geminiSummary.trim().length > 20) {
        return geminiSummary.trim();
      }
    } catch (err) {
      console.warn('Gemini summary failed, generating local summary:', err);
    }
  }

  // Factual, non-hallucinatory local clinical summary
  const parts: string[] = [];
  const chief = extraction.chiefComplaint || 'health concerns';
  const dur = extraction.duration ? ` for ${extraction.duration}` : '';
  const sev = extraction.severity ? ` rated ${extraction.severity}` : '';
  const loc = extraction.location ? ` localized to ${extraction.location}` : '';

  parts.push(
    `Patient ${patient.name} (${patient.age} y/o ${patient.gender.toLowerCase()}) presents with a history of ${chief}${dur}${sev}${loc}.`
  );

  if (extraction.associatedSymptoms && extraction.associatedSymptoms.length > 0) {
    parts.push(`Associated symptoms noted: ${extraction.associatedSymptoms.join(', ')}.`);
  } else {
    parts.push('No associated systemic symptoms reported during pre-consultation.');
  }

  if (extraction.medications && extraction.medications.length > 0) {
    parts.push(`Medications reported: ${extraction.medications.join(', ')}.`);
  } else {
    parts.push('No current or OTC medications were reported.');
  }

  if (extraction.allergies && extraction.allergies.length > 0) {
    parts.push(`Allergies: ${extraction.allergies.join(', ')}.`);
  } else {
    parts.push('Allergy history was not specified or negative.');
  }

  if (extraction.medicalHistory && extraction.medicalHistory.length > 0) {
    parts.push(`Relevant past history: ${extraction.medicalHistory.join(', ')}.`);
  }

  if (extraction.urgencyLevel === 'urgent') {
    parts.push(
      `[TRIAGE PRIORITY: Elevated clinical priority noted due to reported symptoms (${extraction.urgencyRationale || 'potential red flag'}).]`
    );
  }

  return parts.join(' ');
}
