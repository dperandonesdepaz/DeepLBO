"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, FileText, BarChart3, Sparkles, Bookmark, Trash2, TrendingUp, GitMerge, Table2 } from "lucide-react"
import { useTemplatesStore, type Template } from "@/store/templates-store"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { AnalysisType } from "@/types/ma"

const SECTORS = [
  "Tecnología", "Software / SaaS", "Servicios Financieros", "Salud / Farma",
  "Industria / Manufactura", "Distribución / Logística", "Retail / Consumo",
  "Alimentación & Bebidas", "Infraestructura", "Real Estate",
  "Media & Entretenimiento", "Energía", "Educación", "Otros",
]

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

const ANALYSIS_TYPES: { id: AnalysisType; label: string; desc: string; color: string; icon: React.ElementType }[] = [
  { id: "lbo",    label: "LBO",          desc: "Leveraged Buyout — compra apalancada, IRR/MOIC, múltiplos de entrada",         color: "bg-primary/10 border-primary/20 hover:border-primary/50",  icon: BarChart3 },
  { id: "dcf",    label: "DCF",          desc: "Discounted Cash Flow — WACC, valor terminal, equity intrínseco",                color: "bg-emerald-50 border-emerald-200 hover:border-emerald-400",  icon: TrendingUp },
  { id: "merger", label: "Fusión / M&A", desc: "Accreción/Dilución — deal structure, sinergias, EPS pro-forma",                 color: "bg-purple-50 border-purple-200 hover:border-purple-400",    icon: GitMerge },
]

export function NewAnalysisForm() {
  const router = useRouter()
  const { templates, init, deleteTemplate } = useTemplatesStore()
  const [analysisType, setAnalysisType] = useState<AnalysisType>("lbo")
  const [name, setName]     = useState("")
  const [sector, setSector] = useState("")
  const [mode, setMode]     = useState<"blank" | "demo" | "template">("blank")
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { init() }, [init])

  const builtIn = templates.filter(t => t.isBuiltIn)
  const userTpls = templates.filter(t => !t.isBuiltIn)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const id = generateId()

    if (analysisType === "dcf") {
      sessionStorage.setItem(`deeplbo_dcf_${id}`, JSON.stringify({
        name: name.trim(), sector, template: mode,
      }))
      await new Promise(r => setTimeout(r, 300))
      router.push(`/dcf/${id}`)
      return
    }

    if (analysisType === "merger") {
      sessionStorage.setItem(`deeplbo_merger_${id}`, JSON.stringify({
        name: name.trim(), template: mode,
      }))
      await new Promise(r => setTimeout(r, 300))
      router.push(`/merger/${id}`)
      return
    }

    // LBO (default)
    sessionStorage.setItem(
      `deeplbo_newname_${id}`,
      JSON.stringify({
        name: name.trim(),
        sector: sector || selectedTemplate?.sector || "",
        template: mode === "template" ? "custom" : mode,
        templateInputs: mode === "template" && selectedTemplate ? selectedTemplate.inputs : undefined,
      })
    )
    await new Promise(r => setTimeout(r, 300))
    router.push(`/dashboard/${id}`)
  }

  const activeType = ANALYSIS_TYPES.find(t => t.id === analysisType)!
  const ActiveIcon = activeType.icon

  return (
    <div className="w-full max-w-2xl">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Volver al dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
            analysisType === "lbo" ? "bg-primary" : analysisType === "dcf" ? "bg-emerald-600" : "bg-purple-600")}>
            <ActiveIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Nuevo análisis</h1>
            <p className="text-sm text-muted-foreground">Elige el tipo de modelo y configura los parámetros</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          {/* Analysis type selector */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">Tipo de análisis</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ANALYSIS_TYPES.map(t => {
                const Icon = t.icon
                const active = analysisType === t.id
                return (
                  <button key={t.id} type="button" onClick={() => { setAnalysisType(t.id); setMode("blank") }}
                    className={cn("p-3.5 rounded-xl border-2 text-left transition-all", active
                      ? t.color.replace("hover:", "")
                      : "border-border hover:border-border/80"
                    )}>
                    <Icon className={cn("w-4 h-4 mb-1.5",
                      active && t.id === "lbo"    ? "text-primary" :
                      active && t.id === "dcf"    ? "text-emerald-700" :
                      active && t.id === "merger" ? "text-purple-700" : "text-muted-foreground"
                    )} />
                    <div className={cn("text-xs font-bold",
                      active && t.id === "lbo"    ? "text-primary" :
                      active && t.id === "dcf"    ? "text-emerald-700" :
                      active && t.id === "merger" ? "text-purple-700" : "text-foreground"
                    )}>{t.label}</div>
                    <div className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{t.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Name + sector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-sm font-semibold text-foreground">Nombre <span className="text-red-500">*</span></label>
              <input
                autoFocus value={name} onChange={e => setName(e.target.value)}
                placeholder={
                  analysisType === "lbo"    ? "Ej. Adquisición TechCo 2025" :
                  analysisType === "dcf"    ? "Ej. Valoración IndustrialCo" :
                                              "Ej. Fusión BigCo + TargetCo"
                }
                className="w-full h-10 px-3 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                required
              />
            </div>
            {analysisType !== "merger" && (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Sector <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                </label>
                <select value={sector} onChange={e => setSector(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all">
                  <option value="">Seleccionar...</option>
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Mode (only for LBO) */}
          {analysisType === "lbo" && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">Punto de partida</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "blank",    icon: FileText,  label: "En blanco",   desc: "Empieza desde cero" },
                  { key: "demo",     icon: Sparkles,  label: "Con ejemplo", desc: "Datos de muestra" },
                  { key: "template", icon: Bookmark,  label: "Plantilla",   desc: "Pre-configurado" },
                ].map(opt => {
                  const Icon = opt.icon
                  const active = mode === opt.key
                  return (
                    <button key={opt.key} type="button" onClick={() => setMode(opt.key as any)}
                      className={cn("p-3 rounded-xl border-2 text-left transition-all", active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
                      <Icon className={cn("w-4 h-4 mb-1.5", active ? "text-primary" : "text-muted-foreground")} />
                      <div className={cn("text-xs font-semibold", active ? "text-primary" : "text-foreground")}>{opt.label}</div>
                      <div className="text-[10px] text-muted-foreground">{opt.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Template picker (LBO only) */}
          {analysisType === "lbo" && mode === "template" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Plantillas predefinidas</p>
              <div className="grid grid-cols-2 gap-2">
                {builtIn.map(t => (
                  <button key={t.id} type="button"
                    onClick={() => { setSelectedTemplate(t); setSector(t.sector) }}
                    className={cn("p-3 rounded-lg border text-left transition-all", selectedTemplate?.id === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                    <div className={cn("text-xs font-semibold", selectedTemplate?.id === t.id ? "text-primary" : "text-foreground")}>{t.name}</div>
                    <div className="text-[10px] text-muted-foreground">{t.description}</div>
                  </button>
                ))}
              </div>
              {userTpls.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Mis plantillas</p>
                  <div className="grid grid-cols-2 gap-2">
                    {userTpls.map(t => (
                      <div key={t.id} className="relative group">
                        <button type="button"
                          onClick={() => { setSelectedTemplate(t); setSector(t.sector) }}
                          className={cn("w-full p-3 rounded-lg border text-left transition-all", selectedTemplate?.id === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                          <div className={cn("text-xs font-semibold pr-5", selectedTemplate?.id === t.id ? "text-primary" : "text-foreground")}>{t.name}</div>
                          <div className="text-[10px] text-muted-foreground">{t.description || t.sector}</div>
                        </button>
                        <button type="button"
                          onClick={() => { deleteTemplate(t.id); if (selectedTemplate?.id === t.id) setSelectedTemplate(null); toast.success("Plantilla eliminada") }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all">
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {!selectedTemplate && <p className="text-xs text-amber-600">Selecciona una plantilla para continuar</p>}
            </div>
          )}

          <button type="submit"
            disabled={!name.trim() || loading || (analysisType === "lbo" && mode === "template" && !selectedTemplate)}
            className={cn(
              "w-full h-10 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
              analysisType === "lbo"    ? "bg-primary hover:bg-primary/90" :
              analysisType === "dcf"    ? "bg-emerald-600 hover:bg-emerald-700" :
                                          "bg-purple-600 hover:bg-purple-700"
            )}>
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creando...</>
            ) : `Crear ${activeType.label}`}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        ¿Solo explorar?{" "}
        <Link href="/dashboard/demo" className="text-primary font-medium hover:underline">Ver LBO demo</Link>
      </p>
    </div>
  )
}
