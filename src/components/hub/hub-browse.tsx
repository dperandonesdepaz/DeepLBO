"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useHubStore, type HubListing, type HubListingType, type HubSector } from "@/store/hub-store"
import { cn } from "@/lib/utils"
import {
  Search, Filter, Building2, TrendingUp, Users, Globe,
  Eye, MessageSquare, Tag, ArrowRight, Plus, Lock,
  ChevronDown, SlidersHorizontal,
} from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<HubListingType, { label: string; color: string; bg: string }> = {
  sale:        { label: "Venta",           color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  investment:  { label: "Búsqueda capital",color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  merger:      { label: "Fusión / M&A",    color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200" },
  partnership: { label: "Partnership",     color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
}

const SECTOR_LABELS: Record<HubSector, string> = {
  technology:    "Tecnología",
  industrial:    "Industrial",
  healthcare:    "Healthcare",
  consumer:      "Consumer",
  financial:     "Financiero",
  real_estate:   "Real Estate",
  energy:        "Energía",
  media:         "Media",
  logistics:     "Logística",
  education:     "Educación",
  other:         "Otro",
}

// ─── Listing card ─────────────────────────────────────────────────────────────
function ListingCard({ listing }: { listing: HubListing }) {
  const type = TYPE_CONFIG[listing.type]
  const evM = listing.askingPriceM ?? (listing.askingMultiple ? listing.askingMultiple * listing.ebitdaM : null)
  const margin = listing.revenueM > 0 ? (listing.ebitdaM / listing.revenueM * 100).toFixed(1) : null

  return (
    <Link
      href={`/hub/${listing.id}`}
      className="block bg-white rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all group"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", type.bg, type.color)}>
                {type.label}
              </span>
              <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {SECTOR_LABELS[listing.sector]}
              </span>
              {listing.status === "under_loi" && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Bajo LOI
                </span>
              )}
              {listing.isDemo && (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                  Ejemplo ficticio
                </span>
              )}
            </div>
            <h3 className="font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5 shrink-0 mt-1" />
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
          {listing.description}
        </p>

        {/* Financials */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Revenue", value: `€${listing.revenueM.toFixed(1)}M` },
            { label: "EBITDA", value: `€${listing.ebitdaM.toFixed(1)}M${margin ? ` (${margin}%)` : ""}` },
            { label: evM ? "EV pedido" : "EV/EBITDA", value: evM ? `€${evM.toFixed(1)}M` : (listing.askingMultiple ? `${listing.askingMultiple}x` : "N/D") },
          ].map(({ label, value }) => (
            <div key={label} className="bg-secondary/50 rounded-lg p-2 text-center">
              <p className="text-[9px] text-muted-foreground">{label}</p>
              <p className="text-xs font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">
              {listing.city ? `${listing.city}, ` : ""}{listing.country}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {listing.anonymous ? (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Lock className="w-2.5 h-2.5" /> Anónimo
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground">{listing.ownerFirm ?? listing.ownerName}</span>
            )}
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Eye className="w-3 h-3" /> {listing.views}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <MessageSquare className="w-3 h-3" /> {listing.interests?.length ?? 0}
            </div>
          </div>
        </div>

        {/* Tags */}
        {listing.tags?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-3 pt-3 border-t border-border/50">
            {listing.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                #{tag}
              </span>
            ))}
            {listing.tags.length > 4 && (
              <span className="text-[10px] text-muted-foreground">+{listing.tags.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function HubBrowse() {
  const { listings, filterType, filterSector, searchQuery, loadListings, setFilter } = useHubStore()
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => { loadListings() }, [loadListings])

  const filtered = listings.filter(l => {
    if (filterType !== "all" && l.type !== filterType) return false
    if (filterSector !== "all" && l.sector !== filterSector) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.tags?.some(t => t.toLowerCase().includes(q)) ||
        l.country.toLowerCase().includes(q) ||
        (l.city ?? "").toLowerCase().includes(q)
      )
    }
    return true
  })

  // Stats
  const totalEV = listings.reduce((s, l) => {
    const ev = l.askingPriceM ?? (l.askingMultiple ? l.askingMultiple * l.ebitdaM : 0)
    return s + ev
  }, 0)
  const totalRevenue = listings.reduce((s, l) => s + l.revenueM, 0)

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Deal Hub</h1>
            <p className="text-blue-100 text-sm max-w-xl">
              Marketplace privado de M&A para analistas, fondos y empresas. Publica oportunidades de inversión,
              venta o fusión — con identidad visible o anónima.
            </p>
            <div className="flex gap-4 mt-3 text-sm">
              <div><span className="font-bold text-white">{listings.length}</span> <span className="text-blue-200">operaciones activas</span></div>
              <div><span className="font-bold text-white">€{(totalRevenue / 1000).toFixed(1)}B+</span> <span className="text-blue-200">revenue agregado</span></div>
              <div><span className="font-bold text-white">€{(totalEV / 1000).toFixed(1)}B+</span> <span className="text-blue-200">deal value</span></div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Link
              href="/hub/new"
              className="inline-flex items-center gap-2 bg-white text-primary text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-md whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Publicar oportunidad
            </Link>
          </div>
        </div>
      </div>

      {/* Search & filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setFilter({ searchQuery: e.target.value })}
              placeholder="Buscar por sector, país, descripción, tags..."
              className="w-full h-10 pl-9 pr-3 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(f => !f)}
            className={cn(
              "flex items-center gap-1.5 h-10 px-3 border rounded-xl text-sm transition-all",
              showFilters ? "bg-primary text-white border-primary" : "bg-white border-border hover:border-primary/30"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {(filterType !== "all" || filterSector !== "all") && (
              <span className="w-4 h-4 bg-white/30 text-[10px] font-bold rounded-full flex items-center justify-center">
                {(filterType !== "all" ? 1 : 0) + (filterSector !== "all" ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-3 flex-wrap p-4 bg-white rounded-xl border border-border">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Tipo de operación</label>
              <select
                value={filterType}
                onChange={e => setFilter({ filterType: e.target.value as HubListingType | "all" })}
                className="h-8 px-2 text-xs border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="all">Todos los tipos</option>
                {(Object.entries(TYPE_CONFIG) as [HubListingType, typeof TYPE_CONFIG[HubListingType]][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Sector</label>
              <select
                value={filterSector}
                onChange={e => setFilter({ filterSector: e.target.value as HubSector | "all" })}
                className="h-8 px-2 text-xs border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="all">Todos los sectores</option>
                {(Object.entries(SECTOR_LABELS) as [HubSector, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            {(filterType !== "all" || filterSector !== "all") && (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setFilter({ filterType: "all", filterSector: "all" })}
                  className="text-xs text-primary hover:underline h-8"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "oportunidad" : "oportunidades"}
          {(filterType !== "all" || filterSector !== "all" || searchQuery) && ` encontradas`}
        </p>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Venta</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500" /> Capital</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Fusión</span>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-border">
          <Building2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Sin resultados</p>
          <p className="text-xs text-muted-foreground mt-1">Prueba con otros filtros o&nbsp;
            <Link href="/hub/new" className="text-primary hover:underline">publica la primera oportunidad</Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[11px] text-muted-foreground text-center pb-4">
        Las oportunidades publicadas son información no verificada proporcionada por los propios usuarios.
        DeepLBO no actúa como intermediario financiero ni asesora sobre operaciones. Realiza tu propia due diligence.
      </p>
    </div>
  )
}
