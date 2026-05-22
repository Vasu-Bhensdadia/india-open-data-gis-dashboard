// Reusable color scale utilities for choropleth and categorical maps
// Lightweight, dependency-free color interpolation and scale factories

export type Color = string

export interface LegendEntry {
  label: string
  color: Color
  from?: number
  to?: number
}

export interface CategoricalScaleOptions {
  palette?: Color[]
  domain?: string[]
  fallback?: Color
  highContrast?: boolean
}

export function createCategoricalScale(options: CategoricalScaleOptions = {}) {
  const { palette = defaultPalette, domain = [], fallback = '#999999' } = options
  const map = new Map<string, Color>()
  let nextIndex = 0

  // pre-populate for known domain
  domain.forEach((d, i) => map.set(d, palette[i % palette.length]))

  return {
    get(category: string | number | null | undefined) {
      if (category == null) return fallback
      const key = String(category)
      if (map.has(key)) return map.get(key) as Color
      const color = palette[nextIndex % palette.length]
      map.set(key, color)
      nextIndex += 1
      return color
    },
    legend() {
      return Array.from(map.entries()).map(([k, c]) => ({ label: k, color: c }))
    },
    override(mapping: Record<string, Color>) {
      Object.entries(mapping).forEach(([k, c]) => map.set(k, c))
    },
  }
}

export const defaultPalette: Color[] = [
  '#2b83ba', // blue
  '#abdda4', // green
  '#fdae61', // orange
  '#d7191c', // red
  '#984ea3', // purple
  '#ffffbf', // yellow
]

// Numeric gradient scale (linear interpolation between multiple stops)
export interface GradientScaleOptions {
  domain: [number, number]
  colors?: Color[]
  steps?: number
  clamp?: boolean
}

export function createGradientScale(opts: GradientScaleOptions) {
  const { domain, colors = ['#f7fbff', '#08306b'], steps = 5, clamp = true } = opts

  const stops = colors.map(hexToRgb)

  function tForValue(v: number) {
    const [a, b] = domain
    if (a === b) return 0
    const t = (v - a) / (b - a)
    return clamp ? Math.max(0, Math.min(1, t)) : t
  }

  function getColor(value: number) {
    const t = tForValue(value)
    // position across stops
    const scaled = t * (stops.length - 1)
    const i = Math.floor(scaled)
    const frac = scaled - i
    const c0 = stops[Math.min(i, stops.length - 1)]
    const c1 = stops[Math.min(i + 1, stops.length - 1)]
    const interpolated = interpolateRgb(c0, c1, frac)
    return rgbToHex(interpolated)
  }

  function legend(bins = steps) {
    const entries: LegendEntry[] = []
    const [a, b] = domain
    for (let i = 0; i < bins; i++) {
      const from = a + (i / bins) * (b - a)
      const to = a + ((i + 1) / bins) * (b - a)
      const mid = (from + to) / 2
      entries.push({ label: `${round(from)}–${round(to)}`, color: getColor(mid), from, to })
    }
    return entries
  }

  return { getColor, legend, domain }
}

// Some useful predefined thematic scales
export function electionPartyColors(overrides: Record<string, Color> = {}) {
  // minimal default mapping; consumers should override/extend
  const defaults: Record<string, Color> = {
    BJP: '#f59e0b',
    INC: '#2563eb',
    AITC: '#ef4444',
    CPI: '#2b8cbe',
    BSP: '#6b21a8',
    Independent: '#6b7280',
  }
  return { ...defaults, ...overrides }
}

export function populationDensityGradient(domain: [number, number]) {
  // light -> dark using a perceptually-ordered blue
  return createGradientScale({ domain, colors: ['#f7fbff', '#deebf7', '#9ecae1', '#3182bd'], steps: 6 })
}

export function literacyPercentageGradient(domain: [number, number]) {
  // low literacy red -> high literacy green
  return createGradientScale({ domain, colors: ['#d7191c', '#fdae61', '#ffffbf', '#abdda4', '#2b83ba'], steps: 6 })
}

// --- small helpers ---
function round(n: number) {
  return Math.round(n * 100) / 100
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 }
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  const toHex = (v: number) => Math.round(v).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function interpolateRgb(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number) {
  return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t }
}
