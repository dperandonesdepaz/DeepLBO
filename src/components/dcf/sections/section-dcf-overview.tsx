"use client"

import { useDCFStore } from "@/store/dcf-store"
import { fmtDCF } from "@/lib/dcf-engine"
import { cn } from "@/lib/utils"
import { TrendingUp, BarChart2, Target, Percent, Building2, AlertCircle } from "lucide-react"

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-2xl font-bold", color ?? "text-foreground")}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}

export function SectionDCFOverview() {
  const { results, inputs, setActiveSection } = useDCFStore()

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Modelo DCF vacío</h2>
        <p className="text-muted-foreground text-sm max-w-sm mb-6">
          Introduce los datos de la empresa para calcular el valor intrínseco por descuento de flujos.
        </p>
        <button
          onClick={() => setActiveSection("company")}
          className="h-9 px-5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Ir a Empresa
        </button>
      </div>
    )
  }

  const r = results
  const evColor = "text-emerald-700"
  const tvPct = (r.tvAsPctOfEV * 100).toFixed(0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{inputs.companyName || "DCF"}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{inputs.sector || "Sin sector"} · Año {inputs.analysisDate}</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Enterprise Value" value={fmtDCF.eur(r.enterpriseValue)} sub="Valor intrínseco EV" color={evColor} />
        <KpiCard label="Equity Value" value={fmtDCF.eur(r.equityValue)} sub={`EV − deuda neta ${fmtDCF.eur(inputs.netDebt)}`} color="text-foreground" />
        <KpiCard label="WACC" value={fmtDCF.pct(r.wacc)} sub={`Ke ${fmtDCF.pct(r.costOfEquity)} · Kd ${fmtDCF.pct(r.costOfDebtAfterTax)} a.t.`} />
        <KpiCard label="EV/EBITDA implícito" value={fmtDCF.mult(r.impliedEVEBITDA)} sub={`EV/Revenue ${fmtDCF.mult(r.impliedEVRevenue)}`} />
      </div>

      {/* Valuation bridge */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-emerald-600" /> Composición del valor
        </h3>
        <div className="space-y-3">
          {[
            { label: "PV Flujos libres (Y1–Y5)", value: r.pvFCFs, sub: `${(r.pvFCFs / r.enterpriseValue * 100).toFixed(0)}% del EV`, color: "bg-emerald-500" },
            { label: "PV Valor Terminal", value: r.pvTerminalValue, sub: `${tvPct}% del EV`, color: "bg-emerald-300" },
            { label: "Enterprise Value total", value: r.enterpriseValue, sub: "", color: "bg-emerald-700", bold: true },
            { label: `(−) Deuda neta`, value: -inputs.netDebt, sub: "", color: "bg-red-400" },
            { label: "= Equity Value", value: r.equityValue, sub: "", color: "bg-blue-600", bold: true },
          ].map((row, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-sm shrink-0", row.color)} />
              <span className={cn("flex-1 text-sm", row.bold ? "font-semibold text-foreground" : "text-muted-foreground")}>{row.label}</span>
              <span className={cn("text-sm font-semibold tabular-nums", row.bold ? "text-foreground" : "text-foreground/80")}>
                {fmtDCF.eur(row.value)}
              </span>
              {row.sub && <span className="text-xs text-muted-foreground">{row.sub}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* TV warning */}
      {r.tvAsPctOfEV > 0.70 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">El valor terminal representa el {tvPct}% del EV</p>
            <p className="text-xs text-amber-700 mt-0.5">Alta dependencia del TV. Revisa la tasa de crecimiento terminal y el método de cálculo.</p>
          </div>
        </div>
      )}

      {/* WACC summary */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Percent className="w-4 h-4 text-emerald-600" /> Resumen WACC
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Tasa libre de riesgo", value: fmtDCF.pct(inputs.riskFreeRate) },
            { label: "Beta", value: inputs.beta.toFixed(2) },
            { label: "Prima de riesgo (ERP)", value: fmtDCF.pct(inputs.equityRiskPremium) },
            { label: "Coste equity (Ke)", value: fmtDCF.pct(r.costOfEquity) },
            { label: "Coste deuda (Kd after-tax)", value: fmtDCF.pct(r.costOfDebtAfterTax) },
            { label: "Peso deuda", value: fmtDCF.pct(inputs.debtWeight) },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">WACC</span>
          <span className="text-lg font-bold text-emerald-700">{fmtDCF.pct(r.wacc)}</span>
        </div>
      </div>

      {/* FCF summary table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold text-foreground">Flujos libres descontados</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="bg-secondary/40">
                <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground">Año</th>
                {r.yearly.map(y => <th key={y.year} className="text-center py-2 px-4 text-xs font-semibold text-muted-foreground">Y{y.year}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Revenue", getValue: (y: typeof r.yearly[0]) => fmtDCF.eur(y.revenue) },
                { label: "EBITDA", getValue: (y: typeof r.yearly[0]) => fmtDCF.eur(y.ebitda) },
                { label: "FCF", getValue: (y: typeof r.yearly[0]) => fmtDCF.eur(y.fcf) },
                { label: "PV FCF", getValue: (y: typeof r.yearly[0]) => fmtDCF.eur(y.pvFCF) },
              ].map(row => (
                <tr key={row.label} className="border-b border-border hover:bg-secondary/20">
                  <td className="py-2 px-4 text-xs text-muted-foreground">{row.label}</td>
                  {r.yearly.map(y => (
                    <td key={y.year} className="py-2 px-4 text-center text-xs font-medium">{row.getValue(y)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
