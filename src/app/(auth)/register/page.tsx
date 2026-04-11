import { Suspense } from "react"
import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-secondary/50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-foreground text-xl tracking-tight">DeepLBO</span>
        </Link>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">Crear cuenta gratis</h1>
            <p className="text-muted-foreground text-sm mt-1">Empieza tu primer análisis M&A en minutos</p>
          </div>
          <Suspense fallback={<div className="h-40 animate-pulse bg-secondary rounded-xl" />}>
            <RegisterForm />
          </Suspense>
          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4 px-4">
          Al registrarte aceptas nuestros{" "}
          <Link href="#" className="hover:underline">Términos de uso</Link>
          {" "}y{" "}
          <Link href="#" className="hover:underline">Política de privacidad</Link>
        </p>
      </div>
    </div>
  )
}
