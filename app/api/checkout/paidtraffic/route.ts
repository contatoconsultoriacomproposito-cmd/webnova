import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';
import { MP_ACCESS_TOKEN } from '../../../constants'; // Ajuste os caminhos conforme necessário
import { PAID_TRAFFIC_PRICE } from '../../../constants'; // Supondo que você definiu o preço
import { getCurrentUser } from '../../../services/authService'; // Importa funções de autenticação

// Configura o cliente do Mercado Pago
const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

export async function POST(request: Request) {
  try {
    // 1. VALIDAÇÃO E OBTENÇÃO DOS DADOS DO USUÁRIO
    const user = await getCurrentUser(); // Busca o usuário autenticado no servidor
    
    if (!user || !user.email) {
      // Retorna 401 se o usuário não estiver logado
      return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });
    }

    // 2. CONFIGURAÇÃO DA PREFERÊNCIA DE PAGAMENTO
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Objeto do produto/serviço
    const paidTrafficService = {
        title: 'Assinatura Mensal de Gestão de Tráfego Pago',
        price: PAID_TRAFFIC_PRICE,
        id: 'PAID_TRAFFIC_SERVICE',
    };

    const preferenceData = {
      body: {
        items: [
          {
            id: paidTrafficService.id,
            title: paidTrafficService.title,
            currency_id: 'BRL',
            unit_price: paidTrafficService.price,
            quantity: 1,
            description: 'Serviço de Assinatura Recorrente Mensal',
          },
        ],
        payer: {
          email: user.email, // Email do usuário logado
        },
        // O campo external_reference é crucial para identificar o usuário no webhook
        external_reference: user.id, 
        
        // Metadados cruciais para o Webhook identificar o serviço
        metadata: {
          product_type: 'PAID_TRAFFIC',
          user_id: user.id,
          payer_email: user.email,
        },
        
        // Configurações de Retorno
        back_urls: {
          success: `${baseUrl}/app/dashboard?payment=success`,
          failure: `${baseUrl}/app/dashboard?payment=failure`,
          pending: `${baseUrl}/app/dashboard?payment=pending`,
        },
        auto_return: 'approved',
        
        // URL que o Mercado Pago chamará após o pagamento
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      },
    };

    // 3. CRIAÇÃO DA PREFERÊNCIA
    const preference = new Preference(client);
    const result = await preference.create(preferenceData);

    // Retorna a URL de checkout (init_point)
    return NextResponse.json({ url: result.init_point });

  } catch (error) {
    console.error('------- ERRO MERCADO PAGO - CHECKOUT PAID TRAFFIC -------');
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}