import { useState } from 'react'
import { ArrowLeft, Lock } from 'lucide-react'
import { TIPOS_OCORRENCIA } from '../logic/rules'
import type { Ocorrencia } from '../types'

const LIMITE_DESCRICAO = 140

export function RelatarOcorrencia({
  nomeLocal,
  onVoltar,
  onEnviar,
}: {
  nomeLocal: string
  onVoltar: () => void
  onEnviar: (tipo: Ocorrencia['tipo'], descricao?: string) => void
}) {
  const [tipoSelecionado, setTipoSelecionado] = useState<Ocorrencia['tipo'] | null>(null)
  const [descricao, setDescricao] = useState('')
  const [mostrarErro, setMostrarErro] = useState(false)

  function handleEnviar() {
    if (!tipoSelecionado) {
      setMostrarErro(true)
      return
    }
    onEnviar(tipoSelecionado, descricao)
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#f3eef1]">
      <div className="shrink-0 px-4 pt-3 pb-2">
        <button
          type="button"
          onClick={onVoltar}
          className="flex items-center gap-1 text-sm text-roxo-escuro font-medium py-1 -ml-1 min-h-[44px]"
        >
          <ArrowLeft size={18} />
          voltar
        </button>
        <h1 className="text-lg font-bold text-roxo-escuro mt-1">O que aconteceu?</h1>
        <p className="text-sm text-[#7a6670]">{nomeLocal}</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-4">
        <div>
          <div className="grid grid-cols-2 gap-2.5">
            {TIPOS_OCORRENCIA.map((t) => {
              const selecionado = tipoSelecionado === t.valor
              return (
                <button
                  key={t.valor}
                  type="button"
                  onClick={() => {
                    setTipoSelecionado(t.valor)
                    setMostrarErro(false)
                  }}
                  className={`min-h-[56px] rounded-xl border px-3 py-3 text-sm font-medium text-center ${
                    selecionado
                      ? 'bg-roxo-escuro border-roxo-escuro text-white'
                      : 'bg-white border-rosa-claro text-roxo-escuro'
                  }`}
                >
                  {t.rotulo}
                </button>
              )
            })}
          </div>
          {mostrarErro && <p className="text-xs text-alerta-grave font-medium mt-2">Escolha o que aconteceu</p>}
        </div>

        <div>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value.slice(0, LIMITE_DESCRICAO))}
            placeholder="Descrição (opcional)"
            rows={3}
            maxLength={LIMITE_DESCRICAO}
            className="w-full rounded-xl border border-rosa-claro bg-white px-3 py-2.5 text-sm text-roxo-escuro placeholder:text-[#b79aab] outline-none resize-none"
          />
          <p className="text-[11px] text-[#9b7f91] text-right mt-0.5">
            {descricao.length}/{LIMITE_DESCRICAO}
          </p>
        </div>

        <p className="flex items-start gap-1.5 text-xs text-[#7a6670]">
          <Lock size={14} className="shrink-0 mt-0.5" />
          Seu relato é anônimo para as outras usuárias.
        </p>
      </div>

      <div className="shrink-0 px-4 pb-4 pt-1" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
        <button
          type="button"
          onClick={handleEnviar}
          className="w-full py-3.5 rounded-xl font-semibold text-sm bg-roxo-escuro text-white min-h-[44px]"
        >
          Enviar relato
        </button>
      </div>
    </div>
  )
}
