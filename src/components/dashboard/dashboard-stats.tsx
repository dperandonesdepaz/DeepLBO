"use client"

import { useEffect, useState } from "react"
import { BarChart3, TrendingUp, GitMerge, Clock } from "lucide-react"
import { getAllAnalyses } from "@/store/analysis-store"
import { getAllDCFAnalyses } from "@/store/dcf-store"
import { getAllMergerAnalyses } from "@/store/merger-store"

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min  = Math.floor(diff / 60000)
  const hrs  = Math.floor(min / 60)
  const days = Math.floor(hrs / 24)
  if (days > 0) return `hace ${days}d`
  if (hrs  > 0) return `hace ${hrs}h`
  if (min  > 0) return `hace ${min}m`
  return "ahora"
}

export function DashboardStats() {
  const [stats, setStats] = useState({ lbo: 0, dcf: 0, merger: 0, lastAccess: "—" })

  useEffect(() => {
    const lboList    = getAllAnalyses()
    const dcfList    = getAllDCFAnalyses()
    const mergerList = getAllMergerAnalyses()

    const allDates = [
      ...lboList.map(a => a.updatedAt),
      ...dcfList.map(a => a.updatedAt),
      ...mergerList.map(a => a.updatedAt),
    ].sort().reverse()

    setStats({
      lbo:    lboList.length,
      dcf:    dcfList.length,
      merger: mergerList.length,
      lastAccess: allDates[0] ? timeAgo(allDates[0]) : "—",
    })
  }, [])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {[
        { label: "LBO",       value: String(stats.lbo),    icon: BarChart3,  color: "text-primary",     bg: "bg-primary/10" },
        { label: "DCF",       value: String(stats.dcf),    icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100" },
        { label: "Fusiones",  value: String(stats.merger), icon: GitMerge,   color: "text-purple-600",  bg: "bg-purple-100" },
        { label: "Último acceso", value: stats.lastAccess, icon: Clock,      color: "text-slate-500",   bg: "bg-slate-100" },
      ].map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
