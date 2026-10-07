import type { Local, Ocorrencia } from '../types'

/**
 * Regras de negócio do Ponto Seguro (R1 a R10 do briefing).
 * Fica tudo num só lugar para que qualquer mudança futura não acabe quebrando o fluxo da demo.
 */

const TRES_HORAS_MS = 3 * 60 * 60 * 1000
const MIN_MS = 60 * 1000

export const PONTOS_BENEFICIO = {
  trajetoConcluido: 10,
  ocorrenciaRelatada: 15,
  ocorrenciaConfirmada: 5,
} as const

export const SOS_SEGURAR_MS = 3000

/** R: janela para responder "Está tudo bem?" antes de avisar os contatos com a última localização. */
export const TEMPO_PERGUNTA_TUDO_BEM_MS = 30 * 1000

/** No modo apresentação, o aviso "Está tudo bem?" dispara ~30s após iniciar o trajeto, não no tempo real estimado. */
export const TEMPO_LIMITE_APRESENTACAO_MS = 30 * 1000

export const TIPOS_OCORRENCIA: { valor: Ocorrencia['tipo']; rotulo: string }[] = [
  { valor: 'assalto', rotulo: 'Assalto' },
  { valor: 'furto', rotulo: 'Tentativa de furto' },
  { valor: 'assedio', rotulo: 'Assédio' },
  { valor: 'sem_luz', rotulo: 'Ponto sem luz' },
  { valor: 'suspeita', rotulo: 'Movimentação suspeita' },
  { valor: 'outro', rotulo: 'Outro' },
]

export function rotuloOcorrencia(tipo: Ocorrencia['tipo']): string {
  return TIPOS_OCORRENCIA.find((t) => t.valor === tipo)?.rotulo ?? 'Ocorrência'
}

const TIPOS_GRAVES: Ocorrencia['tipo'][] = ['assalto', 'furto', 'assedio']

/** Ocorrências graves pedem vermelho; as demais (ponto sem luz, suspeita, outro) são alerta leve em âmbar. */
export function gravidadeOcorrencia(tipo: Ocorrencia['tipo']): 'grave' | 'leve' {
  return TIPOS_GRAVES.includes(tipo) ? 'grave' : 'leve'
}

/** Pior gravidade entre as ocorrências válidas de um local — usada para colorir o alerta no marcador. */
export function piorGravidade(ocorrencias: Ocorrencia[]): 'grave' | 'leve' | null {
  if (ocorrencias.some((o) => gravidadeOcorrencia(o.tipo) === 'grave')) return 'grave'
  if (ocorrencias.length > 0) return 'leve'
  return null
}

/** R1 — faixas de contagem. 0-2 não mostra número nenhum (nunca revela mulher sozinha). */
export function faixaContagem(contagem: number): { rotulo: string | null; critico: boolean } {
  if (contagem <= 2) return { rotulo: null, critico: false }
  if (contagem <= 4) return { rotulo: '3+', critico: false }
  if (contagem <= 9) return { rotulo: '5+', critico: false }
  return { rotulo: '10+', critico: false }
}

/** Contagem atual de um local = base do seed + 1 se a usuária estiver marcada ali agora (R7: só muda por "Estou aqui"). */
export function contagemAtual(local: Local, checkedInLocalId: string | null): number {
  return local.baseMulheres + (checkedInLocalId === local.id ? 1 : 0)
}

/** R3 + R4 — alternar check-in: marcar em outro local tira do anterior; marcar no mesmo local tira dali. */
export function proximoCheckIn(atual: string | null, localId: string): string | null {
  return atual === localId ? null : localId
}

/** R5 — só mostra ocorrências das últimas 3 horas e que não foram marcadas como resolvidas. */
export function ocorrenciasValidas(ocorrencias: Ocorrencia[], agora = Date.now()): Ocorrencia[] {
  return ocorrencias
    .filter((o) => !o.resolvida && agora - o.timestamp <= TRES_HORAS_MS)
    .sort((a, b) => b.timestamp - a.timestamp)
}

export function temOcorrenciaRecente(local: Local, agora = Date.now()): boolean {
  return ocorrenciasValidas(local.ocorrencias, agora).length > 0
}

export function formatarTempoRelativo(timestamp: number, agora = Date.now()): string {
  const diffMin = Math.max(0, Math.round((agora - timestamp) / MIN_MS))
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `há ${diffMin} min`
  const horas = Math.floor(diffMin / 60)
  const minutosResto = diffMin % 60
  return minutosResto > 0 ? `há ${horas}h ${minutosResto}min` : `há ${horas} h`
}

function paraRadianos(graus: number): number {
  return (graus * Math.PI) / 180
}

/** Distância em metros entre dois pontos (fórmula de haversine). */
export function distanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = paraRadianos(lat2 - lat1)
  const dLng = paraRadianos(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(paraRadianos(lat1)) * Math.cos(paraRadianos(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatarDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros / 10) * 10} m`
  return `${(metros / 1000).toFixed(1)} km`
}

/** R6 — chegada do ônibus. A cada 60s o chamador diminui 1 min; ao chegar a 0, reinicia entre 8 e 15 min. */
export function avancarChegadaOnibus(minutosAtuais: number): number {
  if (minutosAtuais <= 0) return 8 + Math.floor(Math.random() * 8) // 8 a 15
  return minutosAtuais - 1
}

export function textoChegadaOnibus(minutos: number): string {
  return minutos <= 0 ? 'chegando' : `chega em ${minutos} min`
}

/** Remove acentos e normaliza para minúsculas, para a busca encontrar "Casper" mesmo sem o acento. */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function faltamPontos(saldo: number, custo: number): number {
  return Math.max(0, custo - saldo)
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function emailValido(email: string): boolean {
  return REGEX_EMAIL.test(email.trim())
}

/** E-mail de faculdade (.edu.br) ganha o selo "Universitária verificada". */
export function pareceEmailUniversitario(email: string): boolean {
  return normalizarTexto(email).endsWith('.edu.br')
}

/** Lugar de apoio mais próximo da usuária — usado pelo SOS para destacar onde ela pode buscar ajuda. */
export function lugarApoioMaisProximo(
  locais: Local[],
  usuaria: { lat: number; lng: number },
): { local: Local; distancia: number } | null {
  const apoios = locais.filter((l) => l.tipo === 'apoio')
  if (apoios.length === 0) return null
  let maisProximo = apoios[0]
  let menorDistancia = distanciaMetros(usuaria.lat, usuaria.lng, maisProximo.lat, maisProximo.lng)
  for (const apoio of apoios.slice(1)) {
    const d = distanciaMetros(usuaria.lat, usuaria.lng, apoio.lat, apoio.lng)
    if (d < menorDistancia) {
      menorDistancia = d
      maisProximo = apoio
    }
  }
  return { local: maisProximo, distancia: menorDistancia }
}

/** Formata segundos decorridos como "Xmin decorridos" (ou "Xs decorridos" se menos de 1 min). */
export function formatarDecorrido(ms: number): string {
  const segundosTotais = Math.floor(ms / 1000)
  if (segundosTotais < 60) return `${segundosTotais}s decorridos`
  const min = Math.floor(segundosTotais / 60)
  const seg = segundosTotais % 60
  return seg > 0 ? `${min}min ${seg}s decorridos` : `${min}min decorridos`
}
