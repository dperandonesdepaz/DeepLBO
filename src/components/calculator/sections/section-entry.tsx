"use client"

import { useAnalysisStore } from "@/store/analysis-store"
import { fmt } from "@/lib/lbo-engine"
import { cn } from "@/lib/utils"

function NumInput({ value, onChange, step = "0.1", min = "0", suffix }:
  { value: number; onChange: (v: number) => void; step?: string; min?: string; suffix?: string }) {
  return (
    <div className="relative">
      <input
        type="number" step={step} min={min} value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full h-9 px-3 pr-10 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">{suffix}</span>
      )}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-foreground">{label}</label>
      {hint && <p className="text-[11px] text-muted-foreground -mt-1">{hint}</p>}
      {children}
    </div>
  )
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
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

function SumRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between py-2 border-b border-border last:border-0", highlight && "font-semibold")}>
      <span className={cn("text-xs", highlight ? "text-foreground" : "text-muted-foreground")}>{label}</span>
      <span className={cn("text-sm", highlight ? "text-primary font-bold" : "text-foreground font-medium")}>{value}</span>
    </div>
  )
}

export function SectionEntry() {
  const { inputs, results, setField } = useAnalysisStore()

  if (!results) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Valoración de Entrada</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Múltiplo de entrada, estructura de capital y fuentes y usos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Valoración */}
        <Card title="Valoración de Entrada" description="Múltiplo de adquisición y comisiones de la transacción">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Múltiplo de Entrada" hint="x EBITDA LTM">
              <NumInput value={inputs.entryMultiple} onChange={v => setField("entryMultiple", v)} step="0.5" suffix="x" />
            </Field>
            <Field label="Fees de Transacción" hint="% sobre EV">
              <NumInput
                value={parseFloat((inputs.feesPct * 100).toFixed(1))}
                onChange={v => setField("feesPct", v / 100)}
                step="0.5"
                suffix="%"
              />
            </Field>
          </div>

          {/* Sources & Uses */}
          <div className="mt-2">
            <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-3">
              Fuentes y Usos
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">USOS</p>
                <SumRow label="EV de entrada"        value={fmt.eur(results.ev)} />
                <SumRow label="Fees de transacción"  value={fmt.eur(results.fees)} />
                <SumRow label="Total usos"           value={fmt.eur(results.ev + results.fees)} highlight />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">FUENTES</p>
                <SumRow label="Deuda senior"         value={fmt.eur(results.seniorDebt)} />
                <SumRow label="Equity (sponsor)"     value={fmt.eur(results.totalEquityInvested)} />
                <SumRow label="Total fuentes"        value={fmt.eur(results.seniorDebt + results.totalEquityInvested)} highlight />
              </div>
            </div>
          </div>
        </Card>

        {/* Estructura de Capital */}
        <Card title="Estructura de Capital" description="Apalancamiento, tipo de interés y amortización de la deuda">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Apalancamiento" hint="Deuda / EBITDA LTM">
              <NumInput value={inputs.leverage} onChange={v => setField("leverage", v)} step="0.25" suffix="x" />
            </Field>
            <Field label="Tipo de Interés" hint="Anual sobre deuda senior">
              <NumInput
                value={parseFloat((inputs.interestRate * 100).toFixed(2))}
                onChange={v => setField("interestRate", v / 100)}
                step="0.25"
                suffix="%"
              />
            </Field>
          </div>

          {/* Amortización */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Amortización anual (M€)</p>
            <div className="grid grid-cols-5 gap-2">
              {inputs.amortization.map((amt, i) => (
                <div key={i}>
                  <div className="text-[10px] text-muted-foreground text-center mb-1">Y{i + 1}</div>
                  <input
                    type="number" step="0.5" min="0" value={amt}
                    onChange={e => {
                      const arr = [...inputs.amortization]
                      arr[i] = parseFloat(e.target.value) || 0
                      setField("amortization", arr)
                    }}
                    className="w-full h-8 px-2 text-xs text-center bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Capital structure summary */}
          <div className="p-4 bg-secondary/50 rounded-lg space-y-3 mt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Deuda / EBITDA</span>
              <span className={cn("font-bold", results.debtOverEbitda > 6 ? "text-red-600" : results.debtOverEbitda > 5 ? "text-amber-600" : "text-green-600")}>
                {fmt.mult(results.debtOverEbitda)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">EBITDA / Intereses</span>
              <span className={cn("font-bold", results.interestCoverage < 2 ? "text-red-600" : results.interestCoverage < 3 ? "text-amber-600" : "text-green-600")}>
                {results.interestCoverage.toFixed(1)}x
              </span>
            </div>
            {/* Equity/Debt split bar */}
            <div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Equity {fmt.pct(results.totalEquityInvested / (results.totalEquityInvested + results.seniorDebt))}</span>
                <span>Deuda {fmt.pct(results.seniorDebt / (results.totalEquityInvested + results.seniorDebt))}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary flex overflow-hidden">
                <div
                  className="h-full bg-primary rounded-l-full"
                  style={{ width: `${(results.totalEquityInvested / (results.totalEquityInvested + results.seniorDebt)) * 100}%` }}
                />
                <div className="flex-1 bg-amber-400 rounded-r-full" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Exit Multiples */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Múltiplos de Salida por Escenario</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(["bear", "base", "bull", "strategic"] as const).map(key => {
            const labels = { bear: "Bear 🐻", base: "Base", bull: "Bull 🐂", strategic: "Estratégico" }
            const colors = { bear: "border-red-200 bg-red-50", base: "border-primary/20 bg-primary/5", bull: "border-green-200 bg-green-50", strategic: "border-purple-200 bg-purple-50" }
            return (
              <div key={key} className={cn("border rounded-lg p-3", colors[key])}>
                <div className="text-xs text-muted-foreground font-medium mb-2">{labels[key]}</div>
                <NumInput
                  value={inputs.exitMultiples[key]}
                  onChange={v => setField("exitMultiples", { ...inputs.exitMultiples, [key]: v })}
                  step="0.5"
                  suffix="x"
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
