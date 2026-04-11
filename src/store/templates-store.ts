"use client"

import { create } from "zustand"
import type { LBOInputs } from "@/types/lbo"
import { DEFAULT_LBO_INPUTS } from "@/types/lbo"

export interface Template {
  id: string
  name: string
  description: string
  sector: string
  isBuiltIn: boolean
  inputs: LBOInputs
  createdAt: string
}

const LS_KEY = "deeplbo_templates"

// Built-in templates
const BUILT_IN_TEMPLATES: Template[] = [
  {
    id: "builtin-software",
    name: "Software / SaaS",
    description: "Empresa de software con alto margen y crecimiento orgánico",
    sector: "Software / SaaS",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    inputs: {
      ...DEFAULT_LBO_INPUTS,
      sector: "Software / SaaS",
      revenue: 25, ebitda: 5, da: 1,
      entryMultiple: 14, leverage: 4.0,
      revenueGrowth: [0.20, 0.18, 0.15, 0.12, 0.10],
      ebitdaMargin: [0.22, 0.24, 0.26, 0.27, 0.28],
    },
  },
  {
    id: "builtin-industrial",
    name: "Industrial / Manufactura",
    description: "Empresa industrial con márgenes estables y bajo crecimiento",
    sector: "Industria / Manufactura",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    inputs: {
      ...DEFAULT_LBO_INPUTS,
      sector: "Industria / Manufactura",
      revenue: 50, ebitda: 7, da: 3,
      entryMultiple: 8, leverage: 5.0,
      revenueGrowth: [0.06, 0.06, 0.05, 0.05, 0.04],
      ebitdaMargin: [0.14, 0.145, 0.15, 0.155, 0.16],
    },
  },
  {
    id: "builtin-retail",
    name: "Retail / Consumo",
    description: "Empresa retail con expansión geográfica y mejora de márgenes",
    sector: "Retail / Consumo",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    inputs: {
      ...DEFAULT_LBO_INPUTS,
      sector: "Retail / Consumo",
      revenue: 80, ebitda: 8, da: 4,
      entryMultiple: 9, leverage: 4.5,
      revenueGrowth: [0.12, 0.10, 0.09, 0.08, 0.07],
      ebitdaMargin: [0.10, 0.11, 0.12, 0.125, 0.13],
    },
  },
  {
    id: "builtin-healthcare",
    name: "Salud / Farma",
    description: "Empresa sanitaria con ingresos recurrentes y alta visibilidad",
    sector: "Salud / Farma",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    inputs: {
      ...DEFAULT_LBO_INPUTS,
      sector: "Salud / Farma",
      revenue: 40, ebitda: 8, da: 2,
      entryMultiple: 12, leverage: 4.0,
      revenueGrowth: [0.10, 0.10, 0.09, 0.08, 0.08],
      ebitdaMargin: [0.20, 0.21, 0.22, 0.23, 0.24],
    },
  },
]

function loadUserTemplates(): Template[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") ?? [] } catch { return [] }
}
function saveUserTemplates(templates: Template[]) {
  if (typeof window !== "undefined") localStorage.setItem(LS_KEY, JSON.stringify(templates.filter(t => !t.isBuiltIn)))
}
function genId(): string {
  return "tpl_" + Math.random().toString(36).slice(2, 10)
}

interface TemplatesState {
  templates: Template[]
  init: () => void
  saveAsTemplate: (name: string, description: string, inputs: LBOInputs) => void
  deleteTemplate: (id: string) => void
  getAll: () => Template[]
  getUserTemplates: () => Template[]
}

export const useTemplatesStore = create<TemplatesState>()((set, get) => ({
  templates: [...BUILT_IN_TEMPLATES],
  init: () => {
    const user = loadUserTemplates()
    set({ templates: [...BUILT_IN_TEMPLATES, ...user] })
  },
  saveAsTemplate: (name, description, inputs) => {
    const tpl: Template = {
      id: genId(),
      name, description,
      sector: inputs.sector || "Otros",
      isBuiltIn: false,
      inputs: JSON.parse(JSON.stringify(inputs)),
      createdAt: new Date().toISOString(),
    }
    const updated = [...get().templates, tpl]
    saveUserTemplates(updated)
    set({ templates: updated })
  },
  deleteTemplate: (id) => {
    const updated = get().templates.filter(t => t.id !== id || t.isBuiltIn)
    saveUserTemplates(updated)
    set({ templates: updated })
  },
  getAll: () => get().templates,
  getUserTemplates: () => get().templates.filter(t => !t.isBuiltIn),
}))
