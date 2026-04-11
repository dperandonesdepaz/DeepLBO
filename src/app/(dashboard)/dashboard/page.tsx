import Link from "next/link"
import { Plus } from "lucide-react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { AnalysisList } from "@/components/dashboard/analysis-list"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { AppFooter } from "@/components/shared/app-footer"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      <DashboardNav />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mis análisis</h1>
            <p className="text-muted-foreground text-sm mt-0.5">LBO · DCF · Fusiones M&A — todos tus modelos en un lugar</p>
          </div>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Nuevo análisis
          </Link>
        </div>
        <DashboardStats />
        <AnalysisList />
      </main>
      <AppFooter />
    </div>
  )
}
