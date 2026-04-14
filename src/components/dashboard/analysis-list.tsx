"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, BarChart3, TrendingUp, Sparkles, Trash2, Clock, GitMerge, ClipboardList, Star } from "lucide-react"
import { getAllAnalyses, deleteAnalysisFromLS, type SavedAnalysis } from "@/store/analysis-store"
import { getAllDCFAnalyses, deleteDCFFromLS, type SavedDCF } from "@/store/dcf-store"
import { getAllMergerAnalyses, deleteMergerFromLS, type SavedMerger } from "@/store/merger-store"
import { computeLBO } from "@/lib/lbo-engine"
import { computeDCF } from "@/lib/dcf-engine"
import { computeMerger } from "@/lib/merger-engine"
import { DEFAULT_LBO_INPUTS } from "@/types/lbo"
import { fmt, irrColor, moicColor } from "@/lib/lbo-engine"
import { fmtDCF } from "@/lib/dcf-engine"
import { fmtMerger } from "@/lib/merger-engine"
import { cn } from "@/lib/utils"

const DEMO_INPUTS = { ...DEFAULT_LBO_INPUTS, companyName: "TechCo España S.L.", sector: "Software / SaaS" }
const DEMO_RESULTS = computeLBO(DEMO_INPUTS)
const DEMO_BASE = DEMO_RESULTS.scenarios.find(s => s.scenario === "Base")!

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  const hrs = Math.floor(min / 60)
  const days = Math.floor(hrs / 24)
  if (days > 0) return `hace ${days}d`
  if (hrs  > 0) return `hace ${hrs}h`
  if (min  > 0) return `hace ${min}m`
  return "ahora"
}

// ── LBO Card ──────────────────────────────────────────────────────────────────
function LBOCard({ a, onDelete }: { a: SavedAnalysis; onDelete: () => void }) {
  const metrics = (() => {
    try {
      const r = computeLBO(a.inputs)
      const base = r.scenarios.find(s => s.scenario === "Base")
      return { irr: base?.irr ?? 0, moic: base?.moic ?? 0 }
    } catch { return { irr: 0, moic: 0 } }
  })()

  return (
    <div className="relative group bg-white rounded-xl border border-border p-5 hover:border-primary/40 hover:shadow-sm transition-all">
      <button
        onClick={e => { e.preventDefault(); onDelete() }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center"
      >
        <Trash2 className="w-3.5 h-3.5 text-red-500" />
      </button>
      <Link href={`/dashboard/${a.id}`} className="block">
        <div className="flex items-start gap-2 mb-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-auto">LBO</span>
        </div>
        <h3 className="font-semibold text-foreground text-sm mb-0.5 group-hover:text-primary transition-colors pr-8">
          {a.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">{a.inputs.sector || "Sin sector"}</p>
        <div className="flex items-center gap-3 pt-3 border-t border-border">
          <span className={cn("text-xs font-bold", irrColor(metrics.irr).split(" ")[0])}>
            {fmt.pct(metrics.irr)} IRR
          </span>
          <span className={cn("text-xs font-bold", moicColor(metrics.moic).split(" ")[0])}>
            {fmt.mult(metrics.moic)}
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Clock className="w-3 h-3" /> {timeAgo(a.updatedAt)}
          </span>
        </div>
      </Link>
      {/* Quick jump to DD / Scoring */}
      <div className="flex gap-1.5 mt-2 pt-2 border-t border-border/40">
        <Link
          href={`/dashboard/${a.id}`}
          onClick={() => { if (typeof window !== "undefined") sessionStorage.setItem("deeplbo_jump_section", "dd") }}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors px-1.5 py-1 rounded hover:bg-primary/5"
        >
          <ClipboardList className="w-3 h-3" /> DD
        </Link>
        <Link
          href={`/dashboard/${a.id}`}
          onClick={() => { if (typeof window !== "undefined") sessionStorage.setItem("deeplbo_jump_section", "scoring") }}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors px-1.5 py-1 rounded hover:bg-primary/5"
        >
          <Star className="w-3 h-3" /> Scoring
        </Link>
      </div>
    </div>
  )
}

// ── DCF Card ──────────────────────────────────────────────────────────────────
function DCFCard({ a, onDelete }: { a: SavedDCF; onDelete: () => void }) {
  const r = (() => { try { return computeDCF(a.inputs) } catch { return null } })()

  return (
    <div className="relative group bg-white rounded-xl border border-border p-5 hover:border-emerald-400/60 hover:shadow-sm transition-all">
      <button
        onClick={e => { e.preventDefault(); onDelete() }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center"
      >
        <Trash2 className="w-3.5 h-3.5 text-red-500" />
      </button>
      <Link href={`/dcf/${a.id}`} className="block">
        <div className="flex items-start gap-2 mb-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full ml-auto">DCF</span>
        </div>
        <h3 className="font-semibold text-foreground text-sm mb-0.5 group-hover:text-emerald-700 transition-colors pr-8">
          {a.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">{a.inputs.sector || "Sin sector"}</p>
        <div className="flex items-center gap-3 pt-3 border-t border-border">
          {r ? (
            <>
              <span className="text-xs font-bold text-emerald-700">{fmtDCF.eur(r.enterpriseValue)}</span>
              <span className="text-xs text-muted-foreground">EV · WACC {fmtDCF.pct(r.wacc)}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Sin datos</span>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Clock className="w-3 h-3" /> {timeAgo(a.updatedAt)}
          </span>
        </div>
      </Link>
    </div>
  )
}

// ── Merger Card ───────────────────────────────────────────────────────────────
function MergerCard({ a, onDelete }: { a: SavedMerger; onDelete: () => void }) {
  const r = (() => { try { return computeMerger(a.inputs) } catch { return null } })()

  return (
    <div className="relative group bg-white rounded-xl border border-border p-5 hover:border-purple-400/60 hover:shadow-sm transition-all">
      <button
        onClick={e => { e.preventDefault(); onDelete() }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center"
      >
        <Trash2 className="w-3.5 h-3.5 text-red-500" />
      </button>
      <Link href={`/merger/${a.id}`} className="block">
        <div className="flex items-start gap-2 mb-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
            <GitMerge className="w-4 h-4 text-purple-700" />
          </div>
          <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full ml-auto">Fusión</span>
        </div>
        <h3 className="font-semibold text-foreground text-sm mb-0.5 group-hover:text-purple-700 transition-colors pr-8">
          {a.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          {a.inputs.acquirerName || "—"} + {a.inputs.targetName || "—"}
        </p>
        <div className="flex items-center gap-3 pt-3 border-t border-border">
          {r ? (
            <span className={cn("text-xs font-bold", r.fullSynergy.isAccretive ? "text-emerald-600" : "text-red-500")}>
              {r.fullSynergy.isAccretive ? "Acretivo" : "Dilutivo"} {(r.fullSynergy.adPct * 100).toFixed(1)}%
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Sin datos</span>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Clock className="w-3 h-3" /> {timeAgo(a.updatedAt)}
          </span>
        </div>
      </Link>
    </div>
  )
}

// ── Main list ─────────────────────────────────────────────────────────────────
export function AnalysisList() {
  const [lboList, setLboList]       = useState<SavedAnalysis[]>([])
  const [dcfList, setDcfList]       = useState<SavedDCF[]>([])
  const [mergerList, setMergerList] = useState<SavedMerger[]>([])

  async function refresh() {
    const [lbo, dcf, merger] = await Promise.all([getAllAnalyses(), getAllDCFAnalyses(), getAllMergerAnalyses()])
    setLboList(lbo)
    setDcfList(dcf)
    setMergerList(merger)
  }

  useEffect(() => { refresh() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const hasAny = lboList.length > 0 || dcfList.length > 0 || mergerList.length > 0

  return (
    <div className="space-y-8">
      {/* Demo card */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Ejemplo</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative group bg-white rounded-xl border border-border p-5 hover:border-primary/40 hover:shadow-sm transition-all">
            <span className="absolute top-3 right-3 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Demo</span>
            <Link href="/dashboard/demo" className="block">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-0.5 group-hover:text-primary transition-colors pr-8">
                TechCo España S.L.
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Software / SaaS</p>
              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <span className={cn("text-xs font-bold", irrColor(DEMO_BASE.irr).split(" ")[0])}>
                  {fmt.pct(DEMO_BASE.irr)} IRR
                </span>
                <span className={cn("text-xs font-bold", moicColor(DEMO_BASE.moic).split(" ")[0])}>
                  {fmt.mult(DEMO_BASE.moic)}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* User analyses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Mis análisis ({lboList.length + dcfList.length + mergerList.length})
          </span>
          {hasAny && (
            <Link href="/dashboard/new"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
              <Plus className="w-3.5 h-3.5" /> Nuevo
            </Link>
          )}
        </div>

        {hasAny ? (
          <div className="space-y-6">
            {lboList.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">LBO</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lboList.map(a => (
                    <LBOCard key={a.id} a={a} onDelete={() => { deleteAnalysisFromLS(a.id).then(() => refresh()) }} />
                  ))}
                </div>
              </div>
            )}
            {dcfList.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">DCF</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dcfList.map(a => (
                    <DCFCard key={a.id} a={a} onDelete={() => { deleteDCFFromLS(a.id).then(() => refresh()) }} />
                  ))}
                </div>
              </div>
            )}
            {mergerList.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">FUSIONES</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mergerList.map(a => (
                    <MergerCard key={a.id} a={a} onDelete={() => { deleteMergerFromLS(a.id).then(() => refresh()) }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-border border-dashed p-12 text-center">
      <div className="w-12 h-12 bg-primary/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <BarChart3 className="w-6 h-6 text-primary/60" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">Sin análisis propios todavía</h3>
      <p className="text-muted-foreground text-sm mb-5 max-w-xs mx-auto">
        Crea tu primer análisis: LBO, DCF o Fusión M&A. Empieza desde cero o usa el ejemplo.
      </p>
      <Link
        href="/dashboard/new"
        className="inline-flex items-center gap-2 h-9 px-5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" /> Crear primer análisis
      </Link>
    </div>
  )
}
