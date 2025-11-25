import { PlanType, PlanDetails, Testimonial } from './types';

export const CONTACT_WHATSAPP = '5548996536507'; 
export const CONTACT_PHONE_DISPLAY = '(48) 99653-6507';
export const UPSALE_PRICE = 0.50; // Mantido para compatibilidade com testes antigos, mas a lógica nova usará as tabelas abaixo.

// TABELAS DE PREÇOS - NOVAS REGRAS DE NEGÓCIO

// Domínio
export const DOMAIN_PRICES = [
  { years: 1, price: 100.00, supportsBonus: 3, label: '1 Ano' },
  { years: 2, price: 180.00, supportsBonus: 5, label: '2 Anos' },
  { years: 3, price: 250.00, supportsBonus: 10, label: '3 Anos' },
];

// Hospedagem
export const HOSTING_PRICES = [
  { years: 1, price: 150.00, supportsBonus: 3, label: '1 Ano' },
  { years: 2, price: 275.00, supportsBonus: 5, label: '2 Anos' },
  { years: 3, price: 350.00, supportsBonus: 10, label: '3 Anos' },
];

// O preço do Suporte VIP é calculado dinamicamente: Valor do Plano * 0.75
export const VIP_SUPPORT_MULTIPLIER = 0.75;

// CREDENCIAIS DO MERCADO PAGO
export const MP_ACCESS_TOKEN = 'APP_USR-7307423595236182-112414-d6ae49903b7f882f9979cf8dd126ec92-371667048';

// CREDENCIAIS ADMIN SUPABASE
export const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0aWNnZmFmbGh4bWJuZXN3enZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDAwNzgzNCwiZXhwIjoyMDc5NTgzODM0fQ.ylSjTiN4K6t4a23fa4cXZwqkter3xze3XT0zFw1cfq0'; 

export const PLANS: PlanDetails[] = [
  {
    id: PlanType.ONE_PAGE,
    title: 'One Page / Landing Page',
    price: 697.00,
    description: 'Ideal para campanhas de vendas e profissionais liberais.',
    features: [
      'Site de página única (rolagem)',
      'Design focado em conversão',
      'Integração com WhatsApp',
      'Botões de Chamada para Ação',
      'Otimizado para Mobile'
    ]
  },
  {
    id: PlanType.INSTITUTIONAL,
    title: 'Institucional',
    price: 997.00,
    description: 'Para empresas que precisam apresentar seus serviços.',
    features: [
      'Até 5 páginas',
      'Página "Quem Somos" & "Serviços"',
      'Formulário de Contato Avançado',
      'Integração com Redes Sociais',
      'Mapa de Localização'
    ],
    recommended: true
  },
  {
    id: PlanType.BLOG,
    title: 'Portal de Notícias / Blog',
    price: 1997.00,
    description: 'Site dinâmico para produtores de conteúdo.',
    features: [
      'Área Administrativa para Posts',
      'Categorias e Tags ilimitadas',
      'Sistema de Comentários',
      'Otimização SEO Avançada',
      'Compartilhamento Social'
    ]
  },
  {
    id: PlanType.ECOMMERCE,
    title: 'Loja Virtual',
    price: 2997.00,
    description: 'Venda seus produtos online com segurança.',
    features: [
      'Cadastro de Produtos e Categorias',
      'Carrinho de Compras',
      'Cálculo de Frete',
      'Integração de Pagamento',
      'Painel de Gestão de Pedidos'
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Ricardo Silva",
    role: "CEO da TechStart",
    content: "O trabalho da WebNova foi excepcional. Minha Landing Page converteu 3x mais que a antiga. O suporte é realmente VIP e me ajudaram em cada etapa.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5
  },
  {
    id: 2,
    name: "Mariana Lima",
    role: "Advogada Trabalhista",
    content: "Profissionalismo do início ao fim. O site institucional passou a credibilidade que meu escritório precisava para fechar grandes contratos.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5
  },
  {
    id: 3,
    name: "Carlos Eduardo",
    role: "Dono da ModaStore",
    content: "O E-commerce ficou incrível. O painel administrativo é muito fácil de usar para cadastrar meus produtos e controlar o estoque.",
    avatar: "https://randomuser.me/api/portraits/men/85.jpg",
    rating: 5
  },
  {
    id: 4,
    name: "Fernanda Souza",
    role: "Nutricionista",
    content: "Adorei o design clean e moderno. Meus pacientes elogiam muito a facilidade de agendar consultas pelo site novo.",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    rating: 5
  },
  {
    id: 5,
    name: "Roberto Campos",
    role: "Corretor de Imóveis",
    content: "A integração com o WhatsApp facilitou muito meu atendimento. Vendo muito mais imóveis agora que o site é rápido.",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    rating: 5
  },
  {
    id: 6,
    name: "Juliana Mendes",
    role: "Influenciadora",
    content: "Meu blog ficou lindo! Consigo postar minhas dicas de viagem super rápido e o layout se adapta perfeito no celular.",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    rating: 5
  },
  {
    id: 7,
    name: "André Torres",
    role: "Personal Trainer",
    content: "O site One Page foi o investimento certo. Direto ao ponto, com meus planos e botão de pagamento. Excelente!",
    avatar: "https://randomuser.me/api/portraits/men/54.jpg",
    rating: 5
  },
  {
    id: 8,
    name: "Patrícia Alves",
    role: "Dona de Clínica de Estética",
    content: "Estou impressionada com a velocidade de entrega. Em 5 dias meu site estava no ar e já recebendo visitas.",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    rating: 5
  },
  {
    id: 9,
    name: "Lucas Pereira",
    role: "Fotógrafo",
    content: "O portfólio ficou incrível. As imagens carregam rápido e a qualidade visual é surpreendente. Recomendo demais.",
    avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    rating: 5
  },
  {
    id: 10,
    name: "Beatriz Costa",
    role: "Psicóloga",
    content: "Equipe atenciosa e muito técnica. Entenderam exatamente o que eu precisava para transmitir acolhimento no meu site.",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    rating: 5
  }
];

export const PROCESS_STEPS = [
  { step: 1, title: 'Briefing e Contratação', desc: 'Reunião inicial para entender seus objetivos e assinatura do contrato.', days: 'Dia 1' },
  { step: 2, title: 'Pesquisa de Mercado', desc: 'Análise aprofundada de concorrentes e tendências do seu nicho.', days: 'Dias 2-3' },
  { step: 3, title: 'Proposta Visual', desc: 'Apresentação de layouts e identidade visual para aprovação.', days: 'Dia 4-5' },
  { step: 4, title: 'Programação Web & Mobile', desc: 'Desenvolvimento do código limpo, rápido e responsivo (Next.js).', days: 'Dias 6-12' },
  { step: 5, title: 'Ajustes Finais', desc: 'Refinamento de detalhes, SEO básico e testes de usabilidade.', days: 'Dias 13-14' },
  { step: 6, title: 'Entrega e Publicação', desc: 'Site no ar, configuração de domínio e treinamento do painel.', days: 'Dia 15' },
];