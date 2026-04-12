import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-secondary/50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-foreground text-xl tracking-tight">DeepLBO</span>
        </Link>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">Nueva contraseña</h1>
            <p className="text-muted-foreground text-sm mt-1">Elige una nueva contraseña para tu cuenta</p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
