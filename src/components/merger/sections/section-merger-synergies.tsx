"use client"

import { useMergerStore } from "@/store/merger-store"
import { fmtMerger } from "@/lib/merger-engine"

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
      <input type="number" value={value} min={0} step="0.1"
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full h-10 px-3 pr-10 text-sm border border-border rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all" />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
    </div>
  )
}

export function SectionMergerSynergies() {
  const { inputs, setInputs, results } = useMergerStore()

  const totalSyn = inputs.costSynergies + inputs.revenueSynergies
  const atTaxRate = inputs.acquirerTaxRate
  const totalAfterTax = totalSyn * (1 - atTaxRate)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Sinergias</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Estimación de sinergias run-rate y costes de integración</p>
      </div>

      {/* Annual synergies */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Sinergias anuales run-rate</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Sinergias de costes" hint="Ahorro en costes duplicados, economies of scale">
            <NumInput value={inputs.costSynergies} onChange={v => setInputs({ costSynergies: v })} suffix="M€/año" />
          </Field>
          <Field label="Sinergias de revenue" hint="Ingresos adicionales por cross-selling, mayor alcance">
            <NumInput value={inputs.revenueSynergies} onChange={v => setInputs({ revenueSynergies: v })} suffix="M€/año" />
          </Field>
        </div>
        <div className="bg-purple-50 rounded-lg px-4 py-3 text-sm flex flex-wrap gap-4">
          <span><span className="text-muted-foreground">Total run-rate pre-tax: </span><span className="font-semibold">{fmtMerger.eur(totalSyn)}</span></span>
          <span><span className="text-muted-foreground">After-tax ({(atTaxRate * 100).toFixed(0)}%): </span><span className="font-semibold text-purple-800">{fmtMerger.eur(totalAfterTax)}</span></span>
        </div>
      </div>

      {/* Ramp */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Ramp up de sinergias</h3>
        <div className="max-w-sm">
          <Field label="% sinergias alcanzadas en Año 1" hint="El resto se alcanza en Año 2+">
            <div className="relative">
              <input type="number" step="5" min={0} max={100}
                value={(inputs.synergyRampYr1Pct * 100).toFixed(0)}
                onChange={e => setInputs({ synergyRampYr1Pct: Math.min(1, (parseFloat(e.target.value) || 0) / 100) })}
                className="w-full h-10 px-3 pr-8 text-sm border border-border rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          </Field>
        </div>
        {results && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Sinergias Year 1", syn: results.yr1.totalSynergiesAfterTax },
              { label: "Sinergias Year 2+", syn: results.yr2.totalSynergiesAfterTax },
            ].map(item => (
              <div key={item.label} className="bg-secondary/40 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-bold text-foreground">{fmtMerger.eur(item.syn)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Integration costs */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Costes de integración</h3>
        <div className="max-w-sm">
          <Field label="Costes one-time de integración" hint="Reestructuración, consultores, IT, indemnizaciones — se cargan en Año 1">
            <NumInput value={inputs.integrationCosts} onChange={v => setInputs({ integrationCosts: v })} suffix="M€" />
          </Field>
        </div>
        {inputs.integrationCosts > 0 && totalAfterTax > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
            <span className="text-amber-800">Payback sinergias: </span>
            <span className="font-semibold text-amber-900">
              {(inputs.integrationCosts / totalAfterTax).toFixed(1)} años
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
