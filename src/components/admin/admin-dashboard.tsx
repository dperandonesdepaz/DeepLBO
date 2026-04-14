"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BarChart3, Users, TrendingUp, Database, Shield, ChevronRight,
  Download, GitMerge, Crown, Globe, Building2, Lock, Eye, MessageSquare,
} from "lucide-react"
import { getAllAnalyses, type SavedAnalysis } from "@/store/analysis-store"
import { getAllDCFAnalyses, type SavedDCF } from "@/store/dcf-store"
import { getAllMergerAnalyses, type SavedMerger } from "@/store/merger-store"
import { useWorkspaceStore } from "@/store/workspace-store"
import { getAllListings, seedDemoListings, type HubListing } from "@/store/hub-store"
import { computeLBO } from "@/lib/lbo-engine"
import { computeDCF } from "@/lib/dcf-engine"
import { computeMerger } from "@/lib/merger-engine"
import { fmt, irrColor, moicColor } from "@/lib/lbo-engine"
import { fmtDCF } from "@/lib/dcf-engine"
import { fmtMerger } from "@/lib/merger-engine"
import { cn } from "@/lib/utils"

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

function Avatar({ name }: { name: string }) {
  const letter = name?.charAt(0).toUpperCase() ?? "?"
  const colors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-red-500"]
  const color = colors[letter.charCodeAt(0) % colors.length]
  return (
    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", color)}>
      {letter}
    </div>
  )
}

type TabId = "overview" | "lbo" | "dcf" | "merger" | "team" | "hub"

const TYPE_LABELS: Record<string, string> = {
  sale: "Venta", investment: "Capital", merger: "Fusión", partnership: "Partnership",
}
const SECTOR_LABELS: Record<string, string> = {
  technology: "Tech", industrial: "Industrial", healthcare: "Healthcare",
  consumer: "Consumer", financial: "Financiero", real_estate: "Real Estate",
  energy: "Energía", media: "Media", logistics: "Logística", education: "Educación", other: "Otro",
}

export function AdminDashboard() {
  const [lboList,    setLboList]    = useState<SavedAnalysis[]>([])
  const [dcfList,    setDcfList]    = useState<SavedDCF[]>([])
  const [mergerList, setMergerList] = useState<SavedMerger[]>([])
  const [hubListings, setHubListings] = useState<HubListing[]>([])
  const [tab, setTab] = useState<TabId>("overview")
  const { workspace, profile, init } = useWorkspaceStore()

  useEffect(() => {
    async function load() {
      const [lbo, dcf, merger] = await Promise.all([
        getAllAnalyses(), getAllDCFAnalyses(), getAllMergerAnalyses(),
      ])
      setLboList(lbo)
      setDcfList(dcf)
      setMergerList(merger)
      seedDemoListings()
      setHubListings(getAllListings())
    }
    load()
    init()
  }, [init])

  const totalAnalyses = lboList.length + dcfList.length + mergerList.length
  const totalEV = lboList.reduce((s, a) => {
    try { return s + computeLBO(a.inputs).ev } catch { return s }
  }, 0)
  const avgIRR = lboList.length > 0
    ? lboList.reduce((s, a) => { try { return s + (computeLBO(a.inputs).scenarios[1]?.irr ?? 0) } catch { return s } }, 0) / lboList.length
    : 0

  function exportAllData() {
    const data = JSON.stringify({
      workspace: workspace?.name ?? "individual",
      exportedAt: new Date().toISOString(),
      lbo: lboList, dcf: dcfList, merger: mergerList,
      members: workspace?.members ?? [],
    }, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `deeplbo_export_${new Date().toISOString().slice(0, 10)}.json`
    a.click(); URL.revokeObjectURL(url)
  }

  const TABS: { id: TabId; label: string; count?: number; icon: React.ElementType; color?: string }[] = [
    { id: "overview", label: "Overview",  icon: Shield },
    { id: "lbo",      label: "LBO",       count: lboList.length,    icon: BarChart3 },
    { id: "dcf",      label: "DCF",       count: dcfList.length,    icon: TrendingUp,  color: "text-emerald-700" },
    { id: "merger",   label: "Fusiones",  count: mergerList.length, icon: GitMerge,    color: "text-purple-700" },
    { id: "hub",      label: "Hub",       count: hubListings.length, icon: Globe,      color: "text-indigo-700" },
    { id: "team",     label: "Equipo",    count: workspace?.members.length, icon: Users },
  ]

  return (
    <div className="min-h-screen bg-secondary/40">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">Admin</span>
            {workspace && (
              <span className="text-xs text-muted-foreground font-medium">— {workspace.name}</span>
            )}
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">LOCAL</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportAllData}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-border rounded-lg hover:bg-secondary transition-colors">
              <Download className="w-3.5 h-3.5" /> Exportar JSON
            </button>
            <Link href="/dashboard" className="text-sm text-primary hover:underline">← Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {workspace ? `Workspace: ${workspace.name}` : "Cuenta individual"} · Datos locales
            </p>
          </div>
          {profile && (
            <div className="flex items-center gap-2">
              <Avatar name={profile.name} />
              <div className="text-right">
                <p className="text-xs font-semibold text-foreground">{profile.name}</p>
                <p className="text-[10px] text-muted-foreground">{profile.role === "admin" ? "Admin" : "Miembro"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Análisis totales", value: String(totalAnalyses), icon: BarChart3, color: "text-primary" },
            { label: "EV Total (LBO)",   value: fmt.eur(totalEV),      icon: Database,  color: "text-green-600" },
            { label: "IRR Medio (LBO)",  value: fmt.pct(avgIRR),       icon: TrendingUp,color: "text-amber-600" },
            { label: "Miembros equipo",  value: String(workspace?.members.length ?? 1), icon: Users, color: "text-violet-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg w-fit overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  tab === t.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>
                <Icon className={cn("w-3.5 h-3.5", t.color)} />
                {t.label}
                {t.count !== undefined && (
                  <span className="text-[10px] bg-border text-foreground/70 px-1.5 py-0.5 rounded-full font-semibold">
                    {t.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Overview ── */}
        {tab === "overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "LBO",     count: lboList.length,    href: "#",   color: "border-primary/30 bg-primary/5",    icon: BarChart3,  icolor: "text-primary" },
                { label: "DCF",     count: dcfList.length,    href: "#",   color: "border-emerald-200 bg-emerald-50",  icon: TrendingUp, icolor: "text-emerald-700" },
                { label: "Fusiones",count: mergerList.length, href: "#",   color: "border-purple-200 bg-purple-50",    icon: GitMerge,   icolor: "text-purple-700" },
              ].map(item => {
                const Icon = item.icon
                return (
                  <div key={item.label} className={cn("rounded-xl border-2 p-5 text-center cursor-pointer hover:shadow-sm transition-all", item.color)}
                    onClick={() => setTab(item.label === "LBO" ? "lbo" : item.label === "DCF" ? "dcf" : "merger")}>
                    <Icon className={cn("w-6 h-6 mx-auto mb-2", item.icolor)} />
                    <p className="text-3xl font-black text-foreground">{item.count}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Actividad reciente</h3>
              </div>
              <div className="divide-y divide-border">
                {[
                  ...lboList.map(a => ({ type: "LBO" as const, name: a.name, updatedAt: a.updatedAt, href: `/dashboard/${a.id}` })),
                  ...dcfList.map(a => ({ type: "DCF" as const, name: a.name, updatedAt: a.updatedAt, href: `/dcf/${a.id}` })),
                  ...mergerList.map(a => ({ type: "Fusión" as const, name: a.name, updatedAt: a.updatedAt, href: `/merger/${a.id}` })),
                ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 8)
                  .map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/20 transition-colors">
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0",
                        item.type === "LBO" ? "bg-primary/10 text-primary" :
                        item.type === "DCF" ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"
                      )}>{item.type}</span>
                      <span className="text-sm text-foreground flex-1 truncate">{item.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{timeAgo(item.updatedAt)}</span>
                      <Link href={item.href} className="shrink-0">
                        <ChevronRight className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </Link>
                    </div>
                  ))}
                {totalAnalyses === 0 && (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    No hay análisis todavía
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── LBO Table ── */}
        {tab === "lbo" && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> LBO
              </h2>
              <span className="text-xs text-muted-foreground">{lboList.length} análisis</span>
            </div>
            {lboList.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Sin análisis LBO</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-secondary/40 border-b border-border">
                    <tr>
                      {["Nombre", "Empresa", "Sector", "EV", "IRR Base", "MOIC", "Actualizado", ""].map(h => (
                        <th key={h} className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lboList.map(a => {
                      let irr = 0, moic = 0, ev = 0
                      try { const r = computeLBO(a.inputs); irr = r.scenarios[1]?.irr ?? 0; moic = r.scenarios[1]?.moic ?? 0; ev = r.ev } catch {}
                      return (
                        <tr key={a.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium text-foreground">{a.name}</td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">{a.inputs.companyName || "—"}</td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">{a.inputs.sector || "—"}</td>
                          <td className="py-3 px-4 text-xs font-semibold">{ev > 0 ? fmt.eur(ev) : "—"}</td>
                          <td className="py-3 px-4">
                            {irr > 0 ? <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", irrColor(irr))}>{fmt.pct(irr)}</span> : "—"}
                          </td>
                          <td className="py-3 px-4">
                            {moic > 0 ? <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", moicColor(moic))}>{fmt.mult(moic)}</span> : "—"}
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">{timeAgo(a.updatedAt)}</td>
                          <td className="py-3 px-4">
                            <Link href={`/dashboard/${a.id}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                              Ver <ChevronRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── DCF Table ── */}
        {tab === "dcf" && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> DCF
              </h2>
              <span className="text-xs text-muted-foreground">{dcfList.length} análisis</span>
            </div>
            {dcfList.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Sin análisis DCF</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-secondary/40 border-b border-border">
                    <tr>
                      {["Nombre", "Empresa", "Sector", "EV", "Equity Value", "WACC", "Actualizado", ""].map(h => (
                        <th key={h} className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dcfList.map(a => {
                      const r = (() => { try { return computeDCF(a.inputs) } catch { return null } })()
                      return (
                        <tr key={a.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium text-foreground">{a.name}</td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">{a.inputs.companyName || "—"}</td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">{a.inputs.sector || "—"}</td>
                          <td className="py-3 px-4 text-xs font-semibold text-emerald-700">{r ? fmtDCF.eur(r.enterpriseValue) : "—"}</td>
                          <td className="py-3 px-4 text-xs font-semibold">{r ? fmtDCF.eur(r.equityValue) : "—"}</td>
                          <td className="py-3 px-4 text-xs">{r ? fmtDCF.pct(r.wacc) : "—"}</td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">{timeAgo(a.updatedAt)}</td>
                          <td className="py-3 px-4">
                            <Link href={`/dcf/${a.id}`} className="text-xs text-emerald-700 hover:underline flex items-center gap-1">
                              Ver <ChevronRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Merger Table ── */}
        {tab === "merger" && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-purple-600" /> Fusiones
              </h2>
              <span className="text-xs text-muted-foreground">{mergerList.length} análisis</span>
            </div>
            {mergerList.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Sin análisis de fusiones</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-secondary/40 border-b border-border">
                    <tr>
                      {["Nombre", "Adquirente", "Target", "EV pagado", "A/D (full)", "Actualizado", ""].map(h => (
                        <th key={h} className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mergerList.map(a => {
                      const r = (() => { try { return computeMerger(a.inputs) } catch { return null } })()
                      return (
                        <tr key={a.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium text-foreground">{a.name}</td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">{a.inputs.acquirerName || "—"}</td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">{a.inputs.targetName || "—"}</td>
                          <td className="py-3 px-4 text-xs font-semibold">{fmtMerger.eur(a.inputs.purchaseEV)}</td>
                          <td className="py-3 px-4">
                            {r ? (
                              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                                r.fullSynergy.isAccretive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                {r.fullSynergy.isAccretive ? "+" : ""}{(r.fullSynergy.adPct * 100).toFixed(1)}%
                              </span>
                            ) : "—"}
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">{timeAgo(a.updatedAt)}</td>
                          <td className="py-3 px-4">
                            <Link href={`/merger/${a.id}`} className="text-xs text-purple-700 hover:underline flex items-center gap-1">
                              Ver <ChevronRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Team Tab ── */}
        {tab === "team" && (
          <div className="space-y-5">
            {!workspace ? (
              <div className="bg-white rounded-xl border border-dashed border-border p-12 text-center">
                <Users className="w-10 h-10 text-primary/30 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Sin workspace de equipo</h3>
                <p className="text-sm text-muted-foreground mb-4">Crea un workspace para gestionar tu equipo de analistas.</p>
                <Link href="/workspace"
                  className="inline-flex items-center gap-2 h-9 px-5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                  <Users className="w-4 h-4" /> Crear workspace
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Equipo — {workspace.name}</h3>
                  <Link href="/workspace" className="text-xs text-primary hover:underline">Gestionar →</Link>
                </div>
                <div className="divide-y divide-border">
                  {workspace.members.map(m => {
                    // Count analyses per member (in local mode, all analyses belong to same user)
                    // With Supabase, filter by member.id
                    const isCurrentUser = m.email === profile?.email
                    const analysisCount = isCurrentUser ? totalAnalyses : 0
                    return (
                      <div key={m.id} className="flex items-center gap-4 px-5 py-4">
                        <div className="relative">
                          <Avatar name={m.name} />
                          {m.id === workspace.ownerId && (
                            <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{m.name}</p>
                            {isCurrentUser && <span className="text-[10px] text-muted-foreground">(tú)</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-foreground">{analysisCount}</p>
                          <p className="text-[10px] text-muted-foreground">análisis</p>
                        </div>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0",
                          m.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground")}>
                          {m.role === "admin" ? "Admin" : "Miembro"}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Hub Tab ── */}
        {tab === "hub" && (
          <div className="space-y-5">
            {/* Hub stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Publicaciones activas", value: String(hubListings.filter(l => l.status === "active").length) },
                { label: "Bajo LOI",               value: String(hubListings.filter(l => l.status === "under_loi").length) },
                { label: "Intereses totales",       value: String(hubListings.reduce((s, l) => s + (l.interests?.length ?? 0), 0)) },
                { label: "Vistas totales",          value: String(hubListings.reduce((s, l) => s + (l.views ?? 0), 0)) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className="text-2xl font-bold text-indigo-600">{value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" /> Deal Hub — Oportunidades
                </h2>
                <Link href="/hub" className="text-xs text-indigo-600 hover:underline">Ver Hub público →</Link>
              </div>
              {hubListings.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">Sin publicaciones en el Hub</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-secondary/40 border-b border-border">
                      <tr>
                        {["Título", "Tipo", "Sector", "Revenue", "EBITDA", "Identidad", "Vistas", "Intereses", "Estado", ""].map(h => (
                          <th key={h} className="py-2.5 px-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {hubListings.map(l => (
                        <tr key={l.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-3 px-3 text-sm font-medium text-foreground max-w-[200px] truncate">{l.title}</td>
                          <td className="py-3 px-3 text-xs text-muted-foreground">{TYPE_LABELS[l.type] ?? l.type}</td>
                          <td className="py-3 px-3 text-xs text-muted-foreground">{SECTOR_LABELS[l.sector] ?? l.sector}</td>
                          <td className="py-3 px-3 text-xs font-semibold">€{l.revenueM.toFixed(1)}M</td>
                          <td className="py-3 px-3 text-xs font-semibold text-emerald-700">€{l.ebitdaM.toFixed(1)}M</td>
                          <td className="py-3 px-3">
                            {l.anonymous
                              ? <span className="flex items-center gap-1 text-xs text-muted-foreground"><Lock className="w-3 h-3" /> Anónimo</span>
                              : <span className="flex items-center gap-1 text-xs"><Eye className="w-3 h-3 text-green-600" /> {l.ownerName ?? l.ownerFirm ?? "—"}</span>
                            }
                          </td>
                          <td className="py-3 px-3 text-xs text-muted-foreground">{l.views ?? 0}</td>
                          <td className="py-3 px-3 text-xs font-semibold">{l.interests?.length ?? 0}</td>
                          <td className="py-3 px-3">
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                              l.status === "active" ? "bg-green-100 text-green-700" :
                              l.status === "under_loi" ? "bg-amber-100 text-amber-700" :
                              "bg-secondary text-muted-foreground"
                            )}>
                              {l.status === "active" ? "Activo" : l.status === "under_loi" ? "Bajo LOI" : "Cerrado"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <Link href={`/hub/${l.id}`} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                              Ver <ChevronRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Local mode notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <Database className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Modo local (sin base de datos)</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Todos los datos están en localStorage. Con Supabase conectado, el admin verá
              análisis reales de todos los miembros del workspace, separados por usuario.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
