"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sendPasswordResetEmail } from "@/store/auth-store"

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [email, setEmail]     = useState("")
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!email) { setError("Introduce tu email"); return }
    setLoading(true)
    const result = await sendPasswordResetEmail(email)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <p className="font-medium text-foreground mb-1">Email enviado</p>
        <p className="text-sm text-muted-foreground">
          Revisa tu bandeja de entrada en <span className="font-medium">{email}</span>. Haz clic en el enlace para restablecer tu contraseña.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fp-email">Email de tu cuenta</Label>
        <Input
          id="fp-email" type="email" placeholder="tu@email.com"
          value={email} onChange={e => setEmail(e.target.value)}
          className="h-10" autoFocus
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Te enviaremos un enlace para restablecer tu contraseña.
      </p>
      {error && <p className="text-sm text-destructive bg-destructive/8 rounded-lg px-3 py-2">{error}</p>}
      <Button type="submit" className="w-full h-10" disabled={loading || !email}>
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : "Enviar enlace"}
      </Button>
    </form>
  )
}
