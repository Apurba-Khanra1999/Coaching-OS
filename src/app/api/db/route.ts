import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json();
    if (!key || value === undefined) {
      return NextResponse.json({ success: false, error: "Missing 'key' or 'value' in request body" }, { status: 400 });
    }

    const valueJson = JSON.stringify(value);
    await sql`
      INSERT INTO app_state (key, value)
      VALUES (${key}, ${valueJson}::jsonb)
      ON CONFLICT (key) DO UPDATE SET value = ${valueJson}::jsonb;
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API POST /api/db failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
