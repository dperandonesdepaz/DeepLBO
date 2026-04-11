"use client"

import { useMergerStore } from "@/store/merger-store"
import { fmtMerger } from "@/lib/merger-engine"
import { cn } from "@/lib/utils"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
function NumInput({ value, onChange, suffix }: { value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div className="relative">
      <input type="number" value={value} min={0} step="any"
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full h-10 px-3 pr-10 text-sm border border-border rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all" />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
    </div>
  )
}
function PctInput({ value, onChange, hint }: { value: number; onChange: (v: number) => void; hint?: string }) {
  return (
    <Field label="" hint={hint}>
      <div className="relative">
        <input type="number" step="1" min={0} max={100} value={(value * 100).toFixed(0)}
          onChange={e => onChange(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) / 100)}
          className="w-full h-10 px-3 pr-8 text-sm border border-border rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
      </div>
    </Field>
  )
}

export function SectionMergerStructure() {
  const { inputs, setInputs, results } = useMergerStore()

  const cashPct  = inputs.cashPct
  const stockPct = 1 - cashPct
  const debtPct  = inputs.debtFinancingPct

  const eqPurchasePrice = results?.equityPurchasePrice ?? (inputs.purchaseEV - inputs.targetNetDebt)
  const cashConsideration = eqPurchasePrice * cashPct
  const stockConsideration = eqPurchasePrice * stockPct
  const debtFinanced = cashConsideration * debtPct
  const equityCash = cashConsideration * (1 - debtPct)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Estructura del Deal</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Precio, forma de pago y estructura de financiación</p>
      </div>

      {/* Purchase price */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Precio</h3>
        <div className="max-w-sm">
          <Field label="Enterprise Value pagado" hint="Precio total de la adquisición (EV = equity + deuda neta target)">
            <NumInput value={inputs.purchaseEV} onChange={v => setInputs({ purchaseEV: v })} suffix="M€" />
          </Field>
        </div>
        {results && (
          <div className="bg-secondary/40 rounded-lg px-4 py-3 text-sm flex flex-wrap gap-4">
            <span><span className="text-muted-foreground">Equity value pagado: </span><span className="font-semibold">{fmtMerger.eur(results.equityPurchasePrice)}</span></span>
            <span><span className="text-muted-foreground">EV/EBITDA implícito: </span><span className="font-semibold">{results.impliedTargetEVEBITDA.toFixed(1)}x</span></span>
            <span><span className="text-muted-foreground">P/E implícito: </span><span className="font-semibold">{results.impliedTargetPE.toFixed(1)}x</span></span>
          </div>
        )}
      </div>

      {/* Consideration mix */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Mix de pago</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">% en efectivo</span>
              <span className="text-sm font-semibold">{(cashPct * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min={0} max={100} step={5}
              value={cashPct * 100}
              onChange={e => setInputs({ cashPct: parseFloat(e.target.value) / 100 })}
              className="w-full accent-purple-600" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>100% acciones</span>
              <span>100% efectivo</span>
            </div>
          </div>

          {/* Stacked bar */}
          <div className="flex rounded-lg overflow-hidden h-8">
            <div className="flex items-center justify-center text-xs font-semibold text-white transition-all" style={{ width: `${cashPct * 100}%`, backgroundColor: "#7c3aed" }}>
              {cashPct > 0.1 ? `Caja ${(cashPct * 100).toFixed(0)}%` : ""}
            </div>
            <div className="flex items-center justify-center text-xs font-semibold text-white transition-all" style={{ width: `${stockPct * 100}%`, backgroundColor: "#a78bfa" }}>
              {stockPct > 0.1 ? `Acciones ${(stockPct * 100).toFixed(0)}%` : ""}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Consideración en efectivo</p>
              <p className="text-sm font-bold text-purple-800">{fmtMerger.eur(cashConsideration)}</p>
            </div>
            <div className="bg-purple-100/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Consideración en acciones</p>
              <p className="text-sm font-bold text-purple-700">{fmtMerger.eur(stockConsideration)}</p>
              {results && inputs.acquirerSharePrice > 0 && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{results.newSharesIssued.toFixed(2)}M nuevas acciones</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cash financing */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Financiación del efectivo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="% financiado con deuda" hint="De la porción en efectivo, cuánto se financia con nueva deuda">
            <div className="relative">
              <input type="number" step="5" min={0} max={100}
                value={(inputs.debtFinancingPct * 100).toFixed(0)}
                onChange={e => setInputs({ debtFinancingPct: Math.min(1, (parseFloat(e.target.value) || 0) / 100) })}
                className="w-full h-10 px-3 pr-8 text-sm border border-border rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          </Field>
          <Field label="Coste de la nueva deuda (Kd)" hint="Tipo de interés anual sobre deuda incremental">
            <div className="relative">
              <input type="number" step="0.1" value={(inputs.debtCost * 100).toFixed(2)}
                onChange={e => setInputs({ debtCost: (parseFloat(e.target.value) || 0) / 100 })}
                className="w-full h-10 px-3 pr-8 text-sm border border-border rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          </Field>
          <Field label="Rendimiento del exceso de caja" hint="Rentabilidad anual de la caja propia utilizada">
            <div className="relative">
              <input type="number" step="0.1" value={(inputs.cashYield * 100).toFixed(2)}
                onChange={e => setInputs({ cashYield: (parseFloat(e.target.value) || 0) / 100 })}
                className="w-full h-10 px-3 pr-8 text-sm border border-border rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          </Field>
        </div>
        <div className="bg-secondary/40 rounded-lg px-4 py-3 text-sm flex flex-wrap gap-4">
          <span><span className="text-muted-foreground">Nueva deuda: </span><span className="font-semibold">{fmtMerger.eur(debtFinanced)}</span></span>
          <span><span className="text-muted-foreground">Caja propia usada: </span><span className="font-semibold">{fmtMerger.eur(equityCash)}</span></span>
        </div>
      </div>

      {/* Shares issued */}
      {results && stockPct > 0 && (
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Impacto en acciones</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { label: "Acciones actuales",     value: `${inputs.acquirerShares.toFixed(1)}M` },
              { label: "+ Nuevas emitidas",      value: `+${results.newSharesIssued.toFixed(2)}M` },
              { label: "= Pro-forma",            value: `${results.proFormaShares.toFixed(2)}M` },
              { label: "Dilución",               value: `${(results.ownershipDilution * 100).toFixed(1)}%` },
            ].map(item => (
              <div key={item.label} className="bg-secondary/40 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
