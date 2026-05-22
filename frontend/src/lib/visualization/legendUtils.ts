import type { LegendEntry } from './colorScale'
import type { LegendItem, LegendConfig } from './legendTypes'

export function entriesToLegendItems(entries: LegendEntry[]): LegendItem[] {
  return entries.map(e => ({ label: e.label, color: e.color, from: e.from, to: e.to }))
}

export function buildCategoricalConfig(title: string | undefined, entries: LegendEntry[]): LegendConfig {
  return { type: 'categorical', title, items: entriesToLegendItems(entries) }
}

export function buildGradientConfig(title: string | undefined, entries: LegendEntry[], minLabel?: string, maxLabel?: string): LegendConfig {
  return { type: 'gradient', title, items: entriesToLegendItems(entries), minLabel, maxLabel }
}

// utility to generate a CSS linear-gradient string from gradient legend items
export function gradientCss(items: LegendItem[]) {
  if (!items.length) return ''
  // use midpoint color stops
  const stops = items.map((it, i) => {
    const pos = Math.round((i / (items.length - 1)) * 100)
    return `${it.color} ${pos}%`
  })
  return `linear-gradient(90deg, ${stops.join(', ')})`
}
