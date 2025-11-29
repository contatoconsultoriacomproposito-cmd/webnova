export enum PlanType {
  NO_PLAN = 'NO_PLAN',
  ONE_PAGE = 'ONE_PAGE',
  INSTITUTIONAL = 'INSTITUTIONAL',
  BLOG = 'BLOG',
  ECOMMERCE = 'ECOMMERCE',
  ADMIN = 'ADMIN'
}

export interface OfferItem {
    id: string; // Ex: 'hosting-1y', 'domain-3y', 'support-3calls'
    title: string;
    description: string;
    price: number;
    // Campos opcionais específicos do tipo de oferta
    years?: number;
    calls?: number;
    campaigns?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanType; // Produto Principal: Tipo de Site
  planExpiry?: string;
  avatarUrl?: string;
  supportTicketsRemaining?: number | 'unlimited';

  // --- Serviços Adicionais (Produtos com Regras de Negócio de Tempo/Ativação) ---
  
  // 1. Serviço de Hospedagem
  hosting?: {
    active: boolean;
    expiryDate?: string; // Data de expiração anual/bianual
    planYears?: number;
  };
  
  // 2. Serviço de Registro de Domínio
  domain?: {
    active: boolean;
    expiryDate?: string; // Data de expiração anual
    domainName?: string;
  };
  
  // 3. Serviço de Suporte VIP Ilimitado
  vipSupport?: {
    active: boolean;
    expiryDate?: string; // Data de expiração anual
  };

  // 4. Serviço de Assinatura Recorrente (Gestão de Tráfego Pago)
  paidTraffic?: {
    active: boolean;
    planName?: string;
    subscriptionId?: string; // ID da assinatura na plataforma de pagamento (Mercado Pago, Stripe, etc.)
    currentPeriodEnd?: string; // Fim do período atual (para controle de renovação mensal)
  }
}

export interface PlanDetails {
  id: PlanType;
  title: string;
  price: number;
  features: string[];
  description: string;
  recommended?: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

export interface BlogPost {
  id: string;
  title: string;
  status: 'draft' | 'published';
  views: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}