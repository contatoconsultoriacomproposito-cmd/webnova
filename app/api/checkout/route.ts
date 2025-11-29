import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';
import { 
  MP_ACCESS_TOKEN, 
  PLANS, 
  SUPPORT_PACKAGES, 
  ADS_OFFER_PRICE, 
  OFFER_HOSTING_YEARS, 
  OFFER_DOMAIN_YEARS, 
  OFFER_SUPPORT_CALLS, 
  OFFER_ADS_CAMPAIGNS, 
  VIP_SUPPORT_MULTIPLIER, 
  UPSALE_PRICE,
  HOSTING_PRICES, // 🟢 IMPORTADO: Tabela de preços de hospedagem
  DOMAIN_PRICES,  // 🟢 IMPORTADO: Tabela de preços de domínio
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
      years, 
      calls, 
      domainName, 
      email 
    } = body;

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
        // --- FLUXO DE PRIMEIRA COMPRA (OFERTA AGREGADA) ---
        
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
        // 🟢 CORREÇÃO: Busca o preço de 1 ano na tabela HOSTING_PRICES
        const offerHostPrice = HOSTING_PRICES.find(p => p.years === OFFER_HOSTING_YEARS)?.price || 150.00;
        items.push({
            id: 'hosting',
            title: `Hospedagem Premium - ${OFFER_HOSTING_YEARS} Ano`,
            quantity: 1,
            unit_price: offerHostPrice, 
            currency_id: 'BRL',
        });

        // 3. Add-on 2: Domínio (1 Ano)
        // 🟢 CORREÇÃO: Busca o preço de 1 ano na tabela DOMAIN_PRICES
        const offerDomainPrice = DOMAIN_PRICES.find(p => p.years === OFFER_DOMAIN_YEARS)?.price || 100.00;
        items.push({
            id: 'domain',
            title: `Domínio (.com.br) - ${OFFER_DOMAIN_YEARS} Ano`,
            quantity: 1,
            unit_price: offerDomainPrice, 
            currency_id: 'BRL',
        });
        
        // 4. Add-on 3: Pacote de Suporte (3 Chamados)
        // O preço já estava sendo buscado corretamente na tabela SUPPORT_PACKAGES
        const supportOfferPrice = SUPPORT_PACKAGES.find(p => p.calls === OFFER_SUPPORT_CALLS)?.price || 0.99;
        items.push({
            id: 'support',
            title: `Pacote de Suporte - ${OFFER_SUPPORT_CALLS} Chamados`,
            quantity: 1,
            unit_price: supportOfferPrice,
            currency_id: 'BRL',
        });
        
        // 5. Add-on 4: Google Ads (5 Campanhas)
        // O preço já estava sendo buscado corretamente na constante ADS_OFFER_PRICE
        items.push({
            id: 'traffic_ads',
            title: `Plano Google Ads - ${OFFER_ADS_CAMPAIGNS} Campanhas`,
            quantity: 1,
            unit_price: ADS_OFFER_PRICE,
            currency_id: 'BRL',
        });
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

    // 🟢 CORREÇÃO CRÍTICA: Define a lista de add-ons agregados para o Webhook
    let aggregatedAddons: string[] = [];
    if (!isAddon) {
        // IDs dos itens adicionados: Hospedagem, Domínio, Suporte e Tráfego Pago
        aggregatedAddons = ['hosting', 'domain', 'support', 'traffic_ads']; 
    }

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
          addon_title: addonTitle, 
          years: years || (isAddon ? undefined : OFFER_HOSTING_YEARS), 
          calls: calls || (isAddon ? undefined : OFFER_SUPPORT_CALLS), 
          domain_name: domainName,
          payer_email: email,
          
          // 🟢 CAMPO VITAL: Envia a lista de serviços agregados na 1ª compra
          aggregated_addons: aggregatedAddons.join(','),
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