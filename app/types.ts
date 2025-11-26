export enum PlanType {
  NO_PLAN = 'NO_PLAN',
  ONE_PAGE = 'ONE_PAGE',
  INSTITUTIONAL = 'INSTITUTIONAL',
  BLOG = 'BLOG',
  ECOMMERCE = 'ECOMMERCE',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  planExpiry?: string;
  avatarUrl?: string;
  // Novos campos para controle de serviços
  hosting?: {
    active: boolean;
    expiryDate?: string;
    planYears?: number;
  };
  domain?: {
    active: boolean;
    expiryDate?: string;
    domainName?: string;
  };
  vipSupport?: {
    active: boolean;
    expiryDate?: string;
  };
  supportTicketsRemaining?: number | 'unlimited';
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