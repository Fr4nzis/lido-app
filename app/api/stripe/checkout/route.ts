import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tipo, riferimento_id, items, modalita } = body;

    if (!tipo || !riferimento_id || !items?.length) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.nome,
        },
        unit_amount: Math.round(item.prezzo * 100),
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      locale: 'it',
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&tipo=${tipo}&modalita=${modalita ?? 'lettino'}`,
      cancel_url: tipo === 'ordine'
        ? `${appUrl}/cart?cancelled=true`
        : `${appUrl}/prenota`,
      metadata: {
        tipo,
        riferimento_id,
      },
    });

    const supabase = getSupabaseAdmin();
    const tableName = tipo === 'ordine' ? 'ordini' : 'prenotazioni';

    await supabase
      .from(tableName)
      .update({ stripe_session_id: session.id })
      .eq('id', riferimento_id);

    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error('Stripe error:', err);
    return NextResponse.json({ error: 'Errore Stripe' }, { status: 500 });
  }
}