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
            // Usa a constante importada para permitir testes com centavos ou valor real
            unit_price: UPSALE_PRICE, 
            currency_id: 'BRL',
        });
    }

    // 3. Opcional: Suporte VIP
    if (includeSupport) {
        // Busca o preço correto baseado no tipo de plano
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

    // Define a URL base (Localhost ou Produção)
    // Remove barra final para evitar duplicidade
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

    // Configuração base da preferência
    const preferenceData = {
      body: {
        items: items, // Envia a lista detalhada de itens
        payer: {
          email: email, 
        },
        // CONFIGURAÇÃO DE MÉTODOS DE PAGAMENTO
        // 'excluded_payment_types: []' instrui o Mercado Pago a NÃO excluir nada.
        // ISSO É CRUCIAL PARA O PIX APARECER.
        // Removemos 'default_payment_method_id' pois causava erro de validação.
        payment_methods: {
            excluded_payment_types: [],
            excluded_payment_methods: [],
            installments: 12
        },
        // Nome na fatura do cartão
        statement_descriptor: 'WEBNOVA SAAS',
        
        // Redirecionamentos
        back_urls: {
          success: `${baseUrl}/?status=success`,
          failure: `${baseUrl}/?status=failure`,
          pending: `${baseUrl}/?status=pending`,
        },
        auto_return: undefined, // Mantém undefined para evitar validações estritas que bloqueiam o fluxo
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        
        // Metadados para o Webhook identificar o pedido posteriormente
        metadata: {
          plan_id: planId,
          include_hosting: includeHosting ? 'true' : 'false',
          include_support: includeSupport ? 'true' : 'false'
        }
      },
    };

    // Tenta criar a preferência com a configuração ideal
    const preference = new Preference(client);
    let result;

    try {
        result = await preference.create(preferenceData);
    } catch (prefError) {
        console.warn("Falha na criação da preferência ideal, tentando fallback sem payment_methods específicos...", prefError);
        
        // FALLBACK: Se der erro (ex: conta não permite certas configurações), 
        // removemos a configuração de payment_methods e tentamos de novo.
        // Isso garante que o link seja gerado de qualquer forma, evitando travar o cliente.
        
        // Casting para 'any' para evitar erro de TypeScript no delete
        delete (preferenceData.body as any).payment_methods;
        
        result = await preference.create(preferenceData);
    }

    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error('------- ERRO MERCADO PAGO -------');
    console.error(error);
    const errorDetails = error.cause ? JSON.stringify(error.cause) : error.message;
    console.error('Detalhes:', errorDetails);
    console.error('---------------------------------');
    
    // Retorna o erro detalhado para o frontend mostrar no alert, facilitando o debug
    return NextResponse.json(
      { 
        error: 'Erro ao processar pagamento',
        details: errorDetails || 'Erro desconhecido no servidor'
      }, 
      { status: 500 }
    );
  }
}