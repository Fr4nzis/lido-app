import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const COSTO_CONSEGNA_LETTINO = 0.50;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lettino, nome_cliente, prodotti, totale, modalita, note } = body;

    if (!lettino || typeof lettino !== 'string') {
      return NextResponse.json({ error: 'Numero lettino obbligatorio' }, { status: 400 });
    }

    if (!prodotti || !Array.isArray(prodotti) || prodotti.length === 0) {
      return NextResponse.json({ error: 'Nessun prodotto' }, { status: 400 });
    }

    // Ricalcola totale lato server
    const subtotale = prodotti.reduce(
      (sum: number, p: any) => sum + p.prezzo_unitario * p.qty, 0
    );
    const costoConsegna = modalita === 'lettino' ? COSTO_CONSEGNA_LETTINO : 0;
    const totaleCalcolato = Math.round((subtotale + costoConsegna) * 100) / 100;

    // Tolleranza 2 centesimi per floating point
    if (Math.abs(totaleCalcolato - totale) > 0.02) {
      console.error('Totale mismatch:', { totaleCalcolato, totaleRicevuto: totale });
      return NextResponse.json({ error: 'Totale non corrispondente' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: ordine, error } = await supabase
      .from('ordini')
      .insert({
        lettino: lettino.toUpperCase(),
        nome_cliente: nome_cliente || null,
        prodotti,
        totale: totaleCalcolato,
        modalita: modalita || 'lettino',
        stato: 'in_attesa',
        note: note || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Errore database' }, { status: 500 });
    }

    return NextResponse.json({ ordine_id: ordine.id }, { status: 201 });

  } catch (err) {
    console.error('Errore API ordini:', err);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}