"use client"

import { useAnalysisStore } from "@/store/analysis-store"
import { fmt } from "@/lib/lbo-engine"
import { cn } from "@/lib/utils"

const SECTORS = [
  "Tecnología", "Software / SaaS", "Servicios Financieros", "Salud / Farma",
  "Industria / Manufactura", "Distribución / Logística", "Retail / Consumo",
  "Alimentación & Bebidas", "Infraestructura", "Real Estate", "Media & Entretenimiento",
  "Energía", "Educación", "Otros",
]

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-foreground">{label}</label>
      {hint && <p className="text-[11px] text-muted-foreground -mt-1">{hint}</p>}
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = "text", step, min }:
  { value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string; step?: string; min?: string }) {
  return (
    <input
      type={type}
      step={step}
      min={min}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-9 px-3 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
    />
  )
}

function NumInput({ value, onChange, step = "0.1", min = "0", suffix }:
  { value: number; onChange: (v: number) => void; step?: string; min?: string; suffix?: string }) {
  return (
    <div className="relative">
      <input
        type="number"
        step={step}
        min={min}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full h-9 px-3 pr-12 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border p-6 space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export function SectionCompany() {
  const { inputs, results, setField } = useAnalysisStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Empresa Objetivo</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Perfil de la compañía y financieros LTM (últimos 12 meses)
        </p>
      </div>

      {/* Perfil */}
      <Section title="Perfil de la Empresa" description="Información general e identificación">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre de la empresa">
            <Input
              value={inputs.companyName}
              onChange={v => setField("companyName", v)}
              placeholder="Ej. Empresa Target, S.L."
            />
          </Field>
          <Field label="Sector">
            <select
              value={inputs.sector}
              onChange={e => setField("sector", e.target.value)}
              className="w-full h-9 px-3 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            >
              <option value="">Seleccionar sector...</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Año de la transacción">
            <NumInput
              value={inputs.transactionYear}
              onChange={v => setField("transactionYear", v)}
              step="1"
              min="2020"
            />
          </Field>
          <Field label="Período de tenencia" hint="Años hasta la desinversión">
            <NumInput
              value={inputs.holdPeriod}
              onChange={v => setField("holdPeriod", v)}
              step="1"
              min="1"
              suffix="años"
            />
          </Field>
        </div>
      </Section>

      {/* Financieros LTM */}
      <Section
        title="Financieros LTM"
        description="Últimos 12 meses (Last Twelve Months). Todos los valores en millones de euros."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Revenue" hint="Ingresos totales M€">
            <NumInput value={inputs.revenue} onChange={v => setField("revenue", v)} suffix="M€" />
          </Field>
          <Field label="EBITDA" hint={`Margen: ${results ? fmt.pct(results.yearly[0].ebitdaMargin) : "—"}`}>
            <NumInput value={inputs.ebitda} onChange={v => setField("ebitda", v)} suffix="M€" />
          </Field>
          <Field label="D&A" hint="Depreciación y Amortización M€">
            <NumInput value={inputs.da} onChange={v => setField("da", v)} suffix="M€" />
          </Field>
          <Field label="Deuda Financiera Neta" hint="Deuda bruta — caja existente">
            <NumInput value={inputs.netDebt} onChange={v => setField("netDebt", v)} suffix="M€" />
          </Field>
          <Field label="Caja en Cierre" hint="Caja disponible al cierre M€">
            <NumInput value={inputs.cash} onChange={v => setField("cash", v)} suffix="M€" />
          </Field>
          <Field label="Tipo Impositivo" hint="Tasa efectiva de impuestos">
            <NumInput
              value={parseFloat((inputs.taxRate * 100).toFixed(1))}
              onChange={v => setField("taxRate", v / 100)}
              step="0.5"
              min="0"
              suffix="%"
            />
          </Field>
        </div>

        {/* Mini summary */}
        {results && (
          <div className="mt-4 p-4 bg-secondary/50 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "EBITDA Margin", value: fmt.pct(results.yearly[0].ebitdaMargin) },
              { label: "EBIT Margin",   value: fmt.pct(results.yearly[0].ebitMargin) },
              { label: "EBIT",          value: fmt.eur(results.yearly[0].ebit) },
              { label: "EBT",           value: fmt.eur(results.yearly[0].ebt) },
            ].map(item => (
              <div key={item.label}>
                <div className="text-[10px] text-muted-foreground font-medium">{item.label}</div>
                <div className="text-sm font-bold text-foreground">{item.value}</div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
