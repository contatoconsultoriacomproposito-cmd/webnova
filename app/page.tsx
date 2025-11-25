'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, X, CheckCircle, Smartphone, Globe, Code, Rocket, ChevronRight, Star, ArrowRight, Monitor, ShoppingBag, FileText, Settings, Users, LogOut, Plus, MessageSquare, ShieldCheck, Palette, Search, Headphones, ChevronLeft, Mail, CheckSquare, Square, Loader2, Server, LifeBuoy, CreditCard } from 'lucide-react';
import { PlanType, User } from './types';
import { PLANS, CONTACT_PHONE_DISPLAY, CONTACT_WHATSAPP, TESTIMONIALS, PROCESS_STEPS, UPSALE_PRICE, VIP_SUPPORT_PRICES, HOSTING_RENEWAL_OPTIONS } from './constants';
import { loginWithEmail, getCurrentUser, logout } from './services/authService';
import { supabase } from './supabaseClient';

// --- COMPONENTES VISUAIS (NAVBAR, HERO, ETC) ---

const Navbar = ({ onLoginClick, onScrollTo }: { onLoginClick: () => void, onScrollTo: (id: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg shadow-brand-500/5 py-2' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group" onClick={() => onScrollTo('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
              W
            </div>
            <span className="font-bold text-2xl text-white tracking-tight group-hover:text-brand-400 transition-colors">WebNova</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {['Quem Somos', 'Vantagens', 'Como Trabalhamos', 'Planos', 'Depoimentos'].map((item) => (
              <button 
                key={item}
                onClick={() => onScrollTo(item.toLowerCase().replace(/ /g, '-'))}
                className="text-slate-300 hover:text-white px-3 py-2 font-medium transition-all text-sm uppercase tracking-wide hover:bg-white/5 rounded-full"
              >
                {item}
              </button>
            ))}
            <div className="pl-4">
              <button 
                onClick={onLoginClick}
                className="bg-white text-slate-950 px-6 py-2.5 rounded-full font-bold hover:bg-brand-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                Área do Cliente <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 absolute w-full animate-slide-in h-screen">
          <div className="px-4 pt-8 pb-6 space-y-4">
             {['Quem Somos', 'Vantagens', 'Como Trabalhamos', 'Planos', 'Depoimentos'].map((item) => (
              <button
                key={item}
                onClick={() => {
                  onScrollTo(item.toLowerCase().replace(/ /g, '-'));
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-4 text-xl font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                {item}
              </button>
            ))}
            <button 
              onClick={() => {
                onLoginClick();
                setIsOpen(false);
              }}
              className="w-full text-left block px-4 py-4 text-xl font-bold text-brand-400 bg-brand-500/10 mt-8 rounded-xl border border-brand-500/20"
            >
              Acessar Área do Cliente
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = ({ onCtaClick }: { onCtaClick: () => void }) => (
  <div id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden min-h-screen flex items-center">
    {/* Animated Background Blobs */}
    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-brand-600/20 blur-[100px] animate-blob mix-blend-screen"></div>
    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[100px] animate-blob animation-delay-2000 mix-blend-screen"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] animate-blob animation-delay-4000"></div>
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 text-brand-300 font-medium text-sm mb-8 border border-white/10 backdrop-blur-sm shadow-xl">
          <span className="flex h-2 w-2 rounded-full bg-brand-400 mr-2 animate-pulse"></span>
          Desenvolvimento Web de Alta Performance
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight mb-8 leading-tight">
          Transforme sua ideia em <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-cyan-400 to-purple-400 text-glow">
            Autoridade Digital
          </span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-400 mb-12 leading-relaxed">
          Criamos sites exclusivos, rápidos e otimizados para converter visitantes em clientes. 
          Sua empresa merece uma presença online <span className="text-white font-semibold">profissional e moderna</span>.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-5">
          <button 
            onClick={onCtaClick}
            className="group px-8 py-4 bg-brand-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-brand-500/40 hover:bg-brand-500 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Ver Planos e Preços <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
          </button>
          <button 
             onClick={() => {
                const form = document.getElementById('contato-form');
                if (form) form.scrollIntoView({ behavior: 'smooth' });
             }}
            className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            <MessageSquare size={20} className="text-green-400" />
            Solicitar Orçamento
          </button>
        </div>
      </div>
    </div>
  </div>
);

const Section = ({ id, title, subtitle, bg = "dark", children }: any) => (
  <section id={id} className={`py-24 ${bg === 'darker' ? 'bg-dark-950' : 'bg-slate-900'} relative overflow-hidden`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xl text-slate-400 max-w-3xl mx-auto">{subtitle}</p>}
        <div className="w-24 h-1 bg-gradient-to-r from-brand-500 to-purple-600 mx-auto mt-8 rounded-full"></div>
      </div>
      {children}
    </div>
  </section>
);

const FeatureCard = ({ icon: Icon, title, desc }: any) => (
  <div className="group glass-card p-8 rounded-3xl hover:bg-slate-800/80 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-2 h-full flex flex-col">
    <div className="w-16 h-16 bg-gradient-to-br from-brand-500/20 to-brand-500/5 rounded-2xl flex items-center justify-center text-brand-400 mb-8 group-hover:scale-110 transition-transform duration-300 border border-brand-500/10">
      <Icon size={32} />
    </div>
    <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-lg flex-grow">{desc}</p>
  </div>
);

const Timeline = () => {
  return (
    <div className="relative container mx-auto px-4">
      {/* Central Line for Desktop */}
      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-brand-500/50 via-purple-500/50 to-brand-500/50 rounded-full"></div>
      
      <div className="space-y-12 md:space-y-0">
        {PROCESS_STEPS.map((step, index) => (
          <div key={step.step} className={`md:flex items-center justify-between w-full relative group ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
            
            {/* Spacer for alternate side */}
            <div className="hidden md:block w-5/12"></div>
            
            {/* Center Node */}
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center">
              <div className="w-12 h-12 bg-slate-900 border-4 border-brand-500 rounded-full flex items-center justify-center z-10 shadow-[0_0_20px_rgba(14,165,233,0.4)] group-hover:scale-125 transition-transform duration-300">
                 <span className="text-white font-bold text-sm">{step.step}</span>
              </div>
            </div>

            {/* Content Card */}
            <div className="w-full md:w-5/12 pl-20 md:pl-0">
               <div className={`p-6 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-brand-500/30 transition-all duration-300 relative hover:-translate-y-1 hover:shadow-xl ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className={`absolute top-4 ${index % 2 === 0 ? 'md:right-full md:mr-8 right-full mr-4' : 'md:left-full md:ml-8 left-0 -ml-12'} hidden md:block text-brand-400 font-bold whitespace-nowrap`}>
                    {step.days}
                  </div>
                  {/* Mobile Days Label */}
                  <div className="md:hidden inline-block px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold mb-3 border border-brand-500/20">
                     Previsão: {step.days}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
               </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-16 text-center">
        <div className="inline-block p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
           <p className="text-green-400 font-bold flex items-center justify-center gap-2">
             <Rocket size={20} />
             Entrega completa entre 3 a 15 dias úteis
           </p>
        </div>
      </div>
    </div>
  );
};

// Contact Form Component
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    selectedPlans: [] as string[]
  });

  const togglePlan = (planTitle: string) => {
    setFormData(prev => {
      if (prev.selectedPlans.includes(planTitle)) {
        return { ...prev, selectedPlans: prev.selectedPlans.filter(p => p !== planTitle) };
      } else {
        return { ...prev, selectedPlans: [...prev.selectedPlans, planTitle] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const plansText = formData.selectedPlans.length > 0 ? formData.selectedPlans.join(', ') : 'Ainda não decidi';
    
    const message = `*Novo Contato via Site WebNova*\n\n` +
      `👤 *Nome:* ${formData.name}\n` +
      `📧 *Email:* ${formData.email}\n` +
      `📱 *Telefone:* ${formData.phone}\n` +
      `🚀 *Interesse nos planos:* ${plansText}\n\n` +
      `Gostaria de solicitar um orçamento!`;

    const url = `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div id="contato-form" className="max-w-4xl mx-auto bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
       <div className="grid md:grid-cols-5">
          <div className="md:col-span-2 bg-gradient-to-br from-brand-600 to-blue-900 p-10 text-white flex flex-col justify-between">
             <div>
                <h3 className="text-2xl font-bold mb-4">Vamos Conversar?</h3>
                <p className="text-brand-100 mb-8 opacity-90">Preencha o formulário e nossa equipe entrará em contato em instantes via WhatsApp.</p>
             </div>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Smartphone size={20}/></div>
                   <div>
                      <p className="text-xs text-brand-200 uppercase">WhatsApp</p>
                      <p className="font-bold">{CONTACT_PHONE_DISPLAY}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><MessageSquare size={20}/></div>
                   <div>
                      <p className="text-xs text-brand-200 uppercase">Atendimento</p>
                      <p className="font-bold">Seg - Sex, 09h às 18h</p>
                   </div>
                </div>
             </div>
          </div>
          <div className="md:col-span-3 p-10">
             <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                   <label className="block text-sm font-medium text-slate-400 mb-2">Seu Nome</label>
                   <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                      placeholder="Como podemos te chamar?"
                   />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Seu Email</label>
                      <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                          placeholder="melhor@email.com"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">WhatsApp / Telefone</label>
                      <input 
                          type="tel" 
                          required
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                          placeholder="(XX) 99999-9999"
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-400 mb-3">Quais planos te interessam? (Selecione)</label>
                   <div className="flex flex-wrap gap-2">
                      {PLANS.map(plan => (
                        <div 
                           key={plan.id}
                           onClick={() => togglePlan(plan.title)}
                           className={`cursor-pointer px-4 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${
                              formData.selectedPlans.includes(plan.title) 
                                ? 'bg-brand-500 border-brand-500 text-white' 
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-brand-500/50'
                           }`}
                        >
                           {formData.selectedPlans.includes(plan.title) ? <CheckSquare size={14} /> : <Square size={14} />}
                           {plan.title}
                        </div>
                      ))}
                   </div>
                </div>
                <button 
                   type="submit"
                   className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                   <MessageSquare size={20} />
                   Solicitar Orçamento no WhatsApp
                </button>
             </form>
          </div>
       </div>
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ plan, isOpen, onClose, currentUser }: { plan: any, isOpen: boolean, onClose: () => void, currentUser: User | null }) => {
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  // Estados para os Upsells
  const [includeHosting, setIncludeHosting] = useState(false);
  const [includeSupport, setIncludeSupport] = useState(false);

  // Reseta os estados quando o modal abre
  useEffect(() => {
    if (isOpen) {
        setIncludeHosting(false);
        setIncludeSupport(false);
        if (currentUser) {
            setUserEmail(currentUser.email);
        } else {
            setUserEmail('');
        }
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !plan) return null;

  // Busca o preço do suporte para o plano escolhido
  const supportPrice = VIP_SUPPORT_PRICES[plan.id as PlanType] || 250;
  
  // Cálculo do Total
  const total = plan.price + (includeHosting ? UPSALE_PRICE : 0) + (includeSupport ? supportPrice : 0);

  const handlePayment = async () => {
    if (!userEmail || !userEmail.includes('@')) {
        alert("Por favor, digite um e-mail válido para receber os detalhes da compra.");
        return;
    }

    setLoading(true);
    
    // Usa o email digitado (se não estiver logado) ou o do usuário (se estiver)
    const emailToUse = userEmail.trim();

    try {
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
                includeSupport: includeSupport, // Novo campo
                includeSupportPrice: includeSupport ? supportPrice : 0, // Envia o preço calculado
                email: emailToUse
            }),
        });

        if (response.ok) {
            const data = await response.json();
            window.location.href = data.url; 
        } else {
            const errorData = await response.json();
            // Aqui: Pega a mensagem detalhada enviada pelo servidor
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
              {/* Se não estiver logado, mostra input de email. Se estiver, mostra email readonly ou editável */}
              <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                      E-mail para envio do acesso: <span className="text-red-500">*</span>
                  </label>
                  <input 
                     type="email" 
                     placeholder="seu@email.com"
                     className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                     value={userEmail}
                     onChange={(e) => setUserEmail(e.target.value)}
                     disabled={!!currentUser} // Desabilita se já estiver logado para evitar erros
                  />
                  {currentUser && <p className="text-xs text-slate-500 mt-1">Logado como {currentUser.name}</p>}
              </div>

              <button 
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transform hover:-translate-y-1"
              >
                {loading ? <Loader2 className="animate-spin" /> : `Finalizar Compra`}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN LANDING PAGE ---

const LandingPage = ({ onPlanSelect, onLoginClick }: { onPlanSelect: (plan: any) => void, onLoginClick: () => void }) => {
  
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Testimonials Logic
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsToShow(1);
      else if (window.innerWidth < 1024) setItemsToShow(2);
      else setItemsToShow(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextTestimonial();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, itemsToShow]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % (TESTIMONIALS.length - itemsToShow + 1));
  };

  const prevTestimonial = () => {
     setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - itemsToShow : prev - 1));
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-50">
      <Navbar onLoginClick={onLoginClick} onScrollTo={scrollTo} />
      
      <Hero onCtaClick={() => scrollTo('planos')} />

      <Section id="quem-somos" title="Quem Somos" subtitle="Especialistas em criar experiências digitais que impulsionam negócios." bg="dark">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 space-y-8 text-slate-300 text-lg leading-relaxed">
            <p>
              Somos mais que uma agência de desenvolvimento. Somos parceiros do seu crescimento. 
              Nossa equipe multidisciplinar une <strong className="text-white">Design, Tecnologia e Marketing</strong> para entregar não apenas um site, 
              mas uma ferramenta poderosa de vendas.
            </p>
            <ul className="space-y-5">
              {[
                "Equipe de desenvolvedores sênior",
                "Especialistas em UI/UX Design",
                "Suporte Humanizado VIP",
                "Foco total em performance e SEO"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-4 group">
                  <div className="bg-green-500/10 p-2 rounded-lg group-hover:bg-green-500/20 transition-colors">
                     <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                  </div>
                  <span className="group-hover:text-white transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 md:order-2 relative">
            <div className="absolute -inset-4 bg-brand-500/20 rounded-2xl blur-2xl"></div>
            <img 
              src="https://picsum.photos/800/600?office" 
              alt="Team working" 
              className="relative rounded-2xl shadow-2xl border border-white/10 grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </Section>

      <Section id="vantagens" title="Por que escolher a WebNova?" bg="darker">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Code} 
            title="Código Personalizado" 
            desc="Nada de templates prontos. Desenvolvemos seu site linha a linha para máxima performance, segurança e exclusividade." 
          />
          <FeatureCard 
            icon={Smartphone} 
            title="Totalmente Responsivo" 
            desc="Seu site perfeito em qualquer tela. Mobile-first design garantindo a melhor experiência em celulares e tablets." 
          />
          <FeatureCard 
            icon={Rocket} 
            title="Alta Performance" 
            desc="Sites otimizados para o Google, carregamento ultrarrápido (Vercel) e melhores pontuações no Core Web Vitals." 
          />
          <FeatureCard 
            icon={Palette} 
            title="Design Exclusivo" 
            desc="Nossa equipe de UI/UX cria uma identidade visual única, alinhada com a psicologia das cores da sua marca." 
          />
          <FeatureCard 
            icon={Search} 
            title="SEO Otimizado" 
            desc="Estrutura de código preparada para que seu site seja encontrado facilmente pelos mecanismos de busca como o Google." 
          />
          <FeatureCard 
            icon={Headphones} 
            title="Suporte Humanizado" 
            desc="Sem robôs. Fale diretamente com nossa equipe técnica via WhatsApp para resolver qualquer questão rapidamente." 
          />
        </div>
      </Section>

      <Section id="como-trabalhamos" title="Como Trabalhamos" subtitle="Processo transparente e ágil para colocar sua empresa no topo." bg="dark">
         <Timeline />
      </Section>

      <Section id="planos" title="Nossos Planos" subtitle="Investimento transparente. Escolha a solução ideal para o seu momento." bg="darker">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`relative bg-slate-900 rounded-3xl flex flex-col border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.recommended ? 'border-brand-500 shadow-brand-500/20 scale-105 z-10' : 'border-slate-800 hover:border-slate-700'}`}>
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-brand-500/40">
                  Mais Popular
                </div>
              )}
              <div className="p-8 flex-grow">
                <h3 className="text-xl font-bold text-white mb-3">{plan.title}</h3>
                <p className="text-sm text-slate-400 mb-8 min-h-[40px]">{plan.description}</p>
                <div className="mb-8">
                  <span className="text-4xl font-extrabold text-white">R$ {plan.price.toFixed(2)}</span>
                  <span className="text-slate-500 font-medium">/único</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckCircle size={16} className="text-brand-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 pt-0 mt-auto">
                <button 
                  onClick={() => onPlanSelect(plan)}
                  className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                    plan.recommended 
                      ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-brand-500/30' 
                      : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  Contratar Agora <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="depoimentos" title="O que dizem nossos clientes" bg="dark">
        <div className="max-w-7xl mx-auto relative px-4 sm:px-10">
          
          <button onClick={prevTestimonial} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-slate-800 rounded-full text-white hover:bg-brand-600 transition-colors shadow-lg border border-slate-700">
            <ChevronLeft size={24} />
          </button>
          
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
            >
              {TESTIMONIALS.map((testimonial) => (
                <div 
                  key={testimonial.id}
                  className="flex-shrink-0 px-4"
                  style={{ width: `${100 / itemsToShow}%` }}
                >
                  <div className="bg-slate-800/50 border border-white/5 p-8 rounded-3xl h-full flex flex-col backdrop-blur-sm hover:border-brand-500/20 transition-all">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} className="text-amber-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-300 italic mb-6 flex-grow leading-relaxed">"{testimonial.content}"</p>
                    <div className="flex items-center gap-4 mt-auto">
                      <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full border-2 border-brand-500/50" />
                      <div>
                        <h5 className="font-bold text-white text-sm">{testimonial.name}</h5>
                        <p className="text-xs text-brand-400 uppercase font-medium">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={nextTestimonial} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-slate-800 rounded-full text-white hover:bg-brand-600 transition-colors shadow-lg border border-slate-700">
            <ChevronRight size={24} />
          </button>

          <div className="flex justify-center gap-2 mt-8">
             {Array.from({ length: TESTIMONIALS.length - itemsToShow + 1 }).map((_, idx) => (
               <button 
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-brand-500' : 'w-2 bg-slate-700'}`}
               />
             ))}
          </div>
        </div>
      </Section>

      <section className="py-24 bg-dark-950 relative">
         <div className="max-w-7xl mx-auto px-4">
             <div className="text-center mb-12">
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Pronto para começar?</h2>
               <p className="text-slate-400">Solicite seu orçamento agora mesmo.</p>
             </div>
             <ContactForm />
         </div>
      </section>

      <footer id="contato" className="bg-slate-950 border-t border-slate-900 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-brand-900/50">W</div>
              <span className="font-bold text-2xl text-white">WebNova</span>
            </div>
            <p className="text-slate-400 mb-8 max-w-sm leading-relaxed">
              Desenvolvemos soluções digitais de alto impacto para empresas que buscam liderança no mercado. Qualidade, rapidez e suporte premium.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
               <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all">
                <span className="sr-only">TikTok</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all">
                <span className="sr-only">YouTube</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 text-lg">Empresa</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><button onClick={() => scrollTo('quem-somos')} className="hover:text-brand-400 transition-colors">Quem Somos</button></li>
              <li><button onClick={() => scrollTo('vantagens')} className="hover:text-brand-400 transition-colors">Vantagens</button></li>
              <li><button onClick={() => scrollTo('planos')} className="hover:text-brand-400 transition-colors">Preços</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 text-lg">Contato</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-center gap-3">
                <Smartphone size={18} className="text-brand-500" /> {CONTACT_PHONE_DISPLAY}
              </li>
              <li className="flex items-center gap-3">
                <Globe size={18} className="text-brand-500" /> Florianópolis, SC
              </li>
            </ul>
            <a 
              href={`https://wa.me/${CONTACT_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-500 transition-all shadow-lg shadow-green-900/20"
            >
              <MessageSquare size={18} /> Falar agora
            </a>
          </div>
        </div>
        <div className="border-t border-slate-900 pt-8 text-center text-sm text-slate-600">
          © {new Date().getFullYear()} WebNova. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

// --- AUTH MOCK ---

const LoginModal = ({ isOpen, onClose, onLogin }: any) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Using Real Supabase Auth (Magic Link)
    const { error } = await loginWithEmail(email);

    if (error) {
      alert("Erro ao enviar login: " + error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10">
        
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-4">
               <Mail size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">Verifique seu Email</h2>
            <p className="text-slate-400 mb-6">Enviamos um link mágico de acesso para <strong>{email}</strong>.</p>
            <button onClick={onClose} className="text-brand-400 font-bold hover:text-brand-300">Fechar</button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-white">Acesse sua Conta</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder-slate-500"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-2">
                  Enviaremos um link de acesso para o seu email. Não precisa de senha.
                </p>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-500 transition-colors disabled:opacity-50 shadow-lg shadow-brand-900/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Entrar na Plataforma'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

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
          
          <button className="w-full flex items-center gap-3 px-4 py-3 text-white bg-brand-600/10 border border-brand-500/20 rounded-xl hover:bg-brand-600/20 transition-all">
            <Layout size={20} className="text-brand-400" /> Visão Geral
          </button>

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
        </div>

        <div className="p-4 m-4 bg-slate-800/50 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
             <img src={user.avatarUrl} className="w-10 h-10 rounded-full border border-slate-600" alt="avatar"/>
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

const DashboardHome = ({ user }: { user: User }) => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white mb-1">Olá, {user.name.split(' ')[0]} 👋</h1>
           <p className="text-slate-400">Aqui está o resumo do seu site hoje.</p>
        </div>
        <div className="inline-flex items-center px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-sm font-bold">
           <span className="w-2 h-2 bg-green-500 rounded-full mr-2 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
           Status: Site Ativo
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <ShieldCheck size={24} />
               </div>
            </div>
            <div className="text-slate-400 text-sm font-medium mb-1">Plano Atual</div>
            <div className="text-2xl font-bold text-white">{PLANS.find(p => p.id === user.plan)?.title || 'Admin'}</div>
            <div className="mt-4 text-xs text-slate-500">Expira em: {new Date(user.planExpiry || '').toLocaleDateString('pt-BR')}</div>
         </div>
         <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <MessageSquare size={24} />
               </div>
            </div>
            <div className="text-slate-400 text-sm font-medium mb-1">Suportes Restantes</div>
            <div className="text-2xl font-bold text-white">Ilimitado</div>
            <div className="mt-4 text-xs text-green-400 font-bold">VIP Ativado</div>
         </div>
         <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-brand-500/10 rounded-lg text-brand-400">
                  <Monitor size={24} />
               </div>
               <span className="text-green-400 text-xs font-bold bg-green-500/10 px-2 py-1 rounded">+12%</span>
            </div>
            <div className="text-slate-400 text-sm font-medium mb-1">Visitas (Este Mês)</div>
            <div className="text-2xl font-bold text-white">1.245</div>
            <div className="mt-4 text-xs text-slate-500">
               Total visualizações únicas
            </div>
         </div>
      </div>

      {/* Feature Specific Panels */}
      {user.plan === PlanType.BLOG && (
        <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-xl text-white">Últimas Postagens</h3>
            <button className="flex items-center gap-2 text-sm bg-brand-600 text-white px-5 py-2.5 rounded-xl hover:bg-brand-500 transition-colors font-medium">
              <Plus size={18} /> Nova Postagem
            </button>
          </div>
          <div className="space-y-4">
             {[1,2,3].map(i => (
               <div key={i} className="flex items-center justify-between p-5 bg-slate-800/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                  <div>
                    <div className="font-bold text-white mb-1">Como aumentar suas vendas online</div>
                    <div className="text-xs text-slate-500">Publicado em 12/10/2023 • 342 visualizações</div>
                  </div>
                  <button className="text-brand-400 text-sm font-medium hover:text-white transition-colors">Editar</button>
               </div>
             ))}
          </div>
        </div>
      )}

      {user.plan === PlanType.ECOMMERCE && (
        <div className="grid md:grid-cols-2 gap-6">
           <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-8">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-xl text-white">Pedidos Recentes</h3>
             </div>
             <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                     <div className="text-sm">
                       <span className="font-bold text-slate-200 block mb-1">#PED-00{i}</span>
                       <span className="block text-slate-500">R$ 149,90 • Pix</span>
                     </div>
                     <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-xs font-bold">Pendente</span>
                  </div>
                ))}
             </div>
           </div>
           <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-8">
              <h3 className="font-bold text-xl text-white mb-6">Ações Rápidas</h3>
              <div className="grid grid-cols-2 gap-4">
                 <button className="p-6 bg-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-300 hover:bg-brand-600 hover:text-white transition-all group">
                    <Plus size={28} className="mb-3 text-brand-500 group-hover:text-white" />
                    <span className="font-bold text-sm">Add Produto</span>
                 </button>
                 <button className="p-6 bg-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-300 hover:bg-purple-600 hover:text-white transition-all group">
                    <Settings size={28} className="mb-3 text-purple-500 group-hover:text-white" />
                    <span className="font-bold text-sm">Config Loja</span>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Common Support Area */}
      <div className="bg-gradient-to-r from-brand-900 to-slate-900 rounded-2xl shadow-xl border border-brand-500/20 p-8 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <div className="mb-6 md:mb-0 relative z-10">
            <h3 className="text-2xl font-bold mb-2">Precisa de ajuda com seu site?</h3>
            <p className="text-brand-100 text-sm max-w-lg">Nossa equipe de suporte VIP está disponível para realizar ajustes, tirar dúvidas ou auxiliar no marketing.</p>
         </div>
         <a href={`https://wa.me/${CONTACT_WHATSAPP}`} target="_blank" rel="noreferrer" className="relative z-10 px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-900/40 flex items-center gap-2 transform hover:-translate-y-1">
           <MessageSquare size={20} /> Chamar no WhatsApp
         </a>
      </div>
    </div>
  );
};

// --- APP ROOT ---

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  // Check active session on load
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        // Timeout de segurança: Se o Supabase demorar mais de 3s, libera a tela
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 3000));
        const userPromise = getCurrentUser();

        const user = await Promise.race([userPromise, timeoutPromise]) as User | null | undefined;

        if (mounted) {
          // Se for User (veio do getCurrentUser), seta. Se for undefined (timeout), assume null.
          setCurrentUser(user && 'id' in user ? user : null);
          setLoadingSession(false);
        }
      } catch (error) {
        console.error("Erro na verificação de sessão:", error);
        if (mounted) setLoadingSession(false);
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
         const user = await getCurrentUser();
         if (mounted) setCurrentUser(user);
      } else if (event === 'SIGNED_OUT') {
         if (mounted) setCurrentUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Handle plan selection from landing page
  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const handleLogout = async () => {
    // Optimistic UI: Limpa a tela imediatamente para evitar "travamento"
    setCurrentUser(null);
    setLoadingSession(false); 
    
    // Executa logout no background
    try {
        await logout();
    } catch (error) {
        console.error("Erro ao fazer logout no Supabase", error);
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (currentUser) {
    return (
      <DashboardLayout user={currentUser} onLogout={handleLogout}>
        <DashboardHome user={currentUser} />
      </DashboardLayout>
    );
  }

  return (
    <>
      <LandingPage 
        onPlanSelect={handlePlanSelect} 
        onLoginClick={() => setIsLoginOpen(true)}
      />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={(user: User) => setCurrentUser(user)} 
      />
      <PaymentModal 
        plan={selectedPlan} 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        currentUser={currentUser} // Pass current user to pre-fill email
      />
    </>
  );
}