import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import { MP_ACCESS_TOKEN } from '../../../constants';
import { supabaseAdmin } from '../../../supabaseAdmin';

const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

export async function POST(request: Request) {
    try {
        const url = new URL(request.url);
        
        // --- 1. EXTRAÇÃO ROBUSTA DE ID E TOPIC ---
        
        // 1.1 Tenta ler parâmetros da URL (para testes ou Mercado Pago antigo)
        let topic = url.searchParams.get('topic') || url.searchParams.get('type');
        let id = url.searchParams.get('id') || url.searchParams.get('data.id');
        
        // 1.2 Tenta ler parâmetros do CORPO JSON (O formato de produção do Mercado Pago)
        let bodyData: any = {};
        try {
            bodyData = await request.json(); 
        } catch (e) {
            // Ignora erro se o corpo não for JSON
        }
        
        // 1.3 Prioriza o que foi encontrado: URL > Body JSON
        topic = topic || bodyData.topic || bodyData.type;
        id = id || bodyData.id || bodyData.data?.id;
        
        // --- FIM DA EXTRAÇÃO ---

        // Retorna à validação de produção: topic=payment e ID são obrigatórios
        // Este é o filtro de segurança para ignorar notificações irrelevantes
        if (topic !== 'payment' || !id) {
            console.warn(`⚠️ Webhook recebido, mas topic (${topic}) ou ID (${id}) ausentes/inválidos.`);
            return NextResponse.json({ status: 'ignored' });
        }


        // 2. Busca os dados do pagamento (SÓ A PARTIR DAQUI O CÓDIGO É EXECUTADO)
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: id });

        if (paymentData.status !== 'approved') {
            return NextResponse.json({ status: 'payment_not_approved' });
        }

        // 3. O RESTO DA SUA LÓGICA DE PROCESSAMENTO (Inalterado)

        // 1. Captura os dados críticos do Metadata
        const metadata = paymentData.metadata || {};
        const payerEmail = paymentData.payer?.email || metadata.payer_email;
        
        // Dados de Planos e Add-ons
        const planId = metadata.plan_id;
        const isAddon = metadata.is_addon === 'true'; 
        const addonId = metadata.addon_id; 
        const addonTitle = metadata.addon_title;

        // Dados de Quantidade e Duração
        const purchaseYears = metadata.years ? parseInt(metadata.years) : 0; 
        const supportCallsToAdd = metadata.calls ? parseInt(metadata.calls) : 0;
        
        // Campo para a Oferta Agregada
        const aggregatedAddons = metadata.aggregated_addons ? (metadata.aggregated_addons as string).split(',') : [];

        if (!payerEmail) {
            console.error('❌ Email não identificado no pagamento.');
            return NextResponse.json({ error: 'No email provided' }, { status: 400 });
        }

        // 2. Busca o usuário
        const { data: userProfile, error: searchError } = await supabaseAdmin
            .from('profiles')
            .select('*') 
            .eq('email', payerEmail)
            .single();

        if (searchError || !userProfile) {
            console.error(`❌ Usuário não encontrado: ${payerEmail}`);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 3. Prepara o Objeto de Atualização
        let updateData: any = {};
        const now = new Date();
        
        // Calcula a data de expiração para o período comprado
        const expiryMultiYear = new Date();
        if (purchaseYears > 0) {
            expiryMultiYear.setFullYear(now.getFullYear() + purchaseYears);
        }
        
        // Data para Mensalidades (Ads)
        const expiryMonth = new Date();
        expiryMonth.setMonth(now.getMonth() + 1);

        // --- Processamento da Compra ---

        // A. Lógica para COMPRA AVULSA (isAddon: true)
        if (isAddon && addonId) {
            console.log(`📦 Processando Add-on Avulso: ${addonId}`);

            if (addonId === 'hosting') {
                updateData.hosting = { active: true, expiryDate: expiryMultiYear.toISOString(), planYears: purchaseYears };
            }
            else if (addonId === 'domain') {
                updateData.domain = { active: true, expiryDate: expiryMultiYear.toISOString(), domainName: metadata.domain_name || userProfile.domain?.domainName || 'Configurar Domínio' };
            }
            else if (addonId === 'traffic_ads') { 
                updateData.paidTraffic = { active: true, planName: addonTitle || 'Plano Ads', currentPeriodEnd: expiryMonth.toISOString() };
            }
            else if (addonId === 'support') {
                 // Ativa o flag visual e prioridade por 1 mês
                 updateData.vipSupport = { active: true, expiryDate: expiryMonth.toISOString() }; 

                 // Soma os chamados comprados
                 const currentTickets = typeof userProfile.supportTicketsRemaining === 'number' ? userProfile.supportTicketsRemaining : 0;
                 if (userProfile.supportTicketsRemaining !== 'unlimited') {
                     updateData.supportTicketsRemaining = currentTickets + supportCallsToAdd;
                 }
            }
        } 
        
        // B. Lógica para OFERTA AGREGADA (Primeira Compra)
        else {
            // 1. Ativa o Plano Principal
            if (planId) {
                console.log(`🚀 Processando Plano Principal: ${planId}`);
                updateData.role = planId;
                updateData.plan_expiry = expiryMultiYear.toISOString();
            }
            
            // 2. Processa todos os serviços agregados (hosting, domain, support, traffic_ads)
            if (aggregatedAddons.length > 0) {
                console.log(`🎁 Processando Oferta Agregada: ${aggregatedAddons.join(', ')}`);
                
                // Ativa Hospedagem e Domínio (1 Ano Fixo)
                if (aggregatedAddons.includes('hosting')) {
                    updateData.hosting = { active: true, expiryDate: expiryMultiYear.toISOString(), planYears: purchaseYears }; 
                }
                if (aggregatedAddons.includes('domain')) {
                    updateData.domain = { active: true, expiryDate: expiryMultiYear.toISOString(), domainName: metadata.domain_name || 'Configurar Domínio' };
                }

                // Ativa Tráfego Pago (Assinatura Mensal)
                if (aggregatedAddons.includes('traffic_ads')) {
                    updateData.paidTraffic = { active: true, planName: 'Oferta Google Ads (5 Camp.)', currentPeriodEnd: expiryMonth.toISOString() };
                }

                // Processa Pacote de Suporte (3 Chamados)
                if (aggregatedAddons.includes('support')) {
                     updateData.vipSupport = { active: true, expiryDate: expiryMonth.toISOString() };
                     // Soma os chamados comprados
                     const currentTickets = typeof userProfile.supportTicketsRemaining === 'number' ? userProfile.supportTicketsRemaining : 0;
                     if (userProfile.supportTicketsRemaining !== 'unlimited') {
                         updateData.supportTicketsRemaining = currentTickets + supportCallsToAdd;
                     }
                }
            }
        }


        // 4. Executa a Atualização no Supabase
        if (Object.keys(updateData).length === 0) {
            console.warn('⚠️ Nenhum dado para atualização no Supabase. Metadata incompleto.');
            return NextResponse.json({ status: 'ignored_no_data' });
        }

        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update(updateData)
            .eq('id', userProfile.id);

        if (updateError) {
            console.error('❌ Erro ao atualizar Supabase:', updateError);
            return NextResponse.json({ error: 'Update failed' }, { status: 500 });
        }

        console.log(`✅ Sucesso! Dados atualizados para ${payerEmail}:`, updateData);

        return NextResponse.json({ status: 'success' });

    } catch (error) {
        console.error('Erro Fatal no Webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}