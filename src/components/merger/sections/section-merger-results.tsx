"use client"

import { useMergerStore } from "@/store/merger-store"
import { fmtMerger } from "@/lib/merger-engine"
import { cn } from "@/lib/utils"
import type { MergerYearResults } from "@/types/ma"

function ADCell({ yr }: { yr: MergerYearResults }) {
  const isAccretive = yr.isAccretive
  const pct = yr.accretionDilutionPct * 100
  return (
    <div className={cn(
      "rounded-xl border-2 p-5 text-center",
      isAccretive ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"
    )}>
      <p className="text-xs text-muted-foreground mb-1">Año {yr.year}</p>
      <p className={cn("text-3xl font-bold mb-1", isAccretive ? "text-emerald-700" : "text-red-700")}>
        {isAccretive ? "+" : ""}{pct.toFixed(1)}%
      </p>
      <p className={cn("text-sm font-semibold mb-3", isAccretive ? "text-emerald-600" : "text-red-600")}>
        {isAccretive ? "ACRETIVO" : "DILUTIVO"}
      </p>
      <div className="space-y-1 text-xs text-left">
        <div className="flex justify-between">
          <span className="text-muted-foreground">EPS pro-forma</span>
          <span className="font-semibold">{fmtMerger.eps(yr.proFormaEPS)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">NI combinado</span>
          <span className="font-semibold">{fmtMerger.eur(yr.combinedNetIncome)}</span>
        </div>
      </div>
    </div>
  )
}

export function SectionMergerResults() {
  const { results, inputs, setActiveSection } = useMergerStore()

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-muted-foreground mb-4">Introduce los datos del deal para ver el análisis de acreción/dilución</p>
        <button
          onClick={() => setActiveSection("acquirer")}
          className="h-9 px-5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          Ir a Adquirente
        </button>
      </div>
    )
  }

  const r = results

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Análisis Acreción / Dilución</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {inputs.acquirerName || "Adquirente"} + {inputs.targetName || "Target"} — {inputs.dealDate}
        </p>
      </div>

      {/* EPS comparison */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">EPS: Antes vs Después</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="text-center flex-1 bg-secondary/40 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">EPS Adquirente (standalone)</p>
            <p className="text-2xl font-bold text-foreground">{fmtMerger.eps(r.acquirerEPS)}</p>
          </div>
          <div className="text-2xl text-muted-foreground">→</div>
          <div className="text-center flex-1 bg-purple-50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">EPS Pro-forma (full synergies)</p>
            <p className="text-2xl font-bold text-purple-800">{fmtMerger.eps(r.fullSynergy.eps)}</p>
          </div>
        </div>

        {/* Year cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ADCell yr={r.yr1} />
          <ADCell yr={r.yr2} />
          <div className={cn("rounded-xl border-2 p-5 text-center",
            r.fullSynergy.isAccretive ? "border-emerald-400 bg-emerald-50/80" : "border-red-400 bg-red-50/80")}>
            <p className="text-xs text-muted-foreground mb-1">Full Synergy Run-rate</p>
            <p className={cn("text-3xl font-bold mb-1", r.fullSynergy.isAccretive ? "text-emerald-700" : "text-red-700")}>
              {r.fullSynergy.isAccretive ? "+" : ""}{(r.fullSynergy.adPct * 100).toFixed(1)}%
            </p>
            <p className={cn("text-sm font-semibold mb-3", r.fullSynergy.isAccretive ? "text-emerald-600" : "text-red-600")}>
              {r.fullSynergy.isAccretive ? "ACRETIVO" : "DILUTIVO"}
            </p>
            <div className="space-y-1 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">EPS pro-forma</span>
                <span className="font-semibold">{fmtMerger.eps(r.fullSynergy.eps)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* P&L bridge */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Puente P&L (Year 2 — Full synergies)</h3>
        <div className="space-y-2">
          {[
            { label: `NI ${inputs.acquirerName || "Adquirente"} (standalone)`, value: inputs.acquirerNetIncome, color: "text-foreground" },
            { label: `+ NI ${inputs.targetName || "Target"} (standalone)`,   value: inputs.targetNetIncome,   color: "text-foreground" },
            { label: "= NI combinado pre-sinergias",                          value: r.combinedNetIncomeBase,  color: "text-foreground" },
            { label: "+ Sinergias after-tax (run-rate)",                       value: r.yr2.totalSynergiesAfterTax, color: "text-emerald-700" },
            { label: "− Coste intereses incremental (a.t.)",                  value: -r.yr2.incrementalInterestCost, color: "text-red-600" },
            { label: "− Rentabilidad caja perdida (a.t.)",                    value: -r.yr2.incrementalCashYieldLost, color: "text-red-600" },
            { label: "= NI Pro-forma",                                        value: r.yr2.combinedNetIncome,  color: "font-bold text-foreground" },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className={cn("text-sm font-semibold tabular-nums", row.color)}>
                {fmtMerger.eur(row.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary metrics */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Métricas del deal</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "EV pagado",            value: `€${inputs.purchaseEV.toFixed(0)}M` },
            { label: "EV/EBITDA (target)",   value: `${r.impliedTargetEVEBITDA.toFixed(1)}x` },
            { label: "P/E (target)",         value: `${r.impliedTargetPE.toFixed(1)}x` },
            { label: "Dilución accionistas", value: fmtMerger.pct(r.ownershipDilution) },
            { label: "Revenue combinado",    value: fmtMerger.eur(r.combinedRevenue) },
            { label: "EBITDA combinado",     value: fmtMerger.eur(r.combinedEBITDA) },
            { label: "Nuevas acciones",      value: `${r.newSharesIssued.toFixed(2)}M` },
            { label: "Pro-forma shares",     value: `${r.proFormaShares.toFixed(2)}M` },
          ].map(item => (
            <div key={item.label} className="bg-secondary/40 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
              <p className="text-sm font-bold text-foreground mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
