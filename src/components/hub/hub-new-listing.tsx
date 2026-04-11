"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useHubStore, type HubListingType, type HubSector } from "@/store/hub-store"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowRight, Check, Info, Lock, Eye, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

const TYPE_OPTIONS: { value: HubListingType; label: string; desc: string }[] = [
  { value: "sale",        label: "Venta de empresa",      desc: "Buscas un comprador para el 100% o mayoría del capital" },
  { value: "investment",  label: "Búsqueda de capital",   desc: "Buscas inversor PE, VC o family office para crecer" },
  { value: "merger",      label: "Fusión / M&A",          desc: "Buscas partner estratégico, fusión o add-on" },
  { value: "partnership", label: "Partnership comercial", desc: "Joint venture, alianza o acuerdo de distribución" },
]

const SECTOR_OPTIONS: { value: HubSector; label: string }[] = [
  { value: "technology",  label: "Tecnología / SaaS" },
  { value: "industrial",  label: "Industrial / Manufactura" },
  { value: "healthcare",  label: "Healthcare / Farmacia" },
  { value: "consumer",    label: "Consumer / Retail" },
  { value: "financial",   label: "Servicios financieros" },
  { value: "real_estate", label: "Real Estate" },
  { value: "energy",      label: "Energía / Utilities" },
  { value: "media",       label: "Media / Publicidad" },
  { value: "logistics",   label: "Logística / Transporte" },
  { value: "education",   label: "Educación" },
  { value: "other",       label: "Otro" },
]

const STEPS = ["Tipo", "Empresa", "Financieros", "Identidad", "Revisión"]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
            i < current ? "bg-primary text-white" :
            i === current ? "bg-primary text-white ring-4 ring-primary/20" :
            "bg-secondary text-muted-foreground"
          )}>
            {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          <span className={cn("text-xs hidden sm:block", i === current ? "font-semibold text-foreground" : "text-muted-foreground")}>
            {label}
          </span>
          {i < STEPS.length - 1 && <div className="w-4 h-px bg-border" />}
        </div>
      ))}
    </div>
  )
}

type FormState = {
  type: HubListingType
  title: string
  sector: HubSector
  country: string
  city: string
  description: string
  highlights: string[]
  useOfFunds: string
  dealRationale: string
  revenueM: string
  ebitdaM: string
  askingMultiple: string
  askingPriceM: string
  netDebtM: string
  anonymous: boolean
  ownerName: string
  ownerFirm: string
  ownerEmail: string
  tags: string
  agreeTerms: boolean
}

const INITIAL: FormState = {
  type: "sale",
  title: "", sector: "industrial", country: "España", city: "",
  description: "",
  highlights: ["", "", ""],
  useOfFunds: "", dealRationale: "",
  revenueM: "", ebitdaM: "", askingMultiple: "", askingPriceM: "", netDebtM: "",
  anonymous: false,
  ownerName: "", ownerFirm: "", ownerEmail: "",
  tags: "",
  agreeTerms: false,
}

export function HubNewListing() {
  const router = useRouter()
  const { createListing } = useHubStore()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INITIAL)
  const [saving, setSaving] = useState(false)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(p => ({ ...p, [key]: value }))
  }

  function setHighlight(i: number, value: string) {
    const next = [...form.highlights]
    next[i] = value
    set("highlights", next)
  }

  function validate(s: number): string | null {
    if (s === 0 && !form.type) return "Selecciona el tipo de operación"
    if (s === 1) {
      if (!form.title.trim()) return "El título es obligatorio"
      if (!form.description.trim() || form.description.length < 50) return "La descripción debe tener al menos 50 caracteres"
    }
    if (s === 2) {
      if (!form.revenueM || parseFloat(form.revenueM) <= 0) return "Introduce el revenue de la empresa"
      if (!form.ebitdaM) return "Introduce el EBITDA"
    }
    if (s === 3) {
      if (!form.ownerEmail.includes("@")) return "Email de contacto obligatorio"
      if (!form.anonymous && !form.ownerName.trim()) return "Introduce tu nombre o el nombre de la empresa"
    }
    return null
  }

  function next() {
    const err = validate(step)
    if (err) { toast.error(err); return }
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    if (!form.agreeTerms) { toast.error("Debes aceptar las condiciones de uso"); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))

    const id = createListing({
      title: form.title.trim(),
      type: form.type,
      sector: form.sector,
      country: form.country,
      city: form.city || undefined,
      revenueM: parseFloat(form.revenueM) || 0,
      ebitdaM: parseFloat(form.ebitdaM) || 0,
      askingMultiple: form.askingMultiple ? parseFloat(form.askingMultiple) : undefined,
      askingPriceM: form.askingPriceM ? parseFloat(form.askingPriceM) : undefined,
      netDebtM: form.netDebtM ? parseFloat(form.netDebtM) : undefined,
      description: form.description.trim(),
      highlights: form.highlights.filter(h => h.trim()),
      useOfFunds: form.useOfFunds.trim() || undefined,
      dealRationale: form.dealRationale.trim() || undefined,
      anonymous: form.anonymous,
      ownerName: form.anonymous ? undefined : form.ownerName.trim() || undefined,
      ownerFirm: form.anonymous ? undefined : form.ownerFirm.trim() || undefined,
      ownerEmail: form.ownerEmail.trim(),
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    })

    setSaving(false)
    toast.success("Oportunidad publicada en el Hub")
    router.push(`/hub/${id}`)
  }

  const stepContent = [
    // Step 0: Type
    <div key="type" className="space-y-3">
      <h2 className="text-base font-bold text-foreground">¿Qué tipo de operación buscas?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TYPE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => set("type", opt.value)}
            className={cn(
              "text-left p-4 rounded-xl border-2 transition-all",
              form.type === opt.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/30"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("w-3 h-3 rounded-full", form.type === opt.value ? "bg-primary" : "bg-border")} />
              <span className={cn("font-semibold text-sm", form.type === opt.value ? "text-primary" : "text-foreground")}>
                {opt.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pl-5">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>,

    // Step 1: Company info
    <div key="company" className="space-y-4">
      <h2 className="text-base font-bold text-foreground">Información de la empresa</h2>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Título del anuncio *</label>
        <p className="text-[11px] text-muted-foreground">Debe ser descriptivo pero no revelar el nombre de la empresa si vas a publicar anónimamente.</p>
        <input value={form.title} onChange={e => set("title", e.target.value)}
          placeholder="Ej: SaaS B2B de gestión logística para sector aeroespacial — venta por sucesión"
          className="w-full h-10 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Sector *</label>
          <select value={form.sector} onChange={e => set("sector", e.target.value as HubSector)}
            className="w-full h-10 px-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
            {SECTOR_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">País *</label>
          <input value={form.country} onChange={e => set("country", e.target.value)}
            className="w-full h-10 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1 col-span-2">
          <label className="text-xs font-medium text-foreground">Ciudad (opcional)</label>
          <input value={form.city} onChange={e => set("city", e.target.value)}
            placeholder="Madrid, Barcelona, Bilbao..."
            className="w-full h-10 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Descripción del negocio y la oportunidad *</label>
        <p className="text-[11px] text-muted-foreground">Mínimo 50 caracteres. Explica qué hace la empresa, por qué se vende/busca inversión y qué hace especial la oportunidad.</p>
        <textarea value={form.description} onChange={e => set("description", e.target.value)}
          rows={5} placeholder="Empresa fundada en... con X años de histórico, dedicada a... Buscamos..."
          className="w-full px-3 py-2 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <p className="text-[10px] text-muted-foreground text-right">{form.description.length}/50 min</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Puntos clave (hasta 5 highlights)</label>
        {form.highlights.map((h, i) => (
          <div key={i} className="flex gap-2">
            <input value={h} onChange={e => setHighlight(i, e.target.value)}
              placeholder={`Punto clave ${i + 1}...`}
              className="flex-1 h-9 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20" />
            {i === form.highlights.length - 1 && form.highlights.length < 5 ? (
              <button type="button" onClick={() => set("highlights", [...form.highlights, ""])}
                className="w-9 h-9 border border-border rounded-lg hover:bg-secondary flex items-center justify-center">
                <Plus className="w-4 h-4 text-muted-foreground" />
              </button>
            ) : i > 0 ? (
              <button type="button"
                onClick={() => set("highlights", form.highlights.filter((_, j) => j !== i))}
                className="w-9 h-9 border border-red-200 text-red-400 rounded-lg hover:bg-red-50 flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            ) : <div className="w-9" />}
          </div>
        ))}
      </div>
      {form.type === "investment" && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Uso de los fondos</label>
          <textarea value={form.useOfFunds} onChange={e => set("useOfFunds", e.target.value)}
            rows={3} placeholder="¿Para qué necesitas el capital? Expansión geográfica, M&A add-on, capex..."
            className="w-full px-3 py-2 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary/20" />
        </div>
      )}
      {form.type === "merger" && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Lógica de la fusión / sinergias buscadas</label>
          <textarea value={form.dealRationale} onChange={e => set("dealRationale", e.target.value)}
            rows={3} placeholder="Qué tipo de partner buscas y qué sinergias esperas conseguir..."
            className="w-full px-3 py-2 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary/20" />
        </div>
      )}
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Tags (separados por coma)</label>
        <input value={form.tags} onChange={e => set("tags", e.target.value)}
          placeholder="SaaS, B2B, Aeroespacial, Recurrente, España"
          className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20" />
      </div>
    </div>,

    // Step 2: Financials
    <div key="financials" className="space-y-4">
      <h2 className="text-base font-bold text-foreground">Datos financieros</h2>
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800">
          Los datos financieros son cruciales para que compradores e inversores puedan evaluar la oportunidad. Puedes aproximar si no tienes las cifras exactas.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Revenue LTM (€M) *", key: "revenueM", placeholder: "Ej: 8.5" },
          { label: "EBITDA LTM (€M) *", key: "ebitdaM", placeholder: "Ej: 2.1" },
          { label: "Deuda neta (€M)", key: "netDebtM", placeholder: "Ej: 1.2 (o 0 si sin deuda)" },
          { label: "EV/EBITDA solicitado (x)", key: "askingMultiple", placeholder: "Ej: 9.5x" },
          { label: "Precio EV solicitado (€M)", key: "askingPriceM", placeholder: "O introduce múltiplo" },
        ].map(({ label, key, placeholder }) => (
          <div key={key} className="space-y-1">
            <label className="text-xs font-medium text-foreground">{label}</label>
            <input
              type="number"
              value={form[key as keyof FormState] as string}
              onChange={e => set(key as keyof FormState, e.target.value)}
              placeholder={placeholder}
              step="0.1" min="0"
              className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        ))}
      </div>
      {form.ebitdaM && form.revenueM && parseFloat(form.revenueM) > 0 && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-primary font-medium">
            Margen EBITDA: {((parseFloat(form.ebitdaM) / parseFloat(form.revenueM)) * 100).toFixed(1)}%
            {form.askingMultiple && ` · EV implicado: €${(parseFloat(form.askingMultiple) * parseFloat(form.ebitdaM)).toFixed(1)}M`}
          </p>
        </div>
      )}
    </div>,

    // Step 3: Identity
    <div key="identity" className="space-y-4">
      <h2 className="text-base font-bold text-foreground">Identidad y contacto</h2>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => set("anonymous", false)}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
            !form.anonymous ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
          )}
        >
          <Eye className={cn("w-6 h-6", !form.anonymous ? "text-primary" : "text-muted-foreground")} />
          <span className={cn("font-semibold text-sm", !form.anonymous ? "text-primary" : "text-foreground")}>Visible</span>
          <p className="text-[11px] text-muted-foreground text-center">Tu nombre y empresa aparecen en el anuncio</p>
        </button>
        <button
          type="button"
          onClick={() => set("anonymous", true)}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
            form.anonymous ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
          )}
        >
          <Lock className={cn("w-6 h-6", form.anonymous ? "text-primary" : "text-muted-foreground")} />
          <span className={cn("font-semibold text-sm", form.anonymous ? "text-primary" : "text-foreground")}>Anónimo</span>
          <p className="text-[11px] text-muted-foreground text-center">Tu identidad permanece oculta hasta que decides avanzar</p>
        </button>
      </div>

      {!form.anonymous && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Tu nombre / empresa *</label>
            <input value={form.ownerName} onChange={e => set("ownerName", e.target.value)}
              placeholder="Carlos García / Acme Capital"
              className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Firma / empresa (opcional)</label>
            <input value={form.ownerFirm} onChange={e => set("ownerFirm", e.target.value)}
              placeholder="Acme Capital Partners"
              className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20" />
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Email de contacto * (nunca mostrado públicamente)</label>
        <input type="email" value={form.ownerEmail} onChange={e => set("ownerEmail", e.target.value)}
          placeholder="tu@email.com"
          className="w-full h-9 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <p className="text-[10px] text-muted-foreground">Tu email nunca se muestra públicamente. Solo se comparte cuando expresamente lo apruebes.</p>
      </div>
    </div>,

    // Step 4: Review
    <div key="review" className="space-y-4">
      <h2 className="text-base font-bold text-foreground">Revisión final</h2>
      <div className="bg-white rounded-xl border border-border p-5 space-y-3">
        {[
          { label: "Tipo", value: TYPE_OPTIONS.find(t => t.value === form.type)?.label },
          { label: "Título", value: form.title },
          { label: "Sector", value: SECTOR_OPTIONS.find(s => s.value === form.sector)?.label },
          { label: "Ubicación", value: [form.city, form.country].filter(Boolean).join(", ") },
          { label: "Revenue", value: form.revenueM ? `€${form.revenueM}M` : "—" },
          { label: "EBITDA", value: form.ebitdaM ? `€${form.ebitdaM}M` : "—" },
          { label: "Identidad", value: form.anonymous ? "Anónima" : (form.ownerName || "Visible") },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm border-b border-border/30 pb-2 last:border-0 last:pb-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground truncate max-w-[60%] text-right">{value}</span>
          </div>
        ))}
      </div>

      <div className="p-4 bg-secondary/50 rounded-xl text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground">Condiciones de publicación</p>
        <p>• La información publicada es responsabilidad exclusiva del autor.</p>
        <p>• DeepLBO no verifica, no intermedia ni asesora sobre las operaciones.</p>
        <p>• Puedes retirar o cerrar el anuncio en cualquier momento desde tu perfil.</p>
        <p>• No publiques información confidencial que no debas revelar (NDA, datos regulados).</p>
      </div>

      <label className="flex items-start gap-2 cursor-pointer">
        <input type="checkbox" checked={form.agreeTerms} onChange={e => set("agreeTerms", e.target.checked)}
          className="mt-0.5 accent-primary w-4 h-4" />
        <span className="text-sm text-foreground">
          He leído y acepto las condiciones de publicación del Deal Hub
        </span>
      </label>
    </div>,
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/hub" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Publicar oportunidad</h1>
          <p className="text-sm text-muted-foreground">El Hub conecta empresas con inversores, compradores y socios estratégicos</p>
        </div>
      </div>

      <StepIndicator current={step} />

      <div className="bg-white rounded-xl border border-border p-6">
        {stepContent[step]}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => step > 0 ? setStep(s => s - 1) : router.push("/hub")}
          className="inline-flex items-center gap-1.5 h-10 px-4 border border-border text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {step === 0 ? "Cancelar" : "Anterior"}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1.5 h-10 px-5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Siguiente <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !form.agreeTerms}
            className="inline-flex items-center gap-1.5 h-10 px-5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publicando...</>
            ) : (
              <><Check className="w-4 h-4" /> Publicar en el Hub</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
