import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';
// Correção: Subindo 2 níveis (checkout -> api -> app) para achar constants
import { MP_ACCESS_TOKEN, VIP_SUPPORT_PRICES, UPSALE_PRICE } from '../../constants';
import { PlanType } from '../../types';

// Configura o cliente do Mercado Pago com sua credencial
const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, title, price, includeHosting, includeSupport, email } = body;

    // Constrói a lista de itens para o checkout
    const items = [];

    // 1. Item Principal: O Site
    items.push({
        id: planId,
        title: title,
        quantity: 1,
        unit_price: Number(price),
        currency_id: 'BRL',
    });

    // 2. Opcional: Hospedagem + Domínio
    if (includeHosting) {
        items.push({
            id: 'hosting-setup',
            title: 'Hospedagem Premium + Domínio (.com.br) - 1 Ano',
            quantity: 1,
            // CORREÇÃO: Usando a constante importada em vez do valor fixo 120
            unit_price: UPSALE_PRICE, 
            currency_id: 'BRL',
        });
    }

    // 3. Opcional: Suporte VIP
    if (includeSupport) {
        // Busca o preço correto baseado no tipo de plano
        const supportPrice = VIP_SUPPORT_PRICES[planId as PlanType] || 250; 
        items.push({
            id: 'vip-support',
            title: 'Suporte VIP Ilimitado Premium',
            quantity: 1,
            unit_price: supportPrice,
            currency_id: 'BRL',
        });
    }

    // Define a URL base (Localhost ou Produção)
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

    // Cria a preferência de pagamento no Mercado Pago
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: items, // Envia a lista detalhada
        payer: {
          email: email, 
        },
        payment_methods: {
            excluded_payment_types: [],
            excluded_payment_methods: [],
            installments: 12
        },
        // Nome na fatura do cartão
        statement_descriptor: 'WEBNOVA SAAS',
        
        back_urls: {
          success: `${baseUrl}/?status=success`,
          failure: `${baseUrl}/?status=failure`,
          pending: `${baseUrl}/?status=pending`,
        },
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        metadata: {
          plan_id: planId,
          include_hosting: includeHosting ? 'true' : 'false',
          include_support: includeSupport ? 'true' : 'false'
        }
      },
    });

    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error('------- ERRO MERCADO PAGO -------');
    console.error(error);
    if (error.cause) console.error('Causa:', JSON.stringify(error.cause, null, 2));
    console.error('---------------------------------');
    
    return NextResponse.json(
      { error: 'Erro ao processar pagamento no servidor' }, 
      { status: 500 }
    );
  }
}