import { useState } from 'react'
import { Check, Loader2, Plus, X } from 'lucide-react'
import { useAppState } from '../store/AppStateContext'
import { emailValido } from '../logic/rules'
import type { ContatoConfianca } from '../types'
import logoCartao from '../assets/logo-cartao.png'

type EtapaVerificacao = 'pendente' | 'verificando' | 'feita'

function ItemVerificacao({
  numero,
  rotulo,
  etapa,
  onTocar,
}: {
  numero: number
  rotulo: string
  etapa: EtapaVerificacao
  onTocar: () => void
}) {
  return (
    <button
      type="button"
      onClick={onTocar}
      disabled={etapa !== 'pendente'}
      className="w-full flex items-center justify-between py-2.5 min-h-[44px]"
    >
      <span className="text-sm text-roxo-escuro">
        {numero} {rotulo}
      </span>
      {etapa === 'feita' && <Check size={18} className="text-rosa" />}
      {etapa === 'verificando' && <Loader2 size={18} className="text-rosa animate-spin" />}
      {etapa === 'pendente' && <Plus size={18} className="text-[#9b7f91]" />}
    </button>
  )
}

export function Onboarding() {
  const { completarCadastro, pularCadastro, estado, alternarConsentimento } = useAppState()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [erroEmail, setErroEmail] = useState<string | null>(null)

  const [etapaDoc, setEtapaDoc] = useState<EtapaVerificacao>('pendente')
  const [etapaSelfie, setEtapaSelfie] = useState<EtapaVerificacao>('pendente')

  const [contatos, setContatos] = useState<ContatoConfianca[]>([])
  const [mostrarFormContato, setMostrarFormContato] = useState(false)
  const [nomeContatoDraft, setNomeContatoDraft] = useState('')
  const [telefoneContatoDraft, setTelefoneContatoDraft] = useState('')

  function simularVerificacao(qual: 'doc' | 'selfie') {
    const setEtapa = qual === 'doc' ? setEtapaDoc : setEtapaSelfie
    setEtapa('verificando')
    window.setTimeout(() => setEtapa('feita'), 700)
  }

  function adicionarContato() {
    if (!nomeContatoDraft.trim() || !telefoneContatoDraft.trim()) return
    setContatos((anteriores) => [...anteriores, { nome: nomeContatoDraft.trim(), telefone: telefoneContatoDraft.trim() }])
    setNomeContatoDraft('')
    setTelefoneContatoDraft('')
    setMostrarFormContato(false)
  }

  function removerContato(idx: number) {
    setContatos((anteriores) => anteriores.filter((_, i) => i !== idx))
  }

  function handleCriarConta() {
    if (!emailValido(email)) {
      setErroEmail('E-mail inválido — confira o formato (ex: nome@exemplo.com)')
      return
    }
    setErroEmail(null)
    completarCadastro(nome, email, contatos)
  }

  const verificacaoCompleta = etapaDoc === 'feita' && etapaSelfie === 'feita'

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 space-y-5 bg-[#f3eef1]">
      <div className="flex flex-col items-center gap-3 pt-2 pb-1">
        <img src={logoCartao} alt="Ponto Seguro" className="w-40 object-contain rounded-xl" />
        <p className="text-center text-sm text-roxo-escuro font-medium max-w-xs">
          "Antes de chegar ao ponto, saiba se você vai estar sozinha."
        </p>
      </div>

      <div className="space-y-1">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome"
          className="w-full border border-rosa-claro rounded-xl px-3 py-3 text-sm text-roxo-escuro bg-white outline-none min-h-[44px]"
        />
      </div>

      <div className="space-y-1">
        <input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (erroEmail) setErroEmail(null)
          }}
          placeholder="E-mail (da faculdade = selo)"
          type="email"
          className={`w-full border rounded-xl px-3 py-3 text-sm text-roxo-escuro bg-white outline-none min-h-[44px] ${
            erroEmail ? 'border-alerta-grave' : 'border-rosa-claro'
          }`}
        />
        {erroEmail && <p className="text-xs text-alerta-grave font-medium">{erroEmail}</p>}
      </div>

      <div className="divide-y divide-rosa-claro border-y border-rosa-claro">
        <ItemVerificacao numero={1} rotulo="Foto do documento" etapa={etapaDoc} onTocar={() => simularVerificacao('doc')} />
        <ItemVerificacao
          numero={2}
          rotulo="Selfie com prova de vida"
          etapa={etapaSelfie}
          onTocar={() => simularVerificacao('selfie')}
        />
        <div className="py-2.5">
          <div className="flex items-center justify-between min-h-[44px]">
            <span className="text-sm text-roxo-escuro">3 Contatos de confiança</span>
            {contatos.length < 2 && !mostrarFormContato && (
              <button type="button" onClick={() => setMostrarFormContato(true)} className="p-1">
                <Plus size={18} className="text-[#9b7f91]" />
              </button>
            )}
          </div>
          {contatos.map((c, idx) => (
            <div key={`${c.nome}-${idx}`} className="flex items-center justify-between text-xs text-[#7a6670] py-1">
              <span>
                {c.nome} · {c.telefone}
              </span>
              <button type="button" onClick={() => removerContato(idx)} className="p-1 -m-1">
                <X size={14} />
              </button>
            </div>
          ))}
          {mostrarFormContato && (
            <div className="space-y-2 pt-1 pb-2">
              <input
                value={nomeContatoDraft}
                onChange={(e) => setNomeContatoDraft(e.target.value)}
                placeholder="Nome do contato"
                className="w-full border border-rosa-claro rounded-lg px-3 py-2 text-sm bg-white outline-none"
              />
              <input
                value={telefoneContatoDraft}
                onChange={(e) => setTelefoneContatoDraft(e.target.value)}
                placeholder="Telefone"
                className="w-full border border-rosa-claro rounded-lg px-3 py-2 text-sm bg-white outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarFormContato(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium border border-rosa-claro text-roxo-escuro"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={adicionarContato}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-roxo-escuro text-white"
                >
                  Salvar contato
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {verificacaoCompleta && <p className="text-xs font-medium text-rosa text-center">Verificação aprovada ✓</p>}
      <p className="text-[11px] text-[#9b7f91] text-center -mt-2">
        Pedimos essa verificação para garantir que só mulheres acessem o app.
      </p>

      <button type="button" onClick={alternarConsentimento} className="w-full flex items-center justify-between py-1">
        <span className="text-xs text-[#7a6670] text-left pr-3">
          Ajudar a mapear a segurança da cidade com dados agregados e anônimos. Nenhum trajeto individual é
          compartilhado. <span className="text-[#b79aab]">(opcional)</span>
        </span>
        <span
          className={`shrink-0 w-11 h-6 rounded-full relative transition-colors ${
            estado.consentimentoMapeamento ? 'bg-roxo-escuro' : 'bg-rosa-claro'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              estado.consentimentoMapeamento ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </span>
      </button>

      <button
        type="button"
        onClick={handleCriarConta}
        className="w-full py-3.5 rounded-xl font-semibold text-sm bg-roxo-escuro text-white min-h-[44px]"
      >
        Criar conta
      </button>

      <button type="button" onClick={pularCadastro} className="w-full text-center text-xs text-[#9b7f91] underline py-2">
        Pular cadastro (demo)
      </button>
    </div>
  )
}
