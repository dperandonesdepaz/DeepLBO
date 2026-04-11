"use client"

import { useMergerStore } from "@/store/merger-store"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Building2, Target, GitBranch, BarChart3, Users } from "lucide-react"

const SECTIONS = [
  { id: "overview",   label: "Resumen Deal",     icon: LayoutDashboard },
  { id: "acquirer",   label: "Adquirente",        icon: Building2 },
  { id: "target",     label: "Target",            icon: Target },
  { id: "structure",  label: "Estructura Deal",   icon: GitBranch },
  { id: "synergies",  label: "Sinergias",         icon: Users },
  { id: "results",    label: "Resultados A/D",    icon: BarChart3 },
]

export function MergerSidebar() {
  const { activeSection, setActiveSection } = useMergerStore()
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
                ? "bg-purple-50 text-purple-700 font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className={cn("w-4 h-4 shrink-0", active ? "text-purple-600" : "")} />
            {s.label}
          </button>
        )
      })}
    </nav>
  )
}
