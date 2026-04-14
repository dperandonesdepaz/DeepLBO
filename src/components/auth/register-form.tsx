"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2, Users, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWorkspaceStore } from "@/store/workspace-store"
import { registerAccount } from "@/store/auth-store"
import { dbUpdateProfile } from "@/lib/db"
import { cn } from "@/lib/utils"

const ROLES = [
  { value: "analyst",  label: "Analista financiero" },
  { value: "investor", label: "Inversor / PE" },
  { value: "founder",  label: "Fundador / Empresario" },
  { value: "student",  label: "Estudiante / MBA" },
  { value: "other",    label: "Otro" },
]

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { workspace, init, setProfileFromInvite } = useWorkspaceStore()
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    fullName: "", email: "", company: "", role: "analyst", password: "",
  })

  const inviteCode  = searchParams?.get("invite") ?? null
  const inviteName  = searchParams?.get("name") ?? ""
  const inviteEmail = searchParams?.get("email") ?? ""

  useEffect(() => {
    init()
    if (inviteName)  setForm(p => ({ ...p, fullName: decodeURIComponent(inviteName) }))
    if (inviteEmail) setForm(p => ({ ...p, email:    decodeURIComponent(inviteEmail) }))
  }, [init, inviteName, inviteEmail])

  const isInvite = !!inviteCode
  const inviteWorkspaceName = isInvite && workspace?.inviteCode === inviteCode ? workspace.name : null

  function set(key: string, value: string) {
    setForm(p => ({ ...p, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!form.fullName || !form.email || !form.password) {
      setError("Nombre, email y contraseña son obligatorios"); return
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres"); return
    }
    setLoading(true)

    const authResult = await registerAccount(form.email, form.password)
    if (!authResult.ok) {
      setLoading(false)
      setError(authResult.error)
      return
    }

    // Update Supabase profile (trigger created it with just email)
    dbUpdateProfile({ name: form.fullName, email: form.email, company: form.company }).catch(() => {})

    // Save profile locally
    if (inviteCode) {
      setProfileFromInvite(form.fullName, form.email, form.company, inviteCode)
    } else {
      useWorkspaceStore.getState().createProfile(form.fullName, form.email, form.company)
    }

    setLoading(false)
    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Invite banner */}
      {isInvite && (
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-xl border",
          inviteWorkspaceName
            ? "bg-emerald-50 border-emerald-200"
            : "bg-amber-50 border-amber-200"
        )}>
          {inviteWorkspaceName
            ? <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            : <Users className="w-4 h-4 text-amber-600 shrink-0" />}
          <p className={cn("text-xs", inviteWorkspaceName ? "text-emerald-800" : "text-amber-800")}>
            {inviteWorkspaceName
              ? `Te unirás a ${inviteWorkspaceName} al registrarte`
              : "Código de invitación recibido. Al registrarte podrás unirte al workspace."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="fullName">Nombre completo *</Label>
          <Input id="fullName" placeholder="Carlos García" value={form.fullName}
            onChange={e => set("fullName", e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="reg-email">Email *</Label>
          <Input id="reg-email" type="email" placeholder="tu@email.com" value={form.email}
            onChange={e => set("email", e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">Empresa</Label>
          <Input id="company" placeholder="Acme S.L." value={form.company}
            onChange={e => set("company", e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role">Rol</Label>
          <select id="role" value={form.role} onChange={e => set("role", e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors">
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="reg-password">Contraseña *</Label>
          <div className="relative">
            <Input id="reg-password" type={showPwd ? "text" : "password"} placeholder="Mínimo 8 caracteres"
              value={form.password} onChange={e => set("password", e.target.value)}
              className="h-10 pr-10" />
            <button type="button" onClick={() => setShowPwd(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/8 rounded-lg px-3 py-2">{error}</p>}

      <Button type="submit" className="w-full h-10 mt-2" disabled={loading}>
        {loading
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creando cuenta...</>
          : isInvite ? "Unirme al equipo" : "Crear cuenta gratis"
        }
      </Button>
    </form>
  )
}
