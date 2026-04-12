"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updatePassword } from "@/store/auth-store"

export function ResetPasswordForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError]     = useState("")
  const [done, setDone]       = useState(false)
  const [pwd, setPwd]         = useState({ next: "", confirm: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (pwd.next.length < 8) { setError("La contraseña debe tener al menos 8 caracteres"); return }
    if (pwd.next !== pwd.confirm) { setError("Las contraseñas no coinciden"); return }
    setLoading(true)
    const result = await updatePassword(pwd.next)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    setDone(true)
    setTimeout(() => router.push("/dashboard"), 2000)
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <p className="font-medium text-foreground mb-1">Contraseña actualizada</p>
        <p className="text-sm text-muted-foreground">Redirigiendo al dashboard...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="new-pwd">Nueva contraseña</Label>
        <div className="relative">
          <Input
            id="new-pwd" type={showPwd ? "text" : "password"} placeholder="Mínimo 8 caracteres"
            value={pwd.next} onChange={e => setPwd(p => ({ ...p, next: e.target.value }))}
            className="h-10 pr-10" autoFocus
          />
          <button type="button" onClick={() => setShowPwd(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm-pwd">Confirmar contraseña</Label>
        <Input
          id="confirm-pwd" type={showPwd ? "text" : "password"} placeholder="Repite la contraseña"
          value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
          className="h-10"
        />
      </div>
      {error && <p className="text-sm text-destructive bg-destructive/8 rounded-lg px-3 py-2">{error}</p>}
      <Button type="submit" className="w-full h-10" disabled={loading || !pwd.next || !pwd.confirm}>
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : "Guardar contraseña"}
      </Button>
    </form>
  )
}
