"use client"

import { useMergerStore } from "@/store/merger-store"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
function NumInput({ value, onChange, suffix, min }: { value: number; onChange: (v: number) => void; suffix?: string; min?: number }) {
  return (
    <div className="relative">
      <input type="number" value={value} min={min ?? 0} step="any"
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full h-10 px-3 pr-10 text-sm border border-border rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all" />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
    </div>
  )
}

export function SectionMergerAcquirer() {
  const { inputs, setInputs } = useMergerStore()
  const fi = (f: string) => (v: number) => setInputs({ [f]: v } as any)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Empresa Adquirente</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Datos del comprador — la empresa que realiza la adquisición</p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Identificación</h3>
        <Field label="Nombre de la empresa">
          <input value={inputs.acquirerName} onChange={e => setInputs({ acquirerName: e.target.value })}
            placeholder="Ej. BigCo España S.A."
            className="w-full h-10 px-3 text-sm border border-border rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all" />
        </Field>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Financieros LTM</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Revenue LTM"><NumInput value={inputs.acquirerRevenue} onChange={fi("acquirerRevenue")} suffix="M€" /></Field>
          <Field label="EBITDA LTM"><NumInput value={inputs.acquirerEBITDA} onChange={fi("acquirerEBITDA")} suffix="M€" /></Field>
          <Field label="Net Income LTM" hint="Beneficio neto standalone pre-deal">
            <NumInput value={inputs.acquirerNetIncome} onChange={fi("acquirerNetIncome")} suffix="M€" />
          </Field>
          <Field label="Deuda neta"><NumInput value={inputs.acquirerNetDebt} onChange={fi("acquirerNetDebt")} suffix="M€" /></Field>
          <Field label="Tasa impositiva efectiva">
            <div className="relative">
              <input type="number" step="0.1" value={(inputs.acquirerTaxRate * 100).toFixed(1)}
                onChange={e => setInputs({ acquirerTaxRate: (parseFloat(e.target.value) || 0) / 100 })}
                className="w-full h-10 px-3 pr-8 text-sm border border-border rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          </Field>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Capitalización bursátil</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Acciones en circulación" hint="Millones de acciones">
            <NumInput value={inputs.acquirerShares} onChange={fi("acquirerShares")} suffix="M acc." />
          </Field>
          <Field label="Precio por acción (€)" hint="Precio actual de mercado">
            <NumInput value={inputs.acquirerSharePrice} onChange={fi("acquirerSharePrice")} suffix="€" />
          </Field>
        </div>
        <div className="bg-secondary/40 rounded-lg px-4 py-3 text-sm">
          <span className="text-muted-foreground">Market Cap implícita: </span>
          <span className="font-semibold text-foreground">€{(inputs.acquirerShares * inputs.acquirerSharePrice).toFixed(0)}M</span>
          <span className="text-muted-foreground ml-3">EPS: </span>
          <span className="font-semibold text-foreground">€{inputs.acquirerShares > 0 ? (inputs.acquirerNetIncome / inputs.acquirerShares).toFixed(2) : "—"}</span>
        </div>
      </div>
    </div>
  )
}
