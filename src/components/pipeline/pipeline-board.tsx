"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, TrendingUp, BarChart3, X, ChevronRight, Flag, Calendar, Edit2 } from "lucide-react"
import {
  usePipelineStore,
  STAGE_CONFIG,
  STAGE_ORDER,
  type PipelineStage,
  type Priority,
} from "@/store/pipeline-store"
import { getAllAnalyses, type SavedAnalysis } from "@/store/analysis-store"
import { computeLBO } from "@/lib/lbo-engine"
import { fmt, irrColor, moicColor } from "@/lib/lbo-engine"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  high:   { label: "Alta",   color: "text-red-600",   dot: "bg-red-500" },
  medium: { label: "Media",  color: "text-amber-600", dot: "bg-amber-500" },
  low:    { label: "Baja",   color: "text-slate-500", dot: "bg-slate-400" },
}

function getMetrics(a: SavedAnalysis) {
  try {
    const r = computeLBO(a.inputs)
    const base = r.scenarios.find(s => s.scenario === "Base")
    return { irr: base?.irr ?? 0, moic: base?.moic ?? 0, ev: r.ev }
  } catch { return { irr: 0, moic: 0, ev: 0 } }
}

function AddToPipelineModal({ analyses, onClose }: {
  analyses: SavedAnalysis[]
  onClose: () => void
}) {
  const { addToPipeline, entries } = usePipelineStore()
  const available = analyses.filter(a => !entries[a.id])

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-border shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-foreground">Añadir análisis al pipeline</h3>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Todos los análisis ya están en el pipeline.
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {available.map(a => {
              const { irr, moic, ev } = getMetrics(a)
              return (
                <button
                  key={a.id}
                  onClick={() => { addToPipeline(a.id, "prospecting", ev); onClose(); toast.success(`${a.name} añadido al pipeline`) }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
                >
                  <div>
                    <div className="text-sm font-medium text-foreground group-hover:text-primary">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.inputs.sector || "Sin sector"}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={cn("font-bold", irrColor(irr).split(" ")[0])}>{fmt.pct(irr)}</span>
                    <span className={cn("font-bold", moicColor(moic).split(" ")[0])}>{fmt.mult(moic)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
        <Link href="/dashboard/new" className="block mt-4 text-center text-xs text-primary hover:underline">
          + Crear nuevo análisis
        </Link>
      </div>
    </div>
  )
}

function PipelineCard({ entry, analysis, onDragStart }: {
  entry: ReturnType<typeof usePipelineStore.getState>["entries"][string]
  analysis: SavedAnalysis | undefined
  onDragStart: (id: string) => void
}) {
  const { removeFromPipeline, updateEntry } = usePipelineStore()
  const metrics = analysis ? getMetrics(analysis) : { irr: 0, moic: 0, ev: 0 }
  const pCfg = PRIORITY_CONFIG[entry.priority]

  return (
    <div
      draggable
      onDragStart={() => onDragStart(entry.analysisId)}
      className="bg-white rounded-lg border border-border p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-foreground truncate">
            {analysis?.name ?? entry.analysisId}
          </div>
          <div className="text-[10px] text-muted-foreground">{analysis?.inputs.sector || "Sin sector"}</div>
        </div>
        <button
          onClick={() => { removeFromPipeline(entry.analysisId); toast.success("Eliminado del pipeline") }}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-50 rounded transition-all ml-1"
        >
          <X className="w-3 h-3 text-red-400" />
        </button>
      </div>

      {analysis && (
        <div className="flex items-center gap-2 mb-2">
          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", irrColor(metrics.irr))}>
            {fmt.pct(metrics.irr)} IRR
          </span>
          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", moicColor(metrics.moic))}>
            {fmt.mult(metrics.moic)}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className={cn("w-2 h-2 rounded-full", pCfg.dot)} />
          <span className={cn("text-[10px] font-medium", pCfg.color)}>{pCfg.label}</span>
        </div>
        {entry.dealSize && (
          <span className="text-[10px] text-muted-foreground">{fmt.eur(entry.dealSize)}</span>
        )}
      </div>

      {entry.notes && (
        <p className="text-[10px] text-muted-foreground mt-1.5 border-t border-border pt-1.5 line-clamp-2">
          {entry.notes}
        </p>
      )}

      <div className="mt-2 flex items-center gap-1.5">
        {(["high", "medium", "low"] as Priority[]).map(p => (
          <button
            key={p}
            onClick={() => updateEntry(entry.analysisId, { priority: p })}
            className={cn(
              "flex-1 text-[9px] font-medium py-0.5 rounded transition-colors",
              entry.priority === p
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            )}
          >
            {PRIORITY_CONFIG[p].label}
          </button>
        ))}
      </div>

      <Link
        href={`/dashboard/${entry.analysisId}`}
        className="mt-2 flex items-center gap-1 text-[10px] text-primary hover:underline"
      >
        Abrir análisis <ChevronRight className="w-2.5 h-2.5" />
      </Link>
    </div>
  )
}

function StageColumn({ stage, cards, analyses, onDrop, onDragStart }: {
  stage: PipelineStage
  cards: ReturnType<typeof usePipelineStore.getState>["entries"][string][]
  analyses: Record<string, SavedAnalysis>
  onDrop: (stage: PipelineStage) => void
  onDragStart: (id: string) => void
}) {
  const cfg = STAGE_CONFIG[stage]
  const [dragOver, setDragOver] = useState(false)

  return (
    <div
      className={cn(
        "flex-1 min-w-[200px] max-w-[260px] rounded-xl border-2 p-3 transition-colors",
        dragOver ? "border-primary/60 bg-primary/5" : "border-transparent bg-secondary/50"
      )}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={() => { setDragOver(false); onDrop(stage) }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full", cfg.dot)} />
          <span className={cn("text-xs font-semibold", cfg.color)}>{cfg.label}</span>
        </div>
        <span className="text-[10px] font-bold bg-white border border-border text-muted-foreground px-1.5 py-0.5 rounded-full">
          {cards.length}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-2 min-h-[80px]">
        {cards.map(entry => (
          <PipelineCard
            key={entry.analysisId}
            entry={entry}
            analysis={analyses[entry.analysisId]}
            onDragStart={onDragStart}
          />
        ))}
        {cards.length === 0 && (
          <div className="flex items-center justify-center h-16 border border-dashed border-border rounded-lg">
            <p className="text-[10px] text-muted-foreground">Arrastra aquí</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function PipelineBoard() {
  const { entries, init, moveStage } = usePipelineStore()
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)

  useEffect(() => {
    init()
    getAllAnalyses().then(setAnalyses)
  }, [init])

  const analysesMap: Record<string, SavedAnalysis> = {}
  analyses.forEach(a => { analysesMap[a.id] = a })

  function handleDrop(stage: PipelineStage) {
    if (!dragging) return
    moveStage(dragging, stage)
    toast.success(`Movido a ${STAGE_CONFIG[stage].label}`)
    setDragging(null)
  }

  const totalDeals = Object.keys(entries).length
  const totalEV = Object.values(entries).reduce((sum, e) => sum + (e.dealSize ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline de Deals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalDeals} deal{totalDeals !== 1 ? "s" : ""} en seguimiento
            {totalEV > 0 && ` · ${fmt.eur(totalEV)} EV total`}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Añadir deal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {STAGE_ORDER.map(stage => {
          const cfg = STAGE_CONFIG[stage]
          const count = Object.values(entries).filter(e => e.stage === stage).length
          return (
            <div key={stage} className={cn("bg-white rounded-lg border p-3 text-center", cfg.border)}>
              <div className={cn("text-xl font-bold", cfg.color)}>{count}</div>
              <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{cfg.label}</div>
            </div>
          )
        })}
      </div>

      {/* Kanban board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGE_ORDER.map(stage => (
          <StageColumn
            key={stage}
            stage={stage}
            cards={Object.values(entries).filter(e => e.stage === stage)}
            analyses={analysesMap}
            onDrop={handleDrop}
            onDragStart={(id) => setDragging(id)}
          />
        ))}
      </div>

      {showAddModal && (
        <AddToPipelineModal
          analyses={analyses}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
