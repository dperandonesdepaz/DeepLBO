"use client"

import { create } from "zustand"
import type { LBOInputs } from "@/types/lbo"

export interface Version {
  id: string
  analysisId: string
  versionNum: number
  label: string
  inputs: LBOInputs
  savedAt: string
  note: string
}

const LS_KEY = "deeplbo_versions"
const MAX_VERSIONS = 20  // per analysis

function load(): Version[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") ?? [] } catch { return [] }
}
function save(versions: Version[]) {
  if (typeof window !== "undefined") localStorage.setItem(LS_KEY, JSON.stringify(versions))
}
function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

interface VersionsState {
  versions: Version[]
  init: () => void
  saveVersion: (analysisId: string, inputs: LBOInputs, note?: string) => void
  deleteVersion: (versionId: string) => void
  getByAnalysis: (analysisId: string) => Version[]
  getLatest: (analysisId: string) => Version | null
}

export const useVersionsStore = create<VersionsState>()((set, get) => ({
  versions: [],
  init: () => set({ versions: load() }),
  saveVersion: (analysisId, inputs, note = "") => {
    const existing = get().versions.filter(v => v.analysisId === analysisId)
    const versionNum = existing.length > 0 ? Math.max(...existing.map(v => v.versionNum)) + 1 : 1
    const now = new Date()
    const label = `v${versionNum} — ${now.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })} ${now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`

    const newVersion: Version = {
      id: genId(),
      analysisId, versionNum, label,
      inputs: JSON.parse(JSON.stringify(inputs)), // deep copy
      savedAt: now.toISOString(),
      note,
    }

    // Keep only last MAX_VERSIONS per analysis
    let updated = [newVersion, ...get().versions]
    const analysisByDate = updated.filter(v => v.analysisId === analysisId)
    if (analysisByDate.length > MAX_VERSIONS) {
      const toRemove = new Set(analysisByDate.slice(MAX_VERSIONS).map(v => v.id))
      updated = updated.filter(v => !toRemove.has(v.id))
    }
    save(updated)
    set({ versions: updated })
  },
  deleteVersion: (versionId) => {
    const updated = get().versions.filter(v => v.id !== versionId)
    save(updated)
    set({ versions: updated })
  },
  getByAnalysis: (analysisId) =>
    get().versions
      .filter(v => v.analysisId === analysisId)
      .sort((a, b) => b.versionNum - a.versionNum),
  getLatest: (analysisId) =>
    get().versions
      .filter(v => v.analysisId === analysisId)
      .sort((a, b) => b.versionNum - a.versionNum)[0] ?? null,
}))
