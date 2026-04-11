import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { HubListingDetail } from "@/components/hub/hub-listing-detail"
import { AppFooter } from "@/components/shared/app-footer"

export default async function HubListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      <DashboardNav />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <HubListingDetail listingId={id} />
      </main>
      <AppFooter />
    </div>
  )
}
