"use client"

import { useDCFStore } from "@/store/dcf-store"
import { fmtDCF } from "@/lib/dcf-engine"
import { cn } from "@/lib/utils"

const YEARS = [1, 2, 3, 4, 5]

function PctInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number" step="0.1" value={(value * 100).toFixed(1)}
      onChange={e => onChange((parseFloat(e.target.value) || 0) / 100)}
      className="w-full h-9 px-2 text-sm text-center border border-border rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all tabular-nums"
    />
  )
}

function NumInput({ value, onChange, suffix }: { value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div className="relative">
      <input
        type="number" step="0.1" value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full h-9 px-2 pr-8 text-sm text-center border border-border rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
      />
      {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{suffix}</span>}
    </div>
  )
}

export function SectionDCFProjections() {
  const { inputs, setInputsArray, results } = useDCFStore()

  const rows = [
    {
      label: "Crecimiento revenue", key: "revenueGrowth" as const,
      values: inputs.revenueGrowth, isPct: true,
      hint: "Tasa de crecimiento revenue vs año anterior",
    },
    {
      label: "Margen EBITDA", key: "ebitdaMarginFwd" as const,
      values: inputs.ebitdaMarginFwd, isPct: true,
      hint: "EBITDA como % del revenue proyectado",
    },
    {
      label: "D&A % revenue", key: "daPct" as const,
      values: inputs.daPct, isPct: true,
      hint: "Depreciación y amortización como % del revenue",
    },
    {
      label: "Capex % revenue", key: "capexPct" as const,
      values: inputs.capexPct, isPct: true,
      hint: "Inversión en activos fijos como % del revenue",
    },
    {
      label: "ΔWC % revenue", key: "wcChangePct" as const,
      values: inputs.wcChangePct, isPct: true,
      hint: "Variación del capital circulante (positivo = salida de caja)",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Proyecciones FCF</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Define los drivers de negocio para los próximos 5 años</p>
      </div>

      {/* Input grid */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground w-52">Driver</th>
                {YEARS.map(y => (
                  <th key={y} className="text-center py-2.5 px-3 text-xs font-semibold text-muted-foreground">Y{y}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.key} className="border-b border-border">
                  <td className="py-2.5 px-4">
                    <div className="text-xs font-semibold text-foreground">{row.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{row.hint}</div>
                  </td>
                  {YEARS.map((_, idx) => (
                    <td key={idx} className="py-2 px-2">
                      <PctInput
                        value={row.values[idx] ?? 0}
                        onChange={v => setInputsArray(row.key, idx, v)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Computed FCF table (read-only) */}
      {results && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-emerald-50">
            <h3 className="text-sm font-semibold text-emerald-800">Flujos libres calculados (read-only)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-secondary/30 border-b border-border">
                  <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground">Partida</th>
                  {YEARS.map(y => <th key={y} className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">Y{y}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Revenue", key: "revenue", fmt: fmtDCF.eur },
                  { label: "↳ Growth", key: "revenueGrowth", fmt: fmtDCF.pct },
                  { label: "EBITDA", key: "ebitda", fmt: fmtDCF.eur },
                  { label: "↳ Margen", key: "ebitdaMargin", fmt: fmtDCF.pct },
                  { label: "EBIT", key: "ebit", fmt: fmtDCF.eur },
                  { label: "NOPAT", key: "nopat", fmt: fmtDCF.eur },
                  { label: "(−) Capex", key: "capex", fmt: fmtDCF.eur },
                  { label: "(−) ΔWC", key: "wcChange", fmt: fmtDCF.eur },
                  { label: "FCF", key: "fcf", fmt: fmtDCF.eur, highlight: true },
                  { label: "PV FCF", key: "pvFCF", fmt: fmtDCF.eur },
                ].map(row => (
                  <tr key={row.key} className={cn("border-b border-border", row.highlight ? "bg-emerald-50/60 font-semibold" : "hover:bg-secondary/10")}>
                    <td className={cn("py-2 px-4 text-xs", row.highlight ? "font-semibold text-foreground" : "text-muted-foreground")}>{row.label}</td>
                    {results.yearly.map(y => (
                      <td key={y.year} className="py-2 px-3 text-center text-xs font-medium">
                        {row.fmt((y as any)[row.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
