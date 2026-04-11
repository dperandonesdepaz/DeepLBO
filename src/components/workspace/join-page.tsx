"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Users, BarChart3, Check, AlertCircle } from "lucide-react"
import { useWorkspaceStore, setPendingInvite } from "@/store/workspace-store"

interface Props { inviteCode: string }

export function JoinPage({ inviteCode }: Props) {
  const router = useRouter()
  const { workspace, profile, init, joinWorkspace } = useWorkspaceStore()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => { init() }, [init])

  // If already logged in with profile, try to join directly
  const isLoggedIn = !!profile

  // Validate invite code against stored workspace
  const isValidCode = workspace?.inviteCode === inviteCode
  const workspaceName = workspace?.name ?? "Workspace desconocido"

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) { setError("Nombre y email obligatorios"); return }
    setLoading(true)

    if (isLoggedIn) {
      // Join directly
      const ok = joinWorkspace(inviteCode, profile!.name, profile!.email)
      if (!ok) { setError("Código de invitación inválido"); setLoading(false); return }
      router.push("/dashboard")
      return
    }

    // Not logged in — save invite pending and go to register
    if (isValidCode) {
      setPendingInvite(inviteCode, workspaceName)
    }
    await new Promise(r => setTimeout(r, 300))
    router.push(`/register?invite=${inviteCode}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="min-h-screen bg-secondary/40 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">DeepLBO</span>
        </div>

        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          {/* Workspace info */}
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Invitación al equipo</p>
              <p className="text-base font-bold text-foreground">{isValidCode ? workspaceName : "Workspace"}</p>
            </div>
            {isValidCode && <Check className="w-5 h-5 text-green-600 ml-auto" />}
          </div>

          {!isValidCode && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700">
                Este enlace de invitación no coincide con ningún workspace activo en este dispositivo.
                Si el admin te envió el enlace, primero el admin debe crear el workspace desde su cuenta.
              </p>
            </div>
          )}

          <h1 className="text-xl font-bold text-foreground mb-1">Únete al equipo</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {isValidCode
              ? `Estás a punto de unirte a ${workspaceName} en DeepLBO.`
              : "Regístrate en DeepLBO para acceder a la plataforma M&A."}
          </p>

          {isLoggedIn ? (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/40 rounded-xl">
                <p className="text-sm text-muted-foreground">Sesión activa como</p>
                <p className="text-sm font-semibold text-foreground">{profile!.name} · {profile!.email}</p>
              </div>
              <button
                onClick={handleJoin}
                disabled={loading || !isValidCode}
                className="w-full h-10 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                Unirme a {workspaceName}
              </button>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">Nombre completo</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full h-10 px-3 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" required />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  className="w-full h-10 px-3 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" required />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button type="submit"
                disabled={loading}
                className="w-full h-10 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                Continuar con el registro
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Ya tienes cuenta?{" "}
                <Link href="/login" className="text-primary hover:underline">Inicia sesión</Link>
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          ¿Sin invitación?{" "}
          <Link href="/register" className="text-primary hover:underline">Regístrate gratis</Link>
        </p>
      </div>
    </div>
  )
}
