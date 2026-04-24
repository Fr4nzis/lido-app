import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get('data');
  const fascia = searchParams.get('fascia') || 'giornata';

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

  // Considera occupato se c'è sovrapposizione di fascia oraria
  // mattina + giornata = occupato mattina
  // pomeriggio + giornata = occupato pomeriggio
  // giornata = occupato tutto
  let fasceSovrapposte: string[] = [];
  if (fascia === 'mattina') {
    fasceSovrapposte = ['mattina', 'giornata'];
  } else if (fascia === 'pomeriggio') {
    fasceSovrapposte = ['pomeriggio', 'giornata'];
  } else {
    fasceSovrapposte = ['mattina', 'pomeriggio', 'giornata'];
  }

  const { data: prenotazioni, error: errPrenotazioni } = await supabase
    .from('prenotazioni')
    .select('ombrellone_id, stato, blocco_scade_il, fascia')
    .eq('data', data)
    .in('stato', ['prenotato', 'bloccato'])
    .in('fascia', fasceSovrapposte);

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
    // Prezzo in base alla fascia
    prezzo: fascia === 'mattina'
      ? o.prezzo_mattina
      : fascia === 'pomeriggio'
      ? o.prezzo_pomeriggio
      : o.prezzo_giornata,
  }));

  return NextResponse.json({ ombrelloni: ombrelloniConStato });
}