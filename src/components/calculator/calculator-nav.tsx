"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BarChart3, Save, Download, ChevronLeft, Check, Loader2,
  FileText, Sheet, Presentation, MessageSquare, History,
  Sparkles, GitBranch, Bookmark
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useAnalysisStore } from "@/store/analysis-store"
import { useCommentsStore } from "@/store/comments-store"
import { useVersionsStore } from "@/store/versions-store"
import { usePipelineStore, STAGE_CONFIG } from "@/store/pipeline-store"
import { useTemplatesStore } from "@/store/templates-store"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { exportLBOExcel, exportLBOPdf } from "@/lib/export-lbo"
import { CommentsPanel } from "./panels/comments-panel"
import { VersionsPanel } from "./panels/versions-panel"
import { AIPanel } from "./panels/ai-panel"

export function CalculatorNav() {
  const { analysisName, setAnalysisName, saveStatus, isDirty, isDemo, persistToStorage, inputs, results, analysisId } = useAnalysisStore()
  const { getUnresolvedCount, init: initComments } = useCommentsStore()
  const { saveVersion, init: initVersions } = useVersionsStore()
  const { addToPipeline, getEntry } = usePipelineStore()
  const { saveAsTemplate } = useTemplatesStore()

  const [editingName, setEditingName] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exportingPptx, setExportingPptx] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingXlsx, setExportingXlsx] = useState(false)
  const [panel, setPanel] = useState<"comments" | "versions" | "ai" | null>(null)

  const unresolvedComments = analysisId ? getUnresolvedCount(analysisId) : 0
  const pipelineEntry = analysisId ? getEntry(analysisId) : null

  async function handleExportPptx() {
    if (!results) { toast.error("Introduce datos financieros antes de exportar"); return }
    setExportingPptx(true)
    try {
      const res = await fetch("/api/export/pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, analysisName }),
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement("a")
      a.href = url
      a.download = `DeepLBO_${analysisName.replace(/[^a-zA-Z0-9]/g, "_")}.pptx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("PowerPoint descargado")
    } catch {
      toast.error("Error generando el PowerPoint")
    } finally {
      setExportingPptx(false)
    }
  }

  async function handleSave() {
    if (isDemo) { toast.info("El análisis demo no se puede guardar. Créa uno nuevo."); return }
    setSaving(true)
    useAnalysisStore.getState().setSaveStatus("saving")
    persistToStorage()
    if (analysisId) saveVersion(analysisId, inputs)
    await new Promise(r => setTimeout(r, 500))
    useAnalysisStore.getState().setSaveStatus("saved")
    useAnalysisStore.getState().setLastSavedAt(new Date())
    setSaving(false)
    toast.success("Análisis guardado y versión creada")
  }

  function togglePanel(p: "comments" | "versions" | "ai") {
    setPanel(panel === p ? null : p)
    if (p === "comments") initComments()
    if (p === "versions") initVersions()
  }

  function handleAddToPipeline() {
    if (!analysisId || isDemo) return
    addToPipeline(analysisId, "prospecting", results?.ev)
    toast.success("Añadido al pipeline")
  }

  const statusLabel = saveStatus === "saving" ? "Guardando..."
    : saveStatus === "saved" && !isDirty ? "Guardado"
    : saveStatus === "error" ? "Error al guardar"
    : "Sin guardar"

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="h-14 px-4 flex items-center gap-2">
          {/* Back */}
          {isDemo ? (
            <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          )}

          <div className="w-px h-5 bg-border shrink-0" />

          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center shrink-0">
            <BarChart3 className="w-3.5 h-3.5 text-white" />
          </div>

          {/* Editable name */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {editingName && !isDemo ? (
              <input
                autoFocus
                className="text-sm font-semibold text-foreground bg-transparent border-b border-primary outline-none w-full max-w-xs"
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
                  isDemo ? "text-foreground cursor-default" : "text-foreground hover:text-primary"
                )}
              >
                {analysisName}
                {!isDemo && <span className="ml-1 text-muted-foreground/50 text-xs font-normal">✏️</span>}
              </button>
            )}
            {isDemo && (
              <span className="shrink-0 text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Demo</span>
            )}
            {pipelineEntry && (
              <span className={cn("shrink-0 hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full", STAGE_CONFIG[pipelineEntry.stage].bg, STAGE_CONFIG[pipelineEntry.stage].color)}>
                {STAGE_CONFIG[pipelineEntry.stage].label}
              </span>
            )}
          </div>

          {/* Save status */}
          <div className={cn("hidden md:flex items-center gap-1.5 text-xs shrink-0", {
            "text-muted-foreground": saveStatus === "saved" && !isDirty,
            "text-amber-500": isDirty || saveStatus === "unsaved",
            "text-green-600": saveStatus === "saving",
            "text-destructive": saveStatus === "error",
          })}>
            {saveStatus === "saving"
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : saveStatus === "saved" && !isDirty
              ? <Check className="w-3 h-3" />
              : <div className="w-2 h-2 rounded-full bg-amber-400" />}
            <span>{statusLabel}</span>
          </div>

          {/* Panel toggles — hidden in demo */}
          {!isDemo && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => togglePanel("ai")}
                title="Asistente IA"
                className={cn("relative p-1.5 rounded-lg transition-colors", panel === "ai" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => togglePanel("comments")}
                title="Comentarios"
                className={cn("relative p-1.5 rounded-lg transition-colors", panel === "comments" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}
              >
                <MessageSquare className="w-4 h-4" />
                {unresolvedComments > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unresolvedComments}
                  </span>
                )}
              </button>
              <button
                onClick={() => togglePanel("versions")}
                title="Historial de versiones"
                className={cn("relative p-1.5 rounded-lg transition-colors", panel === "versions" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}
              >
                <History className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="w-px h-5 bg-border shrink-0" />

          {/* Actions — demo shows register CTA instead */}
          <div className="flex items-center gap-2 shrink-0">
            {isDemo ? (
              <>
                <Link href="/login" className="h-8 px-3 text-xs font-medium text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors flex items-center">
                  Iniciar sesión
                </Link>
                <Link href="/register" className="h-8 px-4 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                  Crear cuenta gratis
                </Link>
              </>
            ) : (
            <>
            <Button size="sm" variant="outline" onClick={handleSave}
              disabled={saving || (saveStatus === "saved" && !isDirty)}
              className="gap-1.5 h-8">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Guardar</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors outline-none">
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isDemo ? "Exportar demo" : "Exportar"}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={handleExportPptx} disabled={exportingPptx}>
                  {exportingPptx ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Presentation className="w-3.5 h-3.5 mr-2" />}
                  {exportingPptx ? "Generando..." : "Descargar PowerPoint"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={exportingPdf}
                  onClick={async () => {
                    if (!results) { toast.error("Introduce datos financieros antes de exportar"); return }
                    setExportingPdf(true)
                    try {
                      await exportLBOPdf(inputs, results, analysisName)
                      toast.success("PDF descargado")
                    } catch (e) {
                      console.error(e)
                      toast.error("Error generando el PDF")
                    } finally {
                      setExportingPdf(false)
                    }
                  }}
                >
                  {exportingPdf ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <FileText className="w-3.5 h-3.5 mr-2" />}
                  {exportingPdf ? "Generando PDF..." : "Descargar PDF"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={exportingXlsx}
                  onClick={async () => {
                    if (!results) { toast.error("Introduce datos financieros antes de exportar"); return }
                    setExportingXlsx(true)
                    try {
                      await exportLBOExcel(inputs, results, analysisName)
                      toast.success("Excel descargado")
                    } catch (e) {
                      console.error(e)
                      toast.error("Error generando el Excel")
                    } finally {
                      setExportingXlsx(false)
                    }
                  }}
                >
                  {exportingXlsx ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Sheet className="w-3.5 h-3.5 mr-2" />}
                  {exportingXlsx ? "Generando Excel..." : "Descargar Excel"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {!isDemo && (
                  <DropdownMenuItem onClick={() => {
                    saveAsTemplate(analysisName, inputs.sector || "Otros", inputs)
                    toast.success("Guardado como plantilla")
                  }}>
                    <Bookmark className="w-3.5 h-3.5 mr-2" /> Guardar como plantilla
                  </DropdownMenuItem>
                )}
                {!pipelineEntry && !isDemo && (
                  <DropdownMenuItem onClick={handleAddToPipeline}>
                    <GitBranch className="w-3.5 h-3.5 mr-2" /> Añadir al pipeline
                  </DropdownMenuItem>
                )}
                {pipelineEntry && (
                  <DropdownMenuItem>
                    <Link href="/dashboard/pipeline" className="flex items-center gap-2 w-full">
                      <GitBranch className="w-3.5 h-3.5" /> Ver en pipeline
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            </>
            )}
          </div>
        </div>
      </header>

      {/* Side panels */}
      {panel === "comments" && <CommentsPanel onClose={() => setPanel(null)} />}
      {panel === "versions" && <VersionsPanel onClose={() => setPanel(null)} />}
      {panel === "ai"       && <AIPanel       onClose={() => setPanel(null)} />}
    </>
  )
}
