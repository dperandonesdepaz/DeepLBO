import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

// ── Types ────────────────────────────────────────────────────────────────────

export type WorkspaceRole = 'admin' | 'member'

export interface WorkspaceMember {
  id: string
  name: string
  email: string
  role: WorkspaceRole
  joinedAt: string
  // Simulated per-member analysis counts (local mode)
  lboCount?: number
  dcfCount?: number
  mergerCount?: number
}

export interface Workspace {
  id: string
  name: string
  description: string
  inviteCode: string
  createdAt: string
  ownerId: string
  members: WorkspaceMember[]
}

export interface UserProfile {
  id: string
  name: string
  email: string
  company: string
  role: WorkspaceRole
  workspaceId: string | null
  workspaceName: string | null
  createdAt: string
}

// ── localStorage helpers ─────────────────────────────────────────────────────

const LS_WORKSPACE = "deeplbo_workspace"
const LS_PROFILE   = "deeplbo_user_profile"

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function generateCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

export function getWorkspaceFromLS(): Workspace | null {
  if (typeof window === "undefined") return null
  try { return JSON.parse(localStorage.getItem(LS_WORKSPACE) ?? "null") } catch { return null }
}

export function saveWorkspaceToLS(ws: Workspace): void {
  localStorage.setItem(LS_WORKSPACE, JSON.stringify(ws))
}

export function getProfileFromLS(): UserProfile | null {
  if (typeof window === "undefined") return null
  try { return JSON.parse(localStorage.getItem(LS_PROFILE) ?? "null") } catch { return null }
}

export function saveProfileToLS(p: UserProfile): void {
  localStorage.setItem(LS_PROFILE, JSON.stringify(p))
}

// For the invite link — store pending invite so register form can read it
const LS_PENDING_INVITE = "deeplbo_pending_invite"

export function setPendingInvite(code: string, workspaceName: string): void {
  localStorage.setItem(LS_PENDING_INVITE, JSON.stringify({ code, workspaceName, ts: Date.now() }))
}

export function getPendingInvite(): { code: string; workspaceName: string } | null {
  if (typeof window === "undefined") return null
  try {
    const d = JSON.parse(localStorage.getItem(LS_PENDING_INVITE) ?? "null")
    if (!d) return null
    // Expire after 30 min
    if (Date.now() - d.ts > 30 * 60 * 1000) { localStorage.removeItem(LS_PENDING_INVITE); return null }
    return d
  } catch { return null }
}

export function clearPendingInvite(): void {
  localStorage.removeItem(LS_PENDING_INVITE)
}

// ── Store ────────────────────────────────────────────────────────────────────

interface WorkspaceStore {
  workspace: Workspace | null
  profile: UserProfile | null
  loaded: boolean

  init: () => void
  createWorkspace: (name: string, description: string, ownerName: string, ownerEmail: string) => Workspace
  updateWorkspace: (partial: Partial<Pick<Workspace, 'name' | 'description'>>) => void
  regenerateInviteCode: () => string
  addMember: (name: string, email: string, role?: WorkspaceRole) => WorkspaceMember
  removeMember: (memberId: string) => void
  updateMemberRole: (memberId: string, role: WorkspaceRole) => void
  joinWorkspace: (inviteCode: string, name: string, email: string) => boolean

  createProfile: (name: string, email: string, company: string) => void
  updateProfile: (partial: Partial<Pick<UserProfile, 'name' | 'email' | 'company'>>) => void
  setProfileFromInvite: (name: string, email: string, company: string, inviteCode: string) => void

  leaveWorkspace: () => void
  disbandWorkspace: () => void
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  subscribeWithSelector((set, get) => ({
    workspace: null,
    profile:   null,
    loaded:    false,

    init: () => {
      const ws = getWorkspaceFromLS()
      const p  = getProfileFromLS()
      set({ workspace: ws, profile: p, loaded: true })
    },

    createWorkspace: (name, description, ownerName, ownerEmail) => {
      const ownerId = generateId()
      const ws: Workspace = {
        id: generateId(),
        name,
        description,
        inviteCode: generateCode(),
        createdAt: new Date().toISOString(),
        ownerId,
        members: [{
          id: ownerId,
          name: ownerName,
          email: ownerEmail,
          role: 'admin',
          joinedAt: new Date().toISOString(),
        }],
      }
      saveWorkspaceToLS(ws)

      // Create or update profile as admin
      const existing = get().profile
      const profile: UserProfile = existing
        ? { ...existing, role: 'admin', workspaceId: ws.id, workspaceName: ws.name }
        : {
          id: ownerId,
          name: ownerName,
          email: ownerEmail,
          company: name,
          role: 'admin',
          workspaceId: ws.id,
          workspaceName: ws.name,
          createdAt: new Date().toISOString(),
        }
      saveProfileToLS(profile)
      set({ workspace: ws, profile })
      return ws
    },

    updateWorkspace: (partial) => {
      const ws = get().workspace
      if (!ws) return
      const updated = { ...ws, ...partial }
      saveWorkspaceToLS(updated)
      set({ workspace: updated })
    },

    regenerateInviteCode: () => {
      const ws = get().workspace
      if (!ws) return ""
      const code = generateCode()
      const updated = { ...ws, inviteCode: code }
      saveWorkspaceToLS(updated)
      set({ workspace: updated })
      return code
    },

    addMember: (name, email, role = 'member') => {
      const ws = get().workspace
      if (!ws) throw new Error("No workspace")
      const member: WorkspaceMember = {
        id: generateId(),
        name, email, role,
        joinedAt: new Date().toISOString(),
      }
      const updated = { ...ws, members: [...ws.members, member] }
      saveWorkspaceToLS(updated)
      set({ workspace: updated })
      return member
    },

    removeMember: (memberId) => {
      const ws = get().workspace
      if (!ws) return
      // Can't remove owner
      if (memberId === ws.ownerId) return
      const updated = { ...ws, members: ws.members.filter(m => m.id !== memberId) }
      saveWorkspaceToLS(updated)
      set({ workspace: updated })
    },

    updateMemberRole: (memberId, role) => {
      const ws = get().workspace
      if (!ws) return
      // Can't change owner role
      if (memberId === ws.ownerId) return
      const updated = {
        ...ws,
        members: ws.members.map(m => m.id === memberId ? { ...m, role } : m)
      }
      saveWorkspaceToLS(updated)
      set({ workspace: updated })
    },

    joinWorkspace: (inviteCode, name, email) => {
      const ws = get().workspace
      if (!ws || ws.inviteCode !== inviteCode) return false
      const member: WorkspaceMember = {
        id: generateId(),
        name, email, role: 'member',
        joinedAt: new Date().toISOString(),
      }
      const updated = { ...ws, members: [...ws.members, member] }
      saveWorkspaceToLS(updated)

      const profile: UserProfile = {
        id: member.id,
        name, email,
        company: ws.name,
        role: 'member',
        workspaceId: ws.id,
        workspaceName: ws.name,
        createdAt: new Date().toISOString(),
      }
      saveProfileToLS(profile)
      set({ workspace: updated, profile })
      return true
    },

    createProfile: (name, email, company) => {
      const existing = get().profile
      const profile: UserProfile = existing
        ? { ...existing, name, email, company }
        : {
          id: generateId(), name, email, company,
          role: 'admin',
          workspaceId: null, workspaceName: null,
          createdAt: new Date().toISOString(),
        }
      saveProfileToLS(profile)
      set({ profile })
    },

    updateProfile: (partial) => {
      const p = get().profile
      if (!p) return
      const updated = { ...p, ...partial }
      saveProfileToLS(updated)
      set({ profile: updated })
    },

    setProfileFromInvite: (name, email, company, inviteCode) => {
      const ws = get().workspace ?? getWorkspaceFromLS()
      if (!ws || ws.inviteCode !== inviteCode) {
        // Create standalone profile
        const profile: UserProfile = {
          id: generateId(), name, email, company,
          role: 'admin',
          workspaceId: null, workspaceName: null,
          createdAt: new Date().toISOString(),
        }
        saveProfileToLS(profile)
        set({ profile })
        return
      }
      // Join workspace
      get().joinWorkspace(inviteCode, name, email)
      clearPendingInvite()
    },

    leaveWorkspace: () => {
      const p = get().profile
      if (!p) return
      const updated: UserProfile = { ...p, role: 'admin', workspaceId: null, workspaceName: null }
      saveProfileToLS(updated)
      set({ profile: updated })
    },

    disbandWorkspace: () => {
      localStorage.removeItem(LS_WORKSPACE)
      const p = get().profile
      if (p) {
        const updated: UserProfile = { ...p, role: 'admin', workspaceId: null, workspaceName: null }
        saveProfileToLS(updated)
        set({ workspace: null, profile: updated })
      } else {
        set({ workspace: null })
      }
    },
  }))
)
