// Metric classification utilities: equal interval and quantiles

export type Breaks = number[]

export function classEqualInterval(values: number[], classes: number) {
  if (!values.length || classes <= 0) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  const step = (max - min) / classes
  const breaks: number[] = []
  for (let i = 0; i <= classes; i++) breaks.push(min + step * i)
  return breaks
}

export function classQuantiles(values: number[], classes: number) {
  if (!values.length || classes <= 0) return []
  const sorted = [...values].sort((a, b) => a - b)
  const breaks: number[] = [sorted[0]]
  for (let i = 1; i < classes; i++) {
    const q = (i * (sorted.length - 1)) / classes
    const lo = Math.floor(q)
    const hi = Math.ceil(q)
    const frac = q - lo
    const val = lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * frac
    breaks.push(val)
  }
  breaks.push(sorted[sorted.length - 1])
  return breaks
}

export function assignClass(value: number, breaks: Breaks) {
  if (!breaks || breaks.length === 0) return -1
  for (let i = 0; i < breaks.length - 1; i++) {
    if (value >= breaks[i] && value <= breaks[i + 1]) return i
  }
  return -1
}
