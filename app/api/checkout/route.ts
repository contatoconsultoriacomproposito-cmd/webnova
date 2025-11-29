import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';
import { 
  MP_ACCESS_TOKEN, 
  PLANS, 
  SUPPORT_PACKAGES, // Adicionado
  ADS_OFFER_PRICE, // Adicionado
  OFFER_HOSTING_YEARS, // Adicionado
  OFFER_DOMAIN_YEARS, // Adicionado
  OFFER_SUPPORT_CALLS, // Adicionado
  OFFER_ADS_CAMPAIGNS, // Adicionado
  VIP_SUPPORT_MULTIPLIER, 
  UPSALE_PRICE 
} from '../../constants';
import { PlanType } from '../../types';

const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

export async function POST(request: Request) {
  try {
    if (!MP_ACCESS_TOKEN || MP_ACCESS_TOKEN.includes('COLE_SEU_TOKEN')) {
        throw new Error("Access Token do Mercado Pago não configurado corretamente.");
    }

    const body = await request.json();
    const { 
      isAddon, 
      addonTitle, 
      addonPrice,
      addonId,
      planId, 
      title, 
      price, 
      // REMOVEMOS: includeHosting e includeSupport 
      years, // Para uso no Addon
      calls, // Para uso no Addon
      domainName, // Para uso no Addon
      email 
    } = body;

    const items = [];

    if (isAddon) {
        // --- FLUXO DE COMPRA AVULSA (DASHBOARD) ---
        // O Webhook usará years e calls do metadata.
        items.push({
            id: addonId || 'addon-service',
            title: addonTitle,
            quantity: 1,
            unit_price: Number(addonPrice),
            currency_id: 'BRL',
        });
    } else {
        // --- FLUXO DE PRIMEIRA COMPRA (LANDING PAGE) ---
        
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

        // 2. Add-on 1: Hospedagem (1 Ano)
        items.push({
            id: 'hosting',
            title: `Hospedagem Premium - ${OFFER_HOSTING_YEARS} Ano`,
            quantity: 1,
            // ATENÇÃO: Use o preço correto de 1 ano aqui, substituindo a constante UPSALE_PRICE se necessário.
            unit_price: 150.00, // Preço Fixo de 1 ano
            currency_id: 'BRL',
        });

        // 3. Add-on 2: Domínio (1 Ano)
        items.push({
            id: 'domain',
            title: `Domínio (.com.br) - ${OFFER_DOMAIN_YEARS} Ano`,
            quantity: 1,
            unit_price: 100.00, // Preço Fixo de 1 ano
            currency_id: 'BRL',
        });
        
        // 4. Add-on 3: Pacote de Suporte (3 Chamados)
        const supportOfferPrice = SUPPORT_PACKAGES.find(p => p.calls === OFFER_SUPPORT_CALLS)?.price || 0.99;
        items.push({
            id: 'support',
            title: `Pacote de Suporte - ${OFFER_SUPPORT_CALLS} Chamados`,
            quantity: 1,
            unit_price: supportOfferPrice,
            currency_id: 'BRL',
        });
        
        // 5. Add-on 4: Google Ads (5 Campanhas)
        items.push({
            id: 'traffic_ads',
            title: `Plano Google Ads - ${OFFER_ADS_CAMPAIGNS} Campanhas`,
            quantity: 1,
            unit_price: ADS_OFFER_PRICE,
            currency_id: 'BRL',
        });
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

    const preferenceData = {
      body: {
        items: items, 
        payer: {
          email: email, 
        },
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
          addon_title: addonTitle, // Adicionado
          years: years || (isAddon ? undefined : OFFER_HOSTING_YEARS), // 1 ano fixo na 1a compra
          calls: calls || (isAddon ? undefined : OFFER_SUPPORT_CALLS), // 3 chamados fixos na 1a compra
          domain_name: domainName,
          payer_email: email,
        // REMOVEMOS: include_hosting e include_support do metadata, pois usamos IDs explícitos agora
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