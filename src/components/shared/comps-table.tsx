"use client"

import { useState } from "react"
import { Plus, Trash2, Table2 } from "lucide-react"
import type { CompsInputs, CompEntry } from "@/types/ma"
import { computeCompEntry, computeComps } from "@/lib/comps-engine"
import { cn } from "@/lib/utils"

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

interface Props {
  inputs: CompsInputs
  onChange: (inputs: CompsInputs) => void
}

const COLS = [
  { key: "name",       label: "Empresa",     type: "text",   suffix: "" },
  { key: "ticker",     label: "Ticker",      type: "text",   suffix: "" },
  { key: "marketCap",  label: "Mkt Cap",     type: "number", suffix: "M€" },
  { key: "netDebt",    label: "Deuda neta",  type: "number", suffix: "M€" },
  { key: "revenue",    label: "Revenue LTM", type: "number", suffix: "M€" },
  { key: "ebitda",     label: "EBITDA LTM",  type: "number", suffix: "M€" },
  { key: "netIncome",  label: "Net Income",  type: "number", suffix: "M€" },
]

export function CompsTable({ inputs, onChange }: Props) {
  const results = computeComps(inputs)

  function addRow() {
    const blank: CompEntry = {
      id: generateId(), name: "", ticker: "", country: "ESP",
      marketCap: 0, netDebt: 0, revenue: 0, ebitda: 0, ebit: 0, netIncome: 0,
      ev: 0, evRevenue: 0, evEbitda: 0, evEbit: 0, peRatio: 0, notes: "",
    }
    onChange({ ...inputs, entries: [...inputs.entries, blank] })
  }

  function updateEntry(id: string, field: string, raw: string) {
    const entries = inputs.entries.map(e => {
      if (e.id !== id) return e
      const partial = { ...e, [field]: field === "name" || field === "ticker" || field === "notes" || field === "country"
        ? raw
        : parseFloat(raw) || 0
      }
      return computeCompEntry(partial as any)
    })
    onChange({ ...inputs, entries })
  }

  function removeEntry(id: string) {
    onChange({ ...inputs, entries: inputs.entries.filter(e => e.id !== id) })
  }

  return (
    <div className="space-y-6">
      {/* Target summary */}
      <div className="bg-white rounded-xl border border-border p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Table2 className="w-4 h-4 text-primary" /> Target & Comparables
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Target — Revenue", field: "targetRevenue", val: inputs.targetRevenue },
            { label: "Target — EBITDA",  field: "targetEBITDA",  val: inputs.targetEBITDA },
            { label: "Target — EBIT",    field: "targetEBIT",    val: inputs.targetEBIT },
            { label: "Target — Net Inc", field: "targetNetIncome", val: inputs.targetNetIncome },
          ].map(f => (
            <div key={f.field} className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">{f.label}</label>
              <div className="relative">
                <input type="number" step="0.1" value={f.val}
                  onChange={e => onChange({ ...inputs, [f.field]: parseFloat(e.target.value) || 0 })}
                  className="w-full h-9 px-3 pr-8 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all" />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">M€</span>
              </div>
            </div>
          ))}
        </div>
        <div className="max-w-sm space-y-1">
          <label className="block text-xs font-semibold text-foreground">Target — Deuda neta</label>
          <div className="relative">
            <input type="number" step="0.1" value={inputs.targetNetDebt}
              onChange={e => onChange({ ...inputs, targetNetDebt: parseFloat(e.target.value) || 0 })}
              className="w-full h-9 px-3 pr-8 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all" />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">M€</span>
          </div>
        </div>
      </div>

      {/* Comparables table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Comparables cotizados</h3>
          <button onClick={addRow}
            className="inline-flex items-center gap-1.5 h-7 px-3 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Añadir
          </button>
        </div>
        {inputs.entries.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">No hay comparables. Añade empresas cotizadas similares.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-xs">
              <thead>
                <tr className="bg-secondary/40 border-b border-border">
                  {COLS.map(c => (
                    <th key={c.key} className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">{c.label}</th>
                  ))}
                  <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">EV</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">EV/Rev</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">EV/EBITDA</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">P/E</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {inputs.entries.map(e => (
                  <tr key={e.id} className="border-b border-border hover:bg-secondary/10">
                    {COLS.map(c => (
                      <td key={c.key} className="py-1.5 px-2">
                        <input
                          type={c.type} value={(e as any)[c.key]}
                          onChange={ev => updateEntry(e.id, c.key, ev.target.value)}
                          className="w-full h-8 px-2 text-xs border border-transparent hover:border-border focus:border-primary rounded transition-all outline-none bg-transparent"
                        />
                      </td>
                    ))}
                    <td className="py-1.5 px-3 text-center font-medium">€{e.ev.toFixed(0)}M</td>
                    <td className={cn("py-1.5 px-3 text-center font-medium", e.evRevenue > 0 ? "text-foreground" : "text-muted-foreground")}>
                      {e.evRevenue > 0 ? `${e.evRevenue.toFixed(1)}x` : "—"}
                    </td>
                    <td className={cn("py-1.5 px-3 text-center font-medium", e.evEbitda > 0 ? "text-foreground" : "text-muted-foreground")}>
                      {e.evEbitda > 0 ? `${e.evEbitda.toFixed(1)}x` : "—"}
                    </td>
                    <td className={cn("py-1.5 px-3 text-center font-medium", e.peRatio > 0 ? "text-foreground" : "text-muted-foreground")}>
                      {e.peRatio > 0 ? `${e.peRatio.toFixed(1)}x` : "—"}
                    </td>
                    <td className="py-1.5 px-2">
                      <button onClick={() => removeEntry(e.id)} className="w-6 h-6 flex items-center justify-center hover:bg-red-50 rounded">
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Stats footer */}
              {results && inputs.entries.length >= 2 && (
                <tfoot>
                  <tr className="bg-primary/5 border-t-2 border-primary/20 font-semibold text-xs">
                    <td colSpan={7} className="py-2 px-3 text-muted-foreground">Mediana</td>
                    <td className="py-2 px-3 text-center text-foreground">—</td>
                    <td className="py-2 px-3 text-center text-foreground">{results.medianEVRevenue.toFixed(1)}x</td>
                    <td className="py-2 px-3 text-center text-foreground">{results.medianEVEBITDA.toFixed(1)}x</td>
                    <td className="py-2 px-3 text-center text-foreground">{results.medianPE.toFixed(1)}x</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* Implied valuation */}
      {results && inputs.entries.length >= 2 && (
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Valoración implícita del Target</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Por EV/Revenue",  ev: results.impliedEVFromRevenue,  equity: results.impliedEVFromRevenue - inputs.targetNetDebt },
              { label: "Por EV/EBITDA",   ev: results.impliedEVFromEBITDA,   equity: results.impliedEquityFromEBITDA },
              { label: "Por EV/EBIT",     ev: results.impliedEVFromEBIT,     equity: results.impliedEVFromEBIT - inputs.targetNetDebt },
              { label: "Por P/E (equity)",ev: results.impliedEquityFromPE + inputs.targetNetDebt, equity: results.impliedEquityFromPE },
            ].map(item => (
              <div key={item.label} className="bg-secondary/40 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground mb-1">{item.label}</p>
                <p className="text-xs font-bold text-foreground">EV: €{item.ev.toFixed(0)}M</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Equity: €{item.equity.toFixed(0)}M</p>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-primary/5 rounded-lg px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rango implícito EV (p25–p75)</span>
            <span className="text-sm font-bold text-foreground">
              €{(inputs.targetEBITDA * results.q1EVEbitda).toFixed(0)}M — €{(inputs.targetEBITDA * results.q3EVEbitda).toFixed(0)}M
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
