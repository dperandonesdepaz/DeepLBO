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

export function SectionMergerTarget() {
  const { inputs, setInputs } = useMergerStore()
  const fi = (f: string) => (v: number) => setInputs({ [f]: v } as any)

  const ebitdaMargin = inputs.targetRevenue > 0 ? inputs.targetEBITDA / inputs.targetRevenue * 100 : 0
  const netMargin    = inputs.targetRevenue > 0 ? inputs.targetNetIncome / inputs.targetRevenue * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Empresa Target</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Datos de la empresa que será adquirida</p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <Field label="Nombre de la empresa">
          <input value={inputs.targetName} onChange={e => setInputs({ targetName: e.target.value })}
            placeholder="Ej. TargetCo S.L."
            className="w-full h-10 px-3 text-sm border border-border rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all" />
        </Field>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Financieros LTM (standalone)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Revenue LTM"><NumInput value={inputs.targetRevenue} onChange={fi("targetRevenue")} suffix="M€" /></Field>
          <Field label="EBITDA LTM"><NumInput value={inputs.targetEBITDA} onChange={fi("targetEBITDA")} suffix="M€" /></Field>
          <Field label="Net Income LTM" hint="Standalone, pre-sinergias">
            <NumInput value={inputs.targetNetIncome} onChange={fi("targetNetIncome")} suffix="M€" />
          </Field>
          <Field label="Deuda neta" hint="Se resta del EV para calcular equity value">
            <NumInput value={inputs.targetNetDebt} onChange={fi("targetNetDebt")} suffix="M€" />
          </Field>
        </div>
        {inputs.targetRevenue > 0 && (
          <div className="bg-secondary/40 rounded-lg px-4 py-3 text-sm flex gap-6">
            <span><span className="text-muted-foreground">Margen EBITDA: </span><span className="font-semibold">{ebitdaMargin.toFixed(1)}%</span></span>
            <span><span className="text-muted-foreground">Margen neto: </span><span className="font-semibold">{netMargin.toFixed(1)}%</span></span>
          </div>
        )}
      </div>
    </div>
  )
}
