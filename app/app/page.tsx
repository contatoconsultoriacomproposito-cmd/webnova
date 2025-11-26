// app/app/page.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, X, CheckCircle, Smartphone, Globe, Code, Rocket, ChevronRight, Star, ArrowRight, Monitor, ShoppingBag, FileText, Settings, Users, LogOut, Plus, MessageSquare, ShieldCheck, Palette, Search, Headphones, ChevronLeft, Mail, CheckSquare, Square, Loader2, Server, Lock, AlertTriangle, LifeBuoy } from 'lucide-react';
import { PlanType, User } from '../types';
import { PLANS, CONTACT_PHONE_DISPLAY, CONTACT_WHATSAPP, TESTIMONIALS, PROCESS_STEPS, UPSALE_PRICE, VIP_SUPPORT_MULTIPLIER, DOMAIN_PRICES, HOSTING_PRICES } from '../constants';
import { loginWithGoogle, getCurrentUser, logout } from '../services/authService';
import { supabase } from '../supabaseClient';
import { redirect } from 'next/navigation'; // Adicionar import

// --- DASHBOARD COMPONENTS ---

const DashboardLayout = ({ user, children, onLogout }: any) => {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 text-slate-300 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-8 border-b border-slate-800">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
              <div className="font-bold text-2xl text-white">WebNova</div>
           </div>
           <div className="text-xs text-brand-400 font-medium mt-2 pl-11">Painel do Cliente</div>
        </div>
        
        <div className="flex-grow p-4 space-y-2 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-bold uppercase text-slate-500 tracking-wider">Menu Principal</div>

          {/* NOVO: Botão para Homepage */}
          <a href="/" className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
            <ChevronLeft size={20} /> Voltar ao Site Público
          </a>
          {/* FIM NOVO */}
          
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
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-96 bg-brand-900/10 blur-[100px] pointer-events-none"></div>

        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white p-4 flex justify-between items-center sticky top-0 z-20">
          <span className="font-bold text-xl">WebNova</span>
          <button onClick={onLogout}><LogOut size={20} /></button>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-10 relative z-10">
           {children}
        </div>
      </main>
    </div>
  );
};

const DashboardHome = ({ user, onPlanSelect }: { user: User, onPlanSelect: (plan: any) => void }) => {
  
  const handleServicePurchase = async (serviceType: 'domain' | 'hosting' | 'support', option: any) => {
    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                isAddon: true,
                addonTitle: option.title,
                addonPrice: option.price,
                addonId: serviceType,
                email: user.email
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

  // STATE 1: NO PLAN (New User) -> Show Plan Selection
  if (user.plan === PlanType.NO_PLAN) {
    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="text-center mb-12">
               <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo, {user.name.split(' ')[0]}! 🚀</h1>
               <p className="text-slate-400">Para começar, escolha o plano ideal para o seu projeto.</p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                {PLANS.map((plan) => (
                    <div key={plan.id} className={`relative bg-slate-900 rounded-3xl flex flex-col border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.recommended ? 'border-brand-500 shadow-brand-500/20 z-10' : 'border-slate-800 hover:border-slate-700'}`}>
                    {plan.recommended && (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                        Recomendado
                        </div>
                    )}
                    <div className="p-6 flex-grow">
                        <h3 className="text-lg font-bold text-white mb-2">{plan.title}</h3>
                        <div className="mb-4">
                        <span className="text-3xl font-extrabold text-white">R$ {plan.price.toFixed(2)}</span>
                        </div>
                        <ul className="space-y-2 mb-6">
                        {plan.features.slice(0,3).map((feature, idx) => ( // Show only top 3 features for compact view
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle size={14} className="text-brand-400 flex-shrink-0 mt-0.5" />
                            {feature}
                            </li>
                        ))}
                        </ul>
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

  // STATE 2: HAS PLAN (Existing User) -> Show Stats & Addons
  const canBuySupport = user.hosting?.active || user.domain?.active;
  const currentPlanPrice = PLANS.find(p => p.id === user.plan)?.price || 0;
  const supportPrice = currentPlanPrice * VIP_SUPPORT_MULTIPLIER;

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

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {/* Card 1: Plano */}
         <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
            <div className="text-slate-400 text-xs font-bold uppercase mb-2">Plano Atual</div>
            <div className="text-lg font-bold text-white truncate">{PLANS.find(p => p.id === user.plan)?.title || 'Admin'}</div>
            <div className="mt-2 text-xs text-slate-500">Expira em: {user.planExpiry ? new Date(user.planExpiry).toLocaleDateString('pt-BR') : 'Vitalício'}</div>
         </div>

         {/* Card 2: Suporte */}
         <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
            <div className="text-slate-400 text-xs font-bold uppercase mb-2">Suporte Técnico</div>
            <div className="text-2xl font-bold text-white">
                {user.supportTicketsRemaining === 'unlimited' ? 'Ilimitado' : `${user.supportTicketsRemaining} Restantes`}
            </div>
            {user.vipSupport?.active && <div className="mt-2 text-xs text-purple-400 font-bold">VIP Ativo até {new Date(user.vipSupport.expiryDate!).toLocaleDateString('pt-BR')}</div>}
         </div>

         {/* Card 3: Hospedagem */}
         <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
            <div className="text-slate-400 text-xs font-bold uppercase mb-2">Hospedagem</div>
            {user.hosting?.active ? (
                <>
                    <div className="text-lg font-bold text-green-400 flex items-center gap-2"><CheckCircle size={16}/> Ativa</div>
                    <div className="mt-2 text-xs text-slate-500">Vence em: {new Date(user.hosting.expiryDate!).toLocaleDateString('pt-BR')}</div>
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
                    <div className="text-lg font-bold text-white truncate">{user.domain.domainName}</div>
                    <div className="mt-2 text-xs text-slate-500">Vence em: {new Date(user.domain.expiryDate!).toLocaleDateString('pt-BR')}</div>
                </>
            ) : (
                <div className="text-lg font-bold text-slate-500">Não contratado</div>
            )}
         </div>
      </div>

      <h3 className="text-2xl font-bold text-white pt-8">Contratação de Serviços Adicionais</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Hospedagem */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><Server size={24}/></div>
                  <h4 className="text-xl font-bold text-white">Hospedagem Premium</h4>
              </div>
              <p className="text-sm text-slate-400 mb-8">Servidor de alta performance, SSL incluso e contas de e-mail.</p>
              
              <div className="space-y-3 mt-auto">
                  {HOSTING_PRICES.map((opt) => (
                      <button 
                        key={opt.years}
                        onClick={() => handleServicePurchase('hosting', { title: `Hospedagem Premium (${opt.years} Anos)`, price: opt.price })}
                        className="w-full flex justify-between items-center p-4 rounded-xl border border-slate-700 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                      >
                          <span className="text-sm font-medium text-slate-300">{opt.label} (+{opt.supportsBonus} suportes)</span>
                          <span className="font-bold text-white group-hover:text-amber-400">R$ {opt.price.toFixed(2)}</span>
                      </button>
                  ))}
              </div>
          </div>

          {/* Domínio */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl"><Globe size={24}/></div>
                  <h4 className="text-xl font-bold text-white">Domínio Personalizado</h4>
              </div>
              <p className="text-sm text-slate-400 mb-8">Registre sua marca na internet (.com.br ou .com).</p>
              
              <div className="space-y-3 mt-auto">
                  {DOMAIN_PRICES.map((opt) => (
                      <button 
                        key={opt.years}
                        onClick={() => handleServicePurchase('domain', { title: `Registro de Domínio (${opt.years} Anos)`, price: opt.price })}
                        className="w-full flex justify-between items-center p-4 rounded-xl border border-slate-700 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group"
                      >
                          <span className="text-sm font-medium text-slate-300">{opt.label} (+{opt.supportsBonus} suportes)</span>
                          <span className="font-bold text-white group-hover:text-pink-400">R$ {opt.price.toFixed(2)}</span>
                      </button>
                  ))}
              </div>
          </div>

          {/* Suporte VIP */}
          <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col relative ${!canBuySupport ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl"><LifeBuoy size={24}/></div>
                  <h4 className="text-xl font-bold text-white">Suporte VIP Ilimitado</h4>
              </div>
              <p className="text-sm text-slate-400 mb-8">Atendimento prioritário para ajustes no seu site.</p>
              
              {!canBuySupport && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6 rounded-3xl border border-slate-700/50">
                      <Lock size={32} className="text-slate-400 mb-2"/>
                      <span className="font-bold text-white text-lg">Bloqueado</span>
                      <span className="text-xs text-slate-400">Contrate Hospedagem ou Domínio para liberar.</span>
                  </div>
              )}

              <div className="mt-auto">
                  <div className="mb-4 p-4 bg-slate-800 rounded-xl">
                      <span className="text-xs text-slate-500 block mb-1">Preço Exclusivo (75% do plano):</span>
                      <span className="text-2xl font-bold text-white">R$ {supportPrice.toFixed(2)}</span>
                  </div>
                  <button 
                    disabled={!canBuySupport}
                    onClick={() => handleServicePurchase('support', { title: `Suporte VIP Ilimitado`, price: supportPrice })}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-900/20"
                  >
                      Contratar Agora
                  </button>
              </div>
          </div>

      </div>
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ plan, isOpen, onClose, currentUser }: { plan: any, isOpen: boolean, onClose: () => void, currentUser: User | null }) => {
  const [loading, setLoading] = useState(false);
  
  // Estados para os Upsells
  const [includeHosting, setIncludeHosting] = useState(false);
  const [includeSupport, setIncludeSupport] = useState(false);

  // Reseta os estados quando o modal abre
  useEffect(() => {
    if (isOpen) {
        setIncludeHosting(false);
        setIncludeSupport(false);
    }
  }, [isOpen]);

  if (!isOpen || !plan) return null;

  // Cálculo do Preço de Suporte VIP
  const supportPrice = plan.price * VIP_SUPPORT_MULTIPLIER;
  
  // Cálculo do Total
  const total = plan.price + (includeHosting ? UPSALE_PRICE : 0) + (includeSupport ? supportPrice : 0);

  const handlePayment = async () => {
    if (!currentUser) {
        // Should not happen due to parent logic, but safety check
        alert("Você precisa estar logado para continuar.");
        return;
    }

    setLoading(true);

    try {
        // Processo de Checkout
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                planId: plan.id,
                title: plan.title,
                price: plan.price,
                includeHosting: includeHosting,
                includeSupport: includeSupport, 
                includeSupportPrice: includeSupport ? supportPrice : 0, 
                email: currentUser.email // Usa email do usuário logado
            }),
        });

        if (response.ok) {
            const data = await response.json();
            window.location.href = data.url; 
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.details || errorData.error || "Erro desconhecido";
            alert(`Erro no Checkout: ${errorMessage}`);
            setLoading(false);
        }
    } catch (error) {
        console.error("Erro no pagamento:", error);
        alert("Erro de conexão. Verifique se o servidor está rodando.");
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-[scaleIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-8 text-white text-center">
          <h3 className="text-2xl font-bold">Resumo do Pedido</h3>
          <p className="opacity-90 mt-2 text-brand-100">Você escolheu: {plan.title}</p>
        </div>
        
        <div className="p-8">
          {/* Valor Base */}
          <div className="flex justify-between items-center mb-6 text-lg">
            <span className="text-slate-400">Criação do Site:</span>
            <span className="font-bold text-2xl text-white">R$ {plan.price.toFixed(2)}</span>
          </div>

          {/* UPSELL 1: HOSPEDAGEM */}
          <div 
             onClick={() => setIncludeHosting(!includeHosting)}
             className={`border rounded-2xl p-4 mb-4 relative cursor-pointer transition-all ${includeHosting ? 'bg-amber-900/20 border-amber-500/50' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
          >
            <div className="flex items-start gap-4">
               <div className={`p-2 rounded-full mt-1 ${includeHosting ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
                  {includeHosting ? <CheckSquare size={20} /> : <Square size={20} />}
               </div>
               <div>
                   <h4 className={`font-bold text-lg ${includeHosting ? 'text-amber-400' : 'text-white'}`}>Hospedagem Premium</h4>
                   <p className="text-sm text-slate-400 mt-1">Domínio .com.br Grátis + SSL + Emails.</p>
                   <div className="mt-2 font-bold text-white">+ R$ {UPSALE_PRICE.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ano</span></div>
               </div>
            </div>
          </div>

          {/* UPSELL 2: SUPORTE VIP */}
          <div 
             onClick={() => setIncludeSupport(!includeSupport)}
             className={`border rounded-2xl p-4 mb-6 relative cursor-pointer transition-all ${includeSupport ? 'bg-purple-900/20 border-purple-500/50' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
          >
            <div className="flex items-start gap-4">
               <div className={`p-2 rounded-full mt-1 ${includeSupport ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  {includeSupport ? <CheckSquare size={20} /> : <Square size={20} />}
               </div>
               <div>
                   <h4 className={`font-bold text-lg ${includeSupport ? 'text-purple-400' : 'text-white'}`}>Suporte VIP Ilimitado</h4>
                   <p className="text-sm text-slate-400 mt-1">Atendimento prioritário e ajustes ilimitados.</p>
                   <div className="mt-2 font-bold text-white">+ R$ {supportPrice.toFixed(2)} <span className="text-xs font-normal text-slate-500">/semestre</span></div>
               </div>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-6 mb-6">
             <div className="flex justify-between items-center">
                <span className="text-lg text-slate-300">Total a Pagar:</span>
                <span className="text-3xl font-extrabold text-white">R$ {total.toFixed(2)}</span>
             </div>
          </div>

          <div className="space-y-4">
              <div className="bg-slate-800 p-3 rounded-lg text-sm text-slate-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Logado como: <span className="font-bold text-white">{currentUser?.email}</span>
              </div>

              <button 
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transform hover:-translate-y-1"
              >
                {loading ? <Loader2 className="animate-spin" /> : `Ir para Pagamento`}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// Este é o componente principal da nova rota /app
export default function AppHome() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loadingSession, setLoadingSession] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Lógica de autenticação: A mesma de antes, mas sem a LandingPage
    useEffect(() => {
        let mounted = true;
        
        const fetchUser = async () => {
            const user = await getCurrentUser();
            if (mounted) {
                if (user) {
                    setCurrentUser(user);
                } else {
                    // SE NÃO HOUVER USUÁRIO LOGADO, REDIRECIONA PARA A HOMEPAGE
                    redirect('/'); 
                }
            }
            if (mounted) setLoadingSession(false);
        };

        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (_event === 'SIGNED_IN' && session) {
            // Recarrega o usuário após login (necessário se o login for via modal/pop-up)
            getCurrentUser().then(user => {
                if(mounted && user) setCurrentUser(user);
            });
          }
          if (_event === 'SIGNED_OUT') {
            if (mounted) setCurrentUser(null);
          }
        });

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
    }, []);

    const handlePlanSelect = (plan: any) => {
        setSelectedPlan(plan);
        setIsPaymentModalOpen(true);
    };

    const handleLogout = async () => {
        setCurrentUser(null); // Optimistic UI update
        try {
            await logout();
        } catch (error) {
            console.error("Erro ao fazer logout no Supabase", error);
        }
    };

    if (loadingSession || !currentUser) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            </div>
        );
    }
    
    // Agora que o usuário está garantido, renderiza o Dashboard
    return (
        <>
            <DashboardLayout user={currentUser} onLogout={handleLogout}>
                <DashboardHome user={currentUser} onPlanSelect={handlePlanSelect} />
            </DashboardLayout>
            {/* AGORA O MODAL ESTÁ ATIVO E CORRIGIDO */}
            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                plan={selectedPlan} // Nome da prop CORRETO
                currentUser={currentUser} // Propriedade faltante ADICIONADA
            />
            
        </>
    );
}

// NOTE: Você precisará trazer as importações de ícones (lucide-react) e os componentes
// LandingPage, LoginModal e PaymentModal para esta nova estrutura, se necessário.
// No entanto, o DashboardLayout e DashboardHome já estão definidos acima.