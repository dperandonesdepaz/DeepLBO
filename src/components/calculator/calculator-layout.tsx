"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useAnalysisStore } from "@/store/analysis-store"
import { DEFAULT_LBO_INPUTS } from "@/types/lbo"
import { computeLBO } from "@/lib/lbo-engine"
import { CalculatorSidebar } from "./calculator-sidebar"
import { CalculatorNav } from "./calculator-nav"
import { CalculatorBottomBar } from "./calculator-bottom-bar"
import { SectionOverview } from "./sections/section-overview"
import { SectionCompany } from "./sections/section-company"
import { SectionEntry } from "./sections/section-entry"
import { SectionPL } from "./sections/section-pl"
import { SectionDebt } from "./sections/section-debt"
import { SectionReturns } from "./sections/section-returns"
import { SectionSensitivity } from "./sections/section-sensitivity"
import { SectionComps } from "./sections/section-comps"
import { SectionDD } from "./sections/section-dd"
import { SectionScoring } from "./sections/section-scoring"

interface Props { analysisId: string }

const SECTIONS: Record<string, React.ComponentType> = {
  overview:    SectionOverview,
  company:     SectionCompany,
  entry:       SectionEntry,
  pl:          SectionPL,
  debt:        SectionDebt,
  returns:     SectionReturns,
  sensitivity: SectionSensitivity,
  comps:       SectionComps,
  dd:          SectionDD,
  scoring:     SectionScoring,
}

export function CalculatorLayout({ analysisId }: Props) {
  const { activeSection, setActiveSection, loadDemo, loadBlank, loadFromStorage, loadAnalysis, persistToStorage, isDirty, isDemo } = useAnalysisStore()

  // Handle jump to section from dashboard quick-links
  useEffect(() => {
    const jumpSection = typeof window !== "undefined" ? sessionStorage.getItem("deeplbo_jump_section") : null
    if (jumpSection) {
      sessionStorage.removeItem("deeplbo_jump_section")
      setTimeout(() => setActiveSection(jumpSection), 100)
    }
  }, [setActiveSection])

  useEffect(() => {
    async function init() {
      if (analysisId === "demo") { loadDemo(); return }

      const found = await loadFromStorage(analysisId)
      if (found) return

      const meta = typeof window !== "undefined"
        ? JSON.parse(sessionStorage.getItem(`deeplbo_newname_${analysisId}`) ?? "null") : null

      const name   = meta?.name    ?? "Nuevo análisis"
      const sector = meta?.sector  ?? ""
      const tmpl   = meta?.template ?? "blank"

      if (tmpl === "demo") {
        const demoInputs = { ...DEFAULT_LBO_INPUTS, companyName: name, sector: sector || "Software / SaaS" }
        loadAnalysis(analysisId, name, demoInputs)
      } else if (tmpl === "custom" && meta?.templateInputs) {
        const tplInputs = { ...meta.templateInputs, companyName: name, sector: sector || meta.templateInputs.sector }
        loadAnalysis(analysisId, name, tplInputs)
      } else {
        loadBlank(analysisId, name)
      }
    }
    init()
  }, [analysisId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save to localStorage 1.5s after any change
  useEffect(() => {
    if (!isDirty) return
    const timer = setTimeout(() => {
      persistToStorage()
    }, 1500)
    return () => clearTimeout(timer)
  }, [isDirty, persistToStorage])

  const ActiveSection = SECTIONS[activeSection] ?? SectionOverview

  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      {/* Demo conversion banner */}
      {isDemo && (
        <div className="bg-primary text-white text-sm py-2.5 px-4 flex items-center justify-center gap-3 sticky top-0 z-50">
          <span className="text-white/80 hidden sm:inline">👁 Estás en modo demo — solo lectura</span>
          <span className="font-medium">Crea tu cuenta gratis para trabajar con tus propios análisis</span>
          <Link
            href="/register"
            className="ml-1 bg-white text-primary text-xs font-bold px-3 py-1 rounded-full hover:bg-blue-50 transition-colors shrink-0"
          >
            Registrarse →
          </Link>
        </div>
      )}

      <CalculatorNav />

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-14 pt-4 pb-24 px-3">
            <CalculatorSidebar />
          </div>
        </aside>

        {/* Main content — read-only overlay in demo mode */}
        <div className="relative flex-1 min-w-0">
          {isDemo && (
            <div
              className="absolute inset-0 z-10 cursor-default"
              onClick={() => {
                const el = document.getElementById("demo-cta-toast")
                if (el) { el.classList.remove("opacity-0", "pointer-events-none"); setTimeout(() => el.classList.add("opacity-0", "pointer-events-none"), 3000) }
              }}
            />
          )}
          <main className="px-4 lg:px-6 pt-6 pb-28">
            <ActiveSection />
          </main>
        </div>
      </div>

      {/* Demo click toast */}
      {isDemo && (
        <div
          id="demo-cta-toast"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 opacity-0 pointer-events-none transition-opacity duration-300 bg-foreground text-white text-sm px-5 py-3 rounded-xl shadow-2xl flex items-center gap-4"
        >
          <span>Modo demo — los datos no se pueden editar</span>
          <Link href="/register" className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors pointer-events-auto">
            Crear cuenta
          </Link>
        </div>
      )}

      <CalculatorBottomBar />
    </div>
  )
}
