"use client"

import { useDCFStore } from "@/store/dcf-store"
import { fmtDCF } from "@/lib/dcf-engine"
import { cn } from "@/lib/utils"

function getSensColor(ev: number, baseEV: number): string {
  const ratio = ev / baseEV
  if (ratio > 1.15) return "bg-emerald-100 text-emerald-800 font-bold"
  if (ratio > 1.05) return "bg-emerald-50 text-emerald-700"
  if (ratio > 0.95) return "bg-secondary/40 text-foreground"
  if (ratio > 0.85) return "bg-amber-50 text-amber-700"
  return "bg-red-50 text-red-700 font-bold"
}

export function SectionDCFSensitivity() {
  const { results, inputs } = useDCFStore()

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-center">
        <div>
          <p className="text-muted-foreground">Introduce datos financieros para ver la sensibilidad</p>
        </div>
      </div>
    )
  }

  // Build 5×5 grid: WACC (rows) × TGR (cols)
  const waccDeltas = [-0.02, -0.01, 0, +0.01, +0.02]
  const tgrDeltas  = [-0.01, -0.005, 0, +0.005, +0.01]

  const r = results
  const baseEV = r.enterpriseValue

  function getSens(wacc: number, tgr: number) {
    return r.sensitivity.find(
      s => Math.abs(s.wacc - wacc) < 0.001 && Math.abs(s.tgr - tgr) < 0.001
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Análisis de Sensibilidad</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Impacto del WACC y la tasa de crecimiento terminal en el Enterprise Value y Equity Value
        </p>
      </div>

      {/* EV sensitivity */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-emerald-50/60">
          <h3 className="text-sm font-semibold text-emerald-800">Enterprise Value — WACC × TGR</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Base: EV = {fmtDCF.eur(baseEV)} / WACC = {fmtDCF.pct(r.wacc)} / TGR = {fmtDCF.pct(inputs.terminalGrowthRate)}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground">WACC \ TGR</th>
                {tgrDeltas.map(dt => {
                  const tgr = inputs.terminalGrowthRate + dt
                  const isBase = Math.abs(dt) < 0.0001
                  return (
                    <th key={dt} className={cn("text-center py-2.5 px-3 text-xs font-semibold", isBase ? "text-emerald-700" : "text-muted-foreground")}>
                      {fmtDCF.pct(tgr)}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {waccDeltas.map(dw => {
                const w = results.wacc + dw
                const isBaseRow = Math.abs(dw) < 0.0001
                return (
                  <tr key={dw} className="border-b border-border">
                    <td className={cn("py-2.5 px-4 text-xs font-semibold", isBaseRow ? "text-emerald-700" : "text-muted-foreground")}>
                      {fmtDCF.pct(w)}
                    </td>
                    {tgrDeltas.map(dt => {
                      const tgr = inputs.terminalGrowthRate + dt
                      const s = getSens(w, tgr)
                      const ev = s?.ev ?? 0
                      const isBaseCell = isBaseRow && Math.abs(dt) < 0.0001
                      return (
                        <td key={dt} className={cn(
                          "py-2.5 px-3 text-center",
                          isBaseCell ? "ring-2 ring-inset ring-emerald-500" : "",
                          ev > 0 ? getSensColor(ev, baseEV) : "bg-secondary/10 text-muted-foreground"
                        )}>
                          {ev > 0 ? fmtDCF.eur(ev) : "—"}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equity sensitivity */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-blue-50/60">
          <h3 className="text-sm font-semibold text-blue-800">Equity Value — WACC × TGR</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Base: Equity = {fmtDCF.eur(r.equityValue)}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground">WACC \ TGR</th>
                {tgrDeltas.map(dt => {
                  const tgr = inputs.terminalGrowthRate + dt
                  const isBase = Math.abs(dt) < 0.0001
                  return (
                    <th key={dt} className={cn("text-center py-2.5 px-3 text-xs font-semibold", isBase ? "text-blue-700" : "text-muted-foreground")}>
                      {fmtDCF.pct(tgr)}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {waccDeltas.map(dw => {
                const w = results.wacc + dw
                const isBaseRow = Math.abs(dw) < 0.0001
                return (
                  <tr key={dw} className="border-b border-border">
                    <td className={cn("py-2.5 px-4 text-xs font-semibold", isBaseRow ? "text-blue-700" : "text-muted-foreground")}>
                      {fmtDCF.pct(w)}
                    </td>
                    {tgrDeltas.map(dt => {
                      const tgr = inputs.terminalGrowthRate + dt
                      const s = getSens(w, tgr)
                      const eq = s?.equity ?? 0
                      const baseEq = r.equityValue
                      const isBaseCell = isBaseRow && Math.abs(dt) < 0.0001
                      return (
                        <td key={dt} className={cn(
                          "py-2.5 px-3 text-center",
                          isBaseCell ? "ring-2 ring-inset ring-blue-500" : "",
                          eq !== 0 ? getSensColor(Math.abs(eq), Math.abs(baseEq)) : "bg-secondary/10 text-muted-foreground"
                        )}>
                          {s ? fmtDCF.eur(eq) : "—"}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span>Leyenda:</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-100 inline-block" /> &gt;+15% vs base</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-50 inline-block" /> +5% a +15%</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-secondary/40 inline-block" /> −5% a +5% (base)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-50 inline-block" /> −5% a −15%</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-50 inline-block" /> &lt;−15%</span>
      </div>
    </div>
  )
}
