import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useAppState } from '../store/AppStateContext'
import { CUPONS, LOCALIZACAO_USUARIA, PATROCINADORAS, PATROCINADORA_PRINCIPAL } from '../data/seed'
import { PONTOS_BENEFICIO, distanciaMetros, faltamPontos, formatarDistancia } from '../logic/rules'
import type { Aba } from '../types'

function logoPatrocinadora(id: string): string | undefined {
  return PATROCINADORAS.find((p) => p.id === id)?.logoSvg
}

export function Beneficios({ onMudarAba }: { onMudarAba: (aba: Aba) => void }) {
  const { estado, resgatarCupom } = useAppState()
  const [resgatado, setResgatado] = useState<string | null>(null)

  const apoios = estado.locais
    .filter((l) => l.tipo === 'apoio')
    .map((l) => ({ local: l, distancia: distanciaMetros(LOCALIZACAO_USUARIA.lat, LOCALIZACAO_USUARIA.lng, l.lat, l.lng) }))
    .sort((a, b) => a.distancia - b.distancia)

  function handleResgatar(cupomId: string, custo: number) {
    const ok = resgatarCupom(custo)
    if (ok) {
      setResgatado(cupomId)
      window.setTimeout(() => setResgatado(null), 2500)
    }
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-6">
      <div className="flex items-center gap-2 bg-white rounded-xl border border-rosa-claro px-4 py-3">
        <div
          className="w-8 h-8 shrink-0"
          dangerouslySetInnerHTML={{ __html: PATROCINADORA_PRINCIPAL.logoSvg }}
          aria-hidden
        />
        <p className="text-xs text-[#7a6670]">
          Ponto Seguro é oferecido por <span className="font-semibold text-roxo-escuro">{PATROCINADORA_PRINCIPAL.nome}</span>
        </p>
      </div>

      <div className="rounded-xl border border-rosa-claro p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#7a6670]">Seus pontos</span>
          <span className="text-2xl font-bold text-roxo-escuro">{estado.pontos}</span>
        </div>
        <p className="text-xs text-[#7a6670] mt-2 leading-relaxed">
          +{PONTOS_BENEFICIO.trajetoConcluido} por trajeto protegido · +{PONTOS_BENEFICIO.ocorrenciaRelatada} por
          ocorrência relatada · +{PONTOS_BENEFICIO.ocorrenciaConfirmada} por ocorrência confirmada
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-[#9b7f91] uppercase">Cupons</p>
        <div className="space-y-2">
          {CUPONS.map((cupom) => {
            const disponivel = estado.pontos >= cupom.custoPontos
            const faltam = faltamPontos(estado.pontos, cupom.custoPontos)
            return (
              <div
                key={cupom.id}
                className="flex items-center gap-3 rounded-xl border border-rosa-claro p-3 bg-white"
              >
                <div
                  className="w-9 h-9 shrink-0"
                  dangerouslySetInnerHTML={{ __html: logoPatrocinadora(cupom.patrocinadoraId) ?? '' }}
                  aria-hidden
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-roxo-escuro font-medium truncate">{cupom.titulo}</p>
                  <p className="text-xs text-[#7a6670]">{cupom.custoPontos} pts</p>
                </div>
                {resgatado === cupom.id ? (
                  <span className="shrink-0 text-xs font-semibold text-rosa">Resgatado!</span>
                ) : (
                  <button
                    type="button"
                    disabled={!disponivel}
                    onClick={() => handleResgatar(cupom.id, cupom.custoPontos)}
                    className={`shrink-0 text-xs font-semibold px-3 py-2 rounded-lg min-h-[36px] ${
                      disponivel
                        ? 'bg-roxo-escuro text-white'
                        : 'bg-rosa-claro text-[#9b7f91] cursor-not-allowed'
                    }`}
                  >
                    {disponivel ? 'Resgatar' : `Faltam ${faltam} pontos`}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-[#9b7f91] uppercase">Lugares de apoio perto de você</p>
        <div className="rounded-xl border border-rosa-claro divide-y divide-rosa-claro bg-white">
          {apoios.map(({ local, distancia }) => (
            <div key={local.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-roxo-escuro font-medium">{local.nome}</p>
                <p className="text-xs text-[#7a6670]">{formatarDistancia(distancia)}</p>
              </div>
              <button
                type="button"
                onClick={() => onMudarAba('radar')}
                className="flex items-center gap-1 text-xs font-medium text-roxo-escuro"
              >
                <MapPin size={14} />
                ver no mapa
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-rosa-claro p-4 space-y-1">
        <p className="text-sm text-roxo-escuro font-medium">Seu impacto</p>
        <p className="text-xs text-[#7a6670]">
          {estado.trajetosConcluidos} trajeto{estado.trajetosConcluidos === 1 ? '' : 's'} protegido
          {estado.trajetosConcluidos === 1 ? '' : 's'} concluído{estado.trajetosConcluidos === 1 ? '' : 's'} ·{' '}
          {estado.relatosEnviados} ocorrência{estado.relatosEnviados === 1 ? '' : 's'} relatada
          {estado.relatosEnviados === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  )
}
