"use client"

import { useAnalysisStore } from "@/store/analysis-store"
import { fmt } from "@/lib/lbo-engine"
import { cn } from "@/lib/utils"

function PctInput({ value, onChange, rowIndex }:
  { value: number; onChange: (idx: number, v: number) => void; rowIndex: number }) {
  return (
    <input
      type="number" step="0.5" min="0" max="100"
      value={parseFloat((value * 100).toFixed(1))}
      onChange={e => onChange(rowIndex, (parseFloat(e.target.value) || 0) / 100)}
      className="w-full h-7 px-2 text-xs text-right bg-transparent border border-border/50 rounded focus:border-primary focus:ring-1 focus:ring-primary/10 outline-none transition-all"
    />
  )
}

function Row({ label, values, format, className, isInput, onChanges, inputPrefix }:
  {
    label: string
    values: (number | null)[]
    format: (v: number) => string
    className?: string
    isInput?: boolean
    onChanges?: ((idx: number, v: number) => void)[]
    inputPrefix?: number // multiplier to convert stored val → display
  }) {
  return (
    <tr className={cn("border-b border-border hover:bg-secondary/30 transition-colors", className)}>
      <td className="py-2 pl-4 pr-2 text-xs text-muted-foreground whitespace-nowrap w-44">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="py-2 px-2 text-right text-xs">
          {isInput && onChanges?.[i] && v !== null ? (
            <PctInput value={v as number} onChange={onChanges[i]} rowIndex={i} />
          ) : (
            <span>{v !== null ? format(v as number) : "—"}</span>
          )}
        </td>
      ))}
    </tr>
  )
}

function SectionRow({ label }: { label: string }) {
  return (
    <tr className="bg-secondary/50">
      <td colSpan={7} className="py-1.5 pl-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </td>
    </tr>
  )
}

function TotalRow({ label, values, format, highlight }: {
  label: string; values: (number | null)[]; format: (v: number) => string; highlight?: boolean
}) {
  return (
    <tr className={cn("border-b border-border", highlight ? "bg-primary/5" : "bg-secondary/30")}>
      <td className={cn("py-2.5 pl-4 pr-2 text-xs font-bold whitespace-nowrap w-44", highlight ? "text-primary" : "text-foreground")}>
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} className={cn("py-2.5 px-2 text-right text-xs font-bold", highlight ? "text-primary" : v != null && (v as number) < 0 ? "text-red-600" : "text-foreground")}>
          {v !== null ? format(v as number) : "—"}
        </td>
      ))}
    </tr>
  )
}

export function SectionPL() {
  const { inputs, results, setArrayField } = useAnalysisStore()

  if (!results) return null

  const Y = results.yearly
  const years = ["Y0 (LTM)", "Y1", "Y2", "Y3", "Y4", "Y5"]
  const numFmt = (v: number) => v.toFixed(1)
  const pctFmt = (v: number) => fmt.pct(v)
  const eurFmt = (v: number) => v.toFixed(1)

  // Helpers for input cell changes per array field
  const growthChanges = Array.from({ length: 5 }, (_, i) =>
    (idx: number, v: number) => setArrayField("revenueGrowth", idx, v)
  )
  const marginChanges = Array.from({ length: 5 }, (_, i) =>
    (idx: number, v: number) => setArrayField("ebitdaMargin", idx, v)
  )
  const daChanges = Array.from({ length: 5 }, (_, i) =>
    (idx: number, v: number) => setArrayField("daPct", idx, v)
  )
  const capexChanges = Array.from({ length: 5 }, (_, i) =>
    (idx: number, v: number) => setArrayField("capexPct", idx, v)
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">P&L y Free Cash Flow</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Proyección a 5 años. Las celdas editables <span className="text-primary font-medium">en azul</span> son inputs del modelo.
        </p>
      </div>

      {/* Assumptions inputs */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Hipótesis de Proyección</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-3 text-xs font-semibold text-muted-foreground w-44">Hipótesis</th>
                {["Y1", "Y2", "Y3", "Y4", "Y5"].map(y => (
                  <th key={y} className="text-center pb-3 text-xs font-semibold text-muted-foreground px-2">{y}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { label: "Crecimiento Revenue (%)", arr: inputs.revenueGrowth, changes: growthChanges },
                { label: "Margen EBITDA (%)",       arr: inputs.ebitdaMargin,  changes: marginChanges },
                { label: "D&A (% Revenue)",         arr: inputs.daPct,        changes: daChanges },
                { label: "Capex (% Revenue)",       arr: inputs.capexPct,     changes: capexChanges },
              ].map(row => (
                <tr key={row.label} className="hover:bg-secondary/30">
                  <td className="py-2 text-xs text-muted-foreground">{row.label}</td>
                  {row.arr.map((v, i) => (
                    <td key={i} className="py-2 px-2">
                      <PctInput value={v} onChange={row.changes[0]} rowIndex={i} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="hover:bg-secondary/30">
                <td className="py-2 text-xs text-muted-foreground">ΔCapital Circulante (M€)</td>
                {inputs.wcChange.map((v, i) => (
                  <td key={i} className="py-2 px-2">
                    <input
                      type="number" step="0.1" value={v}
                      onChange={e => setArrayField("wcChange", i, parseFloat(e.target.value) || 0)}
                      className="w-full h-7 px-2 text-xs text-right bg-transparent border border-border/50 rounded focus:border-primary focus:ring-1 focus:ring-primary/10 outline-none transition-all"
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Full P&L */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Cuenta de Resultados (M€)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-secondary/50">
              <tr className="border-b border-border">
                <th className="text-left py-2.5 pl-4 pr-2 text-xs font-semibold text-muted-foreground w-44">Partida</th>
                {years.map(y => (
                  <th key={y} className="text-right py-2.5 px-2 text-xs font-semibold text-muted-foreground">{y}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <SectionRow label="Cuenta de Resultados" />
              <Row label="Revenue" values={Y.map(y => y.revenue)} format={eurFmt} className="font-medium" />
              <Row label="Crecimiento" values={Y.map(y => y.revenueGrowth)} format={pctFmt} className="text-muted-foreground" />
              <TotalRow label="EBITDA" values={Y.map(y => y.ebitda)} format={eurFmt} />
              <Row label="Margen EBITDA" values={Y.map(y => y.ebitdaMargin)} format={pctFmt} className="text-primary/80" />
              <Row label="D&A" values={Y.map(y => y.da)} format={eurFmt} className="text-muted-foreground" />
              <TotalRow label="EBIT" values={Y.map(y => y.ebit)} format={eurFmt} />
              <Row label="Intereses" values={Y.map(y => y.interest)} format={eurFmt} className="text-muted-foreground" />
              <Row label="EBT" values={Y.map(y => y.ebt)} format={eurFmt} />
              <Row label="Impuestos" values={Y.map(y => y.taxes)} format={eurFmt} className="text-muted-foreground" />
              <TotalRow label="Beneficio Neto" values={Y.map(y => y.netIncome)} format={eurFmt} highlight />
              <Row label="Margen Neto" values={Y.map(y => y.netMargin)} format={pctFmt} className="text-muted-foreground" />

              <SectionRow label="Free Cash Flow" />
              <Row label="EBITDA" values={Y.map(y => y.ebitda)} format={eurFmt} />
              <Row label="Impuestos" values={Y.map(y => y.taxes)} format={eurFmt} className="text-muted-foreground" />
              <Row label="Capex" values={Y.map(y => y.capex)} format={eurFmt} className="text-muted-foreground" />
              <Row label="ΔCapital Circulante" values={Y.map(y => y.wcChange)} format={eurFmt} className="text-muted-foreground" />
              <TotalRow label="FCF antes de Deuda" values={Y.map(y => y.fcfBeforeDebt)} format={eurFmt} />
              <Row label="Amortización Deuda" values={Y.map(y => y.debtAmort)} format={eurFmt} className="text-muted-foreground" />
              <TotalRow label="FCF a Equity" values={Y.map(y => y.fcfToEquity)} format={eurFmt} highlight />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
