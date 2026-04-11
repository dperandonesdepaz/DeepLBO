"use client"

import { useEffect, useState } from "react"
import { useWorkspaceStore } from "@/store/workspace-store"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Users, Link2, Copy, Check, Plus, Trash2, Shield, Crown,
  RefreshCw, Settings, UserPlus, AlertTriangle, Building2
} from "lucide-react"

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const letter = name?.charAt(0).toUpperCase() ?? "?"
  const colors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-red-500", "bg-pink-500"]
  const color = colors[letter.charCodeAt(0) % colors.length]
  const sz = size === "sm" ? "w-7 h-7 text-xs" : size === "lg" ? "w-12 h-12 text-lg" : "w-9 h-9 text-sm"
  return (
    <div className={cn("rounded-full flex items-center justify-center text-white font-bold shrink-0", sz, color)}>
      {letter}
    </div>
  )
}

export function WorkspaceSettings() {
  const {
    workspace, profile, init,
    createWorkspace, updateWorkspace, regenerateInviteCode,
    addMember, removeMember, updateMemberRole, disbandWorkspace,
    updateProfile,
  } = useWorkspaceStore()

  const [loaded, setLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<"workspace" | "members" | "profile">("workspace")

  // Create workspace form
  const [wsName, setWsName] = useState("")
  const [wsDesc, setWsDesc] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [ownerEmail, setOwnerEmail] = useState("")

  // Add member form
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState<"admin" | "member">("member")
  const [showAddMember, setShowAddMember] = useState(false)

  // Profile edit
  const [profName, setProfName] = useState("")
  const [profEmail, setProfEmail] = useState("")
  const [profCompany, setProfCompany] = useState("")

  useEffect(() => {
    init()
    setLoaded(true)
  }, [init])

  useEffect(() => {
    if (profile) {
      setProfName(profile.name)
      setProfEmail(profile.email)
      setProfCompany(profile.company)
    }
  }, [profile])

  if (!loaded) return null

  const isAdmin = profile?.role === 'admin'
  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/join/${workspace?.inviteCode ?? ""}`
    : ""

  function handleCopyLink() {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success("Enlace copiado al portapapeles")
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault()
    if (!wsName.trim() || !ownerName.trim() || !ownerEmail.trim()) return
    createWorkspace(wsName.trim(), wsDesc.trim(), ownerName.trim(), ownerEmail.trim())
    toast.success("Workspace creado")
  }

  function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) return
    addMember(newName.trim(), newEmail.trim(), newRole)
    setNewName(""); setNewEmail(""); setShowAddMember(false)
    toast.success(`${newName} añadido al equipo`)
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    updateProfile({ name: profName, email: profEmail, company: profCompany })
    toast.success("Perfil actualizado")
  }

  // ── No workspace yet ──────────────────────────────────────────────────────
  if (!workspace) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workspace de equipo</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Crea un workspace para tu equipo y gestiona el acceso colaborativo
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border-2 border-primary/30 p-5">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">Crear workspace de empresa</h3>
            <p className="text-xs text-muted-foreground">
              Para equipos de 2–50 personas. El admin crea el workspace y distribuye el enlace de invitación.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5 opacity-60">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">Cuenta individual</h3>
            <p className="text-xs text-muted-foreground">
              Sin workspace. Todos tus análisis son privados y solo tú tienes acceso.
            </p>
            <p className="text-[10px] text-muted-foreground mt-2 font-semibold">← Ya estás en este modo</p>
          </div>
        </div>

        {/* Create form */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Crear nuevo workspace
          </h2>
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">Nombre del workspace *</label>
                <input value={wsName} onChange={e => setWsName(e.target.value)}
                  placeholder="Ej. Dept. M&A — Goldman"
                  className="w-full h-10 px-3 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" required />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">Descripción</label>
                <input value={wsDesc} onChange={e => setWsDesc(e.target.value)}
                  placeholder="Ej. Equipo de análisis buy-side"
                  className="w-full h-10 px-3 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">Tu nombre (admin) *</label>
                <input value={ownerName} onChange={e => setOwnerName(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full h-10 px-3 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" required />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">Tu email (admin) *</label>
                <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)}
                  placeholder="admin@empresa.com"
                  className="w-full h-10 px-3 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" required />
              </div>
            </div>
            <button type="submit"
              className="h-10 px-6 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
              Crear workspace
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Workspace exists ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{workspace.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {workspace.description || "Workspace de equipo"} · {workspace.members.length} miembro{workspace.members.length !== 1 ? "s" : ""}
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
          {profile?.role === "admin" ? "Admin" : "Miembro"}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg w-fit">
        {([
          { id: "workspace", label: "Workspace", icon: Building2 },
          { id: "members",   label: "Equipo",    icon: Users },
          { id: "profile",   label: "Mi perfil", icon: Shield },
        ] as const).map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                tab === t.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab: Workspace ── */}
      {tab === "workspace" && (
        <div className="space-y-5">
          {/* Invite link */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" /> Enlace de invitación
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Comparte este enlace con tu equipo. Quien lo abra podrá unirse al workspace directamente.
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly value={inviteLink}
                className="flex-1 h-10 px-3 text-xs text-muted-foreground bg-secondary/50 border border-border rounded-lg outline-none font-mono"
              />
              <button onClick={handleCopyLink}
                className={cn("h-10 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                  copied ? "bg-green-600 text-white" : "bg-primary text-white hover:bg-primary/90")}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            {isAdmin && (
              <button
                onClick={() => { regenerateInviteCode(); toast.success("Nuevo código generado") }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Regenerar código (invalida el anterior)
              </button>
            )}
          </div>

          {/* Workspace info */}
          {isAdmin && (
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" /> Configuración
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">Nombre del workspace</label>
                  <input defaultValue={workspace.name}
                    onBlur={e => updateWorkspace({ name: e.target.value.trim() || workspace.name })}
                    className="w-full h-9 px-3 text-sm border border-border rounded-lg outline-none focus:border-primary transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">Descripción</label>
                  <input defaultValue={workspace.description}
                    onBlur={e => updateWorkspace({ description: e.target.value })}
                    className="w-full h-9 px-3 text-sm border border-border rounded-lg outline-none focus:border-primary transition-all" />
                </div>
              </div>
            </div>
          )}

          {/* Danger zone */}
          {isAdmin && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-red-800 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4" /> Zona de peligro
              </h3>
              <button
                onClick={() => {
                  if (confirm("¿Estás seguro? Esto eliminará el workspace y todos los datos de equipo.")) {
                    disbandWorkspace()
                    toast.success("Workspace eliminado")
                  }
                }}
                className="inline-flex items-center gap-1.5 h-8 px-4 text-xs font-medium text-red-700 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Disolver workspace
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Members ── */}
      {tab === "members" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{workspace.members.length} miembro{workspace.members.length !== 1 ? "s" : ""}</h3>
              {isAdmin && (
                <button onClick={() => setShowAddMember(!showAddMember)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  <UserPlus className="w-3.5 h-3.5" /> Añadir miembro
                </button>
              )}
            </div>

            {/* Add member form */}
            {showAddMember && isAdmin && (
              <form onSubmit={handleAddMember} className="px-5 py-4 border-b border-border bg-secondary/20 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder="Nombre completo" required
                    className="h-9 px-3 text-sm border border-border rounded-lg outline-none focus:border-primary transition-all" />
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                    placeholder="email@empresa.com" required
                    className="h-9 px-3 text-sm border border-border rounded-lg outline-none focus:border-primary transition-all" />
                  <div className="flex gap-2">
                    <select value={newRole} onChange={e => setNewRole(e.target.value as any)}
                      className="flex-1 h-9 px-3 text-sm border border-border rounded-lg outline-none focus:border-primary transition-all">
                      <option value="member">Miembro</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button type="submit"
                      className="h-9 px-3 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors">
                      Añadir
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Después de añadirlo, comparte el enlace de invitación para que se registre y entre al workspace.
                </p>
              </form>
            )}

            {/* Members list */}
            <div className="divide-y divide-border">
              {workspace.members.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3.5">
                  <Avatar name={m.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
                      {m.id === workspace.ownerId && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isAdmin && m.id !== workspace.ownerId ? (
                      <select
                        value={m.role}
                        onChange={e => {
                          updateMemberRole(m.id, e.target.value as any)
                          toast.success("Rol actualizado")
                        }}
                        className="h-7 px-2 text-xs border border-border rounded-lg outline-none focus:border-primary transition-all"
                      >
                        <option value="member">Miembro</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        m.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                      )}>
                        {m.role === "admin" ? "Admin" : "Miembro"}
                      </span>
                    )}
                    {isAdmin && m.id !== workspace.ownerId && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar a ${m.name} del equipo?`)) {
                            removeMember(m.id)
                            toast.success("Miembro eliminado")
                          }
                        }}
                        className="w-7 h-7 flex items-center justify-center hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <Link2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">¿Cómo invitar a nuevos miembros?</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Ve a la pestaña "Workspace" y copia el enlace de invitación. Quién lo abra podrá registrarse
                directamente como miembro de este equipo. También puedes añadir manualmente arriba y enviarles el enlace.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Profile ── */}
      {tab === "profile" && (
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Mi perfil
          </h3>
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">Nombre completo</label>
              <input value={profName} onChange={e => setProfName(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">Email</label>
              <input type="email" value={profEmail} onChange={e => setProfEmail(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">Empresa</label>
              <input value={profCompany} onChange={e => setProfCompany(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit"
                className="h-9 px-5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                Guardar cambios
              </button>
              <span className="text-xs text-muted-foreground">
                Rol: <span className="font-semibold">{profile?.role === "admin" ? "Admin" : "Miembro"}</span>
              </span>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
