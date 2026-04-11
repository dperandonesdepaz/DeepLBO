"use client"

import { useMergerStore } from "@/store/merger-store"
import { fmtMerger } from "@/lib/merger-engine"
import { cn } from "@/lib/utils"
import { GitMerge, Building2, Target, AlertCircle } from "lucide-react"

export function SectionMergerOverview() {
  const { results, inputs, setActiveSection } = useMergerStore()

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
          <GitMerge className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Análisis de Fusión / M&A</h2>
        <p className="text-muted-foreground text-sm max-w-sm mb-6">
          Introduce los datos del adquirente y del target para calcular el análisis de acreción/dilución del deal.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setActiveSection("acquirer")}
            className="h-9 px-5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
            Empezar con Adquirente
          </button>
        </div>
      </div>
    )
  }

  const r = results
  const isAccretive = r.fullSynergy.isAccretive

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <GitMerge className="w-5 h-5 text-purple-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {inputs.acquirerName || "Adquirente"} + {inputs.targetName || "Target"}
          </h1>
          <p className="text-sm text-muted-foreground">{inputs.dealDate} · EV pagado: {fmtMerger.eur(inputs.purchaseEV)}</p>
        </div>
      </div>

      {/* Headline verdict */}
      <div className={cn(
        "rounded-2xl border-2 p-6 flex items-center justify-between",
        isAccretive ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"
      )}>
        <div>
          <p className="text-sm text-muted-foreground">Veredicto (full synergies)</p>
          <p className={cn("text-4xl font-black mt-1", isAccretive ? "text-emerald-700" : "text-red-700")}>
            {isAccretive ? "ACRETIVO" : "DILUTIVO"}
          </p>
          <p className={cn("text-lg font-semibold mt-0.5", isAccretive ? "text-emerald-600" : "text-red-600")}>
            {isAccretive ? "+" : ""}{(r.fullSynergy.adPct * 100).toFixed(1)}% en EPS
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">EPS: {fmtMerger.eps(r.acquirerEPS)} → {fmtMerger.eps(r.fullSynergy.eps)}</p>
          <p className="text-xs text-muted-foreground mt-1">NI: {fmtMerger.eur(inputs.acquirerNetIncome)} → {fmtMerger.eur(r.fullSynergy.combinedNI)}</p>
        </div>
      </div>

      {/* Companies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Adquirente", icon: Building2, color: "text-blue-700 bg-blue-50",
            name: inputs.acquirerName || "—", rev: inputs.acquirerRevenue, eb: inputs.acquirerEBITDA, ni: inputs.acquirerNetIncome },
          { label: "Target", icon: Target, color: "text-purple-700 bg-purple-50",
            name: inputs.targetName || "—", rev: inputs.targetRevenue, eb: inputs.targetEBITDA, ni: inputs.targetNetIncome },
        ].map(co => {
          const Icon = co.icon
          return (
            <div key={co.label} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", co.color.split(" ")[1])}>
                  <Icon className={cn("w-4 h-4", co.color.split(" ")[0])} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{co.label}</p>
                  <p className="text-sm font-semibold text-foreground">{co.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Revenue", val: fmtMerger.eur(co.rev) },
                  { label: "EBITDA",  val: fmtMerger.eur(co.eb) },
                  { label: "Net Inc.", val: fmtMerger.eur(co.ni) },
                ].map(m => (
                  <div key={m.label} className="bg-secondary/40 rounded p-2">
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    <p className="text-xs font-bold text-foreground">{m.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Combined + deal metrics */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Pro-forma combinado</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            { label: "Revenue combinado",   value: fmtMerger.eur(r.combinedRevenue) },
            { label: "EBITDA combinado",    value: fmtMerger.eur(r.combinedEBITDA) },
            { label: "EV/EBITDA (target)",  value: `${r.impliedTargetEVEBITDA.toFixed(1)}x` },
            { label: "Dilución acc.",       value: fmtMerger.pct(r.ownershipDilution) },
          ].map(m => (
            <div key={m.label} className="bg-secondary/40 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
              <p className="text-sm font-bold text-foreground mt-0.5">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Warning: Y1 dilution even if full synergies accretive */}
      {!r.yr1.isAccretive && r.fullSynergy.isAccretive && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Dilutivo en Año 1, acretivo a futuro</p>
            <p className="text-xs text-amber-700 mt-0.5">Los costes de integración ({fmtMerger.eur(inputs.integrationCosts)}) generan dilución en el primer año. El deal se vuelve acretivo cuando las sinergias alcanzan run-rate completo.</p>
          </div>
        </div>
      )}
    </div>
  )
}
