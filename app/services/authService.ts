import { supabase } from '../supabaseClient';
import { User, PlanType } from '../types';

// Função auxiliar para transformar os dados do banco no Tipo User do nosso app
const mapProfileToUser = (profile: any, authId: string, email: string): User => {
  return {
    id: authId,
    name: profile.full_name || 'Usuário',
    email: email,
    plan: (profile.role as PlanType) || PlanType.INSTITUTIONAL,
    planExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), 
    avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'U')}&background=0ea5e9&color=fff`
  };
};

export const loginWithEmail = async (email: string) => {
  // Lógica de Redirecionamento Inteligente:
  // 1. Tenta usar a URL configurada na Vercel (NEXT_PUBLIC_BASE_URL)
  // 2. Se não existir, tenta pegar a origem do navegador (window.location.origin)
  // 3. Fallback final para localhost:3000
  
  let redirectTo = 'http://localhost:3000';

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    redirectTo = process.env.NEXT_PUBLIC_BASE_URL;
  } else if (typeof window !== 'undefined') {
    redirectTo = window.location.origin;
  }

  // Remove barra final se existir para evitar URLs duplas (ex: .com//)
  redirectTo = redirectTo.replace(/\/$/, '');

  // Login via Magic Link (Email sem senha)
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo, // URL correta para onde o usuário volta
      shouldCreateUser: true,
      data: {
        full_name: email.split('@')[0],
        avatar_url: '',
      }
    }
  });
  return { data, error };
};

export const getCurrentUser = async (): Promise<User | null> => {
  // 1. Pega a sessão ativa
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) return null;

  // 2. Busca os dados extras na tabela 'profiles'
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    console.error('Erro ao buscar perfil:', error);
    // Se tiver sessão mas não tiver perfil (erro raro), retorna null
    return null;
  }

  return mapProfileToUser(profile, session.user.id, session.user.email!);
};

export const logout = async () => {
  await supabase.auth.signOut();
};