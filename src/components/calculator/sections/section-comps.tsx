"use client"

import { useState, useEffect } from "react"
import { CompsTable } from "@/components/shared/comps-table"
import { FootballField } from "@/components/shared/football-field"
import { useAnalysisStore } from "@/store/analysis-store"
import type { CompsInputs, ValuationRange } from "@/types/ma"
import { DEFAULT_COMPS_INPUTS } from "@/types/ma"

const LS_COMPS_KEY = "deeplbo_comps_"
const LS_FF_KEY    = "deeplbo_ff_"

export function SectionComps() {
  const { analysisId, inputs: lboInputs, results: lboResults } = useAnalysisStore()

  const [compsInputs, setCompsInputs] = useState<CompsInputs>(() => {
    if (typeof window === "undefined") return { ...DEFAULT_COMPS_INPUTS }
    const saved = localStorage.getItem(LS_COMPS_KEY + analysisId)
    return saved ? JSON.parse(saved) : {
      ...DEFAULT_COMPS_INPUTS,
      targetName: lboInputs.companyName || "",
      sector: lboInputs.sector || "",
      targetRevenue: lboInputs.revenue,
      targetEBITDA: lboInputs.ebitda,
      targetEBIT: lboInputs.ebitda - lboInputs.da,
      targetNetIncome: 0,
      targetNetDebt: lboInputs.netDebt,
    }
  })

  const [footballRanges, setFootballRanges] = useState<ValuationRange[]>(() => {
    if (typeof window === "undefined") return []
    const saved = localStorage.getItem(LS_FF_KEY + analysisId)
    if (saved) return JSON.parse(saved)
    // Pre-fill with LBO result if available
    if (lboResults) {
      const base = lboResults.scenarios[1]
      return [{
        method: "LBO (Base case)",
        description: "Leveraged Buyout Base",
        low: lboResults.scenarios[0].evAtExit,
        high: lboResults.scenarios[2].evAtExit,
        midpoint: base.evAtExit,
        color: "#3B82F6",
      }]
    }
    return []
  })

  useEffect(() => {
    if (!analysisId) return
    localStorage.setItem(LS_COMPS_KEY + analysisId, JSON.stringify(compsInputs))
  }, [compsInputs, analysisId])

  useEffect(() => {
    if (!analysisId) return
    localStorage.setItem(LS_FF_KEY + analysisId, JSON.stringify(footballRanges))
  }, [footballRanges, analysisId])

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-bold text-foreground">Comparables & Football Field</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Análisis de empresas comparables cotizadas e integración en un rango de valoración completo
        </p>
      </div>

      <CompsTable inputs={compsInputs} onChange={setCompsInputs} />

      <FootballField ranges={footballRanges} onChange={setFootballRanges} />
    </div>
  )
}
