import { useState } from 'react'
import { Pencil, Plus, RotateCcw, X } from 'lucide-react'
import { useAppState } from '../store/AppStateContext'
import type { ContatoConfianca } from '../types'
import logoHorizontal from '../assets/logo-horizontal.png'

function Interruptor({ ligado, onAlternar }: { ligado: boolean; onAlternar: () => void }) {
  return (
    <button type="button" onClick={onAlternar} className="shrink-0">
      <span
        className={`block w-11 h-6 rounded-full relative transition-colors ${ligado ? 'bg-roxo-escuro' : 'bg-rosa-claro'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            ligado ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

export function Perfil() {
  const { estado, resetarDemo, alternarModoApresentacao, alternarConsentimento, atualizarContatos } = useAppState()
  const [confirmandoReset, setConfirmandoReset] = useState(false)
  const [editandoContatos, setEditandoContatos] = useState(false)
  const [nomeDraft, setNomeDraft] = useState('')
  const [telefoneDraft, setTelefoneDraft] = useState('')

  function adicionarContato() {
    if (!nomeDraft.trim() || !telefoneDraft.trim() || estado.contatos.length >= 2) return
    const novo: ContatoConfianca = { nome: nomeDraft.trim(), telefone: telefoneDraft.trim() }
    atualizarContatos([...estado.contatos, novo])
    setNomeDraft('')
    setTelefoneDraft('')
  }

  function removerContato(idx: number) {
    atualizarContatos(estado.contatos.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-6">
      <div className="flex flex-col items-center gap-2 pt-2">
        <img src={logoHorizontal} alt="Ponto Seguro" className="h-7 object-contain" />
        <p className="font-semibold text-roxo-escuro">{estado.perfil.nome}</p>
        {estado.perfil.universitariaVerificada && (
          <span className="text-[11px] font-medium text-rosa bg-rosa-claro rounded-full px-2.5 py-0.5">
            Universitária verificada
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wide text-[#9b7f91] uppercase">Contatos de confiança</p>
          <button type="button" onClick={() => setEditandoContatos((v) => !v)} className="p-1 -m-1 text-roxo-escuro">
            <Pencil size={14} />
          </button>
        </div>
        <div className="rounded-xl border border-rosa-claro p-4 space-y-2">
          {estado.contatos.length === 0 && !editandoContatos && (
            <p className="text-xs text-[#7a6670]">Nenhum contato cadastrado ainda.</p>
          )}
          {estado.contatos.map((c, idx) => (
            <div key={`${c.nome}-${idx}`} className="flex items-center justify-between text-sm">
              <span className="text-roxo-escuro">
                {c.nome} · {c.telefone}
              </span>
              {editandoContatos && (
                <button type="button" onClick={() => removerContato(idx)} className="p-1 -m-1 text-[#9b7f91]">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          {editandoContatos && estado.contatos.length < 2 && (
            <div className="space-y-2 pt-2 border-t border-rosa-claro">
              <input
                value={nomeDraft}
                onChange={(e) => setNomeDraft(e.target.value)}
                placeholder="Nome do contato"
                className="w-full border border-rosa-claro rounded-lg px-3 py-2 text-sm bg-white outline-none"
              />
              <input
                value={telefoneDraft}
                onChange={(e) => setTelefoneDraft(e.target.value)}
                placeholder="Telefone"
                className="w-full border border-rosa-claro rounded-lg px-3 py-2 text-sm bg-white outline-none"
              />
              <button
                type="button"
                onClick={adicionarContato}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-roxo-escuro text-white"
              >
                <Plus size={14} />
                Adicionar contato
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-rosa-claro p-4 space-y-3">
        <p className="text-sm text-roxo-escuro font-medium">Privacidade</p>
        <p className="text-xs text-[#7a6670] leading-relaxed">
          Mostramos só números por ponto, a partir de 3 mulheres. Ninguém vê onde você está.
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-rosa-claro">
          <span className="text-xs text-[#7a6670] pr-3">
            Ajudar a mapear a segurança da cidade com dados agregados e anônimos.
          </span>
          <Interruptor ligado={estado.consentimentoMapeamento} onAlternar={alternarConsentimento} />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-[#9b7f91] uppercase">Demonstração</p>
        <div className="rounded-xl border border-rosa-claro p-4 space-y-3">
          <div className="w-full flex items-center justify-between">
            <span className="text-sm text-roxo-escuro text-left">
              Modo apresentação
              <span className="block text-xs text-[#7a6670] font-normal">Acelera os tempos do trajeto</span>
            </span>
            <Interruptor ligado={estado.modoApresentacao} onAlternar={alternarModoApresentacao} />
          </div>

          <div className="border-t border-rosa-claro pt-3">
            {!confirmandoReset ? (
              <button
                type="button"
                onClick={() => setConfirmandoReset(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm border border-roxo-escuro text-roxo-escuro min-h-[44px]"
              >
                <RotateCcw size={16} />
                Resetar demonstração
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[#7a6670]">
                  Isso volta tudo aos dados iniciais: pontos, ocorrências, check-in e cadastro. Confirma?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmandoReset(false)}
                    className="flex-1 py-2.5 rounded-xl font-medium text-sm border border-rosa-claro text-roxo-escuro min-h-[44px]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetarDemo()
                      setConfirmandoReset(false)
                    }}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-roxo-escuro text-white min-h-[44px]"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
