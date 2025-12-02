import { PlanType, PlanDetails, Testimonial } from './types';

export const CONTACT_WHATSAPP = '5548996536507'; 
export const CONTACT_PHONE_DISPLAY = '(48) 99653-6507';
export const UPSALE_PRICE = 999.99; // Mantido para compatibilidade com testes antigos, mas a lógica nova usará as tabelas abaixo.

// TABELAS DE PREÇOS - NOVAS REGRAS DE NEGÓCIO

// Domínio
export const DOMAIN_PRICES = [
  { years: 1, price: 100.00, supportsBonus: 3, label: '1 Ano' },
  { years: 2, price: 150.00, supportsBonus: 5, label: '2 Anos' },
  { years: 3, price: 200.00, supportsBonus: 10, label: '3 Anos' },
];

// Hospedagem
export const HOSTING_PRICES = [
  { years: 1, price: 150.00, supportsBonus: 3, label: '1 Ano' },
  { years: 2, price: 250.00, supportsBonus: 5, label: '2 Anos' },
  { years: 3, price: 300.00, supportsBonus: 10, label: '3 Anos' },
];

// pacote de suportes
export const SUPPORT_PACKAGES = [
  { calls: 3, price: 525.00, label: '3 Chamados' },
  { calls: 5, price: 750.00, label: '5 Chamados' },
  { calls: 8, price: 1000.00, label: '8 Chamados' },
];

// O preço da oferta agregada
export const OFFER_HOSTING_YEARS = 1;
export const OFFER_DOMAIN_YEARS = 1;
export const OFFER_SUPPORT_CALLS = 3;
export const OFFER_ADS_CAMPAIGNS = 5;
export const ADS_OFFER_PRICE = 0.33;

// O preço do Suporte VIP é calculado dinamicamente: Valor do Plano * 0.75
export const VIP_SUPPORT_MULTIPLIER = 0.75;

// Serviços de Assinatura
// ⚠️ NOVO CAMPO: Preço Mensal da Gestão de Tráfego Pago
export const ADS_PRICES = [
  { campaigns: 'Até 5 Campanhas', price: 750.00, id: 'ads_basic', label: 'Iniciante' },
  { campaigns: '6 a 10 Campanhas', price: 1250.00, id: 'ads_pro', label: 'Profissional' },
  { campaigns: '11 a 20 Campanhas', price: 1750.00, id: 'ads_advanced', label: 'Empresarial' }
];

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
    content: "O trabalho da 321Sites foi excepcional. Minha Landing Page converteu 3x mais que a antiga. O suporte é realmente VIP e me ajudaram em cada etapa.",
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
    role: "Dentista",
    content: "Frequentemente recebo clientes vindos do Google que acessaram meu site e se impressionaram. a 321Site faz um exímio trabalho.",
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