import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { HubNewListing } from "@/components/hub/hub-new-listing"
import { AppFooter } from "@/components/shared/app-footer"

export default function HubNewPage() {
  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      <DashboardNav />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        <HubNewListing />
      </main>
      <AppFooter />
    </div>
  )
}
