import { NextResponse } from 'next/server';
import { testGeminiConnection } from '@/lib/ai/gemini';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await testGeminiConnection();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        model: 'gemini-3.5-flash-lite',
        message: error?.message || 'Error occurred while testing Gemini connection',
        latencyMs: 0,
      },
      { status: 500 }
    );
  }
}
