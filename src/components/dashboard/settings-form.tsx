"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { User, Lock, Bell, Trash2, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWorkspaceStore } from "@/store/workspace-store"
import { loginAccount, resetPassword, logoutAccount } from "@/store/auth-store"

const USER_ROLES = [
  { value: "analyst",  label: "Analista de PE/VC" },
  { value: "investor", label: "Inversor / LP" },
  { value: "founder",  label: "Founder / CEO" },
  { value: "student",  label: "Estudiante / Académico" },
  { value: "other",    label: "Otro" },
]

function Section({ icon: Icon, title, description, children }: {
  icon: React.ElementType; title: string; description?: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-6 space-y-5">
      <div className="flex items-center gap-3 pb-1 border-b border-border">
        <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-foreground">{label}</label>
      {hint && <p className="text-[11px] text-muted-foreground -mt-1">{hint}</p>}
      {children}
    </div>
  )
}

function Inp({ value, onChange, placeholder, type = "text", disabled }: {
  value?: string; onChange?: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean
}) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full h-9 px-3 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50 disabled:bg-secondary/50 disabled:text-muted-foreground disabled:cursor-not-allowed"
    />
  )
}

export function SettingsForm() {
  const router = useRouter()
  const { profile, init, workspace } = useWorkspaceStore()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("analyst")
  const [notifications, setNotifications] = useState({
    weekly: true, updates: true, tips: false, security: true,
  })
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" })
  const [pwdError, setPwdError] = useState("")

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "")
      setCompany(profile.company ?? "")
      setRole(profile.role === "admin" || profile.role === "member" ? "analyst" : (profile.role ?? "analyst"))
    }
  }, [profile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    // Update profile in workspace store
    if (profile) {
      useWorkspaceStore.getState().updateProfile?.({ name, company })
    }
    await new Promise(r => setTimeout(r, 700))
    setSaving(false)
    toast.success("Perfil actualizado")
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Profile */}
      <Section icon={User} title="Perfil" description="Tu información personal y profesional">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre completo">
            <Inp value={name} onChange={setName} placeholder="Tu nombre" />
          </Field>
          <Field label="Email" hint="No se puede cambiar por ahora">
            <Inp value={profile?.email ?? ""} disabled />
          </Field>
          <Field label="Empresa / Fondo">
            <Inp value={company} onChange={setCompany} placeholder="Ej. Acme Capital Partners" />
          </Field>
          <Field label="Perfil profesional">
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full h-9 px-3 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            >
              {USER_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </Field>
        </div>
        {workspace && (
          <div className="pt-1">
            <p className="text-xs text-muted-foreground">
              Workspace: <span className="font-semibold text-foreground">{workspace.name}</span>
              <span className="ml-2 text-muted-foreground">· {profile?.role === "admin" ? "Administrador" : "Miembro"}</span>
            </p>
          </div>
        )}
      </Section>

      {/* Security */}
      <Section icon={Lock} title="Seguridad" description="Gestiona tu contraseña y acceso">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Contraseña actual">
            <Inp type="password" placeholder="••••••••"
              value={pwd.current} onChange={v => { setPwd(p => ({ ...p, current: v })); setPwdError("") }} />
          </Field>
          <Field label="Nueva contraseña" hint="Mínimo 8 caracteres">
            <Inp type="password" placeholder="••••••••"
              value={pwd.next} onChange={v => { setPwd(p => ({ ...p, next: v })); setPwdError("") }} />
          </Field>
          <Field label="Confirmar nueva contraseña">
            <Inp type="password" placeholder="••••••••"
              value={pwd.confirm} onChange={v => { setPwd(p => ({ ...p, confirm: v })); setPwdError("") }} />
          </Field>
        </div>
        {pwdError && <p className="text-xs text-destructive bg-destructive/8 rounded-lg px-3 py-2">{pwdError}</p>}
        <button
          type="button"
          onClick={() => {
            setPwdError("")
            if (!pwd.current || !pwd.next || !pwd.confirm) { setPwdError("Completa todos los campos de contraseña"); return }
            if (pwd.next.length < 8) { setPwdError("La nueva contraseña debe tener al menos 8 caracteres"); return }
            if (pwd.next !== pwd.confirm) { setPwdError("Las contraseñas no coinciden"); return }
            const email = profile?.email ?? ""
            const check = loginAccount(email, pwd.current)
            if (!check.ok) { setPwdError("La contraseña actual es incorrecta"); return }
            const result = resetPassword(email, pwd.next)
            if (!result.ok) { setPwdError(result.error); return }
            setPwd({ current: "", next: "", confirm: "" })
            toast.success("Contraseña actualizada correctamente")
          }}
          className="h-8 px-4 text-xs font-medium border border-border rounded-lg hover:bg-secondary transition-colors"
        >
          Cambiar contraseña
        </button>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notificaciones" description="Configura cuándo quieres recibir emails">
        <div className="space-y-3">
          {[
            { key: "weekly",   label: "Resumen semanal de análisis" },
            { key: "updates",  label: "Actualizaciones del producto" },
            { key: "tips",     label: "Consejos y casos de uso" },
            { key: "security", label: "Alertas de seguridad de la cuenta" },
          ].map(item => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={notifications[item.key as keyof typeof notifications]}
                onChange={e => setNotifications(n => ({ ...n, [item.key]: e.target.checked }))}
                className="w-4 h-4 rounded border-border text-primary accent-primary"
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Plan */}
      <Section icon={Shield} title="Plan actual" description="Información de tu suscripción">
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-sm font-bold text-primary">Acceso Completo</div>
              <span className="text-[10px] font-semibold bg-primary text-white px-2 py-0.5 rounded-full">GRATIS</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Sin tarjeta de crédito</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Análisis LBO ilimitados",
              "Análisis DCF ilimitados",
              "Modelos de Fusión M&A",
              "Deal Hub — publicar y explorar",
              "Due Diligence Tracker",
              "Deal Scoring IC",
              "Herramientas rápidas (IRR/WACC/etc.)",
              "Workspace de equipo",
              "Exportación PowerPoint",
              "Autoguardado y versiones",
            ].map(f => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-foreground">
                <div className="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                {f}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground border-t border-primary/10 pt-3">
            DeepLBO es actualmente <span className="font-semibold text-foreground">100% gratuito</span>. En el futuro
            se añadirán funcionalidades premium opcionales, pero las actuales siempre serán gratuitas.
          </p>
        </div>
      </Section>

      {/* Danger zone */}
      <Section icon={Trash2} title="Zona peligrosa" description="Acciones irreversibles sobre tu cuenta">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div>
              <div className="text-sm font-semibold text-amber-700">Borrar todos mis análisis</div>
              <div className="text-xs text-amber-600 mt-0.5">Se eliminarán todos tus análisis LBO, DCF y Fusiones del navegador</div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm("¿Seguro que quieres borrar todos tus análisis? Esta acción no se puede deshacer.")) {
                  ["deeplbo_analyses", "deeplbo_dcf_analyses", "deeplbo_merger_analyses",
                    "deeplbo_dd_checklists", "deeplbo_deal_scores"].forEach(k => localStorage.removeItem(k))
                  toast.success("Todos los análisis eliminados")
                }
              }}
              className="h-8 px-4 text-xs font-semibold text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
            >
              Borrar datos
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
            <div>
              <div className="text-sm font-semibold text-red-700">Eliminar cuenta</div>
              <div className="text-xs text-red-500 mt-0.5">Se eliminarán todos tus datos de forma permanente</div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!confirm("¿Seguro que quieres eliminar tu cuenta y todos tus datos? Esta acción no se puede deshacer.")) return
                const ALL_KEYS = [
                  "deeplbo_analyses", "deeplbo_dcf_analyses", "deeplbo_merger_analyses",
                  "deeplbo_dd_checklists", "deeplbo_deal_scores", "deeplbo_hub_listings",
                  "deeplbo_workspace", "deeplbo_user_profile", "deeplbo_auth_accounts",
                  "deeplbo_auth_session", "deeplbo_pending_invite",
                ]
                ALL_KEYS.forEach(k => localStorage.removeItem(k))
                logoutAccount()
                router.push("/")
              }}
              className="h-8 px-4 text-xs font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="h-9 px-6 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : "Guardar cambios"}
        </button>
      </div>
    </form>
  )
}
