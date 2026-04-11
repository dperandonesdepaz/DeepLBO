"use client"

import { useEffect } from "react"
import { useMergerStore } from "@/store/merger-store"
import { MergerNav } from "./merger-nav"
import { MergerSidebar } from "./merger-sidebar"
import { SectionMergerOverview } from "./sections/section-merger-overview"
import { SectionMergerAcquirer } from "./sections/section-merger-acquirer"
import { SectionMergerTarget } from "./sections/section-merger-target"
import { SectionMergerStructure } from "./sections/section-merger-structure"
import { SectionMergerSynergies } from "./sections/section-merger-synergies"
import { SectionMergerResults } from "./sections/section-merger-results"

interface Props { analysisId: string }

const SECTIONS: Record<string, React.ComponentType> = {
  overview:  SectionMergerOverview,
  acquirer:  SectionMergerAcquirer,
  target:    SectionMergerTarget,
  structure: SectionMergerStructure,
  synergies: SectionMergerSynergies,
  results:   SectionMergerResults,
}

export function MergerLayout({ analysisId }: Props) {
  const { activeSection, loadDemo, loadBlank, loadFromStorage, persistToStorage, isDirty } = useMergerStore()

  useEffect(() => {
    if (analysisId === "merger-demo") { loadDemo(); return }
    const found = loadFromStorage(analysisId)
    if (found) return

    const meta = typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem(`deeplbo_merger_${analysisId}`) ?? "null")
      : null

    const name = meta?.name ?? "Nueva Fusión"
    if (meta?.template === "demo") {
      useMergerStore.getState().loadDemo()
    } else {
      loadBlank(analysisId, name)
    }
  }, [analysisId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isDirty) return
    const timer = setTimeout(() => { persistToStorage() }, 1500)
    return () => clearTimeout(timer)
  }, [isDirty, persistToStorage])

  const ActiveSection = SECTIONS[activeSection] ?? SectionMergerOverview

  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      <MergerNav />
      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-14 pt-4 pb-24 px-3">
            <MergerSidebar />
          </div>
        </aside>
        <main className="flex-1 min-w-0 px-4 lg:px-6 pt-6 pb-28">
          <ActiveSection />
        </main>
      </div>
    </div>
  )
}
