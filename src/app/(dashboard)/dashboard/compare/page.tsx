import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { CompareView } from "@/components/compare/compare-view"
import { AppFooter } from "@/components/shared/app-footer"

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      <DashboardNav />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px] mx-auto w-full">
        <CompareView />
      </main>
      <AppFooter />
    </div>
  )
}
