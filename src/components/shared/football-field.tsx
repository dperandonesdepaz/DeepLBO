"use client"

import { useState } from "react"
import { Plus, Trash2, BarChart2 } from "lucide-react"
import type { ValuationRange } from "@/types/ma"
import { cn } from "@/lib/utils"

const PRESET_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#EC4899"
]

interface Props {
  ranges: ValuationRange[]
  onChange: (ranges: ValuationRange[]) => void
}

function generateId() { return Math.random().toString(36).slice(2, 8) }

export function FootballField({ ranges, onChange }: Props) {
  const allValues = ranges.flatMap(r => [r.low, r.high]).filter(v => v > 0)
  const minEV = allValues.length ? Math.min(...allValues) * 0.85 : 0
  const maxEV = allValues.length ? Math.max(...allValues) * 1.15 : 100

  function addRange() {
    const idx = ranges.length % PRESET_COLORS.length
    onChange([...ranges, {
      method: `Método ${ranges.length + 1}`,
      description: "",
      low: 0, high: 0, midpoint: 0,
      color: PRESET_COLORS[idx],
    }])
  }

  function updateRange(idx: number, partial: Partial<ValuationRange>) {
    onChange(ranges.map((r, i) => {
      if (i !== idx) return r
      const updated = { ...r, ...partial }
      updated.midpoint = (updated.low + updated.high) / 2
      return updated
    }))
  }

  function removeRange(idx: number) {
    onChange(ranges.filter((_, i) => i !== idx))
  }

  function pct(v: number): string {
    if (maxEV === minEV) return "0%"
    return `${((v - minEV) / (maxEV - minEV) * 100).toFixed(1)}%`
  }
  function width(low: number, high: number): string {
    if (maxEV === minEV) return "0%"
    return `${((high - low) / (maxEV - minEV) * 100).toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" /> Football Field — Rango de Valoración
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Agrega métodos de valoración para visualizar el rango de Enterprise Value</p>
        </div>
        <button onClick={addRange}
          className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Añadir método
        </button>
      </div>

      {ranges.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-border p-10 text-center">
          <BarChart2 className="w-8 h-8 text-primary/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Añade métodos de valoración para crear el football field</p>
          <button onClick={addRange}
            className="mt-3 inline-flex items-center gap-1.5 h-8 px-4 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Añadir primer método
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-5 space-y-5">
          {/* Chart */}
          <div className="space-y-3">
            {/* X axis labels */}
            <div className="relative h-5 ml-44">
              {[0, 0.25, 0.5, 0.75, 1].map(p => (
                <span key={p} className="absolute text-[10px] text-muted-foreground transform -translate-x-1/2"
                  style={{ left: `${p * 100}%` }}>
                  €{(minEV + (maxEV - minEV) * p).toFixed(0)}M
                </span>
              ))}
            </div>

            {/* Bars */}
            {ranges.map((r, idx) => (
              <div key={idx} className="flex items-center gap-3 h-9">
                <div className="w-44 shrink-0 text-right pr-3">
                  <span className="text-xs font-semibold text-foreground truncate block">{r.method}</span>
                </div>
                <div className="flex-1 relative bg-secondary/30 h-full rounded-sm">
                  {/* Grid lines */}
                  {[0.25, 0.5, 0.75].map(p => (
                    <div key={p} className="absolute top-0 bottom-0 w-px bg-border/50" style={{ left: `${p * 100}%` }} />
                  ))}
                  {/* Bar */}
                  {r.low > 0 && r.high > r.low && (
                    <>
                      <div
                        className="absolute top-1 bottom-1 rounded-sm opacity-85"
                        style={{
                          left: pct(r.low),
                          width: width(r.low, r.high),
                          backgroundColor: r.color,
                        }}
                      />
                      {/* Midpoint line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white/80"
                        style={{ left: pct(r.midpoint) }}
                      />
                      {/* Labels */}
                      <span className="absolute top-1/2 -translate-y-1/2 text-[9px] font-semibold text-white"
                        style={{ left: `calc(${pct(r.low)} + 3px)` }}>
                        {r.low.toFixed(0)}
                      </span>
                      <span className="absolute top-1/2 -translate-y-1/2 text-[9px] font-semibold text-white"
                        style={{ right: `calc(${100 - parseFloat(width(r.low, r.high)) - parseFloat(pct(r.low))}% + 3px)` }}>
                        {r.high.toFixed(0)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input table */}
          <div className="border-t border-border pt-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configuración de rangos</p>
            {ranges.map((r, idx) => (
              <div key={idx} className="grid grid-cols-[20px_1fr_100px_100px_100px_28px] gap-2 items-center">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                <input type="text" value={r.method} placeholder="Nombre del método"
                  onChange={e => updateRange(idx, { method: e.target.value })}
                  className="h-8 px-2 text-xs border border-border rounded outline-none focus:border-primary transition-all" />
                <div className="relative">
                  <input type="number" step="1" value={r.low || ""}
                    placeholder="Min"
                    onChange={e => updateRange(idx, { low: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-2 pr-6 text-xs border border-border rounded outline-none focus:border-primary transition-all" />
                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">M€</span>
                </div>
                <div className="relative">
                  <input type="number" step="1" value={r.high || ""}
                    placeholder="Max"
                    onChange={e => updateRange(idx, { high: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-2 pr-6 text-xs border border-border rounded outline-none focus:border-primary transition-all" />
                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">M€</span>
                </div>
                <div className="text-[10px] text-muted-foreground text-center">
                  {r.midpoint > 0 ? `€${r.midpoint.toFixed(0)}M` : "—"}
                </div>
                <button onClick={() => removeRange(idx)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-red-50 rounded transition-colors">
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          {ranges.filter(r => r.low > 0 && r.high > 0).length >= 2 && (
            <div className="border-t border-border pt-4">
              <div className="bg-primary/5 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rango de consenso (todos los métodos)</span>
                <span className="text-sm font-bold text-foreground">
                  €{Math.min(...ranges.filter(r => r.low > 0).map(r => r.low)).toFixed(0)}M —
                  €{Math.max(...ranges.filter(r => r.high > 0).map(r => r.high)).toFixed(0)}M
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
