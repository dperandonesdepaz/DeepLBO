"use client"

import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import type { LBOInputs, LBOResults } from "@/types/lbo"
import { DEFAULT_LBO_INPUTS } from "@/types/lbo"
import { computeLBO } from "@/lib/lbo-engine"

// ─── Blank inputs (new analysis, all zeros) ──────────────────────────────────
export const BLANK_LBO_INPUTS: LBOInputs = {
  companyName: '',
  sector: '',
  transactionYear: new Date().getFullYear(),
  revenue: 0,
  ebitda: 0,
  da: 0,
  netDebt: 0,
  cash: 0,
  entryMultiple: 10,
  feesPct: 0.06,
  leverage: 4.5,
  interestRate: 0.065,
  amortization: [0, 0, 0, 0, 0],
  revenueGrowth: [0.15, 0.15, 0.12, 0.10, 0.10],
  ebitdaMargin: [0.145, 0.155, 0.160, 0.165, 0.170],
  daPct: [0.05, 0.05, 0.05, 0.05, 0.05],
  capexPct: [0.06, 0.06, 0.06, 0.055, 0.055],
  wcChange: [-0.5, -0.8, -0.6, -0.7, -0.5],
  taxRate: 0.25,
  exitMultiples: { bear: 12, base: 14, bull: 16, strategic: 18 },
  holdPeriod: 5,
}

// ─── localStorage helpers ────────────────────────────────────────────────────
const LS_KEY = "deeplbo_analyses"

export interface SavedAnalysis {
  id: string
  name: string
  inputs: LBOInputs
  updatedAt: string
}

function loadFromLS(): Record<string, SavedAnalysis> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") ?? {}
  } catch { return {} }
}

export function getAllAnalyses(): SavedAnalysis[] {
  return Object.values(loadFromLS()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function saveAnalysisToLS(id: string, name: string, inputs: LBOInputs) {
  const all = loadFromLS()
  all[id] = { id, name, inputs, updatedAt: new Date().toISOString() }
  localStorage.setItem(LS_KEY, JSON.stringify(all))
}

export function deleteAnalysisFromLS(id: string) {
  const all = loadFromLS()
  delete all[id]
  localStorage.setItem(LS_KEY, JSON.stringify(all))
}

export function getAnalysisFromLS(id: string): SavedAnalysis | null {
  return loadFromLS()[id] ?? null
}

// ─── Compute helper — returns null if inputs are blank ───────────────────────
function safeCompute(inputs: LBOInputs): LBOResults | null {
  if (inputs.revenue === 0 && inputs.ebitda === 0) return null
  return computeLBO(inputs)
}

// ─── Store ───────────────────────────────────────────────────────────────────
type SaveStatus = "saved" | "saving" | "unsaved" | "error"

interface AnalysisState {
  analysisId: string | null
  analysisName: string
  isDemo: boolean

  inputs: LBOInputs
  results: LBOResults | null

  activeSection: string
  saveStatus: SaveStatus
  lastSavedAt: Date | null
  isDirty: boolean

  setAnalysisId: (id: string) => void
  setAnalysisName: (name: string) => void
  setInputs: (inputs: Partial<LBOInputs>) => void
  setField: <K extends keyof LBOInputs>(key: K, value: LBOInputs[K]) => void
  setArrayField: <K extends keyof LBOInputs>(key: K, index: number, value: number) => void
  setActiveSection: (section: string) => void
  setSaveStatus: (status: SaveStatus) => void
  setLastSavedAt: (date: Date) => void

  // Load modes
  loadAnalysis: (id: string, name: string, inputs: LBOInputs) => void
  loadBlank: (id: string, name: string) => void
  loadDemo: () => void
  loadFromStorage: (id: string) => boolean  // returns true if found

  persistToStorage: () => void
  resetInputs: () => void
  recompute: () => void
}

export const useAnalysisStore = create<AnalysisState>()(
  subscribeWithSelector((set, get) => ({
    analysisId:    null,
    analysisName:  "Nuevo análisis",
    isDemo:        false,
    inputs:        { ...BLANK_LBO_INPUTS },
    results:       null,
    activeSection: "overview",
    saveStatus:    "saved",
    lastSavedAt:   null,
    isDirty:       false,

    setAnalysisId:   (id) => set({ analysisId: id }),
    setAnalysisName: (name) => set({ analysisName: name, isDirty: true, saveStatus: "unsaved" }),

    setInputs: (partial) => {
      const next = { ...get().inputs, ...partial }
      set({ inputs: next, results: safeCompute(next), isDirty: true, saveStatus: "unsaved" })
    },

    setField: (key, value) => {
      const next = { ...get().inputs, [key]: value }
      set({ inputs: next, results: safeCompute(next), isDirty: true, saveStatus: "unsaved" })
    },

    setArrayField: (key, index, value) => {
      const arr = [...(get().inputs[key] as number[])]
      arr[index] = value
      const next = { ...get().inputs, [key]: arr }
      set({ inputs: next, results: safeCompute(next), isDirty: true, saveStatus: "unsaved" })
    },

    setActiveSection: (section) => set({ activeSection: section }),
    setSaveStatus:    (status) => set({ saveStatus: status }),
    setLastSavedAt:   (date) => set({ lastSavedAt: date, isDirty: false }),

    loadAnalysis: (id, name, inputs) => {
      set({
        analysisId: id, analysisName: name, inputs,
        results: safeCompute(inputs),
        isDirty: false, saveStatus: "saved",
        lastSavedAt: new Date(), isDemo: false,
        activeSection: "overview",
      })
    },

    loadBlank: (id, name) => {
      set({
        analysisId: id, analysisName: name,
        inputs: { ...BLANK_LBO_INPUTS },
        results: null,
        isDirty: false, saveStatus: "saved",
        lastSavedAt: null, isDemo: false,
        activeSection: "company",  // start on company section for blank
      })
    },

    loadDemo: () => {
      set({
        analysisId: "demo", analysisName: "Análisis Demo — TechCo España",
        inputs: { ...DEFAULT_LBO_INPUTS, companyName: "TechCo España S.L.", sector: "Software / SaaS" },
        results: computeLBO({ ...DEFAULT_LBO_INPUTS, companyName: "TechCo España S.L.", sector: "Software / SaaS" }),
        isDirty: false, saveStatus: "saved",
        lastSavedAt: new Date(), isDemo: true,
        activeSection: "overview",
      })
    },

    loadFromStorage: (id) => {
      const saved = getAnalysisFromLS(id)
      if (!saved) return false
      set({
        analysisId: id, analysisName: saved.name,
        inputs: saved.inputs,
        results: safeCompute(saved.inputs),
        isDirty: false, saveStatus: "saved",
        lastSavedAt: new Date(saved.updatedAt), isDemo: false,
        activeSection: "overview",
      })
      return true
    },

    persistToStorage: () => {
      const { analysisId, analysisName, inputs, isDemo } = get()
      if (!analysisId || isDemo) return
      saveAnalysisToLS(analysisId, analysisName, inputs)
    },

    resetInputs: () => {
      set({
        inputs: { ...BLANK_LBO_INPUTS },
        results: null,
        isDirty: true, saveStatus: "unsaved",
      })
    },

    recompute: () => {
      const { inputs } = get()
      set({ results: safeCompute(inputs) })
    },
  }))
)
