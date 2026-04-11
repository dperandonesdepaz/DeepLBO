import type {
  LBOInputs,
  LBOResults,
  YearlyMetrics,
  DebtSchedule,
  ExitScenario,
  ValueBridge,
  SensitivityCell,
} from "@/types/lbo"

// ─── Core LBO calculation engine ────────────────────────────────────────────

export function computeLBO(inputs: LBOInputs): LBOResults {
  const {
    revenue: rev0, ebitda: ebitda0, da: da0, netDebt, cash,
    entryMultiple, feesPct, leverage, interestRate,
    amortization, revenueGrowth, ebitdaMargin, daPct,
    capexPct, wcChange, taxRate, exitMultiples, holdPeriod,
  } = inputs

  // ── Entry ──────────────────────────────────────────────────────────────────
  const ev            = ebitda0 * entryMultiple
  const equityValue   = ev - netDebt + cash
  const fees          = ev * feesPct
  const totalEquity   = equityValue + fees
  const seniorDebt    = ebitda0 * leverage
  const annualInterest0 = seniorDebt * interestRate
  const ebit0         = ebitda0 - da0
  const interestCoverage = ebit0 / Math.max(annualInterest0, 0.001)
  const debtOverEbitda   = seniorDebt / Math.max(ebitda0, 0.001)

  // ── Yearly P&L ─────────────────────────────────────────────────────────────
  const yearly: YearlyMetrics[] = []
  const debtSchedule: DebtSchedule[] = []

  // Year 0 (entry)
  yearly.push({
    year: 0,
    revenue: rev0,
    revenueGrowth: null,
    ebitda: ebitda0,
    ebitdaMargin: ebitda0 / Math.max(rev0, 0.001),
    da: -da0,
    ebit: ebit0,
    ebitMargin: ebit0 / Math.max(rev0, 0.001),
    interest: -annualInterest0,
    ebt: ebit0 - annualInterest0,
    taxes: Math.max(ebit0 - annualInterest0, 0) > 0
      ? -Math.max(ebit0 - annualInterest0, 0) * taxRate : 0,
    netIncome: 0, // filled below
    netMargin: 0,
    capex: -rev0 * (capexPct[0] ?? 0.06),
    wcChange: 0,
    fcfBeforeDebt: 0,
    debtAmort: 0,
    fcfToEquity: 0,
  })
  const y0 = yearly[0]
  y0.netIncome = y0.ebt + y0.taxes
  y0.netMargin = y0.netIncome / Math.max(rev0, 0.001)
  y0.fcfBeforeDebt = y0.ebitda + y0.capex + y0.wcChange + y0.taxes
  y0.fcfToEquity   = y0.fcfBeforeDebt

  // Year 0 debt
  debtSchedule.push({
    year: 0, openingBalance: seniorDebt, amortization: 0,
    closingBalance: seniorDebt, interest: annualInterest0,
    leverageRatio: seniorDebt / Math.max(ebitda0, 0.001),
    coverageRatio: ebitda0 / Math.max(annualInterest0, 0.001),
  })

  // Years 1–5
  for (let y = 1; y <= 5; y++) {
    const idx = y - 1
    const prevRevenue = yearly[y - 1].revenue
    const rev   = prevRevenue * (1 + (revenueGrowth[idx] ?? 0))
    const ebitda = rev * (ebitdaMargin[idx] ?? 0.15)
    const da    = rev * (daPct[idx] ?? 0.05)
    const ebit  = ebitda - da
    const prevDebt = debtSchedule[y - 1].closingBalance
    const amort = amortization[idx] ?? 0
    const closingDebt = Math.max(0, prevDebt - amort)
    const interest = prevDebt * interestRate
    const ebt   = ebit - interest
    const taxes = ebt > 0 ? -ebt * taxRate : 0
    const netIncome = ebt + taxes
    const capex = -rev * (capexPct[idx] ?? 0.06)
    const wc    = wcChange[idx] ?? 0
    const fcf   = ebitda + capex + wc + taxes
    const fcfEq = fcf - amort

    yearly.push({
      year: y,
      revenue: rev,
      revenueGrowth: rev / prevRevenue - 1,
      ebitda, ebitdaMargin: ebitda / rev,
      da: -da, ebit, ebitMargin: ebit / rev,
      interest: -interest, ebt, taxes, netIncome,
      netMargin: netIncome / rev,
      capex, wcChange: wc, fcfBeforeDebt: fcf,
      debtAmort: -amort, fcfToEquity: fcfEq,
    })

    debtSchedule.push({
      year: y, openingBalance: prevDebt,
      amortization: amort, closingBalance: closingDebt,
      interest,
      leverageRatio: closingDebt / Math.max(ebitda, 0.001),
      coverageRatio: ebitda / Math.max(interest, 0.001),
    })
  }

  // ── Exit scenarios ─────────────────────────────────────────────────────────
  const exitYear  = Math.min(holdPeriod, 5)
  const ebitdaExit = yearly[exitYear].ebitda
  const debtExit   = debtSchedule[exitYear].closingBalance

  const scenarioKeys = ['bear', 'base', 'bull', 'strategic'] as const
  const scenarioLabels = ['Bear', 'Base', 'Bull', 'Strategic'] as const

  const scenarios: ExitScenario[] = scenarioKeys.map((key, i) => {
    const mult        = exitMultiples[key]
    const evExit      = ebitdaExit * mult
    const equityExit  = Math.max(0, evExit - debtExit)
    const gain        = equityExit - totalEquity
    const moic        = equityExit / Math.max(totalEquity, 0.001)
    const irr         = Math.pow(Math.max(moic, 0), 1 / Math.max(holdPeriod, 1)) - 1
    return {
      scenario: scenarioLabels[i],
      exitMultiple: mult, ebitdaAtExit: ebitdaExit,
      evAtExit: evExit, debtAtExit: debtExit,
      equityAtExit: equityExit, equityInvested: totalEquity,
      grossGain: gain, moic, irr,
    }
  })

  // ── Value bridge (base case) ───────────────────────────────────────────────
  const base       = scenarios[1]
  const totalGain  = base.grossGain
  const ebitdaGrowthValue = (ebitdaExit - ebitda0) * base.exitMultiple
  const multipleExpansion = ebitda0 * (base.exitMultiple - entryMultiple)
  const deleveraging      = seniorDebt - debtExit
  // Residual (inorganic/other)
  const residual = totalGain - ebitdaGrowthValue - multipleExpansion - deleveraging

  const valueBridge: ValueBridge[] = [
    { label: 'Equity Invertido',         value: -totalEquity,          pct: null,   color: 'negative' },
    { label: 'Crecimiento EBITDA',        value: ebitdaGrowthValue,     pct: ebitdaGrowthValue / Math.max(totalGain, 0.001), color: 'positive' },
    { label: 'Expansión de Múltiplo',     value: multipleExpansion,     pct: multipleExpansion / Math.max(totalGain, 0.001), color: 'positive' },
    { label: 'Desapalancamiento',         value: deleveraging,          pct: deleveraging / Math.max(totalGain, 0.001),      color: 'positive' },
    ...(Math.abs(residual) > 0.1 ? [{ label: 'Otros',  value: residual, pct: residual / Math.max(totalGain, 0.001), color: 'neutral' as const }] : []),
    { label: 'Ganancia Bruta Total',      value: totalGain,             pct: 1,      color: 'total' },
  ]

  // ── Sensitivity ───────────────────────────────────────────────────────────
  const exitMults  = [10, 12, 14, 16, 18]
  const ebitdaM5s  = [0.13, 0.15, 0.17, 0.19, 0.21]
  const holdYears  = [3, 4, 5, 6, 7]

  const irrSensitivity: SensitivityCell[] = []
  for (const em of exitMults) {
    for (const m5 of ebitdaM5s) {
      const rev5   = yearly[5].revenue
      const eb5    = rev5 * m5
      const ev5    = eb5 * em
      const eq5    = Math.max(0, ev5 - debtExit)
      const moic5  = eq5 / Math.max(totalEquity, 0.001)
      const irr5   = Math.pow(Math.max(moic5, 0), 1 / Math.max(holdPeriod, 1)) - 1
      irrSensitivity.push({ row: em, col: m5, irr: irr5 })
    }
  }

  const moicSensitivity: SensitivityCell[] = []
  for (const hy of holdYears) {
    const yr    = Math.min(hy, 5)
    const eb_hy = yearly[yr].ebitda
    const dt_hy = debtSchedule[yr].closingBalance
    for (const em of exitMults) {
      const ev_h = eb_hy * em
      const eq_h = Math.max(0, ev_h - dt_hy)
      const m    = eq_h / Math.max(totalEquity, 0.001)
      moicSensitivity.push({ row: hy, col: em, moic: m })
    }
  }

  return {
    ev, equityValue, fees, totalEquityInvested: totalEquity,
    seniorDebt, debtOverEbitda, interestCoverage,
    yearly, debtSchedule, scenarios, valueBridge,
    irrSensitivity, moicSensitivity,
  }
}

// ─── Format helpers ──────────────────────────────────────────────────────────

export const fmt = {
  eur:  (v: number, decimals = 1) => `€${v.toFixed(decimals)}M`,
  pct:  (v: number, decimals = 1) => `${(v * 100).toFixed(decimals)}%`,
  mult: (v: number, decimals = 1) => `${v.toFixed(decimals)}x`,
  num:  (v: number, decimals = 1) => v.toFixed(decimals),
  sign: (v: number) => v >= 0 ? '+' : '',
}

export function irrColor(irr: number): string {
  if (irr >= 0.45) return 'text-emerald-600 bg-emerald-50'
  if (irr >= 0.35) return 'text-green-600 bg-green-50'
  if (irr >= 0.25) return 'text-amber-600 bg-amber-50'
  return 'text-red-600 bg-red-50'
}

export function moicColor(moic: number): string {
  if (moic >= 5)   return 'text-emerald-600 bg-emerald-50'
  if (moic >= 3.5) return 'text-green-600 bg-green-50'
  if (moic >= 2.5) return 'text-amber-600 bg-amber-50'
  return 'text-red-600 bg-red-50'
}

export function irrLabel(irr: number): string {
  if (irr >= 0.45) return 'Excepcional'
  if (irr >= 0.35) return 'Excelente'
  if (irr >= 0.25) return 'Bueno'
  return 'Bajo'
}
