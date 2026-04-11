"use client"

import { useAnalysisStore } from "@/store/analysis-store"
import { fmt, irrColor, moicColor } from "@/lib/lbo-engine"
import { cn } from "@/lib/utils"

const EXIT_MULTS = [10, 12, 14, 16, 18]
const EBITDA_M5s = [0.13, 0.15, 0.17, 0.19, 0.21]
const HOLD_YEARS = [3, 4, 5, 6, 7]

export function SectionSensitivity() {
  const { results } = useAnalysisStore()
  if (!results) return null

  const getIRR = (exitMult: number, ebitdaM5: number) => {
    const cell = results.irrSensitivity.find(c => c.row === exitMult && c.col === ebitdaM5)
    return cell?.irr ?? 0
  }
  const getMOIC = (holdYear: number, exitMult: number) => {
    const cell = results.moicSensitivity.find(c => c.row === holdYear && c.col === exitMult)
    return cell?.moic ?? 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Análisis de Sensibilidad</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Impacto de las variables clave en los retornos del fondo
        </p>
      </div>

      {/* IRR Sensitivity: Exit Multiple × EBITDA Margin Y5 */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            IRR — Múltiplo de Salida × Margen EBITDA Y5
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cada celda muestra el IRR aproximado para la combinación dada
          </p>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="w-full">
            <thead>
              <tr>
                <th className="pb-3 pr-4 text-left">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Mult. Salida ↓ / Margen Y5 →
                  </div>
                </th>
                {EBITDA_M5s.map(m => (
                  <th key={m} className="pb-3 px-2 text-center text-xs font-semibold text-muted-foreground">
                    {fmt.pct(m)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {EXIT_MULTS.map(em => (
                <tr key={em} className="hover:bg-secondary/20 transition-colors">
                  <td className="py-2 pr-4 text-xs font-semibold text-foreground">{fmt.mult(em)}</td>
                  {EBITDA_M5s.map(m => {
                    const irr = getIRR(em, m)
                    const colorClass = irrColor(irr)
                    return (
                      <td key={m} className="py-2 px-1 text-center">
                        <span className={cn(
                          "inline-block w-16 py-1 rounded-md text-xs font-bold",
                          colorClass
                        )}>
                          {fmt.pct(irr)}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="px-5 pb-4 flex items-center gap-3 flex-wrap">
          <span className="text-[10px] text-muted-foreground font-medium">Referencia:</span>
          {[
            { label: "≥45% — Excepcional", className: "text-emerald-600 bg-emerald-50" },
            { label: "≥35% — Excelente",   className: "text-green-600 bg-green-50" },
            { label: "≥25% — Bueno",        className: "text-amber-600 bg-amber-50" },
            { label: "<25% — Bajo",          className: "text-red-600 bg-red-50" },
          ].map(l => (
            <span key={l.label} className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", l.className)}>
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* MOIC Sensitivity: Hold Period × Exit Multiple */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            MOIC — Período de Tenencia × Múltiplo de Salida
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Múltiplo sobre capital invertido según el horizonte y precio de salida
          </p>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="w-full">
            <thead>
              <tr>
                <th className="pb-3 pr-4 text-left">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Años ↓ / Múlt. Salida →
                  </div>
                </th>
                {EXIT_MULTS.map(em => (
                  <th key={em} className="pb-3 px-2 text-center text-xs font-semibold text-muted-foreground">
                    {fmt.mult(em)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {HOLD_YEARS.map(hy => (
                <tr key={hy} className="hover:bg-secondary/20 transition-colors">
                  <td className="py-2 pr-4 text-xs font-semibold text-foreground">{hy} años</td>
                  {EXIT_MULTS.map(em => {
                    const moic = getMOIC(hy, em)
                    const colorClass = moicColor(moic)
                    return (
                      <td key={em} className="py-2 px-1 text-center">
                        <span className={cn(
                          "inline-block w-16 py-1 rounded-md text-xs font-bold",
                          colorClass
                        )}>
                          {fmt.mult(moic)}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOIC legend */}
        <div className="px-5 pb-4 flex items-center gap-3 flex-wrap">
          <span className="text-[10px] text-muted-foreground font-medium">Referencia:</span>
          {[
            { label: "≥5x — Excepcional",  className: "text-emerald-600 bg-emerald-50" },
            { label: "≥3.5x — Excelente",  className: "text-green-600 bg-green-50" },
            { label: "≥2.5x — Bueno",       className: "text-amber-600 bg-amber-50" },
            { label: "<2.5x — Bajo",         className: "text-red-600 bg-red-50" },
          ].map(l => (
            <span key={l.label} className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", l.className)}>
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* Key insight callout */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-primary mb-2">Cómo leer estas tablas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground mb-1">Tabla IRR</p>
            <p>Cruza el múltiplo de salida objetivo con el margen EBITDA esperado en el año 5.
            Un IRR &gt;35% generalmente se considera el objetivo mínimo en LBOs de PE.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Tabla MOIC</p>
            <p>Cruza el horizonte de inversión con el múltiplo de salida.
            Un MOIC &gt;3x en 5 años es el objetivo típico para fondos de mid-market.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
