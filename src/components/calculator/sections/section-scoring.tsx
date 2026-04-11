"use client"

import { useEffect } from "react"
import { useAnalysisStore } from "@/store/analysis-store"
import {
  useScoringStore,
  computeWeightedScore,
  type ScoringCriterion,
} from "@/store/deal-scoring-store"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

// ─── Score labels ─────────────────────────────────────────────────────────────
const SCORE_LABELS: Record<number, string> = {
  1: "Muy débil", 2: "Débil", 3: "Neutro", 4: "Fuerte", 5: "Muy fuerte",
}

const REC_CONFIG = {
  strong_buy:  { label: "COMPRA FUERTE",  color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200",  dot: "bg-emerald-500" },
  buy:         { label: "COMPRA",         color: "text-green-700",   bg: "bg-green-50 border-green-200",      dot: "bg-green-500"   },
  neutral:     { label: "NEUTRAL",        color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",      dot: "bg-amber-500"   },
  pass:        { label: "DESCARTA",       color: "text-orange-700",  bg: "bg-orange-50 border-orange-200",    dot: "bg-orange-500"  },
  strong_pass: { label: "DESCARTA FUERTE",color: "text-red-700",     bg: "bg-red-50 border-red-200",          dot: "bg-red-500"     },
}

// ─── Spider chart (pure SVG) ──────────────────────────────────────────────────
function SpiderChart({ criteria }: { criteria: ScoringCriterion[] }) {
  const n = criteria.length
  const cx = 120
  const cy = 120
  const R = 90
  const levels = [1, 2, 3, 4, 5]

  function getPoint(i: number, value: number) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const r = (value / 5) * R
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  function getLabelPoint(i: number) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const r = R + 18
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  const axisPoints = criteria.map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    return `${cx + R * Math.cos(angle)},${cy + R * Math.sin(angle)}`
  })

  const dataPoints = criteria.map((c, i) => {
    const p = getPoint(i, c.score)
    return `${p.x},${p.y}`
  })

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[280px] mx-auto">
      {/* Grid levels */}
      {levels.map(level => {
        const pts = criteria.map((_, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2
          const r = (level / 5) * R
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
        }).join(" ")
        return (
          <polygon key={level} points={pts} fill="none"
            stroke={level === 5 ? "#e2e8f0" : "#f1f5f9"} strokeWidth="1" />
        )
      })}

      {/* Axis lines */}
      {criteria.map((_, i) => (
        <line key={i} x1={cx} y1={cy} x2={axisPoints[i].split(",")[0]} y2={axisPoints[i].split(",")[1]}
          stroke="#e2e8f0" strokeWidth="1" />
      ))}

      {/* Data polygon */}
      <polygon
        points={dataPoints.join(" ")}
        fill="rgba(59,130,246,0.15)"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {criteria.map((c, i) => {
        const p = getPoint(i, c.score)
        return <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#3b82f6" stroke="white" strokeWidth="1.5" />
      })}

      {/* Labels */}
      {criteria.map((c, i) => {
        const lp = getLabelPoint(i)
        const anchor = lp.x < cx - 5 ? "end" : lp.x > cx + 5 ? "start" : "middle"
        const shortLabel = c.label.split(" ").slice(0, 2).join(" ")
        return (
          <text key={i} x={lp.x} y={lp.y} textAnchor={anchor}
            dominantBaseline="central" fontSize="7.5" fill="#64748b" fontFamily="sans-serif">
            {shortLabel}
          </text>
        )
      })}

      {/* Center score */}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e293b" fontFamily="sans-serif">
        {computeWeightedScore(criteria).toFixed(1)}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">
        / 5.0
      </text>
    </svg>
  )
}

// ─── Score slider row ─────────────────────────────────────────────────────────
function CriterionRow({ criterion, onUpdate }: {
  criterion: ScoringCriterion
  onUpdate: (updates: Partial<ScoringCriterion>) => void
}) {
  return (
    <div className="bg-white rounded-lg border border-border p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-foreground">{criterion.label}</span>
            <span className="text-[9px] font-semibold text-muted-foreground border border-border rounded px-1">
              peso {criterion.weight}x
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{criterion.description}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: criterion.color }}
          >
            {criterion.score}
          </div>
        </div>
      </div>

      {/* Star rating */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onUpdate({ score: s })}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={cn("w-5 h-5 transition-colors",
                s <= criterion.score ? "fill-current" : "fill-none stroke-current"
              )}
              style={{ color: s <= criterion.score ? criterion.color : "#cbd5e1" }}
            />
          </button>
        ))}
        <span className="ml-1 text-[11px] text-muted-foreground">{SCORE_LABELS[criterion.score] ?? ""}</span>
      </div>

      {/* Weight selector */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">Peso:</span>
        {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(w => (
          <button
            key={w}
            type="button"
            onClick={() => onUpdate({ weight: w })}
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded border transition-colors",
              criterion.weight === w
                ? "bg-primary text-white border-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            )}
          >
            {w}x
          </button>
        ))}
      </div>

      {/* Notes inline */}
      <input
        value={criterion.notes}
        onChange={e => onUpdate({ notes: e.target.value })}
        placeholder="Comentarios sobre este criterio..."
        className="w-full text-[11px] px-2 py-1 border border-border/50 rounded bg-secondary/30 focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40"
      />
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function SectionScoring() {
  const { analysisId } = useAnalysisStore()
  const { score, weightedAvg, loadScore, updateCriterion, updateNotes } = useScoringStore()

  useEffect(() => {
    if (analysisId) loadScore(analysisId)
  }, [analysisId, loadScore])

  if (!score) return null

  const rec = REC_CONFIG[score.recommendation]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Deal Scoring</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Evalúa el deal en 10 criterios ponderados. El resultado orienta la recomendación al IC.
        </p>
      </div>

      {/* Summary card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Spider chart */}
        <div className="bg-white rounded-xl border border-border p-5 flex flex-col items-center justify-center">
          <SpiderChart criteria={score.criteria} />
        </div>

        {/* Score + recommendation */}
        <div className="space-y-4">
          <div className={cn("rounded-xl border p-5 space-y-3", rec.bg)}>
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full shrink-0", rec.dot)} />
              <span className={cn("text-xs font-bold uppercase tracking-wider", rec.color)}>Recomendación IC</span>
            </div>
            <p className={cn("text-2xl font-bold", rec.color)}>{rec.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-foreground">{weightedAvg.toFixed(1)}</span>
              <span className="text-lg text-muted-foreground">/ 5.0</span>
            </div>
            <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
              <div className="h-full bg-current rounded-full transition-all" style={{ width: `${(weightedAvg / 5) * 100}%`, color: rec.dot.replace("bg-", "").replace("-500", "") }} />
            </div>
          </div>

          {/* Per-criterion summary */}
          <div className="bg-white rounded-xl border border-border p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Resumen por criterio</p>
            {score.criteria.map(c => (
              <div key={c.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-xs text-foreground flex-1 truncate">{c.label}</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <div key={s} className={cn("w-2.5 h-2.5 rounded-sm", s <= c.score ? "opacity-100" : "opacity-20")}
                      style={{ backgroundColor: c.color }} />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground w-4 text-right">{c.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IC Notes */}
      <div className="bg-white rounded-xl border border-border p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Notas para el IC</h3>
        <textarea
          value={score.summaryNotes}
          onChange={e => updateNotes(e.target.value)}
          placeholder="Resumen ejecutivo de la tesis de inversión, riesgos clave y justificación de la recomendación para presentar al Investment Committee..."
          className="w-full text-sm px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40"
          rows={5}
        />
      </div>

      {/* Criteria grid */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Criterios de evaluación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {score.criteria.map(criterion => (
            <CriterionRow
              key={criterion.id}
              criterion={criterion}
              onUpdate={updates => updateCriterion(criterion.id, updates)}
            />
          ))}
        </div>
      </div>

      {/* Scale legend */}
      <div className="bg-secondary/40 rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Escala de puntuación</p>
        <div className="flex gap-4 flex-wrap">
          {Object.entries(SCORE_LABELS).map(([s, label]) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-primary">{s}</span>
              <span className="text-xs text-muted-foreground">— {label}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          El peso determina la importancia relativa de cada criterio (0.5x = poco relevante, 2.0x = crítico). La puntuación final es el promedio ponderado.
        </p>
      </div>
    </div>
  )
}
