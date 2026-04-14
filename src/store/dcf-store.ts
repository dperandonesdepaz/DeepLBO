import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import type { DCFInputs, DCFResults } from "@/types/ma"
import { DEFAULT_DCF_INPUTS } from "@/types/ma"
import { computeDCF } from "@/lib/dcf-engine"
import { dbGetAllDCF, dbUpsertDCF, dbGetDCF, dbDeleteDCF } from "@/lib/db"

const LS_KEY = "deeplbo_dcf_analyses"

export interface SavedDCF {
  id: string
  name: string
  inputs: DCFInputs
  createdAt: string
  updatedAt: string
}

function loadFromLS(): SavedDCF[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as SavedDCF[] } catch { return [] }
}

function writeToLS(id: string, name: string, inputs: DCFInputs) {
  const all = loadFromLS()
  const idx = all.findIndex(a => a.id === id)
  const now = new Date().toISOString()
  if (idx >= 0) all[idx] = { ...all[idx], name, inputs, updatedAt: now }
  else all.push({ id, name, inputs, createdAt: now, updatedAt: now })
  localStorage.setItem(LS_KEY, JSON.stringify(all))
}

// ─── Public helpers ───────────────────────────────────────────────────────────

export async function getAllDCFAnalyses(): Promise<SavedDCF[]> {
  try {
    const rows = await dbGetAllDCF()
    return rows.map(r => ({ id: r.id, name: r.name, inputs: r.inputs as DCFInputs, createdAt: r.createdAt, updatedAt: r.updatedAt }))
  } catch {
    return loadFromLS().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }
}

export function saveDCFToLS(id: string, name: string, inputs: DCFInputs) {
  writeToLS(id, name, inputs)
  dbUpsertDCF(id, name, inputs).catch(() => {})
}

export async function deleteDCFFromLS(id: string) {
  const all = loadFromLS().filter(a => a.id !== id)
  localStorage.setItem(LS_KEY, JSON.stringify(all))
  await dbDeleteDCF(id).catch(() => {})
}

export async function getDCFFromLS(id: string): Promise<SavedDCF | null> {
  const local = loadFromLS().find(a => a.id === id)
  if (local) return local
  try {
    const remote = await dbGetDCF(id)
    if (!remote) return null
    return { id: remote.id, name: remote.name, inputs: remote.inputs as DCFInputs, createdAt: remote.createdAt, updatedAt: remote.updatedAt }
  } catch { return null }
}

// ── Store ─────────────────────────────────────────────────────────────────────

interface DCFStore {
  analysisId: string | null
  analysisName: string
  inputs: DCFInputs
  results: DCFResults | null
  isDemo: boolean
  isDirty: boolean
  saveStatus: 'unsaved' | 'saving' | 'saved' | 'error'
  lastSavedAt: Date | null
  activeSection: string

  setInputs: (partial: Partial<DCFInputs>) => void
  setInputsArray: <K extends keyof DCFInputs>(key: K, index: number, value: number) => void
  setAnalysisName: (name: string) => void
  setActiveSection: (s: string) => void
  setSaveStatus: (s: DCFStore['saveStatus']) => void
  setLastSavedAt: (d: Date) => void

  loadBlank: (id: string, name: string) => void
  loadDemo: () => void
  loadAnalysis: (id: string, name: string, inputs: DCFInputs) => void
  loadFromStorage: (id: string) => Promise<boolean>
  persistToStorage: () => void
}

export const useDCFStore = create<DCFStore>()(
  subscribeWithSelector((set, get) => ({
    analysisId:    null,
    analysisName:  "Nuevo DCF",
    inputs:        { ...DEFAULT_DCF_INPUTS },
    results:       null,
    isDemo:        false,
    isDirty:       false,
    saveStatus:    'unsaved',
    lastSavedAt:   null,
    activeSection: 'overview',

    setInputs: (partial) => set(state => {
      const next = { ...state.inputs, ...partial }
      return { inputs: next, results: computeDCF(next), isDirty: true, saveStatus: 'unsaved' }
    }),

    setInputsArray: (key, index, value) => set(state => {
      const arr = [...(state.inputs[key] as number[])]
      arr[index] = value
      const next = { ...state.inputs, [key]: arr }
      return { inputs: next, results: computeDCF(next), isDirty: true, saveStatus: 'unsaved' }
    }),

    setAnalysisName: (name) => set({ analysisName: name, isDirty: true }),
    setActiveSection: (activeSection) => set({ activeSection }),
    setSaveStatus: (saveStatus) => set({ saveStatus }),
    setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),

    loadBlank: (id, name) => set({
      analysisId: id, analysisName: name,
      inputs: { ...DEFAULT_DCF_INPUTS },
      results: null, isDemo: false, isDirty: false,
      saveStatus: 'unsaved', activeSection: 'company',
    }),

    loadDemo: () => {
      const demo: DCFInputs = { ...DEFAULT_DCF_INPUTS, companyName: "TechCo España S.L.", sector: "Software / SaaS", revenue: 50, ebitda: 10 }
      set({
        analysisId: 'demo', analysisName: "TechCo España (DCF Demo)",
        inputs: demo, results: computeDCF(demo),
        isDemo: true, isDirty: false, saveStatus: 'saved', activeSection: 'overview',
      })
    },

    loadAnalysis: (id, name, inputs) => set({
      analysisId: id, analysisName: name, inputs, results: computeDCF(inputs),
      isDemo: false, isDirty: false, saveStatus: 'saved', activeSection: 'overview',
    }),

    loadFromStorage: async (id) => {
      const saved = await getDCFFromLS(id)
      if (!saved) return false
      set({
        analysisId: id, analysisName: saved.name,
        inputs: saved.inputs, results: computeDCF(saved.inputs),
        isDemo: false, isDirty: false, saveStatus: 'saved', activeSection: 'overview',
      })
      return true
    },

    persistToStorage: () => {
      const { analysisId, analysisName, inputs, isDemo } = get()
      if (!analysisId || isDemo) return
      saveDCFToLS(analysisId, analysisName, inputs)
    },
  }))
)
