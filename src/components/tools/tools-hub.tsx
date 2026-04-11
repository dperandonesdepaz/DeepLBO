"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Calculator, TrendingUp, Percent, BarChart3, RefreshCw, Info } from "lucide-react"

// ─── IRR / MOIC Calculator ───────────────────────────────────────────────────
function IrrMoicCalc() {
  const [equity, setEquity] = useState(10)
  const [exitValue, setExitValue] = useState(50)
  const [hold, setHold] = useState(5)
  const [distributions, setDistributions] = useState<string[]>(["", "", "", "", ""])

  const moic = equity > 0 ? exitValue / equity : 0
  const irr = moic > 0 && hold > 0 ? (Math.pow(moic, 1 / hold) - 1) * 100 : 0

  // With intermediate distributions
  function xirr() {
    const flows = [-equity]
    distributions.forEach(d => flows.push(parseFloat(d) || 0))
    flows[flows.length - 1] += exitValue

    let rate = 0.2
    for (let iter = 0; iter < 100; iter++) {
      let npv = 0
      let dNpv = 0
      flows.forEach((cf, t) => {
        npv += cf / Math.pow(1 + rate, t)
        dNpv -= t * cf / Math.pow(1 + rate, t + 1)
      })
      if (Math.abs(dNpv) < 1e-10) break
      rate = rate - npv / dNpv
      if (rate < -0.99) { rate = -0.5; break }
    }
    return rate * 100
  }

  const hasDistributions = distributions.some(d => parseFloat(d) > 0)
  const effectiveIrr = hasDistributions ? xirr() : irr

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Equity invertido (€M)</label>
          <input type="number" value={equity} onChange={e => setEquity(+e.target.value)} min="0"
            className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Valor de salida (€M)</label>
          <input type="number" value={exitValue} onChange={e => setExitValue(+e.target.value)} min="0"
            className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Años de hold</label>
          <input type="number" value={hold} onChange={e => {
            const v = Math.max(1, Math.min(20, +e.target.value))
            setHold(v)
            setDistributions(Array(v).fill("").map((_, i) => distributions[i] ?? ""))
          }} min="1" max="20"
            className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      {/* Distributions */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1.5">Distribuciones intermedias por año (€M) — opcional</p>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(hold, 5)}, 1fr)` }}>
          {distributions.slice(0, hold).map((d, i) => (
            <div key={i} className="space-y-0.5">
              <label className="text-[10px] text-muted-foreground">Año {i + 1}</label>
              <input type="number" value={d} min="0"
                onChange={e => {
                  const next = [...distributions]
                  next[i] = e.target.value
                  setDistributions(next)
                }}
                placeholder="0"
                className="w-full h-8 px-2 text-xs border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "MOIC", value: `${moic.toFixed(2)}x`, highlight: moic >= 3 },
          { label: hasDistributions ? "IRR (XIRR)" : "IRR aprox.", value: `${effectiveIrr.toFixed(1)}%`, highlight: effectiveIrr >= 20 },
          { label: "Beneficio neto", value: `€${(exitValue - equity + distributions.reduce((s, d) => s + (parseFloat(d) || 0), 0)).toFixed(1)}M`, highlight: false },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={cn("rounded-xl p-4 text-center border", highlight ? "bg-primary/5 border-primary/20" : "bg-secondary/50 border-border")}>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={cn("text-2xl font-bold", highlight ? "text-primary" : "text-foreground")}>{value}</p>
          </div>
        ))}
      </div>

      {/* Classification */}
      <div className={cn("rounded-lg p-3 border text-sm font-medium text-center",
        irr >= 30 ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
        irr >= 20 ? "bg-green-50 border-green-200 text-green-700" :
        irr >= 15 ? "bg-amber-50 border-amber-200 text-amber-700" :
        "bg-red-50 border-red-200 text-red-700"
      )}>
        {irr >= 30 ? "Excelente retorno — supera el hurdle de clase top PE (>30% IRR)" :
         irr >= 20 ? "Buen retorno — supera el hurdle PE estándar (>20% IRR)" :
         irr >= 15 ? "Retorno moderado — por encima del coste de capital equity típico" :
         "Retorno bajo — por debajo del hurdle PE mínimo (15% IRR)"}
      </div>

      <p className="text-[10px] text-muted-foreground">
        * IRR se aproxima como MOIC^(1/años)-1 sin distribuciones intermedias. Con distribuciones se usa Newton-Raphson (XIRR).
      </p>
    </div>
  )
}

// ─── WACC Calculator ─────────────────────────────────────────────────────────
function WaccCalc() {
  const [rf, setRf] = useState(3.2)
  const [beta, setBeta] = useState(1.1)
  const [erp, setErp] = useState(5.5)
  const [scp, setScp] = useState(0)
  const [kd, setKd] = useState(5.5)
  const [tax, setTax] = useState(25)
  const [debtPct, setDebtPct] = useState(40)

  const equityPct = 100 - debtPct
  const ke = rf + beta * erp + scp
  const kdAfterTax = kd * (1 - tax / 100)
  const wacc = (ke * equityPct + kdAfterTax * debtPct) / 100

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Equity side */}
        <div className="space-y-3 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Coste del equity (Ke)</p>
          {[
            { label: "Tasa libre de riesgo Rf (%)", value: rf, set: setRf, step: 0.1 },
            { label: "Beta (β)", value: beta, set: setBeta, step: 0.05 },
            { label: "Prima de riesgo ERP (%)", value: erp, set: setErp, step: 0.1 },
            { label: "Small cap premium (%)", value: scp, set: setScp, step: 0.1 },
          ].map(({ label, value, set, step }) => (
            <div key={label} className="space-y-0.5">
              <label className="text-[11px] text-muted-foreground">{label}</label>
              <input type="number" value={value} step={step}
                onChange={e => set(+e.target.value)}
                className="w-full h-8 px-2 text-sm border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-300" />
            </div>
          ))}
          <div className="pt-1 border-t border-blue-200">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700 font-medium">Ke = {rf}% + {beta}×{erp}% + {scp}%</span>
              <span className="font-bold text-blue-900">{ke.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Debt side */}
        <div className="space-y-3 bg-purple-50/50 rounded-xl p-4 border border-purple-100">
          <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">Coste de la deuda (Kd)</p>
          {[
            { label: "Tipo de interés Kd (%)", value: kd, set: setKd, step: 0.1 },
            { label: "Tasa impositiva (%)", value: tax, set: setTax, step: 1 },
            { label: "% Deuda en estructura", value: debtPct, set: setDebtPct, step: 1 },
          ].map(({ label, value, set, step }) => (
            <div key={label} className="space-y-0.5">
              <label className="text-[11px] text-muted-foreground">{label}</label>
              <input type="number" value={value} step={step} min="0" max={label.includes("%") && label.includes("Deuda") ? 100 : undefined}
                onChange={e => set(+e.target.value)}
                className="w-full h-8 px-2 text-sm border border-purple-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-purple-300" />
            </div>
          ))}
          <div className="pt-1 border-t border-purple-200">
            <div className="flex justify-between text-sm">
              <span className="text-purple-700 font-medium">Kd after-tax</span>
              <span className="font-bold text-purple-900">{kdAfterTax.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>E/V · {equityPct}% — D/V · {debtPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* WACC result */}
      <div className="rounded-xl bg-primary p-5 text-white text-center">
        <p className="text-sm text-white/70 mb-1">WACC</p>
        <p className="text-4xl font-bold">{wacc.toFixed(2)}%</p>
        <p className="text-xs text-white/60 mt-2">
          = {equityPct}%×{ke.toFixed(1)}% + {debtPct}%×{kdAfterTax.toFixed(1)}%
        </p>
      </div>

      {/* Reference */}
      <div className="bg-secondary/50 rounded-xl p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-1.5">Referencias sectoriales (WACC mediana España 2024-25)</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            ["Tecnología / SaaS", "9-12%"], ["Healthcare", "7-9%"],
            ["Industrial / Manufactura", "8-10%"], ["Consumer / Retail", "8-11%"],
            ["Logística", "7-9%"], ["Real Estate", "6-8%"],
          ].map(([sector, range]) => (
            <div key={sector} className="flex justify-between text-xs bg-white rounded px-2 py-1">
              <span className="text-muted-foreground">{sector}</span>
              <span className="font-semibold text-foreground">{range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── EV Bridge / Equity Bridge ───────────────────────────────────────────────
function EvBridgeCalc() {
  const [ev, setEv] = useState(100)
  const [netDebt, setNetDebt] = useState(30)
  const [minority, setMinority] = useState(0)
  const [preferred, setPreferred] = useState(0)
  const [pension, setPension] = useState(0)
  const [earnout, setEarnout] = useState(0)
  const [cash, setCash] = useState(5)

  const equity = ev - netDebt - minority - preferred - pension - earnout + cash
  const adjustments = [
    { label: "Enterprise Value (EV)", value: ev, sign: null, color: "text-primary" },
    { label: "(-) Deuda neta (DN)", value: -netDebt, sign: "-", color: "text-red-600" },
    { label: "(+) Caja excedentaria", value: cash, sign: "+", color: "text-emerald-600" },
    { label: "(-) Interés minoritario", value: -minority, sign: "-", color: "text-red-600" },
    { label: "(-) Acciones preferentes", value: -preferred, sign: "-", color: "text-red-600" },
    { label: "(-) Pasivos pensión", value: -pension, sign: "-", color: "text-red-600" },
    { label: "(-) Contingencias earn-out", value: -earnout, sign: "-", color: "text-red-600" },
  ].filter(a => a.value !== 0 || a.sign === null)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "EV (€M)", value: ev, set: setEv },
          { label: "Deuda financiera (€M)", value: netDebt, set: setNetDebt },
          { label: "Caja excedentaria (€M)", value: cash, set: setCash },
          { label: "Interés minoritario (€M)", value: minority, set: setMinority },
          { label: "Acciones preferentes (€M)", value: preferred, set: setPreferred },
          { label: "Pasivos pensión (€M)", value: pension, set: setPension },
          { label: "Earn-out contingente (€M)", value: earnout, set: setEarnout },
        ].map(({ label, value, set }) => (
          <div key={label} className="space-y-0.5">
            <label className="text-[11px] text-muted-foreground">{label}</label>
            <input type="number" value={value} min="0"
              onChange={e => set(+e.target.value)}
              className="w-full h-8 px-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20" />
          </div>
        ))}
      </div>

      {/* Bridge visual */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-1">
        {adjustments.map(({ label, value, sign, color }) => (
          <div key={label} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
            <span className={cn("text-sm", color)}>{label}</span>
            <span className={cn("text-sm font-bold", color)}>€{Math.abs(value).toFixed(1)}M</span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2 mt-1 border-t-2 border-primary/30">
          <span className="text-sm font-bold text-foreground">= Equity Value</span>
          <span className={cn("text-xl font-bold", equity >= 0 ? "text-primary" : "text-red-600")}>
            €{equity.toFixed(1)}M
          </span>
        </div>
      </div>

      {equity < 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Equity Value negativo — la deuda y obligaciones superan el EV. El deal destruiría valor para el accionista a este precio.
        </div>
      )}
    </div>
  )
}

// ─── Leverage Analysis ───────────────────────────────────────────────────────
function LeverageCalc() {
  const [ebitda, setEbitda] = useState(10)
  const [totalDebt, setTotalDebt] = useState(45)
  const [interest, setInterest] = useState(3.2)
  const [capex, setCapex] = useState(1.5)
  const [wc, setWc] = useState(0.5)
  const [tax, setTax] = useState(25)

  const debtEbitda = ebitda > 0 ? totalDebt / ebitda : 0
  const ebitda_interest = interest > 0 ? ebitda / interest : Infinity
  const ebit = ebitda - capex
  const nopat = ebit * (1 - tax / 100)
  const fcf = nopat + capex - capex - wc  // simplified
  const dscr = interest > 0 ? (ebitda - capex - wc) / interest : 0
  const debtFcf = fcf > 0 ? totalDebt / fcf : 0

  function ratingColor(ratio: number, thresholds: [number, number, number]) {
    if (ratio <= thresholds[0]) return "text-emerald-600"
    if (ratio <= thresholds[1]) return "text-amber-600"
    if (ratio <= thresholds[2]) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "EBITDA LTM (€M)", value: ebitda, set: setEbitda },
          { label: "Deuda total (€M)", value: totalDebt, set: setTotalDebt },
          { label: "Intereses anuales (€M)", value: interest, set: setInterest },
          { label: "Capex mantenimiento (€M)", value: capex, set: setCapex },
          { label: "Variación WC anual (€M)", value: wc, set: setWc },
          { label: "Tasa impositiva (%)", value: tax, set: setTax },
        ].map(({ label, value, set }) => (
          <div key={label} className="space-y-0.5">
            <label className="text-[11px] text-muted-foreground">{label}</label>
            <input type="number" value={value} step="0.1" min="0"
              onChange={e => set(+e.target.value)}
              className="w-full h-8 px-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Deuda / EBITDA", value: debtEbitda, fmt: `${debtEbitda.toFixed(1)}x`, thresholds: [4, 5.5, 7] as [number, number, number],
            note: "< 4x conservador · 4-6x típico PE · >6x agresivo" },
          { label: "EBITDA / Intereses (ICR)", value: ebitda_interest === Infinity ? 99 : ebitda_interest,
            fmt: ebitda_interest === Infinity ? "∞" : `${ebitda_interest.toFixed(1)}x`,
            thresholds: [99, 3, 2] as [number, number, number],
            note: "> 3x cómodo · 2-3x vigilancia · < 2x estrés" },
          { label: "Deuda / FCF", value: debtFcf, fmt: `${debtFcf.toFixed(1)}x`, thresholds: [6, 9, 12] as [number, number, number],
            note: "Años para repagar deuda con FCF" },
          { label: "DSCR (servicio deuda)", value: dscr, fmt: `${dscr.toFixed(2)}x`, thresholds: [99, 1.5, 1.2] as [number, number, number],
            note: "> 1.5x sano · 1.2-1.5x ajustado · < 1.2x riesgo covenant" },
        ].map(({ label, value, fmt, thresholds, note }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={cn("text-2xl font-bold", ratingColor(value, thresholds))}>{fmt}</p>
            <p className="text-[10px] text-muted-foreground mt-1.5">{note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Accretion/Dilution Quick ─────────────────────────────────────────────────
function AccretionQuick() {
  const [acqEps, setAcqEps] = useState(2.50)
  const [acqShares, setAcqShares] = useState(100)
  const [targetNI, setTargetNI] = useState(20)
  const [purchaseEq, setPurchaseEq] = useState(200)
  const [cashPct, setCashPct] = useState(50)
  const [acqSharePrice, setAcqSharePrice] = useState(50)
  const [synergies, setSynergies] = useState(5)
  const [interestRate, setInterestRate] = useState(5)
  const [tax, setTax] = useState(25)

  const cashPortion = purchaseEq * (cashPct / 100)
  const stockPortion = purchaseEq * (1 - cashPct / 100)
  const newShares = acqSharePrice > 0 ? stockPortion / acqSharePrice : 0
  const proFormaShares = acqShares + newShares
  const interestCost = cashPortion * (interestRate / 100) * (1 - tax / 100)
  const proFormaNI = acqEps * acqShares + targetNI + synergies * (1 - tax / 100) - interestCost
  const proFormaEps = proFormaShares > 0 ? proFormaNI / proFormaShares : 0
  const deltaEps = proFormaEps - acqEps
  const deltaEpsPct = acqEps > 0 ? (deltaEps / acqEps) * 100 : 0
  const accretive = deltaEpsPct > 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "EPS adquirente (€)", value: acqEps, set: setAcqEps, step: 0.01 },
          { label: "Acciones adquirente (M)", value: acqShares, set: setAcqShares, step: 1 },
          { label: "Beneficio neto objetivo (€M)", value: targetNI, set: setTargetNI, step: 0.5 },
          { label: "Equity de compra (€M)", value: purchaseEq, set: setPurchaseEq, step: 1 },
          { label: "Precio acción adquirente (€)", value: acqSharePrice, set: setAcqSharePrice, step: 0.5 },
          { label: "Sinergias after-tax (€M)", value: synergies, set: setSynergies, step: 0.5 },
        ].map(({ label, value, set, step }) => (
          <div key={label} className="space-y-0.5">
            <label className="text-[11px] text-muted-foreground">{label}</label>
            <input type="number" value={value} step={step} min="0"
              onChange={e => set(+e.target.value)}
              className="w-full h-8 px-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20" />
          </div>
        ))}
      </div>

      {/* Cash/stock mix */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Efectivo: {cashPct}%</span>
          <span>Acciones: {100 - cashPct}%</span>
        </div>
        <input type="range" min="0" max="100" value={cashPct} onChange={e => setCashPct(+e.target.value)}
          className="w-full accent-primary" />
      </div>

      <div className={cn("rounded-xl border p-5 text-center space-y-2",
        accretive ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
      )}>
        <p className={cn("text-3xl font-bold", accretive ? "text-emerald-700" : "text-red-700")}>
          {accretive ? "ACRETIVO" : "DILUTIVO"}
        </p>
        <p className={cn("text-xl font-semibold", accretive ? "text-emerald-600" : "text-red-600")}>
          {deltaEpsPct > 0 ? "+" : ""}{deltaEpsPct.toFixed(2)}% EPS
        </p>
        <div className="flex justify-center gap-6 text-sm pt-1">
          <div>
            <p className="text-muted-foreground text-xs">EPS pre-deal</p>
            <p className="font-bold text-foreground">€{acqEps.toFixed(2)}</p>
          </div>
          <div className="text-muted-foreground">→</div>
          <div>
            <p className="text-muted-foreground text-xs">EPS pro-forma</p>
            <p className={cn("font-bold", accretive ? "text-emerald-600" : "text-red-600")}>€{proFormaEps.toFixed(2)}</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">Nuevas acciones emitidas: {newShares.toFixed(1)}M · Interés financiación: €{interestCost.toFixed(1)}M</p>
      </div>
    </div>
  )
}

// ─── Tools registry ───────────────────────────────────────────────────────────
const TOOLS = [
  { id: "irr",       label: "IRR / MOIC",       icon: TrendingUp,  color: "text-blue-600",   bg: "bg-blue-50",
    desc: "Calcula IRR y MOIC dado equity invertido, valor de salida y hold period. Soporta distribuciones intermedias.",
    component: IrrMoicCalc },
  { id: "wacc",      label: "WACC (CAPM)",       icon: Percent,     color: "text-purple-600", bg: "bg-purple-50",
    desc: "Constructor de WACC completo con CAPM (Rf + β×ERP + SCP) y coste de deuda after-tax.",
    component: WaccCalc },
  { id: "ev_bridge", label: "EV → Equity Bridge",icon: BarChart3,   color: "text-emerald-600",bg: "bg-emerald-50",
    desc: "Calcula el Equity Value ajustando EV por deuda, caja, intereses minoritarios, pensiones y earn-outs.",
    component: EvBridgeCalc },
  { id: "leverage",  label: "Análisis de deuda", icon: Calculator,  color: "text-orange-600", bg: "bg-orange-50",
    desc: "Ratios de apalancamiento: Deuda/EBITDA, ICR, DSCR y Deuda/FCF con semáforo de alerta.",
    component: LeverageCalc },
  { id: "accretion", label: "A/D rápido",         icon: RefreshCw,   color: "text-pink-600",   bg: "bg-pink-50",
    desc: "Calculadora de accretion/dilution express para análisis de fusiones sin construir el modelo completo.",
    component: AccretionQuick },
]

// ─── Main ─────────────────────────────────────────────────────────────────────
export function ToolsHub() {
  const [activeTool, setActiveTool] = useState("irr")
  const tool = TOOLS.find(t => t.id === activeTool) ?? TOOLS[0]
  const Component = tool.component

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Herramientas rápidas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Calculadoras financieras de uso inmediato. Sin crear un análisis, sin guardar.
        </p>
      </div>

      {/* Tool selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {TOOLS.map(t => {
          const Icon = t.icon
          const active = activeTool === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTool(t.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all",
                active
                  ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                  : "bg-white border-border hover:border-primary/30 hover:shadow-sm"
              )}
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", active ? "bg-white/20" : t.bg)}>
                <Icon className={cn("w-5 h-5", active ? "text-white" : t.color)} />
              </div>
              <span className={cn("text-xs font-semibold leading-tight", active ? "text-white" : "text-foreground")}>
                {t.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Active tool */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-start gap-3 mb-5 pb-4 border-b border-border">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", tool.bg)}>
            {(() => { const Icon = tool.icon; return <Icon className={cn("w-5 h-5", tool.color)} /> })()}
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">{tool.label}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
          </div>
        </div>
        <Component />
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-xl">
        <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Las herramientas rápidas son calculadoras autónomas. Para un análisis completo con autoguardado, historial y exportación, crea un análisis LBO, DCF o Fusión desde el dashboard.
        </p>
      </div>
    </div>
  )
}
