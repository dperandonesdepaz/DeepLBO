"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3, Settings, LogOut, ChevronDown, User,
  Shield, Users, Crown, Menu, X
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useWorkspaceStore } from "@/store/workspace-store"
import { logoutAccount } from "@/store/auth-store"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/dashboard",          label: "Análisis"      },
  { href: "/dashboard/pipeline", label: "Pipeline"      },
  { href: "/dashboard/compare",  label: "Comparar"      },
  { href: "/dashboard/tools",    label: "Herramientas"  },
  { href: "/hub",                label: "Hub"           },
  { href: "/workspace",          label: "Equipo"        },
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { workspace, profile, init } = useWorkspaceStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { init() }, [init])
  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const displayName = profile?.name ?? "Usuario"
  const initials = displayName.charAt(0).toUpperCase()
  const isAdmin = profile?.role === "admin"

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground text-base">DeepLBO</span>
          </Link>

          {/* Workspace badge */}
          {workspace && (
            <Link href="/workspace"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
              <Users className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold text-primary truncate max-w-[120px]">{workspace.name}</span>
              <span className="text-[9px] text-muted-foreground">{workspace.members.length}</span>
            </Link>
          )}

          <nav className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const active = href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href)
              // Hide "Equipo" nav link when workspace badge is already shown
              if (href === "/workspace" && workspace) return null
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn("px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link href="/admin"
              className="hidden lg:flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors">
              <Shield className="w-3.5 h-3.5" /> Admin
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(o => !o)}
            className="sm:hidden flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Menú"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-secondary rounded-lg px-2 py-1.5 transition-colors outline-none">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-foreground leading-none">{displayName}</p>
                {workspace && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {isAdmin ? "Admin" : "Miembro"} · {workspace.name}
                  </p>
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {profile && (
                <div className="px-2 py-1.5 border-b border-border mb-1">
                  <p className="text-xs font-semibold text-foreground">{profile.name}</p>
                  <p className="text-[10px] text-muted-foreground">{profile.email}</p>
                </div>
              )}
              <DropdownMenuItem>
                <Link href="/workspace" className="flex items-center gap-2 w-full">
                  <Users className="w-3.5 h-3.5" /> {workspace ? "Mi equipo" : "Crear workspace"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/dashboard/settings" className="flex items-center gap-2 w-full">
                  <Settings className="w-3.5 h-3.5" /> Configuración
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem>
                  <Link href="/admin" className="flex items-center gap-2 w-full">
                    <Shield className="w-3.5 h-3.5" /> Admin panel
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => { logoutAccount(); router.push("/") }}
              >
                <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-border bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href)
            if (href === "/workspace" && workspace) return null
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
                )}
              >
                {label}
              </Link>
            )
          })}
          {isAdmin && (
            <Link href="/admin"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              <Shield className="w-4 h-4" /> Admin
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
