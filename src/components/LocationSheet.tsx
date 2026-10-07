import { X, Bus, TrainFront, Coffee } from 'lucide-react'
import type { Local } from '../types'
import { LOCALIZACAO_USUARIA } from '../data/seed'
import {
  contagemAtual,
  distanciaMetros,
  faixaContagem,
  formatarDistancia,
  formatarTempoRelativo,
  gravidadeOcorrencia,
  ocorrenciasValidas,
  rotuloOcorrencia,
  textoChegadaOnibus,
} from '../logic/rules'

const ROTULO_TIPO: Record<Local['tipo'], string> = {
  onibus: 'Ônibus',
  metro: 'Metrô',
  apoio: 'Lugar de apoio',
}

function IconeTipo({ tipo }: { tipo: Local['tipo'] }) {
  if (tipo === 'metro') return <TrainFront size={16} className="text-roxo-escuro" />
  if (tipo === 'apoio') return <Coffee size={16} className="text-rosa" />
  return <Bus size={16} className="text-roxo-escuro" />
}

export function LocationSheet({
  local,
  checkedInLocalId,
  ocorrenciasConfirmadasIds,
  onEstouAqui,
  onFechar,
  onIrParaTrajeto,
  onRelatarOcorrencia,
  onConfirmarOcorrencia,
  onMarcarResolvida,
}: {
  local: Local
  checkedInLocalId: string | null
  ocorrenciasConfirmadasIds: string[]
  onEstouAqui: (id: string) => void
  onFechar: () => void
  onIrParaTrajeto: () => void
  onRelatarOcorrencia: () => void
  onConfirmarOcorrencia: (ocorrenciaId: string) => void
  onMarcarResolvida: (ocorrenciaId: string) => void
}) {
  const distancia = distanciaMetros(LOCALIZACAO_USUARIA.lat, LOCALIZACAO_USUARIA.lng, local.lat, local.lng)
  const contagem = contagemAtual(local, checkedInLocalId)
  const { rotulo } = faixaContagem(contagem)
  const ocorrencias = ocorrenciasValidas(local.ocorrencias)
  const estaAqui = checkedInLocalId === local.id

  return (
    <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-[0_-4px_24px_rgba(74,15,56,0.18)] max-h-[70%] overflow-y-auto z-[600]">
      <div className="sticky top-0 bg-white pt-2 px-4 pb-2 border-b border-rosa-claro">
        <div className="mx-auto w-10 h-1 rounded-full bg-rosa-claro mb-2" />
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold text-roxo-escuro text-[15px] leading-snug">{local.nome}</h2>
          <button type="button" onClick={onFechar} className="p-1 -m-1 text-[#9b7f91]" aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#7a6670] mt-1">
          <IconeTipo tipo={local.tipo} />
          <span>{ROTULO_TIPO[local.tipo]}</span>
          <span>·</span>
          <span>{formatarDistancia(distancia)} de você</span>
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        {local.tipo !== 'apoio' && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#7a6670]">Mulheres agora</span>
            <span className="font-bold text-roxo-escuro text-base">{rotulo ?? 'menos de 3'}</span>
          </div>
        )}

        {local.tipo === 'onibus' &&
          local.linhas?.map((linha) => (
            <div key={linha.codigo} className="flex items-center justify-between text-sm border-t border-rosa-claro pt-2">
              <span className="font-medium text-roxo-escuro">{linha.codigo}</span>
              <span className="text-[#7a6670]">{textoChegadaOnibus(linha.minutos)}</span>
            </div>
          ))}

        {local.tipo === 'metro' && local.metro && (
          <div className="text-sm border-t border-rosa-claro pt-2 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-roxo-escuro">{local.metro.linha}</span>
              <span className="text-[#7a6670]">{local.metro.status}</span>
            </div>
            <div className="text-[#7a6670]">trens a cada ~{local.metro.intervaloMin} min</div>
          </div>
        )}

        {ocorrencias.length > 0 && (
          <div className="space-y-2 border-t border-rosa-claro pt-2">
            {ocorrencias.map((oc) => {
              const grave = gravidadeOcorrencia(oc.tipo) === 'grave'
              const jaConfirmou = ocorrenciasConfirmadasIds.includes(oc.id)
              return (
                <div
                  key={oc.id}
                  className={`rounded-lg border px-3 py-2 ${grave ? 'border-alerta-grave/40 bg-alerta-grave/5' : 'border-alerta-leve/40 bg-alerta-leve/5'}`}
                >
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className={grave ? 'text-alerta-grave' : 'text-alerta-leve'}>◆</span>
                    <span className="font-medium text-roxo-escuro">{rotuloOcorrencia(oc.tipo)}</span>
                    <span className="text-[#7a6670]">· {formatarTempoRelativo(oc.timestamp)}</span>
                  </div>
                  {oc.descricao && <p className="text-xs text-[#7a6670] mt-0.5">{oc.descricao}</p>}
                  {oc.confirmacoes > 0 && (
                    <p className="text-xs text-[#7a6670] mt-0.5">{oc.confirmacoes} confirmações</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => onConfirmarOcorrencia(oc.id)}
                      disabled={jaConfirmou}
                      className={`flex-1 text-xs font-medium py-1.5 rounded-md border min-h-[32px] ${
                        jaConfirmou
                          ? 'border-rosa-claro text-[#b79aab] cursor-not-allowed'
                          : 'border-roxo-escuro text-roxo-escuro'
                      }`}
                    >
                      {jaConfirmou ? 'Confirmado' : 'Confirmar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onMarcarResolvida(oc.id)}
                      className="flex-1 text-xs font-medium py-1.5 rounded-md border border-roxo-escuro text-roxo-escuro min-h-[32px]"
                    >
                      Já resolveu
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="px-4 pb-4 pt-1 space-y-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
        {local.tipo !== 'apoio' && (
          <button
            type="button"
            onClick={() => onEstouAqui(local.id)}
            className={`w-full py-3 rounded-xl font-semibold text-sm min-h-[44px] ${
              estaAqui ? 'bg-rosa-claro text-roxo-escuro border border-rosa' : 'bg-roxo-escuro text-white'
            }`}
          >
            {estaAqui ? 'Você está aqui · Sair' : 'Estou aqui'}
          </button>
        )}
        {local.tipo !== 'apoio' && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRelatarOcorrencia}
              className="flex-1 py-3 rounded-xl font-medium text-sm border border-roxo-escuro text-roxo-escuro min-h-[44px]"
            >
              Relatar ocorrência
            </button>
            <button
              type="button"
              onClick={onIrParaTrajeto}
              className="flex-1 py-3 rounded-xl font-medium text-sm border border-roxo-escuro text-roxo-escuro min-h-[44px]"
            >
              Iniciar trajeto
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
