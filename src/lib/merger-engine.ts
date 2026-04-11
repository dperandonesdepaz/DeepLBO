import type { MergerInputs, MergerResults, MergerYearResults } from "@/types/ma"

export function computeMerger(i: MergerInputs): MergerResults | null {
  if (i.acquirerNetIncome === 0 || i.acquirerShares === 0) return null

  // ── Acquirer standalone metrics ──────────────────────────────────────────
  const acquirerMktCap = i.acquirerShares * i.acquirerSharePrice  // M€
  const acquirerEV = acquirerMktCap + i.acquirerNetDebt
  const acquirerEPS = i.acquirerNetIncome / i.acquirerShares

  // ── Deal structure ────────────────────────────────────────────────────────
  // EV paid → equity consideration = EV - target net debt
  const equityPurchasePrice = i.purchaseEV - i.targetNetDebt
  const totalConsideration = equityPurchasePrice

  const cashConsideration  = totalConsideration * i.cashPct
  const stockConsideration = totalConsideration * (1 - i.cashPct)

  // Cash portion financed by new debt vs own cash
  const debtFinanced = cashConsideration * i.debtFinancingPct
  const equityCash   = cashConsideration * (1 - i.debtFinancingPct)

  // New shares issued to fund stock consideration
  const newSharesIssued = i.acquirerSharePrice > 0
    ? stockConsideration / i.acquirerSharePrice
    : 0
  const proFormaShares = i.acquirerShares + newSharesIssued
  const ownershipDilution = newSharesIssued / proFormaShares

  const exchangeRatio = newSharesIssued  // conceptual: shares issued per unit

  // ── Pro-forma combined (before synergies & deal effects) ─────────────────
  const combinedRevenue  = i.acquirerRevenue + i.targetRevenue
  const combinedEBITDA   = i.acquirerEBITDA  + i.targetEBITDA
  const combinedNetIncomeBase = i.acquirerNetIncome + i.targetNetIncome

  // ── Deal effects (per year) ───────────────────────────────────────────────
  // Annual incremental interest on new debt (pre-tax)
  const annualInterestPreTax = debtFinanced * i.debtCost
  const annualInterestAfterTax = annualInterestPreTax * (1 - i.acquirerTaxRate)

  // Opportunity cost of cash used (after-tax)
  const annualCashCostAfterTax = equityCash * i.cashYield * (1 - i.acquirerTaxRate)

  // Total annual financing cost after-tax
  const annualFinancingCost = annualInterestAfterTax + annualCashCostAfterTax

  // ── Helper: compute year results at given synergy ramp ───────────────────
  function computeYear(year: number, ramp: number): MergerYearResults {
    const revSyn = i.revenueSynergies * ramp
    const costSyn = i.costSynergies * ramp
    const totalSynAfterTax = (revSyn + costSyn) * (1 - i.acquirerTaxRate)

    // Amortise integration costs in year 1
    const integrationEffect = year === 1 ? i.integrationCosts : 0

    const netIncomeEffect = totalSynAfterTax - annualFinancingCost - integrationEffect
    const combinedNI = combinedNetIncomeBase + netIncomeEffect
    const eps = combinedNI / proFormaShares
    const adPct = (eps - acquirerEPS) / Math.abs(acquirerEPS)
    const isAccretive = eps > acquirerEPS

    return {
      year,
      revenueSynergiesRATE: revSyn,
      costSynergiesRATE: costSyn,
      totalSynergiesAfterTax: totalSynAfterTax,
      incrementalInterestCost: annualInterestAfterTax,
      incrementalCashYieldLost: annualCashCostAfterTax,
      netIncomeEffect,
      combinedNetIncome: combinedNI,
      proFormaEPS: eps,
      accretionDilutionPct: adPct,
      isAccretive,
    }
  }

  const yr1 = computeYear(1, i.synergyRampYr1Pct)
  const yr2 = computeYear(2, 1.0)

  // Full synergy (no ramp, no integration costs)
  const fullSynATax = (i.revenueSynergies + i.costSynergies) * (1 - i.acquirerTaxRate)
  const fullNIEffect = fullSynATax - annualFinancingCost
  const fullCombinedNI = combinedNetIncomeBase + fullNIEffect
  const fullEPS = fullCombinedNI / proFormaShares
  const fullADPct = (fullEPS - acquirerEPS) / Math.abs(acquirerEPS)
  const fullSynergy = {
    totalSynAfterTax: fullSynATax,
    netIncomeEffect: fullNIEffect,
    combinedNI: fullCombinedNI,
    eps: fullEPS,
    adPct: fullADPct,
    isAccretive: fullEPS > acquirerEPS,
  }

  // ── Implied multiples for target ─────────────────────────────────────────
  const impliedTargetEVEBITDA = i.targetEBITDA > 0 ? i.purchaseEV / i.targetEBITDA : 0
  const impliedTargetPE = i.targetNetIncome > 0
    ? equityPurchasePrice / i.targetNetIncome
    : 0

  return {
    equityPurchasePrice,
    impliedTargetEVEBITDA,
    impliedTargetPE,
    totalConsideration,
    cashConsideration,
    stockConsideration,
    debtFinanced,
    equityCash,
    newSharesIssued,
    exchangeRatio,
    proFormaShares,
    ownershipDilution,
    acquirerEPS,
    combinedRevenue,
    combinedEBITDA,
    combinedNetIncomeBase,
    yr1,
    yr2,
    fullSynergy,
  }
}

export const fmtMerger = {
  eur:  (v: number) => `€${Math.abs(v).toFixed(1)}M`,
  pct:  (v: number) => `${(v * 100).toFixed(1)}%`,
  mult: (v: number) => `${v.toFixed(1)}x`,
  eps:  (v: number) => `€${v.toFixed(2)}`,
}
