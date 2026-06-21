import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await sql`SELECT key, value FROM app_state`;
    const data: Record<string, any> = {};
    for (const row of rows) {
      data[row.key] = row.value;
    }
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("API GET /api/db/all failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
