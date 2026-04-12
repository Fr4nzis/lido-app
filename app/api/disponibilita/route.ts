import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get('data');

  if (!data) {
    return NextResponse.json({ error: 'Parametro data obbligatorio' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: tuttiOmbrelloni, error: errOmbrelloni } = await supabase
    .from('ombrelloni')
    .select('*')
    .eq('attivo', true)
    .order('codice');

  if (errOmbrelloni) {
    return NextResponse.json({ error: 'Errore DB ombrelloni' }, { status: 500 });
  }

  const now = new Date().toISOString();

  const { data: prenotazioni, error: errPrenotazioni } = await supabase
    .from('prenotazioni')
    .select('ombrellone_id, stato, blocco_scade_il')
    .eq('data', data)
    .in('stato', ['prenotato', 'bloccato']);

  if (errPrenotazioni) {
    return NextResponse.json({ error: 'Errore DB prenotazioni' }, { status: 500 });
  }

  const statiMap = new Map<string, string>();

  for (const p of prenotazioni) {
    if (p.stato === 'prenotato') {
      statiMap.set(p.ombrellone_id, 'occupato');
    } else if (p.stato === 'bloccato') {
      const scaduto = p.blocco_scade_il && new Date(p.blocco_scade_il) < new Date(now);
      if (!scaduto) {
        statiMap.set(p.ombrellone_id, 'bloccato');
      }
    }
  }

  const ombrelloniConStato = tuttiOmbrelloni.map((o) => ({
    ...o,
    stato: statiMap.get(o.id) ?? 'disponibile',
  }));

  return NextResponse.json({ ombrelloni: ombrelloniConStato });
}