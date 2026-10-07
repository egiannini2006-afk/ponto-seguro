import { useEffect, useRef, useState } from 'react'
import { useAppState } from '../store/AppStateContext'
import { DESTINOS_TRAJETO, LOCALIZACAO_USUARIA } from '../data/seed'
import {
  PONTOS_BENEFICIO,
  SOS_SEGURAR_MS,
  TEMPO_LIMITE_APRESENTACAO_MS,
  TEMPO_PERGUNTA_TUDO_BEM_MS,
  formatarDecorrido,
  formatarDistancia,
  lugarApoioMaisProximo,
  textoChegadaOnibus,
} from '../logic/rules'

interface TrajetoAtivo {
  localId: string
  localNome: string
  linhaCodigo: string
  chegadaInicialMin: number
  destino: string
  duracaoMin: number
  inicioTs: number
}

function BotaoSOS({ aoAcionar }: { aoAcionar: () => void }) {
  const [progresso, setProgresso] = useState(0)
  const seguraDesde = useRef<number | null>(null)
  const frameId = useRef<number | null>(null)

  function pararSegurar() {
    if (frameId.current) cancelAnimationFrame(frameId.current)
    seguraDesde.current = null
    setProgresso(0)
  }

  function comecarSegurar() {
    seguraDesde.current = Date.now()
    const tick = () => {
      if (!seguraDesde.current) return
      const decorrido = Date.now() - seguraDesde.current
      const pct = Math.min(1, decorrido / SOS_SEGURAR_MS)
      setProgresso(pct)
      if (pct >= 1) {
        pararSegurar()
        aoAcionar()
        return
      }
      frameId.current = requestAnimationFrame(tick)
    }
    frameId.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => pararSegurar(), [])

  const raio = 44
  const circunferencia = 2 * Math.PI * raio

  return (
    <button
      type="button"
      onPointerDown={comecarSegurar}
      onPointerUp={pararSegurar}
      onPointerLeave={pararSegurar}
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-28 h-28 rounded-full border-2 border-roxo-escuro flex items-center justify-center select-none touch-none"
      style={{ WebkitUserSelect: 'none' }}
    >
      <svg viewBox="0 0 96 96" className="absolute inset-0 w-full h-full -rotate-90">
        <circle cx="48" cy="48" r={raio} fill="none" stroke="#f6eaf2" strokeWidth="4" />
        <circle
          cx="48"
          cy="48"
          r={raio}
          fill="none"
          stroke="#E0457B"
          strokeWidth="4"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - progresso)}
          strokeLinecap="round"
        />
      </svg>
      <span className="font-bold text-roxo-escuro text-lg">SOS</span>
    </button>
  )
}

export function Trajeto() {
  const { estado, concluirTrajeto } = useAppState()
  const locaisOnibus = estado.locais.filter((l) => l.tipo === 'onibus')

  const [embarqueId, setEmbarqueId] = useState(locaisOnibus[0]?.id ?? '')
  const localEmbarque = locaisOnibus.find((l) => l.id === embarqueId) ?? locaisOnibus[0] ?? null
  const [linhaCodigo, setLinhaCodigo] = useState(localEmbarque?.linhas?.[0]?.codigo ?? '')
  const [destinoNome, setDestinoNome] = useState(DESTINOS_TRAJETO[0].nome)

  const [trajeto, setTrajeto] = useState<TrajetoAtivo | null>(null)
  const [agora, setAgora] = useState(() => Date.now())
  const [mensagemSos, setMensagemSos] = useState<string | null>(null)
  const [respondeuTudoBem, setRespondeuTudoBem] = useState(false)
  const [contatosAvisadosLocalizacao, setContatosAvisadosLocalizacao] = useState(false)
  const [concluido, setConcluido] = useState(false)

  useEffect(() => {
    if (!trajeto || concluido) return
    const id = window.setInterval(() => setAgora(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [trajeto, concluido])

  // dispara o aviso "contatos avisados com a última localização" quando a janela da pergunta "Está tudo bem?" esgota
  useEffect(() => {
    if (!trajeto || concluido || respondeuTudoBem || contatosAvisadosLocalizacao) return
    const limiteMs = estado.modoApresentacao ? TEMPO_LIMITE_APRESENTACAO_MS : trajeto.duracaoMin * 60 * 1000
    const elapsedMs = agora - trajeto.inicioTs
    if (elapsedMs >= limiteMs + TEMPO_PERGUNTA_TUDO_BEM_MS) {
      setContatosAvisadosLocalizacao(true)
    }
  }, [agora, trajeto, concluido, respondeuTudoBem, contatosAvisadosLocalizacao, estado.modoApresentacao])

  if (locaisOnibus.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 text-center text-sm text-[#7a6670]">
        Nenhum ponto de ônibus disponível para montar um trajeto.
      </div>
    )
  }

  function handleEmbarqueChange(id: string) {
    setEmbarqueId(id)
    const local = locaisOnibus.find((l) => l.id === id)
    setLinhaCodigo(local?.linhas?.[0]?.codigo ?? '')
  }

  function iniciarTrajeto() {
    if (!localEmbarque) return
    const linha = localEmbarque.linhas?.find((l) => l.codigo === linhaCodigo)
    const destino = DESTINOS_TRAJETO.find((d) => d.nome === destinoNome) ?? DESTINOS_TRAJETO[0]
    setTrajeto({
      localId: localEmbarque.id,
      localNome: localEmbarque.nome,
      linhaCodigo,
      chegadaInicialMin: linha?.minutos ?? 0,
      destino: destino.nome,
      duracaoMin: destino.duracaoMin,
      inicioTs: Date.now(),
    })
    setAgora(Date.now())
    setRespondeuTudoBem(false)
    setContatosAvisadosLocalizacao(false)
    setConcluido(false)
    setMensagemSos(null)
  }

  function chegou() {
    concluirTrajeto()
    setConcluido(true)
  }

  function cancelarTrajeto() {
    setTrajeto(null)
    setConcluido(false)
  }

  function acionarSos() {
    const apoio = lugarApoioMaisProximo(estado.locais, LOCALIZACAO_USUARIA)
    const trecho = apoio
      ? ` ${apoio.local.nome} é o lugar de apoio mais próximo (${formatarDistancia(apoio.distancia)}).`
      : ''
    setMensagemSos(`Ligando para o 190 e enviando sua localização aos contatos (simulação).${trecho}`)
  }

  if (trajeto && !concluido) {
    const elapsedMs = agora - trajeto.inicioTs
    const limiteMs = estado.modoApresentacao ? TEMPO_LIMITE_APRESENTACAO_MS : trajeto.duracaoMin * 60 * 1000
    const progresso = Math.min(1, elapsedMs / limiteMs)
    const passouLimite = elapsedMs >= limiteMs && !respondeuTudoBem && !contatosAvisadosLocalizacao
    const tempoNaPerguntaMs = passouLimite ? elapsedMs - limiteMs : 0
    const segundosRestantesPergunta = Math.max(0, Math.ceil((TEMPO_PERGUNTA_TUDO_BEM_MS - tempoNaPerguntaMs) / 1000))

    const nomesContatos = estado.contatos.map((c) => c.nome).filter(Boolean)
    const avisoSaida =
      nomesContatos.length > 0
        ? `${nomesContatos.join(' e ')} foram avisados que você saiu`
        : 'Seus contatos de confiança foram avisados que você saiu'

    return (
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-5">
        <h1 className="text-lg font-bold text-roxo-escuro">Trajeto em andamento</h1>

        <div className="bg-white rounded-xl border border-rosa-claro divide-y divide-rosa-claro">
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-[#7a6670]">De</span>
            <span className="font-medium text-roxo-escuro text-right">{trajeto.localNome}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-[#7a6670]">Linha</span>
            <span className="font-medium text-roxo-escuro">
              {trajeto.linhaCodigo} · {textoChegadaOnibus(trajeto.chegadaInicialMin)}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-[#7a6670]">Para</span>
            <span className="font-medium text-roxo-escuro">
              {trajeto.destino} · ~{trajeto.duracaoMin} min
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs text-[#7a6670] mb-1">Progresso</p>
          <div className="h-2 rounded-full bg-rosa-claro overflow-hidden">
            <div className="h-full bg-roxo-escuro transition-all" style={{ width: `${progresso * 100}%` }} />
          </div>
        </div>

        <p className="text-sm text-roxo-escuro">
          ✓ {avisoSaida} · {formatarDecorrido(elapsedMs)}
        </p>

        {passouLimite && !contatosAvisadosLocalizacao && (
          <div className="rounded-xl border border-alerta-leve/50 bg-alerta-leve/5 p-4 space-y-2">
            <p className="text-sm font-semibold text-roxo-escuro">Está tudo bem?</p>
            <p className="text-xs text-[#7a6670]">Responda em até {segundosRestantesPergunta}s.</p>
            <button
              type="button"
              onClick={() => setRespondeuTudoBem(true)}
              className="w-full py-2.5 rounded-xl font-medium text-sm bg-roxo-escuro text-white min-h-[44px]"
            >
              Está tudo bem, estou indo
            </button>
          </div>
        )}

        {contatosAvisadosLocalizacao && (
          <div className="rounded-xl border border-alerta-grave/50 bg-alerta-grave/5 p-4">
            <p className="text-sm font-medium text-alerta-grave">
              Contatos avisados com sua última localização (simulação).
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={chegou}
          className="w-full py-3.5 rounded-xl font-semibold text-sm bg-roxo-escuro text-white min-h-[44px]"
        >
          Cheguei
        </button>

        <div className="flex flex-col items-center gap-2 pt-2 pb-4">
          <BotaoSOS aoAcionar={acionarSos} />
          <p className="text-xs text-[#7a6670] text-center">segure 3 s · liga 190 + envia localização</p>
          <p className="text-xs text-[#7a6670] text-center max-w-xs">
            Se não confirmar a chegada: "Está tudo bem?" → avisa os contatos
          </p>
          {mensagemSos && (
            <p className="text-xs text-roxo-escuro bg-rosa-claro rounded-lg px-3 py-2 text-center mt-1">
              {mensagemSos}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (concluido) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
        <p className="text-lg font-bold text-roxo-escuro">Você chegou! 🎉</p>
        <p className="text-sm text-[#7a6670]">
          Seus contatos foram avisados que você chegou. +{PONTOS_BENEFICIO.trajetoConcluido} pontos no seu saldo.
        </p>
        <button
          type="button"
          onClick={cancelarTrajeto}
          className="mt-2 py-3 px-6 rounded-xl font-semibold text-sm bg-roxo-escuro text-white min-h-[44px]"
        >
          Concluir
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
      <h1 className="text-lg font-bold text-roxo-escuro">Trajeto protegido</h1>
      <p className="text-sm text-[#7a6670]">
        Escolha de onde vai sair, a linha e para onde vai. Seus contatos são avisados quando você sai e quando chega.
      </p>

      <div className="space-y-1">
        <label className="text-xs font-medium text-[#7a6670]">Ponto de embarque</label>
        <select
          value={embarqueId}
          onChange={(e) => handleEmbarqueChange(e.target.value)}
          className="w-full border border-rosa-claro rounded-xl px-3 py-3 text-sm text-roxo-escuro bg-white min-h-[44px]"
        >
          {locaisOnibus.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-[#7a6670]">Linha</label>
        <select
          value={linhaCodigo}
          onChange={(e) => setLinhaCodigo(e.target.value)}
          className="w-full border border-rosa-claro rounded-xl px-3 py-3 text-sm text-roxo-escuro bg-white min-h-[44px]"
        >
          {localEmbarque?.linhas?.map((l) => (
            <option key={l.codigo} value={l.codigo}>
              {l.codigo} · {textoChegadaOnibus(l.minutos)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-[#7a6670]">Destino</label>
        <select
          value={destinoNome}
          onChange={(e) => setDestinoNome(e.target.value)}
          className="w-full border border-rosa-claro rounded-xl px-3 py-3 text-sm text-roxo-escuro bg-white min-h-[44px]"
        >
          {DESTINOS_TRAJETO.map((d) => (
            <option key={d.nome} value={d.nome}>
              {d.nome} · ~{d.duracaoMin} min
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={iniciarTrajeto}
        disabled={!linhaCodigo}
        className="w-full py-3.5 rounded-xl font-semibold text-sm bg-roxo-escuro text-white min-h-[44px] disabled:opacity-50"
      >
        Iniciar trajeto
      </button>
    </div>
  )
}
