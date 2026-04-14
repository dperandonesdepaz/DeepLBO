"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, X, TrendingUp, ArrowUpDown, BarChart2 } from "lucide-react"
import { getAllAnalyses, type SavedAnalysis } from "@/store/analysis-store"
import { computeLBO } from "@/lib/lbo-engine"
import type { LBOResults, LBOInputs } from "@/types/lbo"
import { fmt, irrColor, moicColor } from "@/lib/lbo-engine"
import { cn } from "@/lib/utils"

interface AnalysisWithResults {
  analysis: SavedAnalysis
  results: LBOResults
}

function getResults(a: SavedAnalysis): LBOResults | null {
  try { return computeLBO(a.inputs) } catch { return null }
}

function DeltaBadge({ a, b, format }: { a: number; b: number; format: (v: number) => string }) {
  const delta = a - b
  if (Math.abs(delta) < 0.001) return <span className="text-[10px] text-muted-foreground">—</span>
  const positive = delta > 0
  return (
    <span className={cn("text-[10px] font-semibold", positive ? "text-green-600" : "text-red-500")}>
      {positive ? "▲" : "▼"} {format(Math.abs(delta))}
    </span>
  )
}

function CompareCell({ value, className }: { value: string; className?: string }) {
  return <td className={cn("py-2.5 px-4 text-sm text-center font-medium", className)}>{value}</td>
}

const ROWS: { label: string; section: string; getValue: (r: LBOResults, i: LBOInputs) => number; format: (v: number) => string; highlight?: boolean }[] = [
  // Entry
  { label: "Enterprise Value",     section: "Entrada",   getValue: (r) => r.ev,                  format: fmt.eur,  highlight: true },
  { label: "Equity Invertido",     section: "Entrada",   getValue: (r) => r.totalEquityInvested, format: fmt.eur },
  { label: "Deuda Senior",         section: "Entrada",   getValue: (r) => r.seniorDebt,          format: fmt.eur },
  { label: "Deuda/EBITDA",         section: "Entrada",   getValue: (r) => r.debtOverEbitda,      format: fmt.mult },
  { label: "Múlt. Entrada",        section: "Entrada",   getValue: (_, i) => i.entryMultiple,    format: fmt.mult },
  // P&L LTM
  { label: "Revenue LTM",          section: "LTM",       getValue: (r) => r.yearly[0].revenue,   format: fmt.eur,  highlight: true },
  { label: "EBITDA LTM",           section: "LTM",       getValue: (r) => r.yearly[0].ebitda,    format: fmt.eur },
  { label: "Margen EBITDA LTM",    section: "LTM",       getValue: (r) => r.yearly[0].ebitdaMargin, format: fmt.pct },
  // Y5
  { label: "Revenue Y5",           section: "Y5",        getValue: (r) => r.yearly[5].revenue,   format: fmt.eur,  highlight: true },
  { label: "EBITDA Y5",            section: "Y5",        getValue: (r) => r.yearly[5].ebitda,    format: fmt.eur },
  { label: "Margen EBITDA Y5",     section: "Y5",        getValue: (r) => r.yearly[5].ebitdaMargin, format: fmt.pct },
  { label: "FCF Y5",               section: "Y5",        getValue: (r) => r.yearly[5].fcfBeforeDebt, format: fmt.eur },
  // Returns
  { label: "IRR Base",             section: "Retornos",  getValue: (r) => r.scenarios[1].irr,    format: fmt.pct,  highlight: true },
  { label: "MOIC Base",            section: "Retornos",  getValue: (r) => r.scenarios[1].moic,   format: fmt.mult, highlight: true },
  { label: "IRR Bear",             section: "Retornos",  getValue: (r) => r.scenarios[0].irr,    format: fmt.pct },
  { label: "IRR Bull",             section: "Retornos",  getValue: (r) => r.scenarios[2].irr,    format: fmt.pct },
  { label: "EV Salida Base",       section: "Retornos",  getValue: (r) => r.scenarios[1].evAtExit, format: fmt.eur },
  { label: "Deuda Salida",         section: "Retornos",  getValue: (r) => r.scenarios[1].debtAtExit, format: fmt.eur },
]

export function CompareView() {
  const [allAnalyses, setAllAnalyses] = useState<SavedAnalysis[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => { getAllAnalyses().then(setAllAnalyses) }, [])

  const selectedData: AnalysisWithResults[] = selected
    .map(id => {
      const a = allAnalyses.find(x => x.id === id)
      if (!a) return null
      const r = getResults(a)
      if (!r) return null
      return { analysis: a, results: r }
    })
    .filter(Boolean) as AnalysisWithResults[]

  function toggleSelect(id: string) {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id))
    } else if (selected.length < 4) {
      setSelected([...selected, id])
    }
  }

  // Group rows by section
  const sections = [...new Set(ROWS.map(r => r.section))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comparador de Análisis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Compara hasta 4 análisis en paralelo
          </p>
        </div>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Seleccionar análisis
        </button>
      </div>

      {/* Picker */}
      {showPicker && (
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Selecciona hasta 4 análisis
            </h3>
            <span className="text-xs text-muted-foreground">{selected.length}/4 seleccionados</span>
          </div>
          {allAnalyses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">No tienes análisis guardados todavía.</p>
              <Link href="/dashboard/new" className="text-sm text-primary hover:underline">Crear primer análisis</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {allAnalyses.map(a => {
                const r = getResults(a)
                const base = r?.scenarios[1]
                const isSelected = selected.includes(a.id)
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleSelect(a.id)}
                    disabled={!isSelected && selected.length >= 4}
                    className={cn(
                      "p-3 rounded-lg border-2 text-left transition-all",
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed"
                    )}
                  >
                    <div className="text-xs font-semibold text-foreground mb-0.5 truncate">{a.name}</div>
                    <div className="text-[10px] text-muted-foreground">{a.inputs.sector || "Sin sector"}</div>
                    {base && (
                      <div className="flex gap-2 mt-1.5">
                        <span className={cn("text-[10px] font-bold", irrColor(base.irr).split(" ")[0])}>{fmt.pct(base.irr)}</span>
                        <span className={cn("text-[10px] font-bold", moicColor(base.moic).split(" ")[0])}>{fmt.mult(base.moic)}</span>
                      </div>
                    )}
                    {isSelected && <div className="text-[9px] text-primary font-semibold mt-1">✓ Seleccionado</div>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Comparison table */}
      {selectedData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-border p-16 text-center">
          <BarChart2 className="w-10 h-10 text-primary/30 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Selecciona análisis para comparar</h3>
          <p className="text-sm text-muted-foreground">Pulsa "Seleccionar análisis" arriba y elige 2 o más</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {/* Analysis headers */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground w-48">Métrica</th>
                  {selectedData.map(({ analysis }, i) => (
                    <th key={analysis.id} className="text-center py-3 px-4 min-w-[140px]">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: ["#3B82F6","#10B981","#F59E0B","#8B5CF6"][i] }}
                        />
                        <span className="text-xs font-semibold text-foreground truncate max-w-[100px]">
                          {analysis.name}
                        </span>
                        <button onClick={() => setSelected(selected.filter(s => s !== analysis.id))}>
                          <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{analysis.inputs.sector || "—"}</div>
                    </th>
                  ))}
                  {selectedData.length >= 2 && (
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground min-w-[80px]">
                      Δ (0 vs 1)
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sections.map(section => (
                  <>
                    <tr key={`section-${section}`} className="bg-secondary/30">
                      <td colSpan={selectedData.length + 2} className="py-1.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                        {section}
                      </td>
                    </tr>
                    {ROWS.filter(r => r.section === section).map(row => (
                      <tr key={row.label} className={cn("border-b border-border hover:bg-secondary/20 transition-colors", row.highlight && "bg-primary/3")}>
                        <td className={cn("py-2.5 px-4 text-xs", row.highlight ? "font-semibold text-foreground" : "text-muted-foreground")}>
                          {row.label}
                        </td>
                        {selectedData.map(({ analysis, results: r }) => {
                          const val = row.getValue(r, analysis.inputs)
                          const display = row.format(val)
                          const isIRR  = row.label.includes("IRR")
                          const isMOIC = row.label.includes("MOIC")
                          return (
                            <CompareCell
                              key={analysis.id}
                              value={display}
                              className={cn(
                                row.highlight ? "font-bold" : "",
                                isIRR ? irrColor(val).split(" ")[0] : "",
                                isMOIC ? moicColor(val).split(" ")[0] : "",
                              )}
                            />
                          )
                        })}
                        {selectedData.length >= 2 && (
                          <td className="py-2.5 px-4 text-center">
                            <DeltaBadge
                              a={row.getValue(selectedData[0].results, selectedData[0].analysis.inputs)}
                              b={row.getValue(selectedData[1].results, selectedData[1].analysis.inputs)}
                              format={row.format}
                            />

                          </td>
                        )}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
