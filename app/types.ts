export enum PlanType {
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

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  date: string;
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