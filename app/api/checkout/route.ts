import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';
import { 
  MP_ACCESS_TOKEN, 
  OFFER_HOSTING_YEARS, 
  OFFER_SUPPORT_CALLS, 
} from '../../constants';

const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

// Interface para tipar o objeto que vem do Frontend
interface AdditionalOffer {
    id: string;
    title: string;
    price: number;
    years?: number;
    calls?: number;
}

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
      email,
      userId, // 🟢 NOVO: Agora recebendo o ID do usuário (CRÍTICO para PIX/Boleto)
      additionalOffers 
    } = body;

    const items = [];
    // Array para armazenar os IDs limpos para o Webhook saber o que liberar
    let aggregatedAddons: string[] = []; 

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
        
        // 1. Item Principal: O Plano do Site
        if (planId) {
            items.push({
                id: planId,
                title: title,
                quantity: 1,
                unit_price: Number(price),
                currency_id: 'BRL',
            });
        }

        // 2. Processar Itens Adicionais Selecionados Dinamicamente
        if (additionalOffers && Array.isArray(additionalOffers)) {
            additionalOffers.forEach((offer: AdditionalOffer) => {
                
                // Mapeamento de ID: O frontend manda 'offer_domain', mas o webhook espera 'domain'
                let cleanId = offer.id;
                
                if (offer.id === 'offer_domain') cleanId = 'domain';
                if (offer.id === 'offer_hosting') cleanId = 'hosting';
                if (offer.id === 'offer_support') cleanId = 'support';
                if (offer.id === 'offer_ads') cleanId = 'traffic_ads'; 

                // Adiciona ao carrinho do Mercado Pago
                items.push({
                    id: cleanId,
                    title: offer.title,
                    quantity: 1,
                    unit_price: Number(offer.price),
                    currency_id: 'BRL',
                });

                // Adiciona à lista de metadados para o Webhook
                aggregatedAddons.push(cleanId);
            });
        }
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

    const preferenceData = {
      body: {
        items: items, 
        payer: {
          email: email, 
        },
        // 🟢 CORREÇÃO CRÍTICA: Adiciona o ID do usuário para o Webhook buscar
        external_reference: userId, 
        
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
        // ✅ Mantido para contornar o bug de roteamento do Vercel
        notification_url: `${baseUrl}/api/webhooks/mercadopago?id=`,
        
        metadata: {
          is_addon: isAddon ? 'true' : 'false',
          addon_id: addonId,
          plan_id: planId,
          addon_title: addonTitle, 
          years: years || (isAddon ? undefined : OFFER_HOSTING_YEARS), 
          calls: calls || (isAddon ? undefined : OFFER_SUPPORT_CALLS), 
          domain_name: domainName,
          // O payer_email é redundante, mas mantido por segurança. 
          // A busca principal agora é pelo external_reference (userId)
          payer_email: email,
          
          aggregated_addons: aggregatedAddons.join(','), 
        }
      },
    };

    const preference = new Preference(client);
    let result;

    try {
        // @ts-ignore - Ignorando erro de tipagem estrita do SDK se necessário
        result = await preference.create(preferenceData);
    } catch (prefError) {
        console.warn("Tentando fallback sem payment_methods...", prefError);
        delete (preferenceData.body as any).payment_methods;
        // @ts-ignore
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