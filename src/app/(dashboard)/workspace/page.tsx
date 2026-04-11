import { WorkspaceSettings } from "@/components/workspace/workspace-settings"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { AppFooter } from "@/components/shared/app-footer"

export default function WorkspacePage() {
  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      <DashboardNav />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        <WorkspaceSettings />
      </main>
      <AppFooter />
    </div>
  )
}
