import type { LegendEntry } from './colorScale'

export type LegendOrientation = 'vertical' | 'horizontal'

export interface LegendItem {
  label: string
  color: string
  from?: number
  to?: number
}

export interface BaseLegendConfig {
  title?: string
  orientation?: LegendOrientation
}

export interface CategoricalLegendConfig extends BaseLegendConfig {
  type: 'categorical'
  items: LegendItem[]
}

export interface GradientLegendConfig extends BaseLegendConfig {
  type: 'gradient'
  items: LegendItem[]
  minLabel?: string
  maxLabel?: string
}

export type LegendConfig = CategoricalLegendConfig | GradientLegendConfig

export interface MapLegendProps {
  config: LegendConfig
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'floating'
  onItemHover?: (item: LegendItem | null) => void
  className?: string
}

// Allow consumers to convert `LegendEntry` (from scales) to `LegendItem`
export function fromLegendEntry(e: LegendEntry): LegendItem {
  return { label: e.label, color: e.color, from: e.from, to: e.to }
}
