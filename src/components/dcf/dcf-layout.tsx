"use client"

import { useEffect } from "react"
import { useDCFStore } from "@/store/dcf-store"
import { DCFNav } from "./dcf-nav"
import { DCFSidebar } from "./dcf-sidebar"
import { SectionDCFOverview } from "./sections/section-dcf-overview"
import { SectionDCFCompany } from "./sections/section-dcf-company"
import { SectionDCFProjections } from "./sections/section-dcf-projections"
import { SectionDCFWacc } from "./sections/section-dcf-wacc"
import { SectionDCFTerminal } from "./sections/section-dcf-terminal"
import { SectionDCFSensitivity } from "./sections/section-dcf-sensitivity"
import { DEFAULT_DCF_INPUTS } from "@/types/ma"

interface Props { analysisId: string }

const SECTIONS: Record<string, React.ComponentType> = {
  overview:    SectionDCFOverview,
  company:     SectionDCFCompany,
  projections: SectionDCFProjections,
  wacc:        SectionDCFWacc,
  terminal:    SectionDCFTerminal,
  sensitivity: SectionDCFSensitivity,
}

export function DCFLayout({ analysisId }: Props) {
  const { activeSection, loadDemo, loadBlank, loadFromStorage, loadAnalysis, persistToStorage, isDirty } = useDCFStore()

  useEffect(() => {
    async function init() {
      if (analysisId === "demo") { loadDemo(); return }
      const found = await loadFromStorage(analysisId)
      if (found) return
      const meta = typeof window !== "undefined"
        ? JSON.parse(sessionStorage.getItem(`deeplbo_dcf_${analysisId}`) ?? "null") : null
      const name   = meta?.name   ?? "Nuevo DCF"
      const sector = meta?.sector ?? ""
      if (meta?.template === "demo") {
        loadAnalysis(analysisId, name, { ...DEFAULT_DCF_INPUTS, companyName: name, sector })
      } else {
        loadBlank(analysisId, name)
      }
    }
    init()
  }, [analysisId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isDirty) return
    const timer = setTimeout(() => { persistToStorage() }, 1500)
    return () => clearTimeout(timer)
  }, [isDirty, persistToStorage])

  const ActiveSection = SECTIONS[activeSection] ?? SectionDCFOverview

  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      <DCFNav />
      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-14 pt-4 pb-24 px-3">
            <DCFSidebar />
          </div>
        </aside>
        <main className="flex-1 min-w-0 px-4 lg:px-6 pt-6 pb-28">
          <ActiveSection />
        </main>
      </div>
    </div>
  )
}
