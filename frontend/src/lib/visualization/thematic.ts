import type { Color, LegendEntry } from './colorScale'
import { createCategoricalScale } from './colorScale'
import { classEqualInterval, classQuantiles, assignClass } from './classification'

export type ValueGetter<T> = (item: T) => number | string | null | undefined

export interface ThematicOptions<T> {
  getValue: ValueGetter<T>
  method?: 'equal' | 'quantile' | 'categorical' | 'custom'
  classes?: number
  breaks?: number[]
  palette?: Color[]
  fallback?: Color
}

export function createThematicMapper<T>(options: ThematicOptions<T>) {
  const { getValue, method = 'quantile', classes = 5, palette, fallback = '#999999', breaks } = options

  return {
    prepare(values: number[]) {
      if (method === 'categorical') {
        // for categorical, nothing to precompute
        this._categorical = createCategoricalScale({ palette, fallback })
        return
      }

      if (method === 'equal') {
        this._breaks = classEqualInterval(values, classes)
        return
      }
      if (method === 'quantile') {
        this._breaks = classQuantiles(values, classes)
        return
      }
      if (method === 'custom' && breaks) {
        this._breaks = [...breaks]
        return
      }
    },
    getColor(item: T) {
      const v = getValue(item)
      if (v == null) return fallback
      if (typeof v === 'string') {
        if (!this._categorical) this._categorical = createCategoricalScale({ palette, fallback })
        return this._categorical.get(v)
      }
      const num = Number(v)
      if (!this._breaks || this._breaks.length === 0) return fallback
      const idx = assignClass(num, this._breaks)
      // map class index to a color from palette
      const p = palette && palette.length ? palette : defaultSequentialPalette(this._breaks.length - 1)
      return p[Math.max(0, Math.min(p.length - 1, idx))] || fallback
    },
    legend() {
      if (this._categorical) return this._categorical.legend()
      if (!this._breaks) return [] as LegendEntry[]
      const entries: LegendEntry[] = []
      const p = palette && palette.length ? palette : defaultSequentialPalette(this._breaks.length - 1)
      for (let i = 0; i < this._breaks.length - 1; i++) {
        entries.push({ label: `${this._breaks[i]}–${this._breaks[i + 1]}`, color: p[i] })
      }
      return entries
    },
    _breaks: [] as number[],
    _categorical: null as ReturnType<typeof createCategoricalScale> | null,
  }
}

function defaultSequentialPalette(n: number) {
  // simple monotonic blues fallback
  const base = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#3182bd', '#08519c']
  if (n <= 0) return [base[base.length - 1]]
  if (n <= base.length) return base.slice(0, n)
  // repeat last color when needed
  return Array.from({ length: n }, (_, i) => base[Math.min(i, base.length - 1)])
}
