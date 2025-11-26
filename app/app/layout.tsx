// app/app/layout.tsx (Este é um Server Component por padrão)
import { redirect } from 'next/navigation';
// Ajuste o caminho para seu authService.ts conforme a estrutura de pastas
import { getCurrentUser } from '../services/authService'; 
import React from 'react';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // AQUI É O SERVIDOR - CHAMADA SEGURA
  const user = await getCurrentUser();

  // Se não houver usuário logado (user === null), redireciona.
  if (!user) {
    redirect('/');
  }
  
  // Se o usuário existir, passa o controle para o Client Component (page.tsx)
  return <>{children}</>;
}