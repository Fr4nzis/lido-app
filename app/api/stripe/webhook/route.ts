import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { tipo, riferimento_id } = session.metadata || {};

    if (!tipo || !riferimento_id) {
      return NextResponse.json({ error: 'Metadata mancanti' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (tipo === 'ordine') {
      await supabase
        .from('ordini')
        .update({ stato: 'in_preparazione' })
        .eq('id', riferimento_id)
        .eq('stato', 'in_attesa');
    } else if (tipo === 'prenotazione') {
      await supabase
        .from('prenotazioni')
        .update({ stato: 'prenotato', blocco_scade_il: null })
        .eq('id', riferimento_id)
        .eq('stato', 'bloccato');
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { tipo, riferimento_id } = session.metadata || {};

    if (tipo && riferimento_id) {
      const supabase = getSupabaseAdmin();
      const table = tipo === 'ordine' ? 'ordini' : 'prenotazioni';
      const statoAnnullato = tipo === 'ordine' ? 'annullato' : 'cancellato';

      await supabase
        .from(table)
        .update({ stato: statoAnnullato })
        .eq('id', riferimento_id)
        .in('stato', ['in_attesa', 'bloccato']);
    }
  }

  return NextResponse.json({ received: true });
}