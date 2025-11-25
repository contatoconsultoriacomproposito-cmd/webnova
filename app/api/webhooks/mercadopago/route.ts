import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import { MP_ACCESS_TOKEN } from '../../../constants';
import { supabaseAdmin } from '../../../supabaseAdmin';

// Configura o cliente do Mercado Pago
const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

export async function POST(request: Request) {
  try {
    // 1. Validação da Notificação
    // O Mercado Pago envia o ID do recurso na URL ou no corpo
    const url = new URL(request.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('id') || url.searchParams.get('data.id');

    // Se não for um pagamento, ignora (pode ser 'merchant_order' etc)
    if (topic !== 'payment') {
        return NextResponse.json({ status: 'ignored' });
    }

    if (!id) {
        return NextResponse.json({ error: 'ID missing' }, { status: 400 });
    }

    // 2. Consulta o Pagamento no Mercado Pago para confirmar o status real
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: id });

    console.log(`🔔 Webhook recebido para pagamento ${id}. Status: ${paymentData.status}`);

    // 3. Se estiver Aprovado, libera o acesso
    if (paymentData.status === 'approved') {
        const metadata = paymentData.metadata;
        const payerEmail = paymentData.payer?.email || metadata?.payer_email; // Metadata customizada ou email do pagador
        const planId = metadata?.plan_id;

        console.log(`✅ Pagamento aprovado para: ${payerEmail}. Plano: ${planId}`);

        if (payerEmail && planId) {
            // 4. Atualiza o usuário no Supabase
            
            // Primeiro, achamos o ID do usuário pelo email
            // Nota: Como estamos usando supabaseAdmin, podemos listar usuários
            // Mas a tabela 'profiles' é mais fácil de consultar
            const { data: userProfile, error: searchError } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('email', payerEmail)
                .single();

            if (searchError || !userProfile) {
                console.error(`❌ Usuário não encontrado para o email ${payerEmail}`);
                // Aqui poderíamos criar um usuário se não existisse, ou apenas logar o erro
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // Calcula nova data de expiração (+1 ano)
            const newExpiry = new Date();
            newExpiry.setFullYear(newExpiry.getFullYear() + 1);

            // Atualiza o perfil
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    role: planId, // Atualiza o plano (OnePage, Blog, etc)
                    // Aqui você precisaria ter uma coluna 'plan_expiry' no seu banco.
                    // Se não criou ainda, o Supabase vai ignorar ou dar erro se for strict.
                    // Vamos assumir que você vai criar ou já criou.
                    // plan_expiry: newExpiry.toISOString() 
                })
                .eq('id', userProfile.id);

            if (updateError) {
                console.error('❌ Erro ao atualizar perfil:', updateError);
                return NextResponse.json({ error: 'Update failed' }, { status: 500 });
            }

            console.log(`🎉 Plano liberado com sucesso para ${payerEmail}!`);
        }
    }

    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error('Erro no Webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}