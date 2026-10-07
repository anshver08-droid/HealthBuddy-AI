import { NextRequest, NextResponse } from 'next/server';
import { getAllCases, getDoctorStats, saveCase } from '@/lib/ai/caseStore';
import { ConsultationCase } from '@/lib/types';

export async function GET() {
  try {
    const cases = getAllCases();
    const stats = getDoctorStats();
    return NextResponse.json({ cases, stats });
  } catch (error) {
    console.error('Error in GET /api/cases:', error);
    return NextResponse.json({ error: 'Failed to retrieve cases' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ConsultationCase = await req.json();
    if (!body || !body.id) {
      return NextResponse.json({ error: 'Invalid case payload' }, { status: 400 });
    }

    const saved = saveCase(body);
    return NextResponse.json({ success: true, case: saved });
  } catch (error) {
    console.error('Error in POST /api/cases:', error);
    return NextResponse.json({ error: 'Failed to save case' }, { status: 500 });
  }
}
