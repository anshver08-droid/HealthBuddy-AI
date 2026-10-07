import { NextRequest, NextResponse } from 'next/server';
import { processConsultationTurn, createInitialExtraction } from '@/lib/ai/adaptiveEngine';
import { ChatMessage, PatientProfile, ClinicalExtraction } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];
    const patient: PatientProfile = body.patient || {
      name: 'Guest Patient',
      age: 25,
      gender: 'Other',
      language: 'English',
      consentGiven: true,
    };
    const currentExtraction: ClinicalExtraction =
      body.currentExtraction || createInitialExtraction();
    const demoMode: boolean = typeof body.demoMode === 'boolean' ? body.demoMode : false;

    const result = await processConsultationTurn({
      messages,
      patient,
      currentExtraction,
      demoMode,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/ai/chat:', error);
    return NextResponse.json(
      {
        error: 'Failed to process consultation turn',
        message: 'Something went wrong while processing your response. Your previous information has been saved. Please try again.',
      },
      { status: 500 }
    );
  }
}
