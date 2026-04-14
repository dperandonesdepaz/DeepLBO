"use client"

import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { dbGetScore, dbSaveScore } from "@/lib/db"

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ScoringCriterion {
  id: string
  label: string
  description: string
  score: number     // 1-5
  weight: number    // 0.5-2.0
  notes: string
  color: string     // for chart
}

export interface DealScore {
  analysisId: string
  criteria: ScoringCriterion[]
  recommendation: "strong_buy" | "buy" | "neutral" | "pass" | "strong_pass"
  summaryNotes: string
  updatedAt: string
}

// ─── Default criteria ─────────────────────────────────────────────────────────
export const DEFAULT_CRITERIA: Omit<ScoringCriterion, "score" | "notes">[] = [
  { id: "market_position",  label: "Posición de mercado",    color: "#3b82f6", weight: 1.5,
    description: "Cuota de mercado, poder de fijación de precios, barreras de entrada (moat)" },
  { id: "growth_profile",   label: "Perfil de crecimiento",  color: "#8b5cf6", weight: 1.5,
    description: "Crecimiento histórico, visibilidad futura, TAM expansionable" },
  { id: "margins_quality",  label: "Calidad de márgenes",    color: "#10b981", weight: 1.5,
    description: "EBITDA margin, recurrencia de ingresos, QofE normalizado" },
  { id: "management_team",  label: "Equipo directivo",       color: "#f59e0b", weight: 1.5,
    description: "Track record, alineamiento post-deal, bench strength" },
  { id: "value_creation",   label: "Palancas de valor",      color: "#ef4444", weight: 1.0,
    description: "Potencial de mejora operativa, M&A add-on, expansión geográfica" },
  { id: "balance_sheet",    label: "Balance y deuda",        color: "#06b6d4", weight: 1.0,
    description: "Calidad del balance, capacidad de apalancamiento, working capital" },
  { id: "esg_profile",      label: "Perfil ESG",             color: "#84cc16", weight: 0.75,
    description: "Riesgos regulatorios, sostenibilidad, governance" },
  { id: "deal_structure",   label: "Estructura del deal",    color: "#f97316", weight: 1.0,
    description: "Precio de entrada, protecciones, earn-out, vendedor alineado" },
  { id: "downside_risk",    label: "Riesgo bajista",         color: "#ec4899", weight: 1.25,
    description: "Ciclicidad, concentración cliente/proveedor, riesgo regulatorio (invertido: 5=bajo riesgo)" },
  { id: "exit_optionality", label: "Opciones de salida",     color: "#a78bfa", weight: 1.0,
    description: "Compradores estratégicos, IPO potential, múltiplo de salida defensible" },
]

// ─── Score interpretation ─────────────────────────────────────────────────────
export function getRecommendation(weightedAvg: number): DealScore["recommendation"] {
  if (weightedAvg >= 4.5) return "strong_buy"
  if (weightedAvg >= 3.5) return "buy"
  if (weightedAvg >= 2.5) return "neutral"
  if (weightedAvg >= 1.5) return "pass"
  return "strong_pass"
}

export function computeWeightedScore(criteria: ScoringCriterion[]): number {
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0)
  const weightedSum = criteria.reduce((s, c) => s + c.score * c.weight, 0)
  return totalWeight > 0 ? weightedSum / totalWeight : 0
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_KEY = "deeplbo_deal_scores"

function loadAll(): Record<string, DealScore> {
  if (typeof window === "undefined") return {}
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") ?? {} }
  catch { return {} }
}

function saveAll(data: Record<string, DealScore>) {
  localStorage.setItem(LS_KEY, JSON.stringify(data))
}

export function getDealScore(analysisId: string): DealScore | null {
  return loadAll()[analysisId] ?? null
}

export function createDealScore(analysisId: string): DealScore {
  const criteria = DEFAULT_CRITERIA.map(c => ({ ...c, score: 3, notes: "" }))
  const weightedAvg = computeWeightedScore(criteria)
  const score: DealScore = {
    analysisId,
    criteria,
    recommendation: getRecommendation(weightedAvg),
    summaryNotes: "",
    updatedAt: new Date().toISOString(),
  }
  const all = loadAll()
  all[analysisId] = score
  saveAll(all)
  return score
}

// ─── Store ────────────────────────────────────────────────────────────────────
interface ScoringState {
  score: DealScore | null
  weightedAvg: number

  loadScore: (analysisId: string) => void
  updateCriterion: (criterionId: string, updates: Partial<ScoringCriterion>) => void
  updateNotes: (notes: string) => void
}

export const useScoringStore = create<ScoringState>()(
  subscribeWithSelector((set, get) => ({
    score: null,
    weightedAvg: 0,

    loadScore(analysisId) {
      const existing = getDealScore(analysisId)
      const score = existing ?? createDealScore(analysisId)
      const weightedAvg = computeWeightedScore(score.criteria)
      set({ score, weightedAvg })
      // Sync from Supabase
      dbGetScore(analysisId).then(remote => {
        if (!remote) return
        const remoteScore: DealScore = {
          analysisId,
          criteria: remote.criteria as ScoringCriterion[],
          recommendation: remote.recommendation as DealScore['recommendation'],
          summaryNotes: remote.summary_notes ?? "",
          updatedAt: remote.updated_at,
        }
        const all = loadAll()
        all[analysisId] = remoteScore
        saveAll(all)
        set({ score: remoteScore, weightedAvg: computeWeightedScore(remoteScore.criteria) })
      }).catch(() => {})
    },

    updateCriterion(criterionId, updates) {
      const { score } = get()
      if (!score) return
      const criteria = score.criteria.map(c =>
        c.id === criterionId ? { ...c, ...updates } : c
      )
      const weightedAvg = computeWeightedScore(criteria)
      const recommendation = getRecommendation(weightedAvg)
      const updated: DealScore = { ...score, criteria, recommendation, updatedAt: new Date().toISOString() }
      const all = loadAll()
      all[score.analysisId] = updated
      saveAll(all)
      set({ score: updated, weightedAvg })
      dbSaveScore(updated.analysisId, updated.criteria, updated.recommendation, updated.summaryNotes).catch(() => {})
    },

    updateNotes(summaryNotes) {
      const { score } = get()
      if (!score) return
      const updated = { ...score, summaryNotes, updatedAt: new Date().toISOString() }
      const all = loadAll()
      all[score.analysisId] = updated
      saveAll(all)
      set({ score: updated })
      dbSaveScore(updated.analysisId, updated.criteria, updated.recommendation, summaryNotes).catch(() => {})
    },
  }))
)
