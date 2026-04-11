import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import type { MergerInputs, MergerResults } from "@/types/ma"
import { DEFAULT_MERGER_INPUTS } from "@/types/ma"
import { computeMerger } from "@/lib/merger-engine"

const LS_KEY = "deeplbo_merger_analyses"

export interface SavedMerger {
  id: string
  name: string
  inputs: MergerInputs
  createdAt: string
  updatedAt: string
}

export function getAllMergerAnalyses(): SavedMerger[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as SavedMerger[]
  } catch { return [] }
}

export function saveMergerToLS(id: string, name: string, inputs: MergerInputs): void {
  const all = getAllMergerAnalyses()
  const idx = all.findIndex(a => a.id === id)
  const now = new Date().toISOString()
  if (idx >= 0) {
    all[idx] = { ...all[idx], name, inputs, updatedAt: now }
  } else {
    all.push({ id, name, inputs, createdAt: now, updatedAt: now })
  }
  localStorage.setItem(LS_KEY, JSON.stringify(all))
}

export function getMergerFromLS(id: string): SavedMerger | null {
  return getAllMergerAnalyses().find(a => a.id === id) ?? null
}

export function deleteMergerFromLS(id: string): void {
  const all = getAllMergerAnalyses().filter(a => a.id !== id)
  localStorage.setItem(LS_KEY, JSON.stringify(all))
}

interface MergerStore {
  analysisId: string | null
  analysisName: string
  inputs: MergerInputs
  results: MergerResults | null
  isDemo: boolean
  isDirty: boolean
  saveStatus: 'unsaved' | 'saving' | 'saved' | 'error'
  lastSavedAt: Date | null
  activeSection: string

  setInputs: (partial: Partial<MergerInputs>) => void
  setAnalysisName: (name: string) => void
  setActiveSection: (s: string) => void
  setSaveStatus: (s: MergerStore['saveStatus']) => void
  setLastSavedAt: (d: Date) => void

  loadBlank: (id: string, name: string) => void
  loadDemo: () => void
  loadAnalysis: (id: string, name: string, inputs: MergerInputs) => void
  loadFromStorage: (id: string) => boolean
  persistToStorage: () => void
}

export const useMergerStore = create<MergerStore>()(
  subscribeWithSelector((set, get) => ({
    analysisId:    null,
    analysisName:  "Nueva Fusión",
    inputs:        { ...DEFAULT_MERGER_INPUTS },
    results:       null,
    isDemo:        false,
    isDirty:       false,
    saveStatus:    'unsaved',
    lastSavedAt:   null,
    activeSection: 'overview',

    setInputs: (partial) => set(state => {
      const next = { ...state.inputs, ...partial }
      return { inputs: next, results: computeMerger(next), isDirty: true, saveStatus: 'unsaved' }
    }),

    setAnalysisName: (name) => set({ analysisName: name, isDirty: true }),
    setActiveSection: (activeSection) => set({ activeSection }),
    setSaveStatus: (saveStatus) => set({ saveStatus }),
    setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),

    loadBlank: (id, name) => set({
      analysisId: id, analysisName: name,
      inputs: { ...DEFAULT_MERGER_INPUTS },
      results: null, isDemo: false, isDirty: false,
      saveStatus: 'unsaved', activeSection: 'acquirer',
    }),

    loadDemo: () => {
      const demo: MergerInputs = {
        ...DEFAULT_MERGER_INPUTS,
        dealName: "Fusión Demo: BigCo + TargetCo",
        acquirerName: "BigCo España S.A.",
        targetName: "TargetCo S.L.",
      }
      set({
        analysisId: 'merger-demo', analysisName: "BigCo / TargetCo (Demo)",
        inputs: demo, results: computeMerger(demo),
        isDemo: true, isDirty: false, saveStatus: 'saved', activeSection: 'overview',
      })
    },

    loadAnalysis: (id, name, inputs) => set({
      analysisId: id, analysisName: name,
      inputs, results: computeMerger(inputs),
      isDemo: false, isDirty: false,
      saveStatus: 'saved', activeSection: 'overview',
    }),

    loadFromStorage: (id) => {
      const saved = getMergerFromLS(id)
      if (!saved) return false
      set({
        analysisId: id, analysisName: saved.name,
        inputs: saved.inputs, results: computeMerger(saved.inputs),
        isDemo: false, isDirty: false,
        saveStatus: 'saved', activeSection: 'overview',
      })
      return true
    },

    persistToStorage: () => {
      const { analysisId, analysisName, inputs, isDemo } = get()
      if (!analysisId || isDemo) return
      saveMergerToLS(analysisId, analysisName, inputs)
    },
  }))
)
