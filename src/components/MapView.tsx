import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import type { Local } from '../types'
import { LOCALIZACAO_USUARIA } from '../data/seed'
import { contagemAtual, faixaContagem, ocorrenciasValidas, piorGravidade } from '../logic/rules'
import { criarIconeLocal, criarIconeUsuaria } from './mapIcons'

const CENTRO_PADRAO: [number, number] = [-23.5614, -46.6558] // meio do corredor Paulista/Consolação
const ZOOM_PADRAO = 15

function ControladorMapa({ centralizarEm }: { centralizarEm: { lat: number; lng: number } | null }) {
  const mapa = useMap()
  useEffect(() => {
    if (centralizarEm) mapa.flyTo([centralizarEm.lat, centralizarEm.lng], 16, { duration: 0.6 })
  }, [centralizarEm, mapa])
  return null
}

export function MapView({
  locais,
  checkedInLocalId,
  localSelecionadoId,
  centralizarEm,
  onSelecionarLocal,
}: {
  locais: Local[]
  checkedInLocalId: string | null
  localSelecionadoId: string | null
  centralizarEm: { lat: number; lng: number } | null
  onSelecionarLocal: (id: string) => void
}) {
  return (
    <MapContainer center={CENTRO_PADRAO} zoom={ZOOM_PADRAO} zoomControl={false} className="w-full h-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ControladorMapa centralizarEm={centralizarEm} />

      <Marker position={[LOCALIZACAO_USUARIA.lat, LOCALIZACAO_USUARIA.lng]} icon={criarIconeUsuaria()} />

      {locais.map((local) => {
        const contagem = contagemAtual(local, checkedInLocalId)
        const { rotulo } = faixaContagem(contagem)
        const gravidade = piorGravidade(ocorrenciasValidas(local.ocorrencias))
        return (
          <Marker
            key={local.id}
            position={[local.lat, local.lng]}
            icon={criarIconeLocal({
              tipo: local.tipo,
              rotulo: local.tipo === 'apoio' ? null : rotulo,
              gravidade,
              selecionado: local.id === localSelecionadoId,
            })}
            eventHandlers={{ click: () => onSelecionarLocal(local.id) }}
          />
        )
      })}
    </MapContainer>
  )
}
