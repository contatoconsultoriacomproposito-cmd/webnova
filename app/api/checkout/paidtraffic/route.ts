// app/api/checkout/paidtraffic/route.ts

import { MercadoPagoConfig, PreApproval } from 'mercadopago'; // Note o PreApproval
import { NextResponse } from 'next/server';
import { MP_ACCESS_TOKEN } from '../../../constants'; // Ajuste o caminho conforme sua estrutura

const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, price, email, reason } = body;

    // A API de Assinaturas (PreApproval) tem campos diferentes da Preference
    const preApproval = new PreApproval(client);

    const result = await preApproval.create({
      body: {
        reason: title, // Ex: "Assinatura Tráfego Pago - Nível 2"
        external_reference: `ADS-${Date.now()}`, // Referência interna
        payer_email: email,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months', // Cobrança Mensal
          transaction_amount: Number(price),
          currency_id: 'BRL',
        },
        back_url: (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000') + '/app', // Retorno após assinar
        status: 'pending',
      },
    });

    // O link de pagamento para assinatura fica em "init_point"
    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error('------- ERRO ASSINATURA MP -------');
    console.error(error);
    return NextResponse.json(
      { error: 'Erro ao criar assinatura' },
      { status: 500 }
    );
  }
}