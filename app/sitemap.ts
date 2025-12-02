// app/sitemap.ts

import { MetadataRoute } from 'next';

// Use a variável de ambiente que você já configurou no Vercel (Tópico 2)
// Exemplo: process.env.NEXT_PUBLIC_BASE_URL
const BASE_URL = 'https://321site.com.br'; 

// A função deve ser exportada como default
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  
  // 1. Definição das páginas estáticas obrigatórias:
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: BASE_URL, // Sua página inicial
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1, // Prioridade máxima
    },
    {
      // Substitua pelo caminho da sua página de serviços/produtos
      url: `${BASE_URL}/services`, 
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Adicione outras páginas estáticas aqui, como /about, /contact, etc.
  ];

  // 2. Lógica para conteúdo dinâmico (Se o seu SaaS gera páginas):
  // Se você tiver URLs dinâmicas (ex: /site/[id] ou /blog/[slug]),
  // você deve fazer um fetch dos dados do Supabase aqui.
  
  // Exemplo de como seria o fetch e mapeamento (DEVE SER ADAPTADO):
  /*
  const dynamicItems = await getDynamicItemsFromSupabase(); // Use sua função de fetch

  const dynamicUrls = dynamicItems.map(item => ({
    url: `${BASE_URL}/sites/${item.slug}`, // Adapte para sua rota
    lastModified: new Date(item.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));
  */

  // 3. Retorne a combinação
  return [
    ...staticUrls,
    // ...(dynamicUrls || []), // Descomente e inclua as URLs dinâmicas quando a lógica estiver pronta
  ];
}