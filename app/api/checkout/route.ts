import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';
// Importa constantes e tipos subindo os níveis de pasta corretos
import { MP_ACCESS_TOKEN, PLANS, VIP_SUPPORT_MULTIPLIER, UPSALE_PRICE } from '../../constants';
import { PlanType } from '../../types';

// Configura o cliente do Mercado Pago com sua credencial
const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

export async function POST(request: Request) {
  try {
    // Validação básica da chave
    if (!MP_ACCESS_TOKEN || MP_ACCESS_TOKEN.includes('COLE_SEU_TOKEN')) {
        throw new Error("Access Token do Mercado Pago não configurado corretamente.");
    }

    const body = await request.json();
    const { 
      isAddon, // Flag para identificar compra avulsa (dentro do dashboard)
      addonTitle, 
      addonPrice,
      addonId,
      planId, 
      title, 
      price, 
      includeHosting, 
      includeSupport, 
      email,
      years,
      calls,
      domainName 
    } = body;

    // Constrói a lista de itens para o checkout
    const items = [];

    if (isAddon) {
        // --- FLUXO DE COMPRA AVULSA (DASHBOARD) ---
        items.push({
            id: addonId || 'addon-service',
            title: addonTitle,
            quantity: 1,
            unit_price: Number(addonPrice),
            currency_id: 'BRL',
        });
    } else {
        // --- FLUXO DE COMPRA PADRÃO (LANDING PAGE) ---
        
        // 1. Item Principal: O Site
        if (planId) {
            items.push({
                id: planId,
                title: title,
                quantity: 1,
                unit_price: Number(price),
                currency_id: 'BRL',
            });
        }

        // 2. Opcional: Hospedagem + Domínio
        if (includeHosting) {
            items.push({
                id: 'hosting-setup',
                title: 'Hospedagem Premium + Domínio (.com.br) - 1 Ano',
                quantity: 1,
                unit_price: UPSALE_PRICE, 
                currency_id: 'BRL',
            });
        }

        // 3. Opcional: Suporte VIP
        if (includeSupport) {
            const plan = PLANS.find(p => p.id === planId);
            const supportPrice = plan ? (plan.price * VIP_SUPPORT_MULTIPLIER) : 250;
            
            items.push({
                id: 'vip-support',
                title: 'Suporte VIP Ilimitado Premium',
                quantity: 1,
                unit_price: supportPrice,
                currency_id: 'BRL',
            });
        }
    }

    // Define a URL base (Localhost ou Produção)
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

    // Configuração base da preferência
    const preferenceData = {
      body: {
        items: items, 
        payer: {
          email: email, 
        },
        // CONFIGURAÇÃO DE MÉTODOS DE PAGAMENTO
        // Listas vazias para forçar aceitação de tudo (PIX, Boleto, Cartão)
        payment_methods: {
            excluded_payment_types: [],
            excluded_payment_methods: [],
            installments: 12
        },
        statement_descriptor: 'WEBNOVA SAAS',
        
        back_urls: {
          success: `${baseUrl}/?status=success`,
          failure: `${baseUrl}/?status=failure`,
          pending: `${baseUrl}/?status=pending`,
        },
        auto_return: undefined,
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        
        metadata: {
          is_addon: isAddon ? 'true' : 'false',
          addon_id: addonId,
          plan_id: planId,

          // Campos Adicionados:
          addon_title: addonTitle, // Usado para nome do Plano de Tráfego Pago
          years: years, // Usado para calcular a expiração de Domínio/Hospedagem
          calls: calls, // Usado para somar os Tickets de Suporte
          domain_name: domainName, // Usado para registrar o nome do domínio
          payer_email: email, // Boa prática de redundância

          // Campos Originais (Mantidos por compatibilidade):
          include_hosting: includeHosting ? 'true' : 'false',
          include_support: includeSupport ? 'true' : 'false'
          }
      },
    };

    const preference = new Preference(client);
    let result;

    try {
        result = await preference.create(preferenceData);
    } catch (prefError) {
        console.warn("Tentando fallback sem payment_methods...", prefError);
        delete (preferenceData.body as any).payment_methods;
        result = await preference.create(preferenceData);
    }

    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error('------- ERRO MERCADO PAGO -------');
    console.error(error);
    const errorDetails = error.cause ? JSON.stringify(error.cause) : error.message;
    return NextResponse.json(
      { 
        error: 'Erro ao processar pagamento',
        details: errorDetails || 'Erro desconhecido no servidor'
      }, 
      { status: 500 }
    );
  }
}