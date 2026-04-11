import type { CompsInputs, CompsResults, CompEntry } from "@/types/ma"

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0
  const s = [...arr].sort((a, b) => a - b)
  const idx = (p / 100) * (s.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  return s[lo] + (s[hi] - s[lo]) * (idx - lo)
}

function median(arr: number[]): number {
  return percentile(arr, 50)
}

function mean(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

export function computeCompEntry(e: Omit<CompEntry, 'ev' | 'evRevenue' | 'evEbitda' | 'evEbit' | 'peRatio'>): CompEntry {
  const ev = e.marketCap + e.netDebt
  return {
    ...e,
    ev,
    evRevenue: e.revenue > 0 ? ev / e.revenue : 0,
    evEbitda:  e.ebitda  > 0 ? ev / e.ebitda  : 0,
    evEbit:    e.ebit    > 0 ? ev / e.ebit     : 0,
    peRatio:   e.netIncome > 0 ? e.marketCap / e.netIncome : 0,
  }
}

export function computeComps(i: CompsInputs): CompsResults | null {
  if (i.entries.length === 0) return null

  const validEVEBITDA  = i.entries.filter(e => e.evEbitda > 0).map(e => e.evEbitda)
  const validEVRev     = i.entries.filter(e => e.evRevenue > 0).map(e => e.evRevenue)
  const validEVEBIT    = i.entries.filter(e => e.evEbit > 0).map(e => e.evEbit)
  const validPE        = i.entries.filter(e => e.peRatio > 0).map(e => e.peRatio)

  const medEVEBITDA = median(validEVEBITDA)
  const medEVRev    = median(validEVRev)
  const medEVEBIT   = median(validEVEBIT)
  const medPE       = median(validPE)
  const mnEVEBITDA  = mean(validEVEBITDA)
  const mnEVRev     = mean(validEVRev)
  const q1EV        = percentile(validEVEBITDA, 25)
  const q3EV        = percentile(validEVEBITDA, 75)

  return {
    medianEVRevenue:  medEVRev,
    medianEVEBITDA:   medEVEBITDA,
    medianEVEBIT:     medEVEBIT,
    medianPE:         medPE,
    meanEVRevenue:    mnEVRev,
    meanEVEBITDA:     mnEVEBITDA,
    q1EVEbitda:       q1EV,
    q3EVEbitda:       q3EV,
    impliedEVFromRevenue:  i.targetRevenue  * medEVRev,
    impliedEVFromEBITDA:   i.targetEBITDA   * medEVEBITDA,
    impliedEVFromEBIT:     i.targetEBIT     * medEVEBIT,
    impliedEquityFromPE:   i.targetNetIncome * medPE,
    impliedEquityFromEBITDA: i.targetEBITDA * medEVEBITDA - i.targetNetDebt,
  }
}
