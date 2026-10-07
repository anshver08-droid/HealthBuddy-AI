import { NextRequest, NextResponse } from 'next/server';
import { generateDoctorCaseSummary } from '@/lib/ai/adaptiveEngine';
import { ClinicalExtraction, PatientProfile } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const extraction: ClinicalExtraction = body.extraction;
    const patient: PatientProfile = body.patient;
    const demoMode: boolean = typeof body.demoMode === 'boolean' ? body.demoMode : false;

    if (!extraction || !patient) {
      return NextResponse.json(
        { error: 'Missing clinical extraction or patient data' },
        { status: 400 }
      );
    }

    const summary = await generateDoctorCaseSummary(extraction, patient, demoMode);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error in /api/ai/summary:', error);
    return NextResponse.json(
      {
        summary:
          'Patient presented for pre-consultation intake. Key clinical symptoms recorded and submitted for attending physician review.',
      },
      { status: 200 }
    );
  }
}
