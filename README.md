# HealthBuddy-AI 🩺⚡
### AI-Based Healthcare Accessibility — AI-Powered Pre-Consultation Assistant
> **Hackathon Round 2 Prototype** | *Your story before the doctor visit.*

---

## 🌟 Executive Summary

**Dark-Rai HealthAI** is an AI-powered clinical pre-consultation intake assistant that engages with a patient **before** they see a doctor. It translates natural conversational symptom descriptions (in English, Hindi, or Hinglish) into an organized, structured clinical case sheet and generates a doctor-ready summary. 

### 🛡️ Core Product Principle: Human-in-the-Loop
This is a **clinical workflow assistance prototype**, **NOT** an autonomous diagnosis system.
- The AI **never** claims "You have disease X" or "Take this medication".
- The AI collects, structures, and highlights important and missing medical parameters.
- The doctor retains **100% final clinical authority** to review, edit, and digitally verify the case sheet.

---

## 🚀 The Core Workflow

```
Patient (Voice / Text)
       ↓
Empathetic AI Conversation
       ↓
Intelligent Adaptive Questioning (One at a time)
       ↓
Live Clinical Information Extraction (Zero Hallucination)
       ↓
Structured Case Sheet (Completeness Scoring & Triage)
       ↓
AI Clinical Summary (Factual, Non-Diagnostic)
       ↓
Doctor Review Console (Inline Edit, Notes, & Digital Verification)
```

---

## ✨ Key Differentiators

1. **Adaptive Questioning Engine**: Does not use a rigid questionnaire. Follow-ups change dynamically depending on the patient's chief complaint, location, duration, and severity.
2. **Conversation → Structured Case Sheet**: Natural narratives (e.g., *"Mujhe 3 din se sir me bahut tez throbbing dard hai"*) are translated into clinical terms (Headache, Throbbing, 3 days) without manual transcription.
3. **Pre-Consultation Intelligence**: Saves 6–8 minutes per patient visit by arming the physician with pre-structured history and missing-information alerts before the physical exam begins.
4. **Strict Human-in-the-Loop Authority**: Doctors can modify any field, add clinical exam notes, and sign off with a verifiable digital timestamp.
5. **Multilingual & Speech Accessible**: Native support for **English**, **Hindi**, and **Hinglish**, paired with browser speech-to-text with graceful text fallback.
6. **Dual-Mode AI Architecture**: Seamlessly uses **Google Gemini 3.8 Flash** via `@google/genai` when an API key is available, and an intelligent offline **Adaptive Clinical Engine** in Demo Mode with zero downtime.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS + Custom Medical Dark Theme + Glassmorphism
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti
- **Voice / Speech**: Browser Web Speech API with fallback
- **AI Backend**: `@google/genai` (Google Gemini 3.8 Flash) + Server-side modular intake heuristics
- **Data Architecture**: In-memory + Client storage sync with REST API endpoints

---

## 📂 Project Structure

```
dark-rai-healthai/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Landing page with hero & workflow
│   │   ├── patient/
│   │   │   ├── page.tsx                 # Patient onboarding profile
│   │   │   ├── consent/page.tsx         # Mandatory clinical consent screen
│   │   │   ├── consultation/page.tsx    # Live AI interview & case sheet
│   │   │   ├── review/page.tsx          # Review & edit extracted case
│   │   │   └── success/page.tsx         # Submission success & summary
│   │   ├── doctor/
│   │   │   ├── page.tsx                 # Doctor dashboard & triage metrics
│   │   │   └── cases/
│   │   │       ├── page.tsx             # Case registry list with filters
│   │   │       └── [id]/page.tsx        # Doctor case review, edit & verify
│   │   ├── login/page.tsx               # 1-Click demo role switcher
│   │   ├── settings/page.tsx            # Engine mode, voice, and specialty
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   │   ├── chat/route.ts        # Adaptive chat & extraction API
│   │   │   │   └── summary/route.ts     # Factual summary generator
│   │   │   └── cases/
│   │   │       ├── route.ts             # Case listing & submission
│   │   │       └── [id]/route.ts        # Case retrieval & doctor verification
│   │   ├── globals.css                  # Medical dark theme styling
│   │   └── layout.tsx                   # App shell & metadata
│   ├── components/
│   │   ├── Navbar.tsx                   # Brand header & role switcher
│   │   ├── Footer.tsx                   # Clinical disclaimers & footer
│   │   ├── PatientHeader.tsx            # 5-step progress indicator
│   │   ├── ChatWindow.tsx               # Adaptive chat with quick-replies
│   │   ├── VoiceInput.tsx               # Microphone STT with animation
│   │   ├── CaseInformationPanel.tsx     # Real-time extracted case sheet
│   │   ├── CaseTable.tsx                # Filterable patient case table
│   │   ├── DoctorSidebar.tsx            # Physician console navigation
│   │   ├── StatusBadge.tsx              # Pending / In Review / Verified
│   │   ├── TriageBadge.tsx              # Routine / Priority / Urgent
│   │   └── Toast.tsx                    # Notifications
│   └── lib/
│       ├── types.ts                     # TypeScript clinical data models
│       ├── storage.ts                   # Unified state persistence
│       ├── speech.ts                    # Web Speech API wrapper
│       └── ai/
│           ├── gemini.ts                # Gemini 3.8 Flash SDK integration
│           ├── adaptiveEngine.ts        # Multilingual NLP & adaptive intake
│           └── caseStore.ts             # Preloaded demo cases & repository
├── .env.example
├── package.json
└── README.md
```

---

## ⚡ Quick Start & Installation

### 1. Clone & Enter Project
```bash
cd "C:\Users\AKASH SINGH\.gemini\antigravity\scratch\dark-rai-healthai"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
> **Note**: An API key is **optional**. The prototype includes a full offline **Demo Mode / Adaptive Clinical Engine** so it is guaranteed to work even in network-constrained hackathon venues.

To use Google Gemini 3.8 Flash for live generation, set your key:
```env
GEMINI_API_KEY=AIzaSy...
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎬 Hackathon Demo Scenario Walkthrough

Follow this exact flow during your Round 2 presentation:

1. **Landing Page (`/`)**:
   - Showcase the problem, the 5-step pipeline, and the clinical safety disclaimer.
   - Click **"Start Consultation"**.
2. **Patient Profile (`/patient`)**:
   - Use the prefilled demo profile: **Akash Singh, 20, Male, English** (or click *"Demo Profile"*).
   - Click **"Continue to Clinical Consent"**.
3. **Clinical Consent (`/patient/consent`)**:
   - Explain the mandatory non-diagnostic disclaimer and check the consent box.
   - Click **"Start AI Consultation"**.
4. **The Live AI Consultation (`/patient/consultation`)**:
   - AI greets Akash: *"Hello Akash... Please describe what is bothering you today."*
   - Patient speaks or types: *"I have been having headaches for 3 days."*
   - **Show the judges**: The right-hand panel immediately updates with **Chief Complaint: Headache** and **Duration: 3 days**!
   - Click the suggested quick reply: **"Throbbing / Pulsing"**.
   - AI asks for severity on 1–10 scale: select **"6/10 (Moderate)"**.
   - AI asks about associated symptoms: select **"Mild nausea & light sensitivity"**.
   - AI asks about medication / allergies: select **"Took Paracetamol"**.
   - Notice the **Case Completeness** meter climb to **82%+**.
   - Click **"Review & Finalize Case"**.
5. **Review Screen (`/patient/review`)**:
   - Demonstrate the inline edit capability for the patient.
   - Click **"Submit for Doctor Review"**.
6. **Submission Success (`/patient/success`)**:
   - Displays the **AI-Generated Case Summary** with Consultation ID `DR-2048`.
   - Click the highlight CTA: **"Step into Doctor Dashboard (Review Case)"**.
7. **Doctor Case Detail (`/doctor/cases/DR-2048`)**:
   - Show how the newly submitted case appears on the doctor's screen.
   - Click **"Edit"** on a section to demonstrate clinical correction.
   - Add physician notes: *"Neurological examination normal. Prescribed hydration and rest."*
   - Click **"Verify Case"**.
   - The badge transitions immediately to **"✓ Doctor Verified"** with an official timestamp!

---

## 🔒 Safety, Ethics & Triage

- **Red-Flag Detection**: Queries containing emergency keywords (e.g. *severe chest pain radiating to left arm*, *thunderclap headache*, *acute breathlessness*) immediately trigger a **Clinical Triage Notice** recommending immediate emergency medical services.
- **Zero Fabrication**: The system only records fields explicitly affirmed by the patient. Any unaddressed parameter is marked as *"Pending"* or *"Unknown"* and highlighted in the doctor's Missing Information box.
- **Audit-Ready Transcripts**: Physicians can toggle the *"Conversation Transcript"* tab to read verbatim patient-AI interactions side-by-side with the structured case sheet.

---

## 🏆 Presentation Highlights for Hackathon Judges

| Challenge in Healthcare | Dark-Rai HealthAI Solution |
| :--- | :--- |
| **High Physician Burnout** | Automates repetitive clinical history taking before the consultation begins. |
| **Incomplete Patient Narrative** | Adaptive questioning systematically captures missing duration, severity, and meds. |
| **Language Barriers** | Natural intake in English, Hindi, and Hinglish with voice-to-text. |
| **Hallucination Risk in AI** | Structured extraction schema with zero autonomous diagnosis and mandatory physician verification. |
