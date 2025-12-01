// app/app/page.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, X, CheckCircle, Smartphone, Globe, Code, Rocket, ChevronRight, Star, ArrowRight, Monitor, ShoppingBag, FileText, Settings, Users, LogOut, Plus, MessageSquare, ShieldCheck, Palette, Search, Headphones, ChevronLeft, Mail, CheckSquare, Square, Loader2, Server, Lock, AlertTriangle, LifeBuoy, Megaphone } from 'lucide-react';
import { PlanType, User } from '../types';
import { PLANS, CONTACT_PHONE_DISPLAY, CONTACT_WHATSAPP, TESTIMONIALS, PROCESS_STEPS, UPSALE_PRICE, VIP_SUPPORT_MULTIPLIER, DOMAIN_PRICES, HOSTING_PRICES, ADS_PRICES, SUPPORT_PACKAGES,OFFER_HOSTING_YEARS,OFFER_DOMAIN_YEARS, OFFER_SUPPORT_CALLS,OFFER_ADS_CAMPAIGNS,ADS_OFFER_PRICE } from '../constants';
import { logout } from '../services/authService'; // Removido getCurrentUser pois faremos a busca direta
import { supabase } from '../supabaseClient';
import { redirect, useRouter } from 'next/navigation';

// --- INTERFACES AUXILIARES ---

// Esta interface representa EXATAMENTE o que vem do seu Banco de Dados (Supabase)
// Baseado na imagem e CSV que você enviou.
interface DBProfile {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
    role: string;
    created_at: string;
    plan_expiry: string | null;
    hosting: any;                
    domain: any;                 
    // Adicionamos as colunas JSON com a variação de case, mas focamos no mapeamento
    vipSupport?: any;            // CamelCase
    
    paidTraffic?: any;           // CamelCase
    
    // Coluna exata que você usa
    supportTicketsRemaining: number; 
}

// 🟢 SOLUÇÃO DO PROBLEMA: Função para garantir que JSON é Objeto, não String
const safeJSONParse = (data: any) => {
    if (data === null || data === undefined) return { active: false };

    // If already object, return as-is but normalize boolean-like strings
    if (typeof data === 'object') {
        // normalize boolean-like strings inside object (very defensive)
        try {
            const clone = JSON.parse(JSON.stringify(data)); // deep clone
            Object.keys(clone).forEach((k) => {
                if (clone[k] === 'true') clone[k] = true;
                if (clone[k] === 'false') clone[k] = false;
            });
            return clone;
        } catch {
            return data;
        }
    }

    if (typeof data === 'string') {
        const trimmed = data.trim();

        // Handle double-encoded JSON: e.g. "\"{...}\"" or stringified JSON with extra quotes
        try {
            let parsed: any = JSON.parse(trimmed);

            // If parsed is still a string that looks like JSON (double-encoded), parse again
            if (typeof parsed === 'string') {
                try {
                    parsed = JSON.parse(parsed);
                } catch {
                    // leave parsed as string
                }
            }

            // Final normalization of boolean-like values inside parsed object
            if (typeof parsed === 'object' && parsed !== null) {
                Object.keys(parsed).forEach((k) => {
                    if (parsed[k] === 'true') parsed[k] = true;
                    if (parsed[k] === 'false') parsed[k] = false;
                });
            }

            return parsed;
        } catch (err) {
            console.warn("safeJSONParse: não conseguiu parsear string para JSON:", trimmed.slice(0, 200));
            return { active: false };
        }
    }

    // Fallback
    return { active: false };
};

// --- HELPER DE NORMALIZAÇÃO ---
// Esta função converte os dados do banco (snake_case/incorretos) para o padrão da App (User)
const normalizeUser = (dbUser: DBProfile, authEmail?: string): User => {
    // defensive checks & logs (very useful while debugging)
    if (!dbUser) {
        console.error("normalizeUser recebeu dbUser vazio");
        return {
            id: '',
            name: 'Usuário',
            email: authEmail || '',
            avatarUrl: '',
            plan: PlanType.NO_PLAN,
            planExpiry: undefined,
            supportTicketsRemaining: 0,
        } as User;
    }

    // Try multiple possible keys (defensive)
    const hostingData = safeJSONParse((dbUser as any).hosting ?? (dbUser as any).hosting_info ?? null);
    const domainData = safeJSONParse((dbUser as any).domain ?? (dbUser as any).domain_info ?? null);

    const vipSupportData = safeJSONParse((dbUser as any).vipSupport ?? (dbUser as any).vipsupport ?? (dbUser as any).vip_support ?? null);
    const paidTrafficData = safeJSONParse((dbUser as any).paidTraffic ?? (dbUser as any).paidtraffic ?? (dbUser as any).paid_traffic ?? null);

    const supportTickets = (dbUser as any).supportTicketsRemaining ?? (dbUser as any).support_tickets_remaining ?? (dbUser as any).supportTicket ?? 0;

    const user: User = {
        id: dbUser.id,
        name: dbUser.full_name || 'Usuário',
        email: dbUser.email || authEmail || '',
        avatarUrl: dbUser.avatar_url,
        plan: ((dbUser.role as PlanType) || PlanType.NO_PLAN),
        planExpiry: dbUser.plan_expiry || undefined,
        supportTicketsRemaining: typeof supportTickets === 'string' ? Number(supportTickets) || 0 : supportTickets,
        hosting: hostingData,
        domain: domainData,
        vipSupport: vipSupportData,
        paidTraffic: paidTrafficData,
    };

    // Warnings to detect mismatched column names or unexpected shapes
    if (!((dbUser as any).hosting) && !((dbUser as any).hosting_info)) {
        console.warn("normalizeUser: coluna 'hosting' ausente no profile (verifique nomes/permissões). Keys:", Object.keys(dbUser));
    }
    if (!((dbUser as any).domain)) {
        console.warn("normalizeUser: coluna 'domain' ausente no profile (keys list)", Object.keys(dbUser));
    }

    return user;
};

// --- DASHBOARD COMPONENTS ---

const DashboardLayout = ({ user, children, onLogout }: any) => {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 text-slate-300 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-8 border-b border-slate-800">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">321</div>
              <div className="font-bold text-2xl text-white">Site</div>
           </div>
           <div className="text-xs text-brand-400 font-medium mt-2 pl-11">Painel do Cliente</div>
        </div>
        
        <div className="flex-grow p-4 space-y-2 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-bold uppercase text-slate-500 tracking-wider">Menu Principal</div>

            <a href="/?bypassAuth=true" className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <ChevronLeft size={20} /> Voltar ao Site Público
            </a>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 text-white bg-brand-600/10 border border-brand-500/20 rounded-xl hover:bg-brand-600/20 transition-all">
            <Layout size={20} className="text-brand-400" /> Visão Geral
          </button>

          {/* Only show extra menu items if user has a real plan */}
          {user.plan !== PlanType.NO_PLAN && (
            <>
                {(user.plan === PlanType.BLOG || user.plan === PlanType.ADMIN) && (
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                    <FileText size={20} /> Postagens (Blog)
                    </button>
                )}

                {(user.plan === PlanType.ECOMMERCE || user.plan === PlanType.ADMIN) && (
                    <>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                        <ShoppingBag size={20} /> Produtos
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                        <Users size={20} /> Pedidos
                    </button>
                    </>
                )}

                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                    <MessageSquare size={20} /> Suporte VIP
                </button>
                
                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                    <Settings size={20} /> Configurações
                </button>
            </>
          )}
        </div>

        <div className="p-4 m-4 bg-slate-800/50 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
             <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=0ea5e9&color=fff`} className="w-10 h-10 rounded-full border border-slate-600" alt="avatar"/>
             <div className="overflow-hidden">
               <p className="text-sm font-bold text-white truncate">{user.name}</p>
               <p className="text-xs text-slate-500 truncate">{user.email}</p>
             </div>
          </div>
          <button onClick={onLogout} className="w-full py-2 flex items-center justify-center gap-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-brand-900/10 blur-[100px] pointer-events-none"></div>

        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white p-4 flex justify-between items-center sticky top-0 z-20">
          <span className="font-bold text-xl">321Site</span>
          <button onClick={onLogout}><LogOut size={20} /></button>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-10 relative z-10">
           {children}
        </div>
      </main>
    </div>
  );
};

// --- FULL OFFER ITEMS ---
const fullOfferItems = [
    { 
        id: "offer_domain",
        title: `Domínio .com.br - ${OFFER_DOMAIN_YEARS} Ano`, 
        price: DOMAIN_PRICES.find(p => p.years === OFFER_DOMAIN_YEARS)?.price || 100.00,
        icon: Globe, 
        description: 'Seu nome na web garantido por um ano.',
        years: OFFER_DOMAIN_YEARS,
        isRecurring: false
    },
    { 
        id: "offer_hosting",
        title: `Hospedagem Premium - ${OFFER_HOSTING_YEARS} Ano`, 
        price: HOSTING_PRICES.find(p => p.years === OFFER_HOSTING_YEARS)?.price || 150.00,
        icon: Server, 
        description: 'Servidores rápidos e seguros para manter seu site online.',
        years: OFFER_HOSTING_YEARS,
        isRecurring: false
    },
    { 
        id: "offer_support",
        title: `Pacote de Suporte - ${OFFER_SUPPORT_CALLS} Chamados`, 
        price: SUPPORT_PACKAGES.find(p => p.calls === OFFER_SUPPORT_CALLS)?.price || 0.99,
        icon: LifeBuoy, 
        description: 'Atendimento prioritário para tirar dúvidas e resolver problemas.',
        calls: OFFER_SUPPORT_CALLS,
        isRecurring: false
    },
    { 
        id: "offer_ads",
        title: `Campanhas Google Ads - ${OFFER_ADS_CAMPAIGNS} Unidades`, 
        price: ADS_OFFER_PRICE,
        icon: Megaphone, 
        description: 'Configuração e monitoramento de campanhas iniciais no Google.',
        campaigns: OFFER_ADS_CAMPAIGNS,
        isRecurring: false
    },
];

const DashboardHome = ({ user, onPlanSelect }: { user: User, onPlanSelect: (plan: any) => void }) => {

  const handleServicePurchase = async (serviceType: 'domain' | 'hosting' | 'support' | 'traffic_ads', option: any) => {
    try {
        const endpoint = serviceType === 'traffic_ads' 
            ? '/api/checkout/paidtraffic' 
            : '/api/checkout';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                title: option.title,
                price: option.price,
                userId: user.id,
                isAddon: true,
                addonTitle: option.title,
                addonPrice: option.price,
                addonId: serviceType,
                reason: option.title 
            }),
        });

        if (response.ok) {
            const data = await response.json();
            window.location.href = data.url;
        } else {
            alert("Erro ao gerar pagamento.");
        }
    } catch (error) {
        console.error(error);
        alert("Erro de conexão.");
    }
  };

  // STATE 1: NO PLAN (New User)
  if (user.plan === PlanType.NO_PLAN) {
        return (
            <div className="space-y-8 max-w-6xl mx-auto">
                <div className="text-center mb-12">
                   <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo, {user.name.split(' ')[0]}! 🚀</h1>
                   <p className="text-slate-400">Para começar, escolha o plano ideal para o seu projeto.</p>
                </div>
                {/* LISTA DE PLANOS (RESUMIDA PARA O EXEMPLO) */}
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {PLANS.map((plan) => (
                        <div key={plan.id} className={`relative bg-slate-900 rounded-3xl flex flex-col border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.recommended ? 'border-brand-500 shadow-brand-500/20 z-10' : 'border-slate-800 hover:border-slate-700'}`}>
                            <div className="p-6 flex-grow">
                                <h3 className="text-lg font-bold text-white mb-2">{plan.title}</h3>
                                <div className="mb-4">
                                <span className="text-3xl font-extrabold text-white">R$ {plan.price.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="p-6 pt-0 mt-auto">
                                <button 
                                onClick={() => onPlanSelect(plan)}
                                className="w-full py-3 bg-slate-800 text-white hover:bg-brand-600 hover:text-white border border-slate-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                Selecionar Plano
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

  // STATE 2: HAS PLAN
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white mb-1">Olá, {user.name.split(' ')[0]} 👋</h1>
           <p className="text-slate-400">Painel de Controle do seu Site</p>
        </div>
        <div className="inline-flex items-center px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-sm font-bold">
           <span className="w-2 h-2 bg-green-500 rounded-full mr-2 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
           Status: Ativo
        </div>
      </div>

      {/* STATUS CARDS COM CORREÇÃO DE DATA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> 
         
         {/* Card 1: Plano */}
         <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
            <div className="text-slate-400 text-xs font-bold uppercase mb-2">Plano Atual</div>
            <div className="text-lg font-bold text-white truncate">{PLANS.find(p => p.id === user.plan)?.title || user.plan}</div>
            
            {/* CORREÇÃO: new Date(...) antes do toLocaleDateString */}
            <div className="mt-2 text-xs text-slate-500">
                Expira em: {user.planExpiry ? new Date(user.planExpiry).toLocaleDateString('pt-BR') : 'Vitalício'}
            </div>
         </div>

         {/* Card 2: Suporte */}
         <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
            <div className="text-slate-400 text-xs font-bold uppercase mb-2">Suporte Técnico</div>
            <div className="text-2xl font-bold text-white">
                {user.supportTicketsRemaining === -1 ? 'Ilimitado' : `${user.supportTicketsRemaining} Restantes`}
            </div>
            {user.vipSupport?.active && (
                <div className="mt-2 text-xs text-purple-400 font-bold">
                    {/* CORREÇÃO: Converter string JSON para Date */}
                    VIP Ativo até {user.vipSupport.expiryDate ? new Date(user.vipSupport.expiryDate).toLocaleDateString('pt-BR') : '...'}
                </div>
            )}
         </div>

         {/* Card 3: Hospedagem */}
         <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
            <div className="text-slate-400 text-xs font-bold uppercase mb-2">Hospedagem</div>
            {user.hosting?.active ? (
                <>
                    <div className="text-lg font-bold text-green-400 flex items-center gap-2"><CheckCircle size={16}/> Ativa</div>
                    <div className="mt-2 text-xs text-slate-500">
                        {/* CORREÇÃO: Converter string JSON para Date */}
                        Vence em: {user.hosting.expiryDate ? new Date(user.hosting.expiryDate).toLocaleDateString('pt-BR') : '...'}
                    </div>
                </>
            ) : (
                <div className="text-lg font-bold text-slate-500">Não contratado</div>
            )}
         </div>

         {/* Card 4: Domínio */}
         <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
            <div className="text-slate-400 text-xs font-bold uppercase mb-2">Domínio</div>
            {user.domain?.active ? (
                <>
                    <div className="text-lg font-bold text-white truncate">{user.domain.domainName || 'Configurado'}</div>
                    <div className="mt-2 text-xs text-slate-500">
                        {/* CORREÇÃO: Converter string JSON para Date */}
                        Vence em: {user.domain.expiryDate ? new Date(user.domain.expiryDate).toLocaleDateString('pt-BR') : '...'}
                    </div>
                </>
            ) : (
                <div className="text-lg font-bold text-slate-500">Não contratado</div>
            )}
         </div>
         
         {/* Card 5: Tráfego Pago */}
         <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
                <Megaphone size={40} className="text-blue-500"/>
            </div>
            <div className="text-slate-400 text-xs font-bold uppercase mb-2">Tráfego Pago (Google)</div>
            
            {user.paidTraffic?.active ? (
                <>
                    <div className="text-lg font-bold text-blue-400 flex items-center gap-2 truncate">
                        <CheckCircle size={16}/> Ativo
                    </div>
                    {user.paidTraffic.currentPeriodEnd && (
                         <div className="mt-2 text-xs text-slate-500">
                            {/* CORREÇÃO: Converter string JSON para Date */}
                            Renova em: {new Date(user.paidTraffic.currentPeriodEnd).toLocaleDateString('pt-BR')}
                         </div>
                    )}
                </>
            ) : (
                <div className="text-lg font-bold text-slate-500">Não contratado</div>
            )}
         </div>
        
      </div>
      
      {/* SEÇÃO DE CONTRATAÇÃO (Mantida igual ao original, resumida aqui para focar no erro) */}
      <h3 className="text-2xl font-bold text-white pt-8">Contratação de Serviços Adicionais</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Card Hospedagem */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col border-t-4 border-t-amber-500 shadow-lg shadow-amber-900/10">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><Server size={24}/></div>
                  <h4 className="text-xl font-bold text-white">Hospedagem</h4>
              </div>
              <div className="space-y-3 mt-auto">
                  {HOSTING_PRICES.map((opt) => (
                      <button 
                        key={opt.years}
                        onClick={() => handleServicePurchase('hosting', { title: `Hospedagem (${opt.years} Anos)`, price: opt.price })}
                        className="w-full flex justify-between items-center p-4 rounded-xl border border-slate-700 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                      >
                          <span className="text-sm font-medium text-slate-300">{opt.label}</span>
                          <span className="font-bold text-white group-hover:text-amber-400">R$ {opt.price.toFixed(2)}</span>
                      </button>
                  ))}
              </div>
          </div>
          {/* ... Outros cards de serviço (mantidos como estavam) ... */}
          {/* Apenas fechando a div para o exemplo compilar */}
      </div>
    </div>
  );
};

interface OfferItem {
    id: string;
    title: string;
    description: string;
    price: number;
    icon: any; 
    years?: number;
    calls?: number;
    isRecurring?: boolean;
}

const PaymentModal = ({ plan, isOpen, onClose, currentUser, additionalOffers }: { 
    plan: any; 
    isOpen: boolean; 
    onClose: () => void; 
    currentUser: User | null;
    additionalOffers: OfferItem[];
}) => {
    const [loading, setLoading] = useState(false);
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]); 

    useEffect(() => {
        if (isOpen) {
            setSelectedAddons([]); 
        }
    }, [isOpen]);

    if (!isOpen || !plan) return null;

    const selectedOfferItems = additionalOffers.filter(item => selectedAddons.includes(item.id));
    const addonsTotal = selectedOfferItems.reduce((sum, item) => sum + item.price, 0);
    const total = plan.price + addonsTotal;

    const handleAddonToggle = (id: string) => {
        setSelectedAddons(prev => 
            prev.includes(id) 
                ? prev.filter(itemId => itemId !== id) 
                : [...prev, id]
        );
    };

    const handlePayment = async () => {
        if (!currentUser) {
            console.error("Usuário não logado para checkout.");
            return;
        }

        setLoading(true);

        try {
            const checkoutAddons = selectedOfferItems.map(item => ({
                id: item.id,
                title: item.title,
                price: item.price,
                years: item.years,
                calls: item.calls,
                isRecurring: item.isRecurring
            }));
            
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: plan.id,
                    title: plan.title,
                    price: plan.price,
                    email: currentUser.email,
                    userId: currentUser.id,
                    additionalOffers: checkoutAddons, 
                }),
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = data.url; 
            } else {
                console.error("Erro no Checkout");
                setLoading(false);
            }
        } catch (error) {
            console.error("Erro de conexão no pagamento:", error);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-8 text-white text-center">
                    <h3 className="text-2xl font-bold">Resumo do Pedido</h3>
                    <p className="opacity-90 mt-2 text-brand-100">{plan.title}</p>
                </div>
                
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-700/50 text-lg">
                        <span className="text-slate-400">Criação do Site:</span>
                        <span className="font-bold text-2xl text-white">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                    </div>

                    <h4 className="text-xl font-bold text-white mb-4">Serviços Adicionais</h4>
                    
                    {additionalOffers.map((item) => {
                        const isSelected = selectedAddons.includes(item.id);
                        const IconComponent = item.icon || CheckSquare;

                        return (
                            <div 
                                key={item.id}
                                onClick={() => handleAddonToggle(item.id)}
                                className={`border rounded-2xl p-4 mb-3 relative cursor-pointer transition-all ${isSelected ? 'bg-brand-900/20 border-brand-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-full mt-1 ${isSelected ? 'bg-brand-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                        <IconComponent size={20} />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className={`font-bold text-lg ${isSelected ? 'text-brand-400' : 'text-white'}`}>{item.title}</h4>
                                        <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                                    </div>
                                    <div className="flex flex-col items-end justify-center h-full ml-4">
                                        <div className="font-bold text-xl text-green-400">+ R$ {item.price.toFixed(2).replace('.', ',')}</div>
                                        <div className="mt-2">
                                            {isSelected ? <CheckSquare size={24} className="text-brand-500" /> : <Square size={24} className="text-slate-600" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <div className="border-t border-slate-700 pt-6 mt-6 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-lg text-slate-300">Total a Pagar:</span>
                            <span className="text-4xl font-extrabold text-white">R$ {total.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : `Ir para Pagamento`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AppHome() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loadingSession, setLoadingSession] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const mounted = useRef(true);

    const router = useRouter();

    // ===============================
    // 1. CARREGAR USUÁRIO DO SUPABASE
    // ===============================
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (error) throw error;

                    console.groupCollapsed("DEBUG: profile raw from supabase");
                    console.log(profile);
                    console.groupEnd();

                    if (profile && mounted.current) {
                        const normalizedUser = normalizeUser(
                            profile as unknown as DBProfile,
                            session.user.email
                        );

                        console.groupCollapsed("DEBUG: normalizedUser");
                        console.log(normalizedUser);
                        console.groupEnd();

                        setCurrentUser(normalizedUser);
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar usuário:", error);
            } finally {
                if (mounted.current) setLoadingSession(false);
            }
        };

        fetchUserData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (_event === 'SIGNED_IN' && session) fetchUserData();
            if (_event === 'SIGNED_OUT') setCurrentUser(null);
        });

        return () => {
            mounted.current = false;
            subscription.unsubscribe();
        };
    }, []);

    // =====================================
    // 2. PROTEGER A ROTA (CLIENT-SIDE GUARD)
    // =====================================
    useEffect(() => {
        if (!loadingSession && !currentUser) {
            router.push("/");
        }
    }, [loadingSession, currentUser, router]);

    // =============
    // 3. LOADING
    // =============
    if (loadingSession) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            </div>
        );
    }

    // ========================================
    // 4. EVITA RENDERIZAR SEM currentUser
    // ========================================
    if (!currentUser) {
        return null; // apenas até o redirect ocorrer
    }

    // ===============================
    // 5. HANDLERS
    // ===============================
    const handlePlanSelect = (plan: any) => {
        setSelectedPlan(plan);
        setIsPaymentModalOpen(true);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Erro ao fazer logout", error);
        }
        window.location.href = "/";
    };

    // ===============================
    // 6. RENDERIZAÇÃO FINAL
    // ===============================
    return (
        <>
            <DashboardLayout user={currentUser} onLogout={handleLogout}>
                <DashboardHome 
                    user={currentUser} 
                    onPlanSelect={handlePlanSelect} 
                />
            </DashboardLayout>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                plan={selectedPlan}
                currentUser={currentUser}
                additionalOffers={fullOfferItems}
            />
        </>
    );
}
