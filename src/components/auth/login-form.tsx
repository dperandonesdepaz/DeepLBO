"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAccount } from "@/store/auth-store"

export function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ email: "", password: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!form.email || !form.password) { setError("Completa todos los campos"); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))

    const result = loginAccount(form.email, form.password)
    setLoading(false)

    if (!result.ok) {
      setError(result.error)
      return
    }
    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email" type="email" placeholder="tu@email.com" autoComplete="email"
          value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          className="h-10"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contraseña</Label>
          <Link href="/forgot-password" className="text-xs text-primary hover:underline">
            ¿La olvidaste?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password" type={showPwd ? "text" : "password"} placeholder="••••••••"
            autoComplete="current-password"
            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            className="h-10 pr-10"
          />
          <button type="button" onClick={() => setShowPwd(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/8 rounded-lg px-3 py-2">{error}</p>}

      <Button type="submit" className="w-full h-10" disabled={loading}>
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Accediendo...</> : "Iniciar sesión"}
      </Button>
    </form>
  )
}
