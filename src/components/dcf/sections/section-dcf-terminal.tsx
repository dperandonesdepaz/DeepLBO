"use client"

import { useDCFStore } from "@/store/dcf-store"
import { fmtDCF } from "@/lib/dcf-engine"
import { cn } from "@/lib/utils"

export function SectionDCFTerminal() {
  const { inputs, setInputs, results } = useDCFStore()

  const tvMethods = [
    { id: "gordon"       as const, label: "Gordon Growth Model", desc: "TV = FCF₅ × (1+g) / (WACC − g)" },
    { id: "exit_multiple" as const, label: "Exit Multiple",       desc: "TV = EBITDA₅ × Múltiplo EV/EBITDA" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Valor Terminal</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          El valor terminal captura el valor de la empresa más allá del horizonte de proyección (Y5)
        </p>
      </div>

      {/* Method selector */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Método de cálculo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tvMethods.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setInputs({ tvMethod: m.id })}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                inputs.tvMethod === m.id
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-border hover:border-emerald-300"
              )}
            >
              <div className={cn("text-sm font-semibold mb-1", inputs.tvMethod === m.id ? "text-emerald-700" : "text-foreground")}>
                {m.label}
              </div>
              <div className="text-xs text-muted-foreground font-mono">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Gordon Growth inputs */}
      <div className={cn("bg-white rounded-xl border p-6 space-y-5 transition-all", inputs.tvMethod === "gordon" ? "border-emerald-200" : "border-border opacity-60")}>
        <h3 className="text-sm font-semibold text-foreground">Gordon Growth Model</h3>
        <div className="max-w-sm space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">Tasa de crecimiento terminal (g)</label>
            <div className="relative">
              <input
                type="number" step="0.1" value={(inputs.terminalGrowthRate * 100).toFixed(2)}
                onChange={e => setInputs({ terminalGrowthRate: (parseFloat(e.target.value) || 0) / 100 })}
                disabled={inputs.tvMethod !== "gordon"}
                className="w-full h-10 px-3 pr-8 text-sm border border-border rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all disabled:opacity-50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Debe ser menor que el WACC{results ? ` (${fmtDCF.pct(results.wacc)})` : ""}. Rango típico: 1.5–3%
            </p>
          </div>
        </div>
        {results && inputs.tvMethod === "gordon" && (
          <div className="bg-emerald-50 rounded-lg px-4 py-3">
            <div className="text-xs text-emerald-700 font-mono mb-1">
              TV = FCF₅ × (1 + {fmtDCF.pct(inputs.terminalGrowthRate)}) / ({fmtDCF.pct(results.wacc)} − {fmtDCF.pct(inputs.terminalGrowthRate)})
            </div>
            <div className="text-xs text-emerald-700 font-mono">
              TV = {fmtDCF.eur(results.yearly[4].fcf)} × {(1 + inputs.terminalGrowthRate).toFixed(3)} / {(results.wacc - inputs.terminalGrowthRate).toFixed(4)}
            </div>
            <div className="text-sm font-bold text-emerald-800 mt-2">= {fmtDCF.eur(results.terminalValueGordon)}</div>
          </div>
        )}
      </div>

      {/* Exit multiple inputs */}
      <div className={cn("bg-white rounded-xl border p-6 space-y-5 transition-all", inputs.tvMethod === "exit_multiple" ? "border-emerald-200" : "border-border opacity-60")}>
        <h3 className="text-sm font-semibold text-foreground">Exit Multiple Method</h3>
        <div className="max-w-sm space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">Múltiplo EV/EBITDA salida</label>
            <div className="relative">
              <input
                type="number" step="0.5" value={inputs.exitMultipleTV}
                onChange={e => setInputs({ exitMultipleTV: parseFloat(e.target.value) || 0 })}
                disabled={inputs.tvMethod !== "exit_multiple"}
                className="w-full h-10 px-3 pr-8 text-sm border border-border rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all disabled:opacity-50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">x</span>
            </div>
            <p className="text-xs text-muted-foreground">EV/EBITDA al que se valora la empresa en Y5. Usar comps como referencia.</p>
          </div>
        </div>
        {results && inputs.tvMethod === "exit_multiple" && (
          <div className="bg-emerald-50 rounded-lg px-4 py-3">
            <div className="text-xs text-emerald-700 font-mono mb-1">
              TV = EBITDA₅ × {inputs.exitMultipleTV}x = {fmtDCF.eur(results.yearly[4].ebitda)} × {inputs.exitMultipleTV}x
            </div>
            <div className="text-sm font-bold text-emerald-800 mt-1">= {fmtDCF.eur(results.terminalValueExit)}</div>
          </div>
        )}
      </div>

      {/* TV summary */}
      {results && (
        <div className="bg-white rounded-xl border-2 border-emerald-200 p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Resumen Valor Terminal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary/40 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">TV (método selec.)</p>
              <p className="text-xl font-bold text-foreground">{fmtDCF.eur(results.terminalValue)}</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">PV del TV</p>
              <p className="text-xl font-bold text-emerald-700">{fmtDCF.eur(results.pvTerminalValue)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">descontado {results.yearly.length} años a {fmtDCF.pct(results.wacc)}</p>
            </div>
            <div className="text-center p-4 bg-secondary/40 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">TV como % del EV</p>
              <p className={cn("text-xl font-bold", results.tvAsPctOfEV > 0.70 ? "text-amber-600" : "text-foreground")}>
                {fmtDCF.pct(results.tvAsPctOfEV)}
              </p>
              {results.tvAsPctOfEV > 0.70 && (
                <p className="text-[10px] text-amber-600 mt-0.5">Alta concentración de valor</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
