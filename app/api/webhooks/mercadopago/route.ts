import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import { MP_ACCESS_TOKEN } from '../../../constants';
import { supabaseAdmin } from '../../../supabaseAdmin';

const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('id') || url.searchParams.get('data.id');

    if (topic !== 'payment') {
        return NextResponse.json({ status: 'ignored' });
    }

    if (!id) {
        return NextResponse.json({ error: 'ID missing' }, { status: 400 });
    }

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: id });

    if (paymentData.status === 'approved') {
        const metadata = paymentData.metadata || {};
        const payerEmail = paymentData.payer?.email || metadata.payer_email;
        
        // Identificadores do Produto
        const planId = metadata.plan_id;
        const isAddon = metadata.is_addon === true || metadata.is_addon === 'true';
        const addonId = metadata.addon_id; 
        
        // Variáveis de Quantidade (Cruciais para sua regra de negócio)
        // Se não vier definido, assume 1 ano ou 0 chamados
        const purchaseYears = metadata.years ? parseInt(metadata.years) : 1; 
        const supportCallsToAdd = metadata.calls ? parseInt(metadata.calls) : 0;

        if (!payerEmail) {
             return NextResponse.json({ error: 'No email provided' }, { status: 400 });
        }

        // Busca o perfil atual (necessário para somar chamados existentes)
        const { data: userProfile, error: searchError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('email', payerEmail)
            .single();

        if (searchError || !userProfile) {
            console.error(`❌ Usuário não encontrado: ${payerEmail}`);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let updateData: any = {};
        
        // Calcula datas de expiração dinâmicas
        const now = new Date();
        
        // Data para Hospedagem/Domínio (Baseada nos anos comprados)
        const expiryMultiYear = new Date();
        expiryMultiYear.setFullYear(now.getFullYear() + purchaseYears);

        // Data para Mensalidades (Ads/Suporte VIP recorrente)
        const expiryMonth = new Date();
        expiryMonth.setMonth(now.getMonth() + 1);

        if (isAddon && addonId) {
            console.log(`📦 Processando Add-on: ${addonId}. Anos: ${purchaseYears}. Chamados: ${supportCallsToAdd}`);

            // 1. HOSPEDAGEM (1, 2 ou 3 Anos)
            if (addonId === 'hosting') {
                updateData.hosting = {
                    active: true,
                    expiryDate: expiryMultiYear.toISOString(),
                    planYears: purchaseYears
                };
                // Se a hospedagem der bônus de suporte, adiciona aqui
                if (supportCallsToAdd > 0) {
                     const currentTickets = typeof userProfile.supportTicketsRemaining === 'number' ? userProfile.supportTicketsRemaining : 0;
                     updateData.supportTicketsRemaining = currentTickets + supportCallsToAdd;
                }
            }
            
            // 2. DOMÍNIO (1, 2 ou 3 Anos)
            else if (addonId === 'domain') {
                updateData.domain = {
                    active: true,
                    expiryDate: expiryMultiYear.toISOString(),
                    domainName: metadata.domain_name || userProfile.domain?.domainName || 'Configurar Domínio'
                };
                // Lógica de bônus de suporte para domínio também
                if (supportCallsToAdd > 0) {
                     const currentTickets = typeof userProfile.supportTicketsRemaining === 'number' ? userProfile.supportTicketsRemaining : 0;
                     updateData.supportTicketsRemaining = currentTickets + supportCallsToAdd;
                }
            }
            
            // 3. TRÁFEGO PAGO (Assinatura Mensal)
            else if (addonId === 'traffic_ads') {
                updateData.paidTraffic = {
                    active: true,
                    planName: metadata.addon_title || 'Plano Ads',
                    currentPeriodEnd: expiryMonth.toISOString()
                };
            }
            
            // 4. SUPORTE VIP (Pacotes de Chamados)
            else if (addonId === 'support') {
                 // Ativa a flag VIP (tempo mensal)
                 updateData.vipSupport = {
                    active: true,
                    expiryDate: expiryMonth.toISOString()
                };
                
                // SOMA os chamados comprados aos existentes
                const currentTickets = typeof userProfile.supportTicketsRemaining === 'number' ? userProfile.supportTicketsRemaining : 0;
                // Se for 'unlimited', não mexemos na contagem, senão somamos
                if (userProfile.supportTicketsRemaining !== 'unlimited') {
                    updateData.supportTicketsRemaining = currentTickets + supportCallsToAdd;
                }
            }

        } else if (planId) {
            // 5. PLANO PRINCIPAL
            updateData.role = planId;
            // Se for compra de site, geralmente é vitalício ou anual? 
            // O código original não tinha expiração no profile, mas vou manter a lógica de 1 ano caso queira usar.
            updateData.plan_expiry = expiryMultiYear.toISOString();
        }

        // Executa a atualização
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update(updateData)
            .eq('id', userProfile.id);

        if (updateError) {
            console.error('❌ Erro Supabase:', updateError);
            return NextResponse.json({ error: 'Update failed' }, { status: 500 });
        }

        console.log(`✅ Atualizado com sucesso para ${payerEmail}`);
    }

    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error('Erro Webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}