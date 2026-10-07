import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AppState, ContatoConfianca, Ocorrencia } from '../types'
import { LOCAIS_INICIAIS } from '../data/seed'
import { PONTOS_BENEFICIO, avancarChegadaOnibus, pareceEmailUniversitario, proximoCheckIn } from '../logic/rules'

const CHAVE_LOCAL_STORAGE = 'ponto-seguro:estado'
const SCHEMA_VERSION = 1
const INTERVALO_TICK_MS = 60 * 1000

function cloneLocaisIniciais() {
  return LOCAIS_INICIAIS.map((local) => ({
    ...local,
    linhas: local.linhas?.map((l) => ({ ...l })),
    metro: local.metro ? { ...local.metro } : undefined,
    ocorrencias: local.ocorrencias.map((o) => ({ ...o })),
  }))
}

function estadoInicial(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    perfil: {
      nome: 'Convidada',
      email: '',
      universitariaVerificada: false,
      cadastroCompleto: false,
    },
    consentimentoMapeamento: true,
    contatos: [],
    checkedInLocalId: null,
    pontos: 0,
    trajetosConcluidos: 0,
    relatosEnviados: 0,
    ocorrenciasConfirmadasIds: [],
    modoApresentacao: false,
    locais: cloneLocaisIniciais(),
  }
}

function carregarEstadoSalvo(): AppState | null {
  try {
    const bruto = window.localStorage.getItem(CHAVE_LOCAL_STORAGE)
    if (!bruto) return null
    const salvo = JSON.parse(bruto) as AppState
    if (salvo.schemaVersion !== SCHEMA_VERSION) return null
    return salvo
  } catch {
    return null
  }
}

function salvarEstado(estado: AppState) {
  try {
    window.localStorage.setItem(CHAVE_LOCAL_STORAGE, JSON.stringify(estado))
  } catch {
    // se o localStorage falhar (modo privado, cota cheia etc.), o app segue funcionando só em memória
  }
}

interface AppStateApi {
  estado: AppState
  estouAqui: (localId: string) => void
  relatarOcorrencia: (localId: string, tipo: Ocorrencia['tipo'], descricao?: string) => void
  confirmarOcorrencia: (localId: string, ocorrenciaId: string) => void
  marcarResolvida: (localId: string, ocorrenciaId: string) => void
  concluirTrajeto: () => void
  alternarModoApresentacao: () => void
  completarCadastro: (nome: string, email: string, contatos: ContatoConfianca[]) => void
  pularCadastro: () => void
  alternarConsentimento: () => void
  atualizarContatos: (contatos: ContatoConfianca[]) => void
  resgatarCupom: (custoPontos: number) => boolean
  resetarDemo: () => void
}

const AppStateCtx = createContext<AppStateApi | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  // lê o localStorage de forma síncrona antes da 1ª renderização (sempre com try/catch — se falhar, usa os dados iniciais)
  const [estado, setEstado] = useState<AppState>(() => carregarEstadoSalvo() ?? estadoInicial())

  useEffect(() => {
    salvarEstado(estado)
  }, [estado])

  // R6: a cada 60s, cada linha de ônibus avança 1 minuto (ou reinicia ao chegar a 0)
  useEffect(() => {
    const id = window.setInterval(() => {
      setEstado((anterior) => ({
        ...anterior,
        locais: anterior.locais.map((local) =>
          local.linhas
            ? { ...local, linhas: local.linhas.map((l) => ({ ...l, minutos: avancarChegadaOnibus(l.minutos) })) }
            : local,
        ),
      }))
    }, INTERVALO_TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  const api = useMemo<AppStateApi>(
    () => ({
      estado,
      estouAqui: (localId: string) =>
        setEstado((anterior) => ({ ...anterior, checkedInLocalId: proximoCheckIn(anterior.checkedInLocalId, localId) })),

      // R8: relato anônimo — sem nenhum dado de quem relatou. R10: +15 pontos.
      relatarOcorrencia: (localId, tipo, descricao) =>
        setEstado((anterior) => {
          const nova: Ocorrencia = {
            id: `oc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            tipo,
            descricao: descricao?.trim() ? descricao.trim().slice(0, 140) : undefined,
            timestamp: Date.now(),
            confirmacoes: 0,
            resolvida: false,
          }
          return {
            ...anterior,
            pontos: anterior.pontos + PONTOS_BENEFICIO.ocorrenciaRelatada,
            relatosEnviados: anterior.relatosEnviados + 1,
            locais: anterior.locais.map((l) =>
              l.id === localId ? { ...l, ocorrencias: [nova, ...l.ocorrencias] } : l,
            ),
          }
        }),

      // R10: +5 pontos, mas só na 1ª confirmação da usuária para cada ocorrência (sem duplicidade).
      confirmarOcorrencia: (localId, ocorrenciaId) =>
        setEstado((anterior) => {
          if (anterior.ocorrenciasConfirmadasIds.includes(ocorrenciaId)) return anterior
          return {
            ...anterior,
            pontos: anterior.pontos + PONTOS_BENEFICIO.ocorrenciaConfirmada,
            ocorrenciasConfirmadasIds: [...anterior.ocorrenciasConfirmadasIds, ocorrenciaId],
            locais: anterior.locais.map((l) =>
              l.id === localId
                ? {
                    ...l,
                    ocorrencias: l.ocorrencias.map((o) =>
                      o.id === ocorrenciaId ? { ...o, confirmacoes: o.confirmacoes + 1 } : o,
                    ),
                  }
                : l,
            ),
          }
        }),

      marcarResolvida: (localId, ocorrenciaId) =>
        setEstado((anterior) => ({
          ...anterior,
          locais: anterior.locais.map((l) =>
            l.id === localId
              ? { ...l, ocorrencias: l.ocorrencias.map((o) => (o.id === ocorrenciaId ? { ...o, resolvida: true } : o)) }
              : l,
          ),
        })),

      // R10: +10 pontos por trajeto protegido concluído.
      concluirTrajeto: () =>
        setEstado((anterior) => ({
          ...anterior,
          pontos: anterior.pontos + PONTOS_BENEFICIO.trajetoConcluido,
          trajetosConcluidos: anterior.trajetosConcluidos + 1,
        })),

      alternarModoApresentacao: () =>
        setEstado((anterior) => ({ ...anterior, modoApresentacao: !anterior.modoApresentacao })),

      completarCadastro: (nome, email, contatos) =>
        setEstado((anterior) => ({
          ...anterior,
          perfil: {
            ...anterior.perfil,
            nome: nome.trim() || 'Convidada',
            email: email.trim(),
            universitariaVerificada: pareceEmailUniversitario(email),
            cadastroCompleto: true,
          },
          contatos,
        })),

      pularCadastro: () =>
        setEstado((anterior) => ({ ...anterior, perfil: { ...anterior.perfil, cadastroCompleto: true } })),

      alternarConsentimento: () =>
        setEstado((anterior) => ({ ...anterior, consentimentoMapeamento: !anterior.consentimentoMapeamento })),

      atualizarContatos: (contatos) => setEstado((anterior) => ({ ...anterior, contatos })),

      // R10: cupom só é resgatado com saldo suficiente; ao resgatar, desconta os pontos.
      resgatarCupom: (custoPontos) => {
        if (estado.pontos < custoPontos) return false
        setEstado((anterior) => ({ ...anterior, pontos: anterior.pontos - custoPontos }))
        return true
      },

      resetarDemo: () => setEstado(estadoInicial()),
    }),
    [estado],
  )

  return <AppStateCtx.Provider value={api}>{children}</AppStateCtx.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateCtx)
  if (!ctx) throw new Error('useAppState precisa estar dentro de <AppStateProvider>')
  return ctx
}
