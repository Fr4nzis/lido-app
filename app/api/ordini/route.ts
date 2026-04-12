import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

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

    const totaleCalcolato = Math.round(
      prodotti.reduce((sum: number, p: any) => sum + p.prezzo_unitario * p.qty, 0) * 100
    ) / 100;

    if (Math.abs(totaleCalcolato - totale) > 0.01) {
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
      return NextResponse.json({ error: 'Errore database' }, { status: 500 });
    }

    return NextResponse.json({ ordine_id: ordine.id }, { status: 201 });

  } catch (err) {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}