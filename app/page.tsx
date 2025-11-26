'use client';

import React, { useState, useEffect, useRef } from 'react';
// IMPORTANTE: Mantenha todos os seus imports de lucide-react, pois seus componentes visuais (Navbar, Hero, etc.) os utilizam
import { Layout, Menu, X, CheckCircle, Smartphone, Globe, Code, Rocket, ChevronRight, Star, ArrowRight, Monitor, ShoppingBag, FileText, Settings, Users, LogOut, Plus, MessageSquare, ShieldCheck, Palette, Search, Headphones, ChevronLeft, Mail, CheckSquare, Square, Loader2, Server, Lock, AlertTriangle, LifeBuoy } from 'lucide-react';
import { PlanType, User } from './types';
import { PLANS, CONTACT_PHONE_DISPLAY, CONTACT_WHATSAPP, TESTIMONIALS, PROCESS_STEPS, UPSALE_PRICE, VIP_SUPPORT_MULTIPLIER, DOMAIN_PRICES, HOSTING_PRICES } from './constants';
import { loginWithGoogle, getCurrentUser, logout } from './services/authService';
import { supabase } from './supabaseClient';
import { redirect } from 'next/navigation'; // <-- NOVO IMPORT OBRIGATÓRIO PARA REDIRECIONAMENTO
import { useRouter } from 'next/navigation'; // <-- Importe o useRouter


// --- COMPONENTES VISUAIS (NAVBAR, HERO, ETC) ---

const Navbar = ({ onLoginClick, onScrollTo, user }: { onLoginClick: () => void, onScrollTo: (id: string) => void, user: User | null }) => {
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
              {user ? (
                  <button 
                    onClick={() => window.location.reload()} 
                    className="bg-brand-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-brand-50 transition-all shadow-lg flex items-center gap-2"
                  >
                    Ir para Painel <ChevronRight size={16} />
                  </button>
              ) : (
                  <button 
                    onClick={onLoginClick}
                    className="bg-white text-slate-950 px-6 py-2.5 rounded-full font-bold hover:bg-brand-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] flex items-center gap-2 transform hover:-translate-y-0.5"
                  >
                    Login / Entrar <ChevronRight size={16} />
                  </button>
              )}
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
                if(user) window.location.reload();
                else onLoginClick();
                setIsOpen(false);
              }}
              className="w-full text-left block px-4 py-4 text-xl font-bold text-brand-400 bg-brand-500/10 mt-8 rounded-xl border border-brand-500/20"
            >
              {user ? 'Acessar Painel' : 'Login / Entrar'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

// app/page.tsx - NOVO COMPONENTE

const AuthRedirector = ({ currentUser }: { currentUser: User | null }) => {
      const router = useRouter(); // <-- Inicialize o hook

      // O código de isClient/useEffect é bom para garantir que roda apenas no navegador.
      const [isClient, setIsClient] = useState(false);
      
      useEffect(() => {
          setIsClient(true);
      }, []);

      // 1. Se não for cliente, não faz nada.
      if (!isClient) {
          return null;
      }

      // 2. Se o usuário está logado E já estamos no Client-Side, verificamos o redirecionamento.
      if (currentUser) {
          // Usamos window.location.search para obter ?bypassAuth=true
          const bypassAuth = window.location.search.includes('bypassAuth=true');

          // Se o usuário está logado E NÃO tem o bypass na URL, redirecionamos para /app
          if (!bypassAuth) {
              // CORREÇÃO CRÍTICA: Use router.replace para Client-Side Navigation
              router.replace('/app');
              return null; // Pare de renderizar assim que o redirecionamento for acionado
          }
      }

      // Se não está logado OU tem bypass, retorna null e renderiza a Landing Page
      return null; 
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

// --- AUTH COMPONENTS ---

const LoginModal = ({ isOpen, onClose, onLogin }: any) => {
  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    const { error } = await loginWithGoogle();
    if (error) alert(error.message);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10 text-center">
        <div className="w-16 h-16 bg-brand-600/20 rounded-full flex items-center justify-center text-brand-500 mx-auto mb-6">
            <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white">Login Necessário</h2>
        <p className="text-slate-400 mb-8">Para continuar com a contratação, acesse sua conta ou cadastre-se gratuitamente.</p>
        
        <button 
        type="button"
        onClick={handleGoogleLogin}
        className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-3 shadow-lg group"
        >
        <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Continuar com Google
        <ArrowRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform"/>
        </button>
        
        <p className="text-xs text-slate-500 mt-6">Ao continuar, você concorda com nossos Termos de Uso.</p>
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
      <Navbar onLoginClick={onLoginClick} onScrollTo={scrollTo} user={null} />
      
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

// --- APP ROOT ---

// --- INÍCIO DA FUNÇÃO HOME ATUALIZADA ---

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const mounted = useRef(true);

  // ARQUIVO: app/page.tsx - Dentro de export default function Home()

useEffect(() => {
      // ... (fetchUser - Mantenha este bloco)
      const fetchUser = async () => {
          const user = await getCurrentUser();
          // REMOVA QUALQUER REDIRECIONAMENTO OU CHECAGEM DE user AQUI
          if (mounted.current) setCurrentUser(user);
          if (mounted.current) setLoadingSession(false);
      };
      fetchUser();
      
      // Mantenha o onAuthStateChange APENAS para o redirect após SIGNED_IN
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (_event === 'SIGNED_IN' && session) {
          // ESSA LINHA É CRUCIAL PARA O LOGIN GOOGLE/OAUTH
          redirect('/app');
        }
      });

      return () => {
        mounted.current = false;
        subscription.unsubscribe();
      };
      // Mantenha a array de dependências vazia, [], se não estiver usando bypassAuth como dependência.
  }, []);

  const handlePlanSelect = (plan: any) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  // Se a sessão está carregando, mostra o loader.
  // Se currentUser for verdadeiro, o redirect('/app') será executado no useEffect.
  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  // Se não estiver logado e não estiver carregando, renderiza a Landing Page (Rota Pública)
  return (
    <>
      {/* NOVO: Componente que gerencia o redirecionamento */}
      <AuthRedirector currentUser={currentUser} />
      
      {/* Assumindo que LandingPage é o componente que agrega toda a sua homepage */}
      <LandingPage 
        onPlanSelect={handlePlanSelect} 
        onLoginClick={() => setIsLoginOpen(true)}
      />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        // Não precisamos fazer nada no onLogin, pois o onAuthStateChange fará o redirect
        onLogin={() => {}} 
      />
    </>
  );
}