// ─── LBO Model Types ────────────────────────────────────────────────────────

export interface LBOInputs {
  // Company Profile
  companyName: string
  sector: string
  transactionYear: number

  // LTM Financials
  revenue: number       // M€
  ebitda: number        // M€
  da: number            // D&A M€
  netDebt: number       // Net financial debt M€
  cash: number          // Cash at closing M€

  // Entry Valuation
  entryMultiple: number // x EBITDA
  feesPct: number       // % of EV

  // Capital Structure
  leverage: number      // x EBITDA (senior debt)
  interestRate: number  // annual %
  amortization: number[] // [y1, y2, y3, y4, y5] M€

  // Projections (per year, index 0 = Y1)
  revenueGrowth: number[]   // % [y1..y5]
  ebitdaMargin: number[]    // % [y1..y5]
  daPct: number[]           // D&A % revenue [y1..y5]
  capexPct: number[]        // Capex % revenue [y1..y5]
  wcChange: number[]        // ΔWC M€ [y1..y5] (negative = outflow)

  // Tax & Exit
  taxRate: number           // %
  exitMultiples: {
    bear: number
    base: number
    bull: number
    strategic: number
  }
  holdPeriod: number        // years
}

export interface YearlyMetrics {
  year: number       // 0 = entry, 1..5 = hold years
  revenue: number
  revenueGrowth: number | null
  ebitda: number
  ebitdaMargin: number
  da: number
  ebit: number
  ebitMargin: number
  interest: number
  ebt: number
  taxes: number
  netIncome: number
  netMargin: number
  // FCF
  capex: number
  wcChange: number
  fcfBeforeDebt: number
  debtAmort: number
  fcfToEquity: number
}

export interface DebtSchedule {
  year: number
  openingBalance: number
  amortization: number
  closingBalance: number
  interest: number
  leverageRatio: number    // Debt/EBITDA
  coverageRatio: number    // EBITDA/Interest
}

export interface ExitScenario {
  scenario: 'Bear' | 'Base' | 'Bull' | 'Strategic'
  exitMultiple: number
  ebitdaAtExit: number
  evAtExit: number
  debtAtExit: number
  equityAtExit: number
  equityInvested: number
  grossGain: number
  moic: number
  irr: number            // approximate (MOIC^(1/n)-1)
}

export interface ValueBridge {
  label: string
  value: number
  pct: number | null
  color: 'positive' | 'negative' | 'neutral' | 'total'
}

export interface SensitivityCell {
  row: number   // axis value (exit multiple or hold period)
  col: number   // axis value (ebitda margin or exit multiple)
  irr?: number
  moic?: number
}

export interface LBOResults {
  // Entry
  ev: number
  equityValue: number
  fees: number
  totalEquityInvested: number
  seniorDebt: number
  debtOverEbitda: number
  interestCoverage: number

  // Yearly P&L
  yearly: YearlyMetrics[]

  // Debt schedule
  debtSchedule: DebtSchedule[]

  // Exit scenarios
  scenarios: ExitScenario[]

  // Value bridge (base case)
  valueBridge: ValueBridge[]

  // Sensitivity
  irrSensitivity: SensitivityCell[]    // exit multiple × ebitda margin Y5
  moicSensitivity: SensitivityCell[]   // hold period × exit multiple
}

// ─── Analysis (DB entity) ───────────────────────────────────────────────────

export interface Analysis {
  id: string
  userId: string
  name: string
  description: string | null
  isFavorite: boolean
  inputs: LBOInputs
  createdAt: string
  updatedAt: string
}

// ─── User profile ───────────────────────────────────────────────────────────

export type UserRole = 'analyst' | 'investor' | 'founder' | 'student' | 'other'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  company: string | null
  role: UserRole
  avatarUrl: string | null
  isAdmin: boolean
  createdAt: string
}

// ─── Default inputs ─────────────────────────────────────────────────────────

export const DEFAULT_LBO_INPUTS: LBOInputs = {
  companyName: '',
  sector: '',
  transactionYear: new Date().getFullYear(),
  revenue: 30,
  ebitda: 4,
  da: 1.5,
  netDebt: 3,
  cash: 1,
  entryMultiple: 10,
  feesPct: 0.06,
  leverage: 4.5,
  interestRate: 0.065,
  amortization: [2.0, 2.5, 3.0, 3.5, 4.0],
  revenueGrowth: [0.15, 0.15, 0.12, 0.10, 0.10],
  ebitdaMargin: [0.145, 0.155, 0.160, 0.165, 0.170],
  daPct: [0.05, 0.05, 0.05, 0.05, 0.05],
  capexPct: [0.06, 0.06, 0.06, 0.055, 0.055],
  wcChange: [-0.5, -0.8, -0.6, -0.7, -0.5],
  taxRate: 0.25,
  exitMultiples: { bear: 12, base: 14, bull: 16, strategic: 18 },
  holdPeriod: 5,
}
