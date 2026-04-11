import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { HubBrowse } from "@/components/hub/hub-browse"
import { AppFooter } from "@/components/shared/app-footer"

export default function HubPage() {
  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      <DashboardNav />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <HubBrowse />
      </main>
      <AppFooter />
    </div>
  )
}
