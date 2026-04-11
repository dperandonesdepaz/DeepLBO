"use client"

import { useState } from "react"
import Link from "next/link"
import { TrendingUp, Save, Download, ChevronLeft, Check, Loader2, FileText } from "lucide-react"
import { useDCFStore } from "@/store/dcf-store"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function DCFNav() {
  const { analysisName, setAnalysisName, saveStatus, isDirty, isDemo, persistToStorage, analysisId } = useDCFStore()
  const [editingName, setEditingName] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (isDemo) { toast.info("El análisis demo no se puede guardar."); return }
    setSaving(true)
    useDCFStore.getState().setSaveStatus("saving")
    persistToStorage()
    await new Promise(r => setTimeout(r, 500))
    useDCFStore.getState().setSaveStatus("saved")
    useDCFStore.getState().setLastSavedAt(new Date())
    setSaving(false)
    toast.success("DCF guardado")
  }

  const statusLabel = saveStatus === "saving" ? "Guardando..."
    : saveStatus === "saved" && !isDirty ? "Guardado"
    : "Sin guardar"

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border">
      <div className="h-14 px-4 flex items-center gap-2">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0">
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        <div className="w-px h-5 bg-border shrink-0" />

        <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-white" />
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {editingName && !isDemo ? (
            <input
              autoFocus
              className="text-sm font-semibold text-foreground bg-transparent border-b border-emerald-600 outline-none w-full max-w-xs"
              value={analysisName}
              onChange={e => setAnalysisName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={e => e.key === "Enter" && setEditingName(false)}
            />
          ) : (
            <button
              onClick={() => !isDemo && setEditingName(true)}
              className={cn(
                "text-sm font-semibold transition-colors truncate max-w-xs block text-left",
                isDemo ? "text-foreground cursor-default" : "text-foreground hover:text-emerald-600"
              )}
            >
              {analysisName}
              {!isDemo && <span className="ml-1 text-muted-foreground/50 text-xs font-normal">✏️</span>}
            </button>
          )}
          <span className="shrink-0 text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">DCF</span>
          {isDemo && (
            <span className="shrink-0 text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Demo</span>
          )}
        </div>

        <div className={cn("hidden md:flex items-center gap-1.5 text-xs shrink-0", {
          "text-muted-foreground": saveStatus === "saved" && !isDirty,
          "text-amber-500": isDirty || saveStatus === "unsaved",
          "text-green-600": saveStatus === "saving",
        })}>
          {saveStatus === "saving"
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : saveStatus === "saved" && !isDirty
            ? <Check className="w-3 h-3" />
            : <div className="w-2 h-2 rounded-full bg-amber-400" />}
          <span>{statusLabel}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSave}
            disabled={saving || (saveStatus === "saved" && !isDirty)}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-sm font-medium rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Guardar</span>
          </button>
          <button
            onClick={() => toast.info("Export PDF — próximamente")}
            className="inline-flex items-center gap-1.5 h-8 px-3 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>
    </header>
  )
}
