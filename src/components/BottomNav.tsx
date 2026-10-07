import { Radar as RadarIcon, Navigation, Gift, User } from 'lucide-react'
import type { Aba } from '../types'

const ITENS: { aba: Aba; rotulo: string; Icone: typeof RadarIcon }[] = [
  { aba: 'radar', rotulo: 'Radar', Icone: RadarIcon },
  { aba: 'trajeto', rotulo: 'Trajeto', Icone: Navigation },
  { aba: 'beneficios', rotulo: 'Benefícios', Icone: Gift },
  { aba: 'perfil', rotulo: 'Perfil', Icone: User },
]

export function BottomNav({ abaAtiva, onMudarAba }: { abaAtiva: Aba; onMudarAba: (aba: Aba) => void }) {
  return (
    <nav className="shrink-0 bg-white border-t border-rosa-claro flex" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {ITENS.map(({ aba, rotulo, Icone }) => {
        const ativa = aba === abaAtiva
        return (
          <button
            key={aba}
            type="button"
            onClick={() => onMudarAba(aba)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px]"
            aria-current={ativa ? 'page' : undefined}
          >
            <Icone size={22} strokeWidth={ativa ? 2.4 : 1.8} color={ativa ? '#4A0F38' : '#9b7f91'} />
            <span className={`text-[11px] ${ativa ? 'font-semibold text-roxo-escuro' : 'text-[#9b7f91]'}`}>{rotulo}</span>
          </button>
        )
      })}
    </nav>
  )
}
