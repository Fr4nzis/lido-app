import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const BLOCCO_DURATA_MINUTI = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ombrellone_id, data, nome_cliente, email_cliente } = body;

    if (!ombrellone_id || !data) {
      return NextResponse.json(
        { message: 'ombrellone_id e data sono obbligatori' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const now = new Date();

    const { data: esistenti, error: errCheck } = await supabase
      .from('prenotazioni')
      .select('id, stato, blocco_scade_il')
      .eq('ombrellone_id', ombrellone_id)
      .eq('data', data)
      .in('stato', ['prenotato', 'bloccato']);

    if (errCheck) {
      return NextResponse.json({ message: 'Errore database' }, { status: 500 });
    }

    const conflitto = esistenti?.some((p) => {
      if (p.stato === 'prenotato') return true;
      if (p.stato === 'bloccato') {
        const scaduto = p.blocco_scade_il && new Date(p.blocco_scade_il) < now;
        return !scaduto;
      }
      return false;
    });

    if (conflitto) {
      return NextResponse.json(
        { message: 'Ombrellone non disponibile per questa data' },
        { status: 409 }
      );
    }

    await supabase
      .from('prenotazioni')
      .update({ stato: 'cancellato' })
      .eq('ombrellone_id', ombrellone_id)
      .eq('data', data)
      .eq('stato', 'bloccato')
      .lt('blocco_scade_il', now.toISOString());

    const { data: ombrellone } = await supabase
      .from('ombrelloni')
      .select('prezzo')
      .eq('id', ombrellone_id)
      .single();

    const scadenzaBlocco = new Date(now.getTime() + BLOCCO_DURATA_MINUTI * 60 * 1000);

    const { data: prenotazione, error: errInsert } = await supabase
      .from('prenotazioni')
      .insert({
        ombrellone_id,
        data,
        nome_cliente: nome_cliente || null,
        email_cliente: email_cliente || null,
        stato: 'bloccato',
        blocco_scade_il: scadenzaBlocco.toISOString(),
        totale: ombrellone?.prezzo ?? 0,
      })
      .select('id')
      .single();

    if (errInsert) {
      return NextResponse.json(
        { message: 'Errore durante la prenotazione' },
        { status: 500 }
      );
    }

    return NextResponse.json({ prenotazione_id: prenotazione.id }, { status: 201 });

  } catch (err) {
    return NextResponse.json({ message: 'Errore interno' }, { status: 500 });
  }
}