"use client"

import { useDCFStore } from "@/store/dcf-store"

const SECTORS = [
  "Tecnología", "Software / SaaS", "Servicios Financieros", "Salud / Farma",
  "Industria / Manufactura", "Distribución / Logística", "Retail / Consumo",
  "Alimentación & Bebidas", "Infraestructura", "Real Estate",
  "Media & Entretenimiento", "Energía", "Educación", "Otros",
]

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
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
      <input
        type="number" value={value} min={min ?? 0} step="any"
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full h-10 px-3 text-sm border border-border rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">{suffix}</span>}
    </div>
  )
}

export function SectionDCFCompany() {
  const { inputs, setInputs } = useDCFStore()
  const fi = (field: string) => (v: number) => setInputs({ [field]: v } as any)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-foreground">Empresa & Financieros LTM</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Datos de la compañía objetivo y sus cifras de los últimos 12 meses</p>
      </div>

      {/* Identity */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Identificación</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre de la empresa">
            <input value={inputs.companyName} onChange={e => setInputs({ companyName: e.target.value })}
              placeholder="Ej. TechCo España S.L."
              className="w-full h-10 px-3 text-sm border border-border rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" />
          </Field>
          <Field label="Sector">
            <select value={inputs.sector} onChange={e => setInputs({ sector: e.target.value })}
              className="w-full h-10 px-3 text-sm border border-border rounded-lg outline-none focus:border-emerald-500 transition-all">
              <option value="">Seleccionar...</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Año del análisis">
            <NumInput value={inputs.analysisDate} onChange={fi("analysisDate")} />
          </Field>
          <Field label="Acciones en circulación (M)" hint="Opcional, para calcular precio por acción">
            <NumInput value={inputs.sharesOutstanding} onChange={fi("sharesOutstanding")} suffix="M acc." />
          </Field>
        </div>
      </div>

      {/* LTM Financials */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Financieros LTM</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Revenue LTM" hint="Facturación últimos 12 meses">
            <NumInput value={inputs.revenue} onChange={fi("revenue")} suffix="M€" />
          </Field>
          <Field label="EBITDA LTM">
            <NumInput value={inputs.ebitda} onChange={fi("ebitda")} suffix="M€" />
          </Field>
          <Field label="D&A LTM" hint="Depreciación y amortización">
            <NumInput value={inputs.da} onChange={fi("da")} suffix="M€" />
          </Field>
          <Field label="Capex LTM" hint="Inversión en activos fijos">
            <NumInput value={inputs.capex} onChange={fi("capex")} suffix="M€" />
          </Field>
          <Field label="Deuda neta" hint="Deuda financiera − caja">
            <NumInput value={inputs.netDebt} onChange={fi("netDebt")} suffix="M€" />
          </Field>
          <Field label="Minoritarios" hint="Participaciones no controladoras">
            <NumInput value={inputs.minorities} onChange={fi("minorities")} suffix="M€" />
          </Field>
        </div>
      </div>

      {/* Tax */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Impuestos</h3>
        <div className="max-w-xs">
          <Field label="Tasa impositiva efectiva" hint="España: 25% general">
            <NumInput value={inputs.taxRate * 100} onChange={v => setInputs({ taxRate: v / 100 })} suffix="%" />
          </Field>
        </div>
      </div>

      {/* Optional premium */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Prima de control (opcional)</h3>
        <div className="max-w-xs">
          <Field label="Prima de control" hint="0% = sin prima. Típico: 20-35% en M&A">
            <NumInput value={inputs.controlPremium * 100} onChange={v => setInputs({ controlPremium: v / 100 })} suffix="%" />
          </Field>
        </div>
      </div>
    </div>
  )
}
