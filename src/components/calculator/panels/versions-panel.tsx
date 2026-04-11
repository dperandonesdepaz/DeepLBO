"use client"

import { useEffect, useState } from "react"
import { History, X, RotateCcw, Tag, ChevronDown } from "lucide-react"
import { useVersionsStore } from "@/store/versions-store"
import { useAnalysisStore } from "@/store/analysis-store"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { computeLBO } from "@/lib/lbo-engine"
import { fmt } from "@/lib/lbo-engine"

export function VersionsPanel({ onClose }: { onClose: () => void }) {
  const { analysisId, inputs, loadAnalysis, analysisName } = useAnalysisStore()
  const { versions, init, saveVersion, deleteVersion, getByAnalysis } = useVersionsStore()
  const [noteInput, setNoteInput] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { init() }, [init])

  const analysisVersions = analysisId ? getByAnalysis(analysisId) : []

  function handleSaveVersion() {
    if (!analysisId) return
    saveVersion(analysisId, inputs, noteInput)
    setNoteInput("")
    toast.success("Versión guardada")
  }

  function handleRestore(versionId: string) {
    const v = analysisVersions.find(x => x.id === versionId)
    if (!v || !analysisId) return
    loadAnalysis(analysisId, analysisName, v.inputs)
    toast.success(`Restaurado a ${v.label}`)
  }

  return (
    <div className="fixed right-0 top-14 bottom-0 z-30 w-72 bg-white border-l border-border flex flex-col shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Historial</span>
          <span className="text-xs bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full">
            {analysisVersions.length}
          </span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Save current */}
      <div className="px-3 py-3 border-b border-border shrink-0 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Guardar versión actual
        </p>
        <div className="flex gap-2">
          <input
            value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            placeholder="Nota opcional..."
            className="flex-1 h-8 px-2 text-xs border border-border rounded-lg outline-none focus:border-primary"
          />
          <button
            onClick={handleSaveVersion}
            className="h-8 px-3 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Tag className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Versions list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {analysisVersions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <History className="w-8 h-8 text-primary/20 mb-2" />
            <p className="text-xs text-muted-foreground">Sin versiones guardadas</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">Guarda una para poder restaurarla</p>
          </div>
        ) : (
          analysisVersions.map(v => {
            let irr = 0, moic = 0
            try {
              const r = computeLBO(v.inputs)
              irr  = r.scenarios[1]?.irr  ?? 0
              moic = r.scenarios[1]?.moic ?? 0
            } catch {}
            const isExpanded = expanded === v.id
            return (
              <div key={v.id} className="bg-secondary/50 rounded-lg border border-border overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : v.id)}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground">{v.label}</div>
                    {v.note && <div className="text-[10px] text-muted-foreground truncate">{v.note}</div>}
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0 ml-2", isExpanded && "rotate-180")} />
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { l: "Revenue", v: fmt.eur(v.inputs.revenue) },
                        { l: "EBITDA",  v: fmt.eur(v.inputs.ebitda) },
                        { l: "IRR",     v: irr > 0 ? fmt.pct(irr) : "—" },
                        { l: "MOIC",    v: moic > 0 ? fmt.mult(moic) : "—" },
                      ].map(item => (
                        <div key={item.l}>
                          <div className="text-[9px] text-muted-foreground">{item.l}</div>
                          <div className="text-xs font-semibold text-foreground">{item.v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore(v.id)}
                        className="flex-1 h-7 flex items-center justify-center gap-1 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" /> Restaurar
                      </button>
                      <button
                        onClick={() => { deleteVersion(v.id); toast.success("Versión eliminada") }}
                        className="h-7 px-2 flex items-center text-xs text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
