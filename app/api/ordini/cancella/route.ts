import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    // Cancella ordini in preparazione creati negli ultimi 15 minuti
    // che non hanno ancora un stripe_session_id confermato
    const quindiciMinutiFA = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    await supabase
      .from('ordini')
      .update({ stato: 'annullato' })
      .eq('stato', 'in_preparazione')
      .is('stripe_session_id', null)
      .gte('created_at', quindiciMinutiFA);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Errore' }, { status: 500 });
  }
}