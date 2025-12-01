// app/app/page.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, X, CheckCircle, Smartphone, Globe, Code, Rocket, ChevronRight, Star, ArrowRight, Monitor, ShoppingBag, FileText, Settings, Users, LogOut, Plus, MessageSquare, ShieldCheck, Palette, Search, Headphones, ChevronLeft, Mail, CheckSquare, Square, Loader2, Server, Lock, AlertTriangle, LifeBuoy, Megaphone, Send } from 'lucide-react';
import { PlanType, User } from '../types';
import { PLANS, CONTACT_PHONE_DISPLAY, CONTACT_WHATSAPP, TESTIMONIALS, PROCESS_STEPS, UPSALE_PRICE, VIP_SUPPORT_MULTIPLIER, DOMAIN_PRICES, HOSTING_PRICES, ADS_PRICES, SUPPORT_PACKAGES, OFFER_HOSTING_YEARS, OFFER_DOMAIN_YEARS, OFFER_SUPPORT_CALLS, OFFER_ADS_CAMPAIGNS, ADS_OFFER_PRICE } from '../constants';
import { logout } from '../services/authService';
import { supabase } from '../supabaseClient';
import { redirect, useRouter } from 'next/navigation';

// --- INTERFACES AUXILIARES ---

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
    vipSupport?: any;
    paidTraffic?: any;
    supportTicketsRemaining: number;
}

// Helper JSON Parse
const safeJSONParse = (data: any) => {
    if (data === null || data === undefined) return { active: false };
    if (typeof data === 'object') {
        try {
            const clone = JSON.parse(JSON.stringify(data));
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
        try {
            let parsed: any = JSON.parse(trimmed);
            if (typeof parsed === 'string') {
                try { parsed = JSON.parse(parsed); } catch { }
            }
            if (typeof parsed === 'object' && parsed !== null) {
                Object.keys(parsed).forEach((k) => {
                    if (parsed[k] === 'true') parsed[k] = true;
                    if (parsed[k] === 'false') parsed[k] = false;
                });
            }
            return parsed;
        } catch (err) {
            return { active: false };
        }
    }
    return { active: false };
};

// Normalização do Usuário
const normalizeUser = (dbUser: DBProfile, authEmail?: string): User => {
    if (!dbUser) {
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

    const hostingData = safeJSONParse((dbUser as any).hosting ?? (dbUser as any).hosting_info ?? null);
    const domainData = safeJSONParse((dbUser as any).domain ?? (dbUser as any).domain_info ?? null);
    const vipSupportData = safeJSONParse((dbUser as any).vipSupport ?? (dbUser as any).vipsupport ?? (dbUser as any).vip_support ?? null);
    const paidTrafficData = safeJSONParse((dbUser as any).paidTraffic ?? (dbUser as any).paidtraffic ?? (dbUser as any).paid_traffic ?? null);
    
    // CORREÇÃO 1: Garantir conversão segura para Number aqui
    const rawTickets = (dbUser as any).supportTicketsRemaining ?? (dbUser as any).support_tickets_remaining ?? (dbUser as any).supportTicket ?? 0;
    const supportTickets = typeof rawTickets === 'string' ? Number(rawTickets) : Number(rawTickets);

    return {
        id: dbUser.id,
        name: dbUser.full_name || 'Usuário',
        email: dbUser.email || authEmail || '',
        avatarUrl: dbUser.avatar_url,
        plan: ((dbUser.role as PlanType) || PlanType.NO_PLAN),
        planExpiry: dbUser.plan_expiry || undefined,
        supportTicketsRemaining: isNaN(supportTickets) ? 0 : supportTickets, // Fallback final para 0
        hosting: hostingData,
        domain: domainData,
        vipSupport: vipSupportData,
        paidTraffic: paidTrafficData,
    };
};

// --- MODAL DE SUPORTE VIP ---
const SupportModal = ({ isOpen, onClose, user, refreshUser }: { isOpen: boolean, onClose: () => void, user: User, refreshUser: () => void }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || '',
        whatsapp: '',
        email: user.email || '',
        siteLink: '',
        message: ''
    });

    if (!isOpen) return null;

    // CORREÇÃO 2: Criar variável segura convertida para Number para uso local
    const currentTickets = Number(user.supportTicketsRemaining || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // CORREÇÃO 3: Usar a variável segura na comparação
        if (currentTickets <= 0) {
            alert("Você não possui tickets de suporte suficientes.");
            return;
        }
        setLoading(true);

        try {
            // CORREÇÃO 4: Usar a variável segura na matemática
            const newCount = currentTickets - 1;
            
            const { error } = await supabase
                .from('profiles')
                .update({ supportTicketsRemaining: newCount })
                .eq('id', user.id);

            if (error) {
                console.error("ERRO SUPABASE DETALHADO:", error); 
                throw error;
            }

            refreshUser();

            const text = `*Nova Solicitação de Suporte VIP*\n\n` +
                         `👤 *Cliente:* ${formData.name}\n` +
                         `📧 *Email:* ${formData.email}\n` +
                         `📱 *WhatsApp:* ${formData.whatsapp}\n` +
                         `🌐 *Site:* ${formData.siteLink}\n\n` +
                         `📝 *Solicitação:* ${formData.message}`;

            const encodedText = encodeURIComponent(text);
            const whatsappUrl = `https://wa.me/5548996536507?text=${encodedText}`;

            window.open(whatsappUrl, '_blank');
            onClose();

        } catch (error) {
            console.error("Erro ao processar suporte:", error);
            alert("Erro ao debitar ticket de suporte. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md relative z-10 p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Headphones className="text-brand-500" /> Abrir Chamado VIP
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24}/></button>
                </div>

                <div className="mb-4 bg-brand-900/20 border border-brand-500/30 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-brand-200 text-sm">Tickets Disponíveis:</span>
                    <span className="text-brand-400 font-bold text-lg">{currentTickets}</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome Completo</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">WhatsApp</label>
                            <input required type="text" placeholder="(DD) 99999-9999" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Link do Site</label>
                        <input required type="url" placeholder="https://..." value={formData.siteLink} onChange={e => setFormData({...formData, siteLink: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Solicitação</label>
                        <textarea required rows={4} placeholder="Descreva o que você precisa..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 outline-none resize-none" />
                    </div>

                    <button disabled={loading} type="submit" className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4">
                        {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Enviar Solicitação (-1 Ticket)</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- DASHBOARD COMPONENTS ---

const DashboardLayout = ({ user, children, onLogout, onOpenSupport }: any) => {
  // CORREÇÃO 5: Garantir que é número antes de verificar se é > 0
  const tickets = Number(user.supportTicketsRemaining || 0);
  const hasTickets = tickets > 0;

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

          {/* User Specific Menus */}
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

                {/* Botão Suporte VIP com Lógica de Tickets */}
                <button 
                    onClick={onOpenSupport}
                    disabled={!hasTickets}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        hasTickets 
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer' 
                        : 'text-slate-700 cursor-not-allowed bg-slate-800/30'
                    }`}
                >
                    <MessageSquare size={20} /> 
                    <span className="flex-grow text-left">Suporte VIP</span>
                    {!hasTickets && <Lock size={14} />}
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

// --- FULL OFFER ITEMS (AUX) ---
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
                {/* LISTA DE PLANOS */}
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

  // STATE 2: HAS PLAN - DASHBOARD PRINCIPAL
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

      {/* STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> 
         
         {/* Card 1: Plano */}
         <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
            <div className="text-slate-400 text-xs font-bold uppercase mb-2">Plano Atual</div>
            <div className="text-lg font-bold text-white truncate">{PLANS.find(p => p.id === user.plan)?.title || user.plan}</div>
            <div className="mt-2 text-xs text-slate-500">
                Expira em: {user.planExpiry ? new Date(user.planExpiry).toLocaleDateString('pt-BR') : 'Vitalício'}
            </div>
         </div>

         {/* Card 2: Suporte */}
         <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
            <div className="text-slate-400 text-xs font-bold uppercase mb-2">Suporte Técnico</div>
            <div className="text-2xl font-bold text-white">
                {/* CORREÇÃO 6: Uso seguro do ticket para exibição */}
                {Number(user.supportTicketsRemaining || 0) === -1 ? 'Ilimitado' : `${Number(user.supportTicketsRemaining || 0)} Restantes`}
            </div>
         </div>

         {/* Card 3: Hospedagem */}
         <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
            <div className="text-slate-400 text-xs font-bold uppercase mb-2">Hospedagem</div>
            {user.hosting?.active ? (
                <>
                    <div className="text-lg font-bold text-green-400 flex items-center gap-2"><CheckCircle size={16}/> Ativa</div>
                    <div className="mt-2 text-xs text-slate-500">
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
                            Renova em: {new Date(user.paidTraffic.currentPeriodEnd).toLocaleDateString('pt-BR')}
                         </div>
                    )}
                </>
            ) : (
                <div className="text-lg font-bold text-slate-500">Não contratado</div>
            )}
         </div>
      </div>
      
      {/* SEÇÃO DE CONTRATAÇÃO DINÂMICA */}
      <h3 className="text-2xl font-bold text-white pt-8">Contratação de Serviços Adicionais</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* 1. Card Hospedagem (Mostra se NÃO tiver hospedagem) */}
          {!user.hosting?.active && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col border-t-4 border-t-amber-500 shadow-lg shadow-amber-900/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><Server size={24}/></div>
                    <h4 className="text-xl font-bold text-white">Hospedagem</h4>
                </div>
                <div className="space-y-3 mt-auto">
                    {HOSTING_PRICES.map((opt) => (
                        <button 
                            key={opt.years}
                            onClick={() => handleServicePurchase('hosting', { title: `Hospedagem (${opt.years} Anos)`, price: opt.price })}
                            className="w-full flex justify-between items-center p-3 rounded-xl border border-slate-700 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                        >
                            <span className="text-sm font-medium text-slate-300">{opt.label}</span>
                            <span className="font-bold text-white group-hover:text-amber-400">R$ {opt.price.toFixed(2)}</span>
                        </button>
                    ))}
                </div>
            </div>
          )}

          {/* 2. Card Domínio (Mostra se NÃO tiver domínio) */}
          {!user.domain?.active && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col border-t-4 border-t-cyan-500 shadow-lg shadow-cyan-900/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-xl"><Globe size={24}/></div>
                    <h4 className="text-xl font-bold text-white">Domínio .com.br</h4>
                </div>
                <div className="space-y-3 mt-auto">
                    {DOMAIN_PRICES.map((opt) => (
                        <button 
                            key={opt.years}
                            onClick={() => handleServicePurchase('domain', { title: `Domínio (${opt.years} Anos)`, price: opt.price })}
                            className="w-full flex justify-between items-center p-3 rounded-xl border border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group"
                        >
                            <span className="text-sm font-medium text-slate-300">{opt.label}</span>
                            <span className="font-bold text-white group-hover:text-cyan-400">R$ {opt.price.toFixed(2)}</span>
                        </button>
                    ))}
                </div>
            </div>
          )}

          {/* 3. Card Tráfego Pago (Mostra se NÃO tiver tráfego pago) */}
          {!user.paidTraffic?.active && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col border-t-4 border-t-blue-500 shadow-lg shadow-blue-900/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Megaphone size={24}/></div>
                    <h4 className="text-xl font-bold text-white">Google Ads</h4>
                </div>
                <div className="space-y-3 mt-auto">
                    {ADS_PRICES.map((opt) => (
                        <button 
                            key={opt.campaigns}
                            onClick={() => handleServicePurchase('traffic_ads', { title: `Google Ads (${opt.campaigns} campanhas)`, price: opt.price })}
                            className="w-full flex justify-between items-center p-3 rounded-xl border border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                        >
                            <span className="text-sm font-medium text-slate-300">{opt.label}</span>
                            <span className="font-bold text-white group-hover:text-blue-400">R$ {opt.price.toFixed(2)}</span>
                        </button>
                    ))}
                </div>
            </div>
          )}

          {/* 4. Card Suporte Extra (SEMPRE VISÍVEL) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col border-t-4 border-t-purple-500 shadow-lg shadow-purple-900/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl"><LifeBuoy size={24}/></div>
                    <h4 className="text-xl font-bold text-white">Mais Suporte</h4>
                </div>
                <div className="space-y-3 mt-auto">
                    {SUPPORT_PACKAGES.map((opt) => (
                        <button 
                            key={opt.calls}
                            onClick={() => handleServicePurchase('support', { title: `Pacote Suporte (${opt.calls} chamados)`, price: opt.price })}
                            className="w-full flex justify-between items-center p-3 rounded-xl border border-slate-700 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                        >
                            <span className="text-sm font-medium text-slate-300">{opt.label}</span>
                            <span className="font-bold text-white group-hover:text-purple-400">R$ {opt.price.toFixed(2)}</span>
                        </button>
                    ))}
                </div>
          </div>

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
    
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    
    const mounted = useRef(true);
    const router = useRouter();

    // ===============================
    // 1. CARREGAR USUÁRIO DO SUPABASE
    // ===============================
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

                if (profile && mounted.current) {
                    const normalizedUser = normalizeUser(
                        profile as unknown as DBProfile,
                        session.user.email
                    );
                    setCurrentUser(normalizedUser);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar usuário:", error);
        } finally {
            if (mounted.current) setLoadingSession(false);
        }
    };

    useEffect(() => {
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
    // 2. PROTEGER A ROTA
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

    if (!currentUser) return null;

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
            <DashboardLayout 
                user={currentUser} 
                onLogout={handleLogout}
                onOpenSupport={() => setIsSupportModalOpen(true)}
            >
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

            <SupportModal 
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
                user={currentUser}
                refreshUser={fetchUserData}
            />
        </>
    );
}