"use client"

import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

export type PipelineStage =
  | "prospecting"
  | "dd"
  | "committee"
  | "signed"
  | "closed"
  | "failed"

export type Priority = "high" | "medium" | "low"

export interface PipelineEntry {
  analysisId: string
  stage: PipelineStage
  priority: Priority
  targetCloseDate: string | null
  dealSize: number | null   // EV M€
  notes: string
  addedAt: string
  updatedAt: string
}

export const STAGE_CONFIG: Record<PipelineStage, { label: string; color: string; bg: string; border: string; dot: string }> = {
  prospecting: { label: "Prospecting",        color: "text-slate-600",  bg: "bg-slate-50",   border: "border-slate-200", dot: "bg-slate-400" },
  dd:          { label: "Due Diligence",       color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200",  dot: "bg-blue-500"  },
  committee:   { label: "Comité Inversión",    color: "text-violet-600", bg: "bg-violet-50",  border: "border-violet-200",dot: "bg-violet-500"},
  signed:      { label: "Firmado / Closing",   color: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-200", dot: "bg-amber-500" },
  closed:      { label: "Cerrado ✓",           color: "text-green-600",  bg: "bg-green-50",   border: "border-green-200", dot: "bg-green-500" },
  failed:      { label: "Descartado",          color: "text-red-500",    bg: "bg-red-50",     border: "border-red-200",   dot: "bg-red-400"   },
}

export const STAGE_ORDER: PipelineStage[] = ["prospecting", "dd", "committee", "signed", "closed", "failed"]

const LS_KEY = "deeplbo_pipeline"

function load(): Record<string, PipelineEntry> {
  if (typeof window === "undefined") return {}
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") ?? {} } catch { return {} }
}
function save(entries: Record<string, PipelineEntry>) {
  if (typeof window !== "undefined") localStorage.setItem(LS_KEY, JSON.stringify(entries))
}

interface PipelineState {
  entries: Record<string, PipelineEntry>
  init: () => void
  addToPipeline: (analysisId: string, stage?: PipelineStage, ev?: number) => void
  moveStage: (analysisId: string, stage: PipelineStage) => void
  updateEntry: (analysisId: string, patch: Partial<PipelineEntry>) => void
  removeFromPipeline: (analysisId: string) => void
  getEntry: (analysisId: string) => PipelineEntry | null
  getByStage: (stage: PipelineStage) => PipelineEntry[]
}

export const usePipelineStore = create<PipelineState>()(
  subscribeWithSelector((set, get) => ({
    entries: {},
    init: () => set({ entries: load() }),
    addToPipeline: (analysisId, stage = "prospecting", ev) => {
      const entries = { ...get().entries }
      if (entries[analysisId]) return  // already in pipeline
      const now = new Date().toISOString()
      entries[analysisId] = {
        analysisId, stage,
        priority: "medium",
        targetCloseDate: null,
        dealSize: ev ?? null,
        notes: "",
        addedAt: now,
        updatedAt: now,
      }
      save(entries)
      set({ entries })
    },
    moveStage: (analysisId, stage) => {
      const entries = { ...get().entries }
      if (!entries[analysisId]) return
      entries[analysisId] = { ...entries[analysisId], stage, updatedAt: new Date().toISOString() }
      save(entries)
      set({ entries })
    },
    updateEntry: (analysisId, patch) => {
      const entries = { ...get().entries }
      if (!entries[analysisId]) return
      entries[analysisId] = { ...entries[analysisId], ...patch, updatedAt: new Date().toISOString() }
      save(entries)
      set({ entries })
    },
    removeFromPipeline: (analysisId) => {
      const entries = { ...get().entries }
      delete entries[analysisId]
      save(entries)
      set({ entries })
    },
    getEntry: (analysisId) => get().entries[analysisId] ?? null,
    getByStage: (stage) => Object.values(get().entries).filter(e => e.stage === stage),
  }))
)
