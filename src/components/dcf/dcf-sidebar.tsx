"use client"

import { useDCFStore } from "@/store/dcf-store"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Building2, BarChart2, TrendingUp, Grid3X3, Calculator } from "lucide-react"

const SECTIONS = [
  { id: "overview",     label: "Resumen DCF",        icon: LayoutDashboard },
  { id: "company",      label: "Empresa",             icon: Building2 },
  { id: "projections",  label: "Proyecciones FCF",    icon: BarChart2 },
  { id: "wacc",         label: "WACC",                icon: Calculator },
  { id: "terminal",     label: "Valor Terminal",      icon: TrendingUp },
  { id: "sensitivity",  label: "Sensibilidad",        icon: Grid3X3 },
]

export function DCFSidebar() {
  const { activeSection, setActiveSection } = useDCFStore()

  return (
    <nav className="space-y-0.5">
      {SECTIONS.map(s => {
        const Icon = s.icon
        const active = activeSection === s.id
        return (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
              active
                ? "bg-emerald-50 text-emerald-700 font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className={cn("w-4 h-4 shrink-0", active ? "text-emerald-600" : "")} />
            {s.label}
          </button>
        )
      })}
    </nav>
  )
}
