import type { DCFInputs, DCFResults, DCFYearlyFCF } from "@/types/ma"

function median(arr: number[]): number {
  if (arr.length === 0) return 0
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 !== 0 ? s[m] : (s[m - 1] + s[m]) / 2
}

export function computeDCF(i: DCFInputs): DCFResults | null {
  if (i.revenue === 0) return null

  // ── WACC ─────────────────────────────────────────────────────────────────
  const equityWeight = 1 - i.debtWeight
  const costOfEquity = i.riskFreeRate + i.beta * i.equityRiskPremium
  const costOfDebtAfterTax = i.costOfDebt * (1 - i.taxRate)
  const wacc = equityWeight * costOfEquity + i.debtWeight * costOfDebtAfterTax

  // ── 5-year FCF projections ────────────────────────────────────────────────
  const yearly: DCFYearlyFCF[] = []
  let prevRevenue = i.revenue
  let pvFCFs = 0

  for (let yr = 1; yr <= 5; yr++) {
    const growth = i.revenueGrowth[yr - 1] ?? 0
    const revenue = prevRevenue * (1 + growth)
    const ebitdaMargin = i.ebitdaMarginFwd[yr - 1] ?? 0
    const ebitda = revenue * ebitdaMargin
    const da = revenue * (i.daPct[yr - 1] ?? 0)
    const ebit = ebitda - da
    const taxes = Math.max(0, ebit) * i.taxRate
    const nopat = ebit - taxes
    const capex = revenue * (i.capexPct[yr - 1] ?? 0)
    const wcChange = revenue * (i.wcChangePct[yr - 1] ?? 0)
    const fcf = nopat + da - capex - wcChange
    const discountFactor = 1 / Math.pow(1 + wacc, yr)
    const pvFCF = fcf * discountFactor
    pvFCFs += pvFCF

    yearly.push({
      year: yr,
      revenue,
      revenueGrowth: growth,
      ebitda,
      ebitdaMargin,
      da,
      ebit,
      taxes,
      nopat,
      capex,
      wcChange,
      fcf,
      discountFactor,
      pvFCF,
    })
    prevRevenue = revenue
  }

  // ── Terminal Value ────────────────────────────────────────────────────────
  const lastFCF = yearly[4].fcf
  const lastEBITDA = yearly[4].ebitda
  const tgr = i.terminalGrowthRate
  const tv5Factor = 1 / Math.pow(1 + wacc, 5)

  const terminalValueGordon = wacc > tgr
    ? lastFCF * (1 + tgr) / (wacc - tgr)
    : lastFCF * (1 + tgr) / 0.001

  const terminalValueExit = lastEBITDA * i.exitMultipleTV
  const terminalValue = i.tvMethod === 'gordon' ? terminalValueGordon : terminalValueExit
  const pvTerminalValue = terminalValue * tv5Factor

  // ── Enterprise Value & Equity ─────────────────────────────────────────────
  const controlPremiumFactor = 1 + i.controlPremium
  const enterpriseValue = (pvFCFs + pvTerminalValue) * controlPremiumFactor
  const equityValue = enterpriseValue - i.netDebt - i.minorities
  const tvAsPctOfEV = pvTerminalValue / (pvFCFs + pvTerminalValue)

  const impliedEVEBITDA = i.ebitda > 0 ? enterpriseValue / i.ebitda : 0
  const impliedEVRevenue = i.revenue > 0 ? enterpriseValue / i.revenue : 0
  const pricePerShare = i.sharesOutstanding > 0 ? equityValue / i.sharesOutstanding : null

  // ── Sensitivity: WACC × TGR (5×5) ────────────────────────────────────────
  const waccDeltas = [-0.02, -0.01, 0, +0.01, +0.02]
  const tgrDeltas  = [-0.01, -0.005, 0, +0.005, +0.01]
  const sensitivity: { wacc: number; tgr: number; ev: number; equity: number }[] = []

  for (const dw of waccDeltas) {
    for (const dt of tgrDeltas) {
      const w = wacc + dw
      const t = tgr + dt
      if (w <= t) {
        sensitivity.push({ wacc: w, tgr: t, ev: 0, equity: 0 })
        continue
      }

      let pvf = 0
      let pr = i.revenue
      const lastFcfForSens: number[] = []

      for (let yr = 1; yr <= 5; yr++) {
        const rev = pr * (1 + (i.revenueGrowth[yr - 1] ?? 0))
        const eb = rev * (i.ebitdaMarginFwd[yr - 1] ?? 0)
        const d = rev * (i.daPct[yr - 1] ?? 0)
        const ebitS = eb - d
        const taxS = Math.max(0, ebitS) * i.taxRate
        const nop = ebitS - taxS
        const cp = rev * (i.capexPct[yr - 1] ?? 0)
        const wc = rev * (i.wcChangePct[yr - 1] ?? 0)
        const f = nop + d - cp - wc
        pvf += f / Math.pow(1 + w, yr)
        lastFcfForSens[yr - 1] = f
        pr = rev
      }

      const lf = lastFcfForSens[4] ?? lastFCF
      const le = yearly[4].ebitda
      const tv = i.tvMethod === 'gordon'
        ? lf * (1 + t) / (w - t)
        : le * i.exitMultipleTV
      const ev2 = (pvf + tv / Math.pow(1 + w, 5)) * controlPremiumFactor
      const eq2 = ev2 - i.netDebt - i.minorities
      sensitivity.push({ wacc: w, tgr: t, ev: ev2, equity: eq2 })
    }
  }

  return {
    wacc,
    costOfEquity,
    costOfDebtAfterTax,
    pvFCFs,
    terminalValueGordon,
    terminalValueExit,
    terminalValue,
    pvTerminalValue,
    tvAsPctOfEV,
    enterpriseValue,
    equityValue,
    pricePerShare,
    impliedEVEBITDA,
    impliedEVRevenue,
    yearly,
    sensitivity,
  }
}

// ── Formatting helpers (re-export from lbo-engine style) ─────────────────────
export const fmtDCF = {
  eur:  (v: number) => `€${Math.abs(v).toFixed(1)}M`,
  pct:  (v: number) => `${(v * 100).toFixed(1)}%`,
  mult: (v: number) => `${v.toFixed(1)}x`,
  ratio:(v: number) => v.toFixed(2),
}
