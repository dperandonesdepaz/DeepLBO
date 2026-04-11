// ─── M&A Analysis Types ──────────────────────────────────────────────────────

export type AnalysisType = 'lbo' | 'dcf' | 'merger' | 'comps'

// ─── DCF Types ────────────────────────────────────────────────────────────────

export interface DCFInputs {
  companyName: string
  sector: string
  analysisDate: number

  // LTM Financials
  revenue: number       // M€
  ebitda: number        // M€
  da: number            // D&A M€
  capex: number         // Capex M€
  netDebt: number       // M€
  minorities: number    // M€

  // 5-year FCF projections
  revenueGrowth: number[]      // [y1..y5] decimal
  ebitdaMarginFwd: number[]    // [y1..y5] decimal
  daPct: number[]              // [y1..y5] % of revenue
  capexPct: number[]           // [y1..y5] % of revenue
  wcChangePct: number[]        // [y1..y5] % of revenue (positive = outflow)
  taxRate: number              // decimal

  // WACC (CAPM)
  riskFreeRate: number         // decimal
  equityRiskPremium: number    // decimal (ERP)
  beta: number                 // unlevered/levered beta
  costOfDebt: number           // decimal (pre-tax)
  debtWeight: number           // decimal (D/(D+E))

  // Terminal Value
  terminalGrowthRate: number   // decimal (Gordon growth)
  exitMultipleTV: number       // EV/EBITDA for exit multiple method
  tvMethod: 'gordon' | 'exit_multiple'

  // Optional
  controlPremium: number       // decimal (0 = no premium)
  sharesOutstanding: number    // M shares (0 = not set)
}

export interface DCFYearlyFCF {
  year: number
  revenue: number
  revenueGrowth: number
  ebitda: number
  ebitdaMargin: number
  da: number
  ebit: number
  taxes: number
  nopat: number
  capex: number
  wcChange: number
  fcf: number
  discountFactor: number
  pvFCF: number
}

export interface DCFResults {
  wacc: number
  costOfEquity: number
  costOfDebtAfterTax: number
  pvFCFs: number
  terminalValueGordon: number
  terminalValueExit: number
  terminalValue: number
  pvTerminalValue: number
  tvAsPctOfEV: number
  enterpriseValue: number
  equityValue: number
  pricePerShare: number | null
  impliedEVEBITDA: number
  impliedEVRevenue: number
  yearly: DCFYearlyFCF[]
  // WACC x TGR sensitivity (5x5 grid)
  sensitivity: { wacc: number; tgr: number; ev: number; equity: number }[]
}

export const DEFAULT_DCF_INPUTS: DCFInputs = {
  companyName: '',
  sector: '',
  analysisDate: new Date().getFullYear(),
  revenue: 50,
  ebitda: 10,
  da: 2,
  capex: 3,
  netDebt: 5,
  minorities: 0,
  revenueGrowth: [0.10, 0.08, 0.07, 0.06, 0.05],
  ebitdaMarginFwd: [0.20, 0.21, 0.22, 0.22, 0.22],
  daPct: [0.04, 0.04, 0.04, 0.04, 0.04],
  capexPct: [0.05, 0.05, 0.05, 0.045, 0.045],
  wcChangePct: [0.01, 0.01, 0.008, 0.008, 0.007],
  taxRate: 0.25,
  riskFreeRate: 0.035,
  equityRiskPremium: 0.055,
  beta: 1.2,
  costOfDebt: 0.05,
  debtWeight: 0.30,
  terminalGrowthRate: 0.025,
  exitMultipleTV: 10,
  tvMethod: 'gordon',
  controlPremium: 0,
  sharesOutstanding: 0,
}

// ─── Comparable Companies (Comps) Types ──────────────────────────────────────

export interface CompEntry {
  id: string
  name: string
  ticker: string
  country: string
  marketCap: number    // M€
  netDebt: number      // M€
  revenue: number      // LTM M€
  ebitda: number       // LTM M€
  ebit: number         // LTM M€
  netIncome: number    // LTM M€
  // Computed
  ev: number           // marketCap + netDebt
  evRevenue: number
  evEbitda: number
  evEbit: number
  peRatio: number
  notes: string
}

export interface CompsInputs {
  targetName: string
  sector: string
  targetRevenue: number   // M€ LTM
  targetEBITDA: number
  targetEBIT: number
  targetNetIncome: number
  targetNetDebt: number
  entries: CompEntry[]
}

export interface CompsResults {
  medianEVRevenue: number
  medianEVEBITDA: number
  medianEVEBIT: number
  medianPE: number
  meanEVRevenue: number
  meanEVEBITDA: number
  q1EVEbitda: number
  q3EVEbitda: number
  // Implied valuations (EV)
  impliedEVFromRevenue: number
  impliedEVFromEBITDA: number
  impliedEVFromEBIT: number
  impliedEquityFromPE: number
  impliedEquityFromEBITDA: number
}

export const DEFAULT_COMPS_INPUTS: CompsInputs = {
  targetName: '',
  sector: '',
  targetRevenue: 50,
  targetEBITDA: 10,
  targetEBIT: 8,
  targetNetIncome: 5,
  targetNetDebt: 5,
  entries: [],
}

// ─── Merger / Accretion-Dilution Types ───────────────────────────────────────

export interface MergerInputs {
  dealName: string
  dealDate: number

  // Acquirer
  acquirerName: string
  acquirerRevenue: number      // M€ LTM
  acquirerEBITDA: number       // M€ LTM
  acquirerNetIncome: number    // M€ LTM (pre-deal standalone)
  acquirerShares: number       // M shares outstanding
  acquirerSharePrice: number   // €/share
  acquirerNetDebt: number      // M€
  acquirerTaxRate: number      // decimal

  // Target
  targetName: string
  targetRevenue: number        // M€ LTM
  targetEBITDA: number         // M€ LTM
  targetNetIncome: number      // M€ LTM (standalone, pre-synergies)
  targetNetDebt: number        // M€

  // Deal Structure
  purchaseEV: number           // Enterprise Value paid M€
  cashPct: number              // % of deal paid in cash (0-1)
  // stockPct = 1 - cashPct

  // Financing the cash portion
  debtFinancingPct: number     // % of cash consideration via new debt (0-1)
  debtCost: number             // % interest on incremental debt
  cashYield: number            // % return on cash used (opportunity cost)

  // Synergies (annual run-rate)
  costSynergies: number        // M€
  revenueSynergies: number     // M€ (incremental EBITDA effect)
  synergyRampYr1Pct: number    // decimal (% of full synergies achieved in yr1)
  integrationCosts: number     // M€ one-time (after-tax)
}

export interface MergerYearResults {
  year: number
  revenueSynergiesRATE: number
  costSynergiesRATE: number
  totalSynergiesAfterTax: number
  incrementalInterestCost: number
  incrementalCashYieldLost: number
  netIncomeEffect: number
  combinedNetIncome: number
  proFormaEPS: number
  accretionDilutionPct: number
  isAccretive: boolean
}

export interface MergerResults {
  // Valuation metrics
  equityPurchasePrice: number
  impliedTargetEVEBITDA: number
  impliedTargetPE: number

  // Consideration breakdown
  totalConsideration: number   // = equityPurchasePrice
  cashConsideration: number
  stockConsideration: number
  debtFinanced: number
  equityCash: number           // cash from acquirer balance sheet

  // Shares
  newSharesIssued: number      // M new acquirer shares
  exchangeRatio: number        // acquirer shares per target share (conceptual)
  proFormaShares: number       // M
  ownershipDilution: number    // % dilution for existing shareholders

  // Acquirer standalone
  acquirerEPS: number

  // Pro-forma combined (before synergies)
  combinedRevenue: number
  combinedEBITDA: number
  combinedNetIncomeBase: number // before synergies, before deal effects

  // Year 1 and Year 2 with synergy ramp
  yr1: MergerYearResults
  yr2: MergerYearResults

  // Full synergy scenario
  fullSynergy: {
    totalSynAfterTax: number
    netIncomeEffect: number
    combinedNI: number
    eps: number
    adPct: number
    isAccretive: boolean
  }
}

export const DEFAULT_MERGER_INPUTS: MergerInputs = {
  dealName: '',
  dealDate: new Date().getFullYear(),
  acquirerName: '',
  acquirerRevenue: 200,
  acquirerEBITDA: 40,
  acquirerNetIncome: 22,
  acquirerShares: 10,
  acquirerSharePrice: 15,
  acquirerNetDebt: 20,
  acquirerTaxRate: 0.25,
  targetName: '',
  targetRevenue: 50,
  targetEBITDA: 10,
  targetNetIncome: 5,
  targetNetDebt: 8,
  purchaseEV: 80,
  cashPct: 0.70,
  debtFinancingPct: 0.50,
  debtCost: 0.05,
  cashYield: 0.03,
  costSynergies: 3,
  revenueSynergies: 1,
  synergyRampYr1Pct: 0.50,
  integrationCosts: 4,
}

// ─── Football Field (Valuation Bridge) ───────────────────────────────────────

export interface ValuationRange {
  method: string
  description: string
  low: number
  high: number
  midpoint: number
  color: string
}
