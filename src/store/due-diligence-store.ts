"use client"

import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { dbGetDD, dbSaveDD } from "@/lib/db"

// ─── Types ────────────────────────────────────────────────────────────────────
export type DDStatus = "pending" | "in_progress" | "complete" | "flagged" | "na"
export type DDPriority = "high" | "medium" | "low"
export type DDCategory =
  | "financial" | "legal" | "tax" | "commercial"
  | "operational" | "it" | "hr" | "esg" | "management"

export interface DDItem {
  id: string
  category: DDCategory
  label: string
  description?: string
  status: DDStatus
  priority: DDPriority
  notes: string
  responsible?: string
  dueDate?: string
  updatedAt: string
}

export interface DDChecklist {
  analysisId: string
  analysisName: string
  items: DDItem[]
  createdAt: string
  updatedAt: string
}

// ─── Default template items ───────────────────────────────────────────────────
export const DD_TEMPLATE: Omit<DDItem, "id" | "status" | "notes" | "updatedAt">[] = [
  // FINANCIAL
  { category: "financial", label: "Auditorías de los últimos 3 años", priority: "high", description: "Cuentas anuales auditadas (3 ejercicios)" },
  { category: "financial", label: "Proyecciones financieras (management case)", priority: "high", description: "Plan de negocio 5 años con hipótesis" },
  { category: "financial", label: "Análisis de calidad del EBITDA (QofE)", priority: "high", description: "Ajustes no recurrentes, normalización EBITDA" },
  { category: "financial", label: "Working capital normalizado (NWC)", priority: "high", description: "Estacionalidad, ciclo de caja, NWC peg" },
  { category: "financial", label: "Deuda neta verificada", priority: "high", description: "Deuda financiera, leasing IFRS 16, contingentes" },
  { category: "financial", label: "Capex histórico y recurrente", priority: "medium", description: "Mantenimiento vs crecimiento" },
  { category: "financial", label: "Cuentas por cobrar aging schedule", priority: "medium", description: "Cartera vencida, provisiones" },
  { category: "financial", label: "Revenue bridge por cliente/segmento", priority: "medium", description: "Concentración de clientes, churn" },
  { category: "financial", label: "Cash conversion cycle", priority: "medium", description: "DSO / DPO / DIO últimos 3 años" },

  // LEGAL
  { category: "legal", label: "Estatutos sociales y pacto de socios", priority: "high", description: "Derechos de arrastre, acompañamiento, anti-dilución" },
  { category: "legal", label: "Contratos de clientes y proveedores clave", priority: "high", description: "Change of control, rescisión, exclusividades" },
  { category: "legal", label: "Litigios y contingencias", priority: "high", description: "Reclamaciones pendientes y estimación de exposición" },
  { category: "legal", label: "Propiedad intelectual (PI / marcas / patentes)", priority: "high", description: "Titularidad, caducidades, infringement claims" },
  { category: "legal", label: "Permisos, licencias y concesiones", priority: "medium", description: "Caducidad y transferibilidad" },
  { category: "legal", label: "Inmuebles: títulos de propiedad y arrendamientos", priority: "medium", description: "Sale & leaseback, opciones de compra" },

  // TAX
  { category: "tax", label: "Declaraciones fiscales últimos 4 años", priority: "high", description: "IS, IVA, declaraciones informativas" },
  { category: "tax", label: "Inspecciones y actas fiscales pendientes", priority: "high", description: "Contingencias fiscales cuantificadas" },
  { category: "tax", label: "Estructuras de precios de transferencia", priority: "medium", description: "Operaciones vinculadas y documentación" },
  { category: "tax", label: "Créditos fiscales y bases imponibles negativas", priority: "medium", description: "BINs y deducciones no aplicadas" },
  { category: "tax", label: "Impuesto diferido (activo/pasivo)", priority: "medium", description: "Diferencias temporarias significativas" },

  // COMMERCIAL
  { category: "commercial", label: "Análisis competitivo del mercado", priority: "high", description: "Cuota de mercado, posicionamiento, moat" },
  { category: "commercial", label: "Top 10 clientes: contratos y retención", priority: "high", description: "Duración contratos, NPS, churn histórico" },
  { category: "commercial", label: "Estrategia de pricing y poder de fijación", priority: "high", description: "Elasticidad, histórico de subidas de precio" },
  { category: "commercial", label: "Pipeline de ventas y tasa de conversión", priority: "medium", description: "CRM data, win rate, sales cycle" },
  { category: "commercial", label: "Tendencias de mercado y TAM/SAM", priority: "medium", description: "Crecimiento sector, tailwinds/headwinds" },

  // OPERATIONAL
  { category: "operational", label: "Cadena de suministro y proveedores clave", priority: "high", description: "Concentración, sustitutibilidad, riesgo geopolítico" },
  { category: "operational", label: "Capacidad de producción y utilización", priority: "medium", description: "Bottlenecks, expansión capex requerido" },
  { category: "operational", label: "KPIs operativos históricos", priority: "medium", description: "OEE, scrap, lead times, NPS interno" },
  { category: "operational", label: "Certificaciones de calidad (ISO, etc.)", priority: "low", description: "Caducidades, procesos de renovación" },

  // IT
  { category: "it", label: "Infraestructura tecnológica y arquitectura", priority: "medium", description: "On-premise vs cloud, deuda técnica" },
  { category: "it", label: "Ciberseguridad e incidentes históricos", priority: "high", description: "Vulnerabilidades, seguros cyber, GDPR compliance" },
  { category: "it", label: "Sistemas ERP/CRM: licencias y contratos", priority: "medium", description: "Dependencia de sistemas propietarios" },
  { category: "it", label: "Roadmap tecnológico y presupuesto IT", priority: "low", description: "Inversión prevista vs necesaria" },

  // HR
  { category: "hr", label: "Plantilla total y estructura organizativa", priority: "high", description: "Headcount, organigrama, costes laborales" },
  { category: "hr", label: "Contratos del equipo directivo (key persons)", priority: "high", description: "Blindajes, pactos de no competencia, retención" },
  { category: "hr", label: "Convenio colectivo y relaciones laborales", priority: "medium", description: "Sindicatos, litigios laborales, ERTE histórico" },
  { category: "hr", label: "Planes de incentivos y variable (MIP/SOP)", priority: "medium", description: "Equity, phantom shares, estructuras de carry" },
  { category: "hr", label: "Rotación, absentismo y clima laboral", priority: "medium", description: "Turnover histórico, Glassdoor, encuestas internas" },

  // ESG
  { category: "esg", label: "Huella de carbono y compromisos net-zero", priority: "medium", description: "Alcance 1/2/3, objetivos SBTi" },
  { category: "esg", label: "Gobierno corporativo (board composition)", priority: "medium", description: "Independientes, comités, conflictos de interés" },
  { category: "esg", label: "Riesgos medioambientales y permisos", priority: "high", description: "Pasivos medioambientales, licencias regulatorias" },
  { category: "esg", label: "Política de compliance y código ético", priority: "low", description: "Canal denuncias, formación, incumplimientos" },

  // MANAGEMENT
  { category: "management", label: "Track record del equipo directivo", priority: "high", description: "CV, resultados vs plan, referencias" },
  { category: "management", label: "Motivación del vendedor y retención post-deal", priority: "high", description: "Earn-out, reinversión, alignment" },
  { category: "management", label: "Sucesión y bench strength", priority: "medium", description: "Riesgo de dependencia de personas clave" },
]

function makeItem(template: typeof DD_TEMPLATE[number], idx: number): DDItem {
  return {
    id: `dd_${idx}_${Date.now()}`,
    ...template,
    status: "pending",
    notes: "",
    updatedAt: new Date().toISOString(),
  }
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_KEY = "deeplbo_dd_checklists"

function loadAll(): Record<string, DDChecklist> {
  if (typeof window === "undefined") return {}
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") ?? {} }
  catch { return {} }
}

function saveAll(data: Record<string, DDChecklist>) {
  localStorage.setItem(LS_KEY, JSON.stringify(data))
}

export function getDDChecklist(analysisId: string): DDChecklist | null {
  return loadAll()[analysisId] ?? null
}

export function createDDChecklist(analysisId: string, analysisName: string): DDChecklist {
  const items = DD_TEMPLATE.map((t, i) => makeItem(t, i))
  const checklist: DDChecklist = {
    analysisId, analysisName, items,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const all = loadAll()
  all[analysisId] = checklist
  saveAll(all)
  return checklist
}

export function saveDDChecklist(checklist: DDChecklist) {
  const all = loadAll()
  all[checklist.analysisId] = { ...checklist, updatedAt: new Date().toISOString() }
  saveAll(all)
}

// ─── Store ────────────────────────────────────────────────────────────────────
interface DDState {
  checklist: DDChecklist | null
  filterCategory: DDCategory | "all"
  filterStatus: DDStatus | "all"

  loadChecklist: (analysisId: string, analysisName: string) => void
  updateItem: (itemId: string, updates: Partial<DDItem>) => void
  resetItem: (itemId: string) => void
  setFilter: (category: DDCategory | "all", status: DDStatus | "all") => void
}

export const useDDStore = create<DDState>()(
  subscribeWithSelector((set, get) => ({
    checklist: null,
    filterCategory: "all",
    filterStatus: "all",

    loadChecklist(analysisId, analysisName) {
      const existing = getDDChecklist(analysisId)
      const checklist = existing ?? createDDChecklist(analysisId, analysisName)
      set({ checklist })
      // Also try to load from Supabase
      dbGetDD(analysisId).then(remote => {
        if (!remote) return
        const remoteChecklist: DDChecklist = {
          analysisId, analysisName: remote.analysis_name ?? analysisName,
          items: remote.items as DDItem[],
          createdAt: remote.created_at, updatedAt: remote.updated_at,
        }
        saveDDChecklist(remoteChecklist)
        set({ checklist: remoteChecklist })
      }).catch(() => {})
    },

    updateItem(itemId, updates) {
      const { checklist } = get()
      if (!checklist) return
      const items = checklist.items.map(item =>
        item.id === itemId ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
      const updated = { ...checklist, items, updatedAt: new Date().toISOString() }
      set({ checklist: updated })
      saveDDChecklist(updated)
      dbSaveDD(updated.analysisId, updated.analysisName, updated.items).catch(() => {})
    },

    resetItem(itemId) {
      get().updateItem(itemId, { status: "pending", notes: "", responsible: undefined })
    },

    setFilter(filterCategory, filterStatus) {
      set({ filterCategory, filterStatus })
    },
  }))
)
