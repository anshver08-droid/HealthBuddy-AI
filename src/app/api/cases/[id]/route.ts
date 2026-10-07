import { NextRequest, NextResponse } from 'next/server';
import { getCaseById, updateCase, verifyCase } from '@/lib/ai/caseStore';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const caseData = getCaseById(id);
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }
    return NextResponse.json({ case: caseData });
  } catch (error) {
    console.error('Error in GET /api/cases/[id]:', error);
    return NextResponse.json({ error: 'Failed to retrieve case' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    if (body.action === 'verify') {
      const verified = verifyCase(
        id,
        body.doctorName || 'Dr. Arvind Sharma, MD',
        body.doctorNotes
      );
      if (!verified) {
        return NextResponse.json({ error: 'Case not found to verify' }, { status: 404 });
      }
      return NextResponse.json({ success: true, case: verified });
    }

    const updated = updateCase(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Case not found to update' }, { status: 404 });
    }

    return NextResponse.json({ success: true, case: updated });
  } catch (error) {
    console.error('Error in PATCH /api/cases/[id]:', error);
    return NextResponse.json({ error: 'Failed to update case' }, { status: 500 });
  }
}
