import type { Local, Patrocinadora, Cupom, Ocorrencia } from '../types'

/** Localização fixa da usuária, perto da FGV (Av. 9 de Julho). Não usa GPS real. */
export const LOCALIZACAO_USUARIA = { lat: -23.5733, lng: -46.6523 }

const MIN = 60 * 1000
const agora = () => Date.now()

function ocorrencia(
  id: string,
  tipo: Ocorrencia['tipo'],
  minutosAtras: number,
  confirmacoes = 0,
  descricao?: string,
): Ocorrencia {
  return {
    id,
    tipo,
    descricao,
    timestamp: agora() - minutosAtras * MIN,
    confirmacoes,
    resolvida: false,
  }
}

/** Dados iniciais dos ~15 locais da região Paulista/Consolação. Valores de E1-E6 são exatos, conforme o briefing. */
export const LOCAIS_INICIAIS: Local[] = [
  // --- 5 locais obrigatórios (valores exatos dos testes) ---
  {
    id: 'onibus-9-julho-fgv',
    nome: 'Ponto Av. 9 de Julho · FGV',
    tipo: 'onibus',
    lat: -23.5726,
    lng: -46.6515,
    baseMulheres: 2,
    linhas: [
      { codigo: '875A-10', minutos: 4 },
      { codigo: '701U-10', minutos: 11 },
    ],
    ocorrencias: [],
  },
  {
    id: 'metro-consolacao',
    nome: 'Estação Consolação',
    tipo: 'metro',
    lat: -23.5578,
    lng: -46.6603,
    baseMulheres: 12,
    metro: { linha: 'Linha 2-Verde', status: 'Operação normal', intervaloMin: 3 },
    ocorrencias: [],
  },
  {
    id: 'onibus-paulista-casper-libero',
    nome: 'Ponto Av. Paulista · Cásper Líbero',
    tipo: 'onibus',
    lat: -23.5631,
    lng: -46.6565,
    baseMulheres: 9,
    linhas: [
      { codigo: '8000-10', minutos: 6 },
      { codigo: '5143-10', minutos: 13 },
    ],
    ocorrencias: [],
  },
  {
    id: 'onibus-rua-augusta',
    nome: 'Ponto Rua Augusta',
    tipo: 'onibus',
    lat: -23.5571,
    lng: -46.6625,
    baseMulheres: 4,
    linhas: [
      { codigo: '875A-10', minutos: 9 },
      { codigo: '107T-10', minutos: 2 },
    ],
    ocorrencias: [ocorrencia('oc-augusta-furto', 'furto', 25, 3, 'Tentativa de furto perto do ponto')],
  },
  {
    id: 'onibus-consolacao-mackenzie',
    nome: 'Ponto Rua da Consolação · Mackenzie',
    tipo: 'onibus',
    lat: -23.5484,
    lng: -46.6531,
    baseMulheres: 1,
    linhas: [
      { codigo: '809P-10', minutos: 7 },
      { codigo: '917H-10', minutos: 14 },
    ],
    // expirada (mais de 3h) — não deve aparecer em nenhuma tela
    ocorrencias: [ocorrencia('oc-mackenzie-semluz', 'sem_luz', 4 * 60, 1, 'Poste apagado em frente ao ponto')],
  },

  // --- mais 5 estações de metrô ---
  {
    id: 'metro-paulista',
    nome: 'Estação Paulista',
    tipo: 'metro',
    lat: -23.5595,
    lng: -46.6627,
    baseMulheres: 7,
    metro: { linha: 'Linha 4-Amarela', status: 'Operação normal', intervaloMin: 4 },
    ocorrencias: [],
  },
  {
    id: 'metro-trianon-masp',
    nome: 'Trianon-MASP',
    tipo: 'metro',
    lat: -23.5614,
    lng: -46.6558,
    baseMulheres: 3,
    metro: { linha: 'Linha 2-Verde', status: 'Operação normal', intervaloMin: 3 },
    ocorrencias: [ocorrencia('oc-trianon-suspeita', 'suspeita', 50, 1, 'Pessoa rondando a entrada da estação')],
  },
  {
    id: 'metro-brigadeiro',
    nome: 'Brigadeiro',
    tipo: 'metro',
    lat: -23.568,
    lng: -46.6465,
    baseMulheres: 0,
    metro: { linha: 'Linha 2-Verde', status: 'Operação normal', intervaloMin: 3 },
    ocorrencias: [],
  },
  {
    id: 'metro-higienopolis-mackenzie',
    nome: 'Higienópolis-Mackenzie',
    tipo: 'metro',
    lat: -23.545,
    lng: -46.6524,
    baseMulheres: 5,
    metro: { linha: 'Linha 4-Amarela', status: 'Operação normal', intervaloMin: 4 },
    ocorrencias: [],
  },
  {
    id: 'metro-clinicas',
    nome: 'Clínicas',
    tipo: 'metro',
    lat: -23.5552,
    lng: -46.6706,
    baseMulheres: 2,
    metro: { linha: 'Linha 2-Verde', status: 'Intervalo maior que o normal', intervaloMin: 6 },
    ocorrencias: [],
  },

  // --- mais 5 pontos de ônibus ---
  {
    id: 'onibus-reboucas-patio',
    nome: 'Ponto Av. Rebouças · Shopping Pátio',
    tipo: 'onibus',
    lat: -23.5655,
    lng: -46.6708,
    baseMulheres: 6,
    linhas: [
      { codigo: '6291-10', minutos: 5 },
      { codigo: '7181-10', minutos: 12 },
    ],
    ocorrencias: [ocorrencia('oc-reboucas-assedio', 'assedio', 60, 1, 'Comentários constrangedores de um homem no ponto')],
  },
  {
    id: 'onibus-brigadeiro-luis-antonio',
    nome: 'Ponto Av. Brigadeiro Luís Antônio',
    tipo: 'onibus',
    lat: -23.5685,
    lng: -46.648,
    baseMulheres: 0,
    linhas: [{ codigo: '6020-10', minutos: 8 }],
    ocorrencias: [],
  },
  {
    id: 'onibus-alameda-santos',
    nome: 'Ponto Alameda Santos',
    tipo: 'onibus',
    lat: -23.5665,
    lng: -46.654,
    baseMulheres: 3,
    linhas: [{ codigo: '8700-21', minutos: 3 }],
    ocorrencias: [ocorrencia('oc-santos-suspeita', 'suspeita', 40, 2, 'Movimentação estranha na esquina')],
  },
  {
    id: 'onibus-alameda-franca',
    nome: 'Ponto Alameda Franca',
    tipo: 'onibus',
    lat: -23.5605,
    lng: -46.658,
    baseMulheres: 11,
    linhas: [
      { codigo: '875A-10', minutos: 7 },
      { codigo: '8012-10', minutos: 10 },
    ],
    ocorrencias: [],
  },
  {
    id: 'onibus-paulista-masp',
    nome: 'Ponto Av. Paulista · MASP',
    tipo: 'onibus',
    lat: -23.5608,
    lng: -46.655,
    baseMulheres: 8,
    linhas: [
      { codigo: '8000-10', minutos: 2 },
      { codigo: '6450-10', minutos: 15 },
    ],
    ocorrencias: [],
  },

  // --- 3 lugares de apoio ---
  {
    id: 'apoio-cafe-aurora',
    nome: 'Café Aurora',
    tipo: 'apoio',
    lat: -23.5575,
    lng: -46.662,
    baseMulheres: 0,
    ocorrencias: [],
  },
  {
    id: 'apoio-farmacia-bem-estar',
    nome: 'Farmácia Bem-Estar',
    tipo: 'apoio',
    lat: -23.559,
    lng: -46.66,
    baseMulheres: 0,
    ocorrencias: [],
  },
  {
    id: 'apoio-livraria-refugio',
    nome: 'Livraria Refúgio',
    tipo: 'apoio',
    lat: -23.572,
    lng: -46.651,
    baseMulheres: 0,
    ocorrencias: [],
  },
]

/** Marcas patrocinadoras fictícias — logos simples em SVG, sem usar marcas reais. */
export const PATROCINADORAS: Patrocinadora[] = [
  {
    id: 'novacred',
    nome: 'NovaCred',
    logoSvg:
      '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="10" fill="#4A0F38"/><path d="M14 32V16h4.2l9.6 11.4V16H32v16h-4.2L18.2 20.6V32Z" fill="#fff"/></svg>',
  },
  {
    id: 'vitalis',
    nome: 'Vitalis Saúde',
    logoSvg:
      '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="10" fill="#7A1F5C"/><path d="M24 12c-4 4.5-9 9.3-9 14.6A9 9 0 0 0 24 36a9 9 0 0 0 9-9.4C33 21.3 28 16.5 24 12Z" fill="#fff"/></svg>',
  },
  {
    id: 'rotanova',
    nome: 'RotaNova Mobilidade',
    logoSvg:
      '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="10" fill="#E0457B"/><path d="M12 30 22 16l4 6 4-5 6 13" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
]

export const CUPONS: Cupom[] = [
  { id: 'cupom-cafe', patrocinadoraId: 'novacred', titulo: 'Café grátis · Café Aurora', custoPontos: 100 },
  { id: 'cupom-farmacia', patrocinadoraId: 'vitalis', titulo: '10% de desconto · Farmácia Bem-Estar', custoPontos: 80 },
  { id: 'cupom-transporte', patrocinadoraId: 'rotanova', titulo: 'R$ 5 de crédito de transporte', custoPontos: 150 },
]

export const PATROCINADORA_PRINCIPAL = PATROCINADORAS[0]

/** Destinos simples para a simulação de trajeto protegido, com duração estimada em minutos. */
export const DESTINOS_TRAJETO: { nome: string; duracaoMin: number }[] = [
  { nome: 'Pinheiros', duracaoMin: 22 },
  { nome: 'Vila Madalena', duracaoMin: 18 },
  { nome: 'Faria Lima', duracaoMin: 15 },
  { nome: 'Centro', duracaoMin: 25 },
  { nome: 'Ibirapuera', duracaoMin: 12 },
]
