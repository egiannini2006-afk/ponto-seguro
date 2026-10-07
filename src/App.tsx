import { useState } from 'react'
import { AppStateProvider, useAppState } from './store/AppStateContext'
import { PrototypeBanner } from './components/PrototypeBanner'
import { BottomNav } from './components/BottomNav'
import { Onboarding } from './screens/Onboarding'
import { Radar } from './screens/Radar'
import { Trajeto } from './screens/Trajeto'
import { Beneficios } from './screens/Beneficios'
import { Perfil } from './screens/Perfil'
import type { Aba } from './types'
import logoHorizontal from './assets/logo-horizontal.png'

function Conteudo({ aba, onMudarAba }: { aba: Aba; onMudarAba: (aba: Aba) => void }) {
  switch (aba) {
    case 'radar':
      return <Radar onMudarAba={onMudarAba} />
    case 'trajeto':
      return <Trajeto />
    case 'beneficios':
      return <Beneficios onMudarAba={onMudarAba} />
    case 'perfil':
      return <Perfil />
  }
}

function AppShell() {
  const { estado } = useAppState()
  const [aba, setAba] = useState<Aba>('radar')

  return (
    <div className="relative w-full max-w-[430px] h-full flex flex-col bg-[#f3eef1] shadow-xl overflow-hidden">
      <PrototypeBanner />
      <header className="shrink-0 bg-white border-b border-rosa-claro px-4 py-2.5 flex items-center">
        <img src={logoHorizontal} alt="Ponto Seguro" className="h-5 object-contain" />
      </header>
      {estado.perfil.cadastroCompleto ? (
        <>
          <main className="flex-1 min-h-0 flex flex-col">
            <Conteudo aba={aba} onMudarAba={setAba} />
          </main>
          <BottomNav abaAtiva={aba} onMudarAba={setAba} />
        </>
      ) : (
        <Onboarding />
      )}
    </div>
  )
}

function App() {
  return (
    <AppStateProvider>
      <div className="h-dvh w-full flex justify-center bg-[#e7dde3]">
        <AppShell />
      </div>
    </AppStateProvider>
  )
}

export default App
