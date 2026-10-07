import { useEffect, useMemo, useState } from 'react'
import { LocateFixed, Search } from 'lucide-react'
import { useAppState } from '../store/AppStateContext'
import { MapView } from '../components/MapView'
import { LocationSheet } from '../components/LocationSheet'
import { RelatarOcorrencia } from './RelatarOcorrencia'
import { LOCALIZACAO_USUARIA } from '../data/seed'
import { PONTOS_BENEFICIO, normalizarTexto, temOcorrenciaRecente } from '../logic/rules'
import type { Aba } from '../types'

type Filtro = 'todos' | 'onibus' | 'metro' | 'ocorrencias'

const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'onibus', rotulo: 'Ônibus' },
  { valor: 'metro', rotulo: 'Metrô' },
  { valor: 'ocorrencias', rotulo: 'Ocorrências' },
]

export function Radar({ onMudarAba }: { onMudarAba: (aba: Aba) => void }) {
  const { estado, estouAqui, relatarOcorrencia, confirmarOcorrencia, marcarResolvida } = useAppState()
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [localSelecionadoId, setLocalSelecionadoId] = useState<string | null>(null)
  const [relatandoLocalId, setRelatandoLocalId] = useState<string | null>(null)
  const [foco, setFoco] = useState<{ lat: number; lng: number; nonce: number } | null>(null)
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null)

  useEffect(() => {
    if (!mensagemSucesso) return
    const id = window.setTimeout(() => setMensagemSucesso(null), 3500)
    return () => window.clearTimeout(id)
  }, [mensagemSucesso])

  const locaisFiltrados = useMemo(() => {
    const buscaNormalizada = normalizarTexto(busca)
    return estado.locais.filter((local) => {
      if (filtro === 'onibus' && local.tipo !== 'onibus') return false
      if (filtro === 'metro' && local.tipo !== 'metro') return false
      if (filtro === 'ocorrencias' && !temOcorrenciaRecente(local)) return false
      if (buscaNormalizada && !normalizarTexto(local.nome).includes(buscaNormalizada)) return false
      return true
    })
  }, [estado.locais, filtro, busca])

  const localSelecionado = localSelecionadoId
    ? estado.locais.find((l) => l.id === localSelecionadoId) ?? null
    : null

  const localParaRelato = relatandoLocalId ? estado.locais.find((l) => l.id === relatandoLocalId) ?? null : null

  if (localParaRelato) {
    return (
      <RelatarOcorrencia
        nomeLocal={localParaRelato.nome}
        onVoltar={() => setRelatandoLocalId(null)}
        onEnviar={(tipo, descricao) => {
          relatarOcorrencia(localParaRelato.id, tipo, descricao)
          setRelatandoLocalId(null)
          setMensagemSucesso(
            `Obrigada! Você acabou de ajudar outras mulheres nesse ponto. +${PONTOS_BENEFICIO.ocorrenciaRelatada} pontos`,
          )
        }}
      />
    )
  }

  return (
    <div className="relative flex-1 min-h-0">
      {mensagemSucesso && (
        <div className="absolute top-3 inset-x-3 z-[700] bg-roxo-escuro text-white text-sm font-medium rounded-xl px-4 py-3 shadow-lg text-center">
          {mensagemSucesso}
        </div>
      )}

      <MapView
        locais={locaisFiltrados}
        checkedInLocalId={estado.checkedInLocalId}
        localSelecionadoId={localSelecionadoId}
        centralizarEm={foco}
        onSelecionarLocal={setLocalSelecionadoId}
      />

      {/* busca + filtros, sobrepostos ao mapa */}
      <div className="absolute top-3 inset-x-3 space-y-2 z-[500]">
        <div className="flex items-center gap-2 bg-white rounded-xl shadow-md px-3 py-2.5">
          <Search size={16} className="text-[#9b7f91] shrink-0" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar ponto ou estação"
            className="flex-1 text-sm outline-none placeholder:text-[#b79aab] text-roxo-escuro min-w-0"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              type="button"
              onClick={() => setFiltro(f.valor)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm ${
                filtro === f.valor ? 'bg-roxo-escuro text-white' : 'bg-white text-roxo-escuro'
              }`}
            >
              {f.rotulo}
            </button>
          ))}
        </div>
      </div>

      {/* botão centralizar */}
      {!localSelecionado && (
        <button
          type="button"
          onClick={() => setFoco({ ...LOCALIZACAO_USUARIA, nonce: Date.now() })}
          aria-label="Centralizar na minha localização"
          className="absolute bottom-24 right-3 w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center z-[500]"
        >
          <LocateFixed size={20} className="text-roxo-escuro" />
        </button>
      )}

      {/* legenda */}
      {!localSelecionado && (
        <div className="absolute bottom-4 left-3 right-16 bg-white/95 rounded-lg shadow-sm px-3 py-1.5 text-[10px] text-[#7a6670] leading-snug z-[500]">
          sem número = menos de 3 · ◆ ocorrência recente · ☕ lugar de apoio
        </div>
      )}

      {localSelecionado && (
        <LocationSheet
          local={localSelecionado}
          checkedInLocalId={estado.checkedInLocalId}
          ocorrenciasConfirmadasIds={estado.ocorrenciasConfirmadasIds}
          onEstouAqui={estouAqui}
          onFechar={() => setLocalSelecionadoId(null)}
          onIrParaTrajeto={() => onMudarAba('trajeto')}
          onRelatarOcorrencia={() => setRelatandoLocalId(localSelecionado.id)}
          onConfirmarOcorrencia={(ocorrenciaId) => confirmarOcorrencia(localSelecionado.id, ocorrenciaId)}
          onMarcarResolvida={(ocorrenciaId) => marcarResolvida(localSelecionado.id, ocorrenciaId)}
        />
      )}
    </div>
  )
}
