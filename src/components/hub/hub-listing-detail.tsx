"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useHubStore, type HubListing } from "@/store/hub-store"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, Eye, MessageSquare, Globe, Lock, Building2,
  TrendingUp, DollarSign, Users, Tag, Check, AlertTriangle, Share2,
} from "lucide-react"
import { toast } from "sonner"

// ─── Interest form ────────────────────────────────────────────────────────────
function InterestForm({ listingId, onDone }: { listingId: string; onDone: () => void }) {
  const { expressInterest } = useHubStore()
  const [form, setForm] = useState({ name: "", email: "", firm: "", message: "", nda: false })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    expressInterest(listingId, { ...form })
    setSubmitting(false)
    setDone(true)
    toast.success("Interés registrado correctamente")
    setTimeout(onDone, 2000)
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6 text-emerald-600" />
        </div>
        <p className="font-semibold text-foreground">Interés registrado</p>
        <p className="text-sm text-muted-foreground mt-1">El propietario recibirá tu información de contacto.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-semibold text-foreground">Expresar interés</h3>
      <p className="text-xs text-muted-foreground">
        Tu información de contacto se enviará al propietario de la oportunidad.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Nombre *</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
            className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Email *</label>
          <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required
            className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Empresa / Fondo</label>
        <input value={form.firm} onChange={e => setForm(p => ({ ...p, firm: e.target.value }))}
          placeholder="Tu firma, fondo o empresa"
          className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Mensaje</label>
        <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          placeholder="Describe brevemente tu interés, mandato de inversión o capacidad de deal..."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>
      <label className="flex items-start gap-2 cursor-pointer">
        <input type="checkbox" checked={form.nda} onChange={e => setForm(p => ({ ...p, nda: e.target.checked }))}
          className="mt-0.5 accent-primary" />
        <span className="text-xs text-muted-foreground">
          Solicitar NDA antes de recibir información confidencial adicional
        </span>
      </label>
      <button type="submit" disabled={submitting || !form.name || !form.email}
        className="w-full h-10 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
        {submitting ? (
          <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enviando...</>
        ) : "Enviar interés"}
      </button>
    </form>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function HubListingDetail({ listingId }: { listingId: string }) {
  const { activeListing: listing, loadListing } = useHubStore()
  const [showInterestForm, setShowInterestForm] = useState(false)

  useEffect(() => { loadListing(listingId) }, [listingId, loadListing])

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Enlace copiado al portapapeles")
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-sm text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  const TYPE_LABELS: Record<string, string> = {
    sale: "Venta", investment: "Búsqueda de capital", merger: "Fusión / M&A", partnership: "Partnership",
  }
  const SECTOR_LABELS: Record<string, string> = {
    technology: "Tecnología", industrial: "Industrial", healthcare: "Healthcare",
    consumer: "Consumer", financial: "Financiero", real_estate: "Real Estate",
    energy: "Energía", media: "Media", logistics: "Logística", education: "Educación", other: "Otro",
  }
  const evM = listing.askingPriceM ?? (listing.askingMultiple ? listing.askingMultiple * listing.ebitdaM : null)
  const ebitdaMargin = listing.revenueM > 0 ? (listing.ebitdaM / listing.revenueM * 100) : 0

  return (
    <div className="space-y-6">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Link href="/hub" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al Hub
        </Link>
        <button onClick={copyLink} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Share2 className="w-4 h-4" /> Compartir
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {TYPE_LABELS[listing.type] ?? listing.type}
              </span>
              <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                {SECTOR_LABELS[listing.sector] ?? listing.sector}
              </span>
              {listing.status === "under_loi" && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  Bajo LOI — proceso avanzado
                </span>
              )}
              {listing.isDemo && (
                <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                  Ejemplo ficticio
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">{listing.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {listing.city ? `${listing.city}, ` : ""}{listing.country}</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {listing.views} vistas</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {listing.interests?.length ?? 0} intereses</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{listing.description}</p>
          </div>

          {/* Key highlights */}
          {listing.highlights?.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Puntos clave de la oportunidad
              </h2>
              <ul className="space-y-2.5">
                {listing.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Deal rationale or use of funds */}
          {(listing.dealRationale || listing.useOfFunds) && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-3">
                {listing.useOfFunds ? "Uso de los fondos" : "Lógica de la fusión"}
              </h2>
              <p className="text-sm text-foreground leading-relaxed">
                {listing.useOfFunds ?? listing.dealRationale}
              </p>
            </div>
          )}

          {/* Tags */}
          {listing.tags?.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              {listing.tags.map(tag => (
                <span key={tag} className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-lg">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">
              Esta información no ha sido verificada por DeepLBO. Realiza tu propia due diligence antes de tomar cualquier decisión de inversión. DeepLBO no actúa como intermediario financiero.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Financial summary */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4 text-sm">Datos financieros</h3>
            <div className="space-y-3">
              {[
                { label: "Revenue LTM", value: `€${listing.revenueM.toFixed(1)}M` },
                { label: "EBITDA LTM", value: `€${listing.ebitdaM.toFixed(1)}M (${ebitdaMargin.toFixed(1)}%)` },
                ...(listing.netDebtM !== undefined ? [{ label: "Deuda neta", value: `€${listing.netDebtM.toFixed(1)}M` }] : []),
                ...(evM ? [{ label: "EV solicitado", value: `€${evM.toFixed(1)}M`, highlight: true }] : []),
                ...(listing.askingMultiple ? [{ label: "EV/EBITDA pedido", value: `${listing.askingMultiple}x`, highlight: true }] : []),
              ].map(({ label, value, highlight }) => (
                <div key={label} className={cn("flex justify-between items-center py-1.5 border-b border-border/40 last:border-0", highlight && "pt-2 border-t-2 border-primary/20 mt-1")}>
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className={cn("text-sm font-bold", highlight ? "text-primary" : "text-foreground")}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Owner info */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
              {listing.anonymous ? <Lock className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
              {listing.anonymous ? "Publicación anónima" : "Propietario"}
            </h3>
            {listing.anonymous ? (
              <p className="text-xs text-muted-foreground">
                El propietario ha elegido mantener su identidad en privado. Al expresar interés, recibirás su información de contacto si decide avanzar.
              </p>
            ) : (
              <div className="space-y-1">
                {listing.ownerName && <p className="text-sm font-medium text-foreground">{listing.ownerName}</p>}
                {listing.ownerFirm && <p className="text-xs text-muted-foreground">{listing.ownerFirm}</p>}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-2">
              Publicado {new Date(listing.createdAt).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* CTA */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-3">
            {!showInterestForm ? (
              <>
                <h3 className="font-semibold text-foreground text-sm">¿Interesado?</h3>
                <p className="text-xs text-muted-foreground">
                  Registra tu interés y el propietario podrá contactarte. Puedes solicitar un NDA antes de recibir más información.
                </p>
                <button
                  onClick={() => setShowInterestForm(true)}
                  className="w-full h-10 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Expresar interés
                </button>
                <p className="text-[10px] text-muted-foreground text-center">
                  {listing.interests?.length ?? 0} {listing.interests?.length === 1 ? "persona ha expresado" : "personas han expresado"} interés
                </p>
              </>
            ) : (
              <InterestForm listingId={listing.id} onDone={() => setShowInterestForm(false)} />
            )}
          </div>

          {/* Related */}
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">¿Tienes una oportunidad?</h3>
            <Link
              href="/hub/new"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Building2 className="w-3.5 h-3.5" />
              Publicar tu empresa en el Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
