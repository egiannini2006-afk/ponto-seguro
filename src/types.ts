export type TipoLocal = 'onibus' | 'metro' | 'apoio'

export type TipoOcorrencia =
  | 'assalto'
  | 'furto'
  | 'assedio'
  | 'sem_luz'
  | 'suspeita'
  | 'outro'

export interface LinhaOnibus {
  codigo: string
  minutos: number
}

export interface InfoMetro {
  linha: string
  status: string
  intervaloMin: number
}

export interface Ocorrencia {
  id: string
  tipo: TipoOcorrencia
  descricao?: string
  timestamp: number
  confirmacoes: number
  resolvida: boolean
}

export interface Local {
  id: string
  nome: string
  tipo: TipoLocal
  lat: number
  lng: number
  baseMulheres: number
  linhas?: LinhaOnibus[]
  metro?: InfoMetro
  ocorrencias: Ocorrencia[]
}

export interface ContatoConfianca {
  nome: string
  telefone: string
}

export interface Perfil {
  nome: string
  email: string
  universitariaVerificada: boolean
  cadastroCompleto: boolean
}

export interface Patrocinadora {
  id: string
  nome: string
  logoSvg: string
}

export interface Cupom {
  id: string
  patrocinadoraId: string
  titulo: string
  custoPontos: number
}

export interface AppState {
  schemaVersion: number
  perfil: Perfil
  consentimentoMapeamento: boolean
  contatos: ContatoConfianca[]
  checkedInLocalId: string | null
  pontos: number
  trajetosConcluidos: number
  relatosEnviados: number
  ocorrenciasConfirmadasIds: string[]
  modoApresentacao: boolean
  locais: Local[]
}

export type Aba = 'radar' | 'trajeto' | 'beneficios' | 'perfil'
