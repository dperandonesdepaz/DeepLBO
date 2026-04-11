import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { SettingsForm } from "@/components/dashboard/settings-form"
import { AppFooter } from "@/components/shared/app-footer"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      <DashboardNav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Gestiona tu perfil y preferencias de cuenta</p>
        </div>
        <SettingsForm />
      </main>
      <AppFooter />
    </div>
  )
}
