import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ToolsHub } from "@/components/tools/tools-hub"
import { AppFooter } from "@/components/shared/app-footer"

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      <DashboardNav />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <ToolsHub />
      </main>
      <AppFooter />
    </div>
  )
}
