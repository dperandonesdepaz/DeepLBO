"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSecurityQuestion, verifySecurityAnswer, resetPassword } from "@/store/auth-store"

type Step = "email" | "question" | "newpwd" | "done"

export function ForgotPasswordForm() {
  const [step, setStep]         = useState<Step>("email")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [email, setEmail]       = useState("")
  const [question, setQuestion] = useState("")
  const [answer, setAnswer]     = useState("")
  const [newPwd, setNewPwd]     = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [showPwd, setShowPwd]   = useState(false)

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const result = getSecurityQuestion(email)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    setQuestion(result.question)
    setStep("question")
  }

  async function handleAnswerSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const result = verifySecurityAnswer(email, answer)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    setStep("newpwd")
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (newPwd.length < 8) { setError("La contraseña debe tener al menos 8 caracteres"); return }
    if (newPwd !== confirmPwd) { setError("Las contraseñas no coinciden"); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const result = resetPassword(email, newPwd)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    setStep("done")
  }

  if (step === "done") {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <p className="font-medium text-foreground mb-1">Contraseña actualizada</p>
        <p className="text-sm text-muted-foreground">
          Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {(["email", "question", "newpwd"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
              s === step ? "bg-primary text-white"
              : (["email", "question", "newpwd"].indexOf(step) > i) ? "bg-primary/20 text-primary"
              : "bg-secondary text-muted-foreground"
            }`}>
              {i + 1}
            </div>
            {i < 2 && <div className={`h-px w-8 transition-colors ${
              (["email", "question", "newpwd"].indexOf(step) > i) ? "bg-primary/40" : "bg-border"
            }`} />}
          </div>
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          {step === "email" ? "Email" : step === "question" ? "Verificación" : "Nueva contraseña"}
        </span>
      </div>

      {/* Step 1 — Email */}
      {step === "email" && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fp-email">Email de tu cuenta</Label>
            <Input id="fp-email" type="email" placeholder="tu@email.com"
              value={email} onChange={e => setEmail(e.target.value)} className="h-10" autoFocus />
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/8 rounded-lg px-3 py-2">{error}</p>}
          <Button type="submit" className="w-full h-10" disabled={loading || !email}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando...</> : "Continuar"}
          </Button>
        </form>
      )}

      {/* Step 2 — Security question */}
      {step === "question" && (
        <form onSubmit={handleAnswerSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Pregunta de seguridad</Label>
            <p className="text-sm font-medium text-foreground bg-secondary rounded-lg px-3 py-2.5">
              {question}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fp-answer">Tu respuesta</Label>
            <Input id="fp-answer" placeholder="Escribe tu respuesta..."
              value={answer} onChange={e => setAnswer(e.target.value)} className="h-10" autoFocus />
            <p className="text-[11px] text-muted-foreground">La respuesta no distingue entre mayúsculas y minúsculas.</p>
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/8 rounded-lg px-3 py-2">{error}</p>}
          <Button type="submit" className="w-full h-10" disabled={loading || !answer}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando...</> : "Verificar respuesta"}
          </Button>
        </form>
      )}

      {/* Step 3 — New password */}
      {step === "newpwd" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fp-newpwd">Nueva contraseña</Label>
            <div className="relative">
              <Input id="fp-newpwd" type={showPwd ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={newPwd} onChange={e => setNewPwd(e.target.value)}
                className="h-10 pr-10" autoFocus />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fp-confirmpwd">Confirmar contraseña</Label>
            <Input id="fp-confirmpwd" type={showPwd ? "text" : "password"}
              placeholder="Repite la contraseña"
              value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
              className="h-10" />
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/8 rounded-lg px-3 py-2">{error}</p>}
          <Button type="submit" className="w-full h-10" disabled={loading || !newPwd || !confirmPwd}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : "Guardar nueva contraseña"}
          </Button>
        </form>
      )}
    </div>
  )
}
