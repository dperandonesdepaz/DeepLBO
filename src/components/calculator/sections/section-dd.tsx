"use client"

import { useEffect, useState } from "react"
import { useAnalysisStore } from "@/store/analysis-store"
import {
  useDDStore,
  type DDCategory, type DDStatus, type DDItem,
  DD_TEMPLATE,
} from "@/store/due-diligence-store"
import { cn } from "@/lib/utils"
import {
  CheckCircle2, Circle, AlertTriangle, Clock, MinusCircle,
  ChevronDown, ChevronRight, Filter, RotateCcw, StickyNote,
} from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES: { id: DDCategory; label: string; color: string }[] = [
  { id: "financial",    label: "Financiero",     color: "bg-blue-500"   },
  { id: "legal",        label: "Legal",          color: "bg-violet-500" },
  { id: "tax",          label: "Fiscal",         color: "bg-orange-500" },
  { id: "commercial",   label: "Comercial",      color: "bg-emerald-500"},
  { id: "operational",  label: "Operacional",    color: "bg-cyan-500"   },
  { id: "it",           label: "IT / Tech",      color: "bg-sky-500"    },
  { id: "hr",           label: "RRHH",           color: "bg-pink-500"   },
  { id: "esg",          label: "ESG",            color: "bg-green-500"  },
  { id: "management",   label: "Management",     color: "bg-amber-500"  },
]

const STATUS_CONFIG: Record<DDStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  pending:     { label: "Pendiente",     icon: Circle,        color: "text-muted-foreground",  bg: "bg-secondary" },
  in_progress: { label: "En progreso",   icon: Clock,         color: "text-amber-600",          bg: "bg-amber-50 border-amber-200" },
  complete:    { label: "Completo",      icon: CheckCircle2,  color: "text-emerald-600",        bg: "bg-emerald-50 border-emerald-200" },
  flagged:     { label: "Alerta",        icon: AlertTriangle, color: "text-red-600",            bg: "bg-red-50 border-red-200" },
  na:          { label: "N/A",           icon: MinusCircle,   color: "text-muted-foreground/50", bg: "bg-secondary/50" },
}

const PRIORITY_COLOR: Record<string, string> = {
  high:   "text-red-600 bg-red-50",
  medium: "text-amber-600 bg-amber-50",
  low:    "text-muted-foreground bg-secondary",
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: DDStatus }) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border", cfg.bg, cfg.color)}>
      <Icon className="w-2.5 h-2.5" /> {cfg.label}
    </span>
  )
}

function DDItemRow({ item, onUpdate }: { item: DDItem; onUpdate: (updates: Partial<DDItem>) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(item.notes)
  const [responsible, setResponsible] = useState(item.responsible ?? "")
  const cfg = STATUS_CONFIG[item.status]

  function saveNotes() {
    onUpdate({ notes, responsible: responsible || undefined })
    setEditingNotes(false)
  }

  return (
    <div className={cn("rounded-lg border transition-all", cfg.bg)}>
      <div
        className="flex items-start gap-3 p-3 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Status icon */}
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            const next: Record<DDStatus, DDStatus> = {
              pending: "in_progress", in_progress: "complete", complete: "flagged",
              flagged: "na", na: "pending",
            }
            onUpdate({ status: next[item.status] })
          }}
          className={cn("mt-0.5 shrink-0", cfg.color)}
          title="Cambiar estado"
        >
          {(() => { const I = cfg.icon; return <I className="w-4 h-4" /> })()}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">{item.label}</span>
            <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase", PRIORITY_COLOR[item.priority])}>
              {item.priority}
            </span>
            {item.notes && <StickyNote className="w-3 h-3 text-muted-foreground" />}
          </div>
          {item.description && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={item.status} />
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-0 space-y-3 border-t border-border/30">
          {/* Status selector */}
          <div className="flex gap-1.5 flex-wrap pt-2">
            {(Object.keys(STATUS_CONFIG) as DDStatus[]).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => onUpdate({ status: s })}
                className={cn(
                  "text-[10px] px-2 py-1 rounded border font-medium transition-all",
                  item.status === s
                    ? `${STATUS_CONFIG[s].color} border-current bg-white shadow-sm`
                    : "text-muted-foreground border-border hover:border-primary/30 bg-white"
                )}
              >
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>

          {/* Notes */}
          {!editingNotes ? (
            <div className="flex items-start gap-2">
              <div className="flex-1">
                {item.notes
                  ? <p className="text-xs text-foreground bg-white/80 rounded px-2 py-1.5 border border-border/50">{item.notes}</p>
                  : <p className="text-xs text-muted-foreground italic">Sin notas</p>
                }
                {item.responsible && (
                  <p className="text-[10px] text-muted-foreground mt-1">Responsable: <span className="font-medium text-foreground">{item.responsible}</span></p>
                )}
              </div>
              <button
                type="button"
                onClick={() => { setNotes(item.notes); setResponsible(item.responsible ?? ""); setEditingNotes(true) }}
                className="text-[10px] text-primary hover:underline whitespace-nowrap"
              >
                {item.notes ? "Editar" : "+ Añadir nota"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Añade notas sobre este punto de DD..."
                className="w-full text-xs px-2 py-1.5 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                rows={3}
              />
              <div className="flex gap-2">
                <input
                  value={responsible}
                  onChange={e => setResponsible(e.target.value)}
                  placeholder="Responsable (opcional)"
                  className="flex-1 text-xs px-2 py-1 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/20 bg-white"
                />
                <button type="button" onClick={saveNotes} className="text-xs px-3 py-1 bg-primary text-white rounded hover:bg-primary/90">Guardar</button>
                <button type="button" onClick={() => setEditingNotes(false)} className="text-xs px-2 py-1 border border-border rounded hover:bg-secondary">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CategorySection({ category, items, onUpdate }: {
  category: typeof CATEGORIES[number]
  items: DDItem[]
  onUpdate: (itemId: string, updates: Partial<DDItem>) => void
}) {
  const [open, setOpen] = useState(true)
  const total = items.length
  const done = items.filter(i => i.status === "complete" || i.status === "na").length
  const flagged = items.filter(i => i.status === "flagged").length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors"
      >
        <div className={cn("w-2 h-2 rounded-full shrink-0", category.color)} />
        <span className="font-semibold text-sm text-foreground">{category.label}</span>
        <div className="flex items-center gap-2 ml-auto">
          {flagged > 0 && (
            <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
              {flagged} alerta{flagged > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{done}/{total}</span>
          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-semibold text-foreground w-8 text-right">{pct}%</span>
          {open ? <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" /> : <ChevronRight className="w-4 h-4 text-muted-foreground ml-1" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-border">
          <div className="pt-3 space-y-2">
            {items.map(item => (
              <DDItemRow
                key={item.id}
                item={item}
                onUpdate={updates => onUpdate(item.id, updates)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function SectionDD() {
  const { analysisId, analysisName } = useAnalysisStore()
  const { checklist, filterCategory, filterStatus, loadChecklist, updateItem, setFilter } = useDDStore()

  useEffect(() => {
    if (analysisId) loadChecklist(analysisId, analysisName || "Análisis")
  }, [analysisId, analysisName, loadChecklist])

  if (!checklist) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-sm text-muted-foreground">Cargando checklist...</div>
      </div>
    )
  }

  const items = checklist.items.filter(item => {
    if (filterCategory !== "all" && item.category !== filterCategory) return false
    if (filterStatus !== "all" && item.status !== filterStatus) return false
    return true
  })

  const total = checklist.items.length
  const done = checklist.items.filter(i => i.status === "complete" || i.status === "na").length
  const flagged = checklist.items.filter(i => i.status === "flagged").length
  const inProgress = checklist.items.filter(i => i.status === "in_progress").length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Due Diligence Tracker</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {checklist.items.length} puntos de revisión en 9 categorías
        </p>
      </div>

      {/* Progress overview */}
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">Progreso global</span>
          <span className="text-2xl font-bold text-primary">{pct}%</span>
        </div>
        <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden mb-4">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Completados",  value: done,       color: "text-emerald-600 bg-emerald-50" },
            { label: "En progreso",  value: inProgress, color: "text-amber-600 bg-amber-50" },
            { label: "Alertas",      value: flagged,    color: "text-red-600 bg-red-50" },
            { label: "Pendientes",   value: total - done - inProgress - flagged, color: "text-muted-foreground bg-secondary" },
          ].map(({ label, value, color }) => (
            <div key={label} className={cn("rounded-lg p-3 text-center", color)}>
              <div className="text-xl font-bold">{value}</div>
              <div className="text-[10px] font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <select
          value={filterCategory}
          onChange={e => setFilter(e.target.value as DDCategory | "all", filterStatus)}
          className="text-xs h-7 px-2 border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
        >
          <option value="all">Todas las categorías</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilter(filterCategory, e.target.value as DDStatus | "all")}
          className="text-xs h-7 px-2 border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
        >
          <option value="all">Todos los estados</option>
          {(Object.keys(STATUS_CONFIG) as DDStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>
        {(filterCategory !== "all" || filterStatus !== "all") && (
          <button
            type="button"
            onClick={() => setFilter("all", "all")}
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
          >
            <RotateCcw className="w-3 h-3" /> Limpiar filtros
          </button>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{items.length} items</span>
      </div>

      {/* Category sections */}
      {filterCategory !== "all"
        ? (
          <div className="space-y-2">
            {items.map(item => (
              <DDItemRow key={item.id} item={item} onUpdate={u => updateItem(item.id, u)} />
            ))}
          </div>
        )
        : CATEGORIES.map(cat => {
          const catItems = items.filter(i => i.category === cat.id)
          if (catItems.length === 0) return null
          return (
            <CategorySection
              key={cat.id}
              category={cat}
              items={catItems}
              onUpdate={updateItem}
            />
          )
        })
      }

      {/* Legend */}
      <div className="bg-secondary/40 rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Cómo usar</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.entries(STATUS_CONFIG) as [DDStatus, typeof STATUS_CONFIG[DDStatus]][]).map(([s, cfg]) => (
            <div key={s} className="flex items-center gap-1.5">
              {(() => { const I = cfg.icon; return <I className={cn("w-3.5 h-3.5", cfg.color)} /> })()}
              <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Haz clic en el icono de estado para cambiar rápidamente, o expande un item para añadir notas y responsable.
        </p>
      </div>
    </div>
  )
}
