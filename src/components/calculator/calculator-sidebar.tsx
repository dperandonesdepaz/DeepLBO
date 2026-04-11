"use client"

import { useAnalysisStore } from "@/store/analysis-store"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  BarChart2,
  Landmark,
  Trophy,
  Grid3x3,
  Table2,
  ClipboardList,
  Star,
} from "lucide-react"

const SECTIONS = [
  { id: "overview",    label: "Resumen",          icon: LayoutDashboard, desc: "KPIs clave" },
  { id: "company",     label: "Empresa",           icon: Building2,       desc: "Perfil & financieros" },
  { id: "entry",       label: "Entrada",           icon: TrendingUp,      desc: "Valoración & estructura" },
  { id: "pl",          label: "P&L y FCF",         icon: BarChart2,       desc: "Proyecciones 5 años" },
  { id: "debt",        label: "Deuda",             icon: Landmark,        desc: "Schedule de amortización" },
  { id: "returns",     label: "Retornos",          icon: Trophy,          desc: "IRR / MOIC / Value bridge" },
  { id: "sensitivity", label: "Sensibilidad",      icon: Grid3x3,         desc: "Tablas de escenarios" },
  { id: "comps",       label: "Comps & FF",        icon: Table2,          desc: "Comparables + Football Field" },
  { id: "scoring",     label: "Deal Scoring",      icon: Star,            desc: "Evaluación 10 criterios" },
  { id: "dd",          label: "Due Diligence",     icon: ClipboardList,   desc: "Checklist 9 categorías" },
]

export function CalculatorSidebar() {
  const { activeSection, setActiveSection } = useAnalysisStore()

  return (
    <nav className="space-y-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 pb-2 pt-1">
        Secciones
      </p>
      {SECTIONS.map((s) => {
        const Icon = s.icon
        const active = activeSection === s.id
        return (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group",
              active
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:bg-white hover:text-foreground hover:shadow-sm"
            )}
          >
            <Icon className={cn("w-4 h-4 shrink-0", active ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
            <div className="min-w-0">
              <div className={cn("text-xs font-medium leading-tight", active ? "text-white" : "text-foreground")}>
                {s.label}
              </div>
              <div className={cn("text-[10px] leading-tight truncate", active ? "text-white/70" : "text-muted-foreground/60")}>
                {s.desc}
              </div>
            </div>
          </button>
        )
      })}
    </nav>
  )
}
