import L from 'leaflet'
import type { TipoLocal } from '../types'

interface OpcoesIcone {
  tipo: TipoLocal
  rotulo: string | null
  gravidade: 'grave' | 'leve' | null
  selecionado: boolean
}

const COR_ONIBUS = '#7A1F5C'
const COR_METRO = '#4A0F38'
const COR_GRAVE = '#D92D20'
const COR_LEVE = '#B45309'

export function criarIconeLocal({ tipo, rotulo, gravidade, selecionado }: OpcoesIcone): L.DivIcon {
  if (tipo === 'apoio') {
    return L.divIcon({
      className: '',
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-rosa shadow-md ${selecionado ? 'ring-2 ring-offset-1 ring-rosa' : ''}">
          <span class="text-sm leading-none">☕</span>
        </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    })
  }

  const corBase = tipo === 'metro' ? COR_METRO : COR_ONIBUS
  const corAlerta = gravidade === 'grave' ? COR_GRAVE : COR_LEVE
  const anel = selecionado ? 'box-shadow:0 0 0 3px rgba(224,69,123,0.55);' : ''

  if (!rotulo) {
    // neutro: nunca mostrar número — só um círculo pequeno e discreto
    return L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:26px;height:26px;">
          <div style="width:26px;height:26px;border-radius:9999px;background:#fff;border:2.5px solid ${corBase};${anel}"></div>
          ${
            gravidade
              ? `<div style="position:absolute;top:-5px;right:-5px;width:14px;height:14px;transform:rotate(45deg);background:${corAlerta};border:2px solid #fff;border-radius:2px;"></div>`
              : ''
          }
        </div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -13],
    })
  }

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;min-width:40px;height:40px;">
        <div style="min-width:40px;height:40px;border-radius:9999px;background:${corBase};display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35);${anel}">
          <span style="color:#fff;font-weight:700;font-size:12px;font-family:Inter,system-ui,sans-serif;padding:0 6px;">${rotulo}</span>
        </div>
        ${
          gravidade
            ? `<div style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;transform:rotate(45deg);background:${corAlerta};border:2px solid #fff;border-radius:2px;"></div>`
            : ''
        }
      </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  })
}

export function criarIconeUsuaria(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="width:22px;height:22px;border-radius:9999px;background:#E0457B;border:3px solid #fff;box-shadow:0 0 0 4px rgba(224,69,123,0.25);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}
