import { NewAnalysisForm } from "@/components/dashboard/new-analysis-form"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"

export default function NewAnalysisPage() {
  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      <DashboardNav />
      <main className="flex-1 flex items-start justify-center px-4 pt-12 pb-20">
        <NewAnalysisForm />
      </main>
    </div>
  )
}
