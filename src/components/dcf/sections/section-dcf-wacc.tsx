"use client"

import { useDCFStore } from "@/store/dcf-store"
import { fmtDCF } from "@/lib/dcf-engine"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function PctField({ label, hint, value, onChange }: { label: string; hint?: string; value: number; onChange: (v: number) => void }) {
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <input
          type="number" step="0.01" value={(value * 100).toFixed(2)}
          onChange={e => onChange((parseFloat(e.target.value) || 0) / 100)}
          className="w-full h-10 px-3 pr-8 text-sm border border-border rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
      </div>
    </Field>
  )
}

function NumField({ label, hint, value, onChange, suffix }: { label: string; hint?: string; value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <input
          type="number" step="0.01" value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-full h-10 px-3 pr-10 text-sm border border-border rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </Field>
  )
}

export function SectionDCFWacc() {
  const { inputs, setInputs, results } = useDCFStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Construcción del WACC</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Weighted Average Cost of Capital — coste de capital ponderado (CAPM)
        </p>
      </div>

      {/* Equity side */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-semibold text-foreground">Coste del Capital Propio (Ke)</h3>
          <span className="text-xs text-muted-foreground">CAPM: Ke = Rf + β × ERP</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PctField
            label="Tasa libre de riesgo (Rf)"
            hint="Bono alemán 10Y ~3.5% (2025)"
            value={inputs.riskFreeRate}
            onChange={v => setInputs({ riskFreeRate: v })}
          />
          <NumField
            label="Beta (β)"
            hint="1.0 = mercado. SaaS: ~1.3. Industrial: ~0.9"
            value={inputs.beta}
            onChange={v => setInputs({ beta: v })}
          />
          <PctField
            label="Prima de riesgo (ERP)"
            hint="EUR equity risk premium ~5.5-6%"
            value={inputs.equityRiskPremium}
            onChange={v => setInputs({ equityRiskPremium: v })}
          />
        </div>
        {results && (
          <div className="bg-emerald-50 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-emerald-800">Coste equity calculado (Ke)</span>
            <span className="text-lg font-bold text-emerald-700">{fmtDCF.pct(results.costOfEquity)}</span>
          </div>
        )}
      </div>

      {/* Debt side */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <h3 className="text-sm font-semibold text-foreground">Coste de la Deuda (Kd)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PctField
            label="Coste de deuda pre-tax (Kd)"
            hint="Tipo medio de la deuda financiera"
            value={inputs.costOfDebt}
            onChange={v => setInputs({ costOfDebt: v })}
          />
          <PctField
            label="Peso de la deuda (D/V)"
            hint="Deuda como % del capital total (D+E). Típico: 20-40%"
            value={inputs.debtWeight}
            onChange={v => setInputs({ debtWeight: v })}
          />
        </div>
        {results && (
          <div className="bg-blue-50 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-blue-800">Kd after-tax = {fmtDCF.pct(inputs.costOfDebt)} × (1 − {fmtDCF.pct(inputs.taxRate)})</span>
            <span className="text-lg font-bold text-blue-700">{fmtDCF.pct(results.costOfDebtAfterTax)}</span>
          </div>
        )}
      </div>

      {/* WACC result */}
      {results && (
        <div className="bg-white rounded-xl border-2 border-emerald-200 p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">WACC — Resumen</h3>
          <div className="space-y-2 mb-5">
            {[
              { label: `Ke × Peso equity (${fmtDCF.pct(1 - inputs.debtWeight)})`, value: results.costOfEquity * (1 - inputs.debtWeight) },
              { label: `Kd a.t. × Peso deuda (${fmtDCF.pct(inputs.debtWeight)})`, value: results.costOfDebtAfterTax * inputs.debtWeight },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium tabular-nums">{fmtDCF.pct(row.value)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 flex items-center justify-between">
              <span className="font-semibold text-foreground">WACC</span>
              <span className="text-2xl font-bold text-emerald-700">{fmtDCF.pct(results.wacc)}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Un WACC mayor reduce el valor del DCF. Un WACC por encima del {fmtDCF.pct(inputs.terminalGrowthRate + 0.02)} sugiere un negocio de mayor riesgo.
          </p>
        </div>
      )}

      {/* Reference table */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Referencia WACC por sector (España/Europa)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { sector: "Software / SaaS",     wacc: "9–12%" },
            { sector: "Industria",            wacc: "7–9%" },
            { sector: "Salud / Farma",        wacc: "7–9%" },
            { sector: "Retail",               wacc: "8–10%" },
            { sector: "Infraestructura",      wacc: "5–7%" },
            { sector: "Servicios Financieros", wacc: "9–11%" },
          ].map(ref => (
            <div key={ref.sector} className="bg-secondary/40 rounded-lg px-3 py-2">
              <p className="text-[10px] text-muted-foreground">{ref.sector}</p>
              <p className="text-xs font-semibold text-foreground">{ref.wacc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
