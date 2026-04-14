import Link from "next/link"
import {
  ArrowRight, BarChart3, Calculator, Download, Lock, TrendingUp, Zap, CheckCircle2,
  Users, ClipboardList, Star, Building2, Globe, Eye,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground text-lg tracking-tight">DeepLBO</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Funcionalidades</Link>
            <Link href="#tools" className="hover:text-foreground transition-colors">Herramientas</Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link>
            <Link href="/demo" className="hover:text-foreground transition-colors font-medium text-primary">Ver demo</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Iniciar sesión
            </Link>
            <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
              Empezar gratis <ArrowRight className="ml-1 w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="hero-gradient text-white pt-24 pb-32 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <Badge className="mb-6 bg-white/15 text-white border-white/25 hover:bg-white/20 text-xs px-3 py-1">
              Plataforma M&A completa para analistas PE/VC — gratis
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              LBO · DCF · Fusiones M&A<br />
              <span className="text-blue-300">en tiempo real</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100/90 max-w-2xl mx-auto mb-10 leading-relaxed">
              La plataforma de análisis financiero de private equity más completa en español.
              LBO, DCF, Accretion/Dilution, Comps, Deal Scoring, Due Diligence y Deal Hub — todo en un lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "bg-white text-primary hover:bg-blue-50 font-semibold px-8 shadow-lg")}>
                Crear cuenta gratis <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link href="/demo" className="inline-flex items-center justify-center h-11 px-8 rounded-lg border border-white/30 text-white text-sm font-medium transition-all hover:bg-white/10">
                <Eye className="mr-2 w-4 h-4" /> Ver demo
              </Link>
            </div>
            <p className="mt-5 text-blue-200/70 text-sm">Sin tarjeta de crédito · Acceso inmediato · Todo gratis</p>
          </div>

          {/* Dashboard mockup */}
          <div className="max-w-4xl mx-auto mt-16 relative z-10">
            <div className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl">
              <div className="bg-white/10 border-b border-white/10 px-4 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                <span className="ml-3 text-white/50 text-xs font-mono">DeepLBO — Target Company S.L. — LBO Analysis</span>
              </div>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Enterprise Value", value: "€40.0M", sub: "10.0x EBITDA" },
                  { label: "IRR (Base)", value: "47.3%", sub: "5 años hold" },
                  { label: "MOIC (Base)", value: "7.3x", sub: "Caso base" },
                  { label: "Deuda / EBITDA", value: "4.5x", sub: "Entrada" },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="bg-white/10 rounded-lg p-3 border border-white/10">
                    <p className="text-blue-200/70 text-xs mb-1">{label}</p>
                    <p className="text-white font-bold text-xl">{value}</p>
                    <p className="text-blue-200/50 text-xs mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Module strip ──────────────────────────────────────────────── */}
        <section className="py-12 px-4 bg-white border-b border-border">
          <div className="max-w-6xl mx-auto">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
              Módulos incluidos
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {modules.map(({ label, color, bg, desc }) => (
                <div key={label} className="text-center">
                  <div className={`w-12 h-12 ${bg} rounded-xl mx-auto mb-2 flex items-center justify-center`}>
                    <span className={`text-sm font-bold ${color}`}>{label.split(" ")[0]}</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────────────── */}
        <section id="features" className="py-24 px-4 bg-secondary/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4 text-primary">Funcionalidades</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Todo lo que necesita un analista PE/M&A
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Construido por y para analistas de buy-side. Sin hojas de cálculo, sin errores de fórmula.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, description, highlight }) => (
                <div key={title}
                  className={`card-hover rounded-xl border p-6 ${highlight
                    ? "bg-primary border-primary/20 text-white"
                    : "bg-white border-border hover:border-primary/30"}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${highlight ? "bg-white/20" : "bg-primary/10"}`}>
                    <Icon className={`w-5 h-5 ${highlight ? "text-white" : "text-primary"}`} />
                  </div>
                  <h3 className={`font-semibold text-base mb-2 ${highlight ? "text-white" : "text-foreground"}`}>{title}</h3>
                  <p className={`text-sm leading-relaxed ${highlight ? "text-blue-100" : "text-muted-foreground"}`}>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tools section ─────────────────────────────────────────────── */}
        <section id="tools" className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="secondary" className="mb-4 text-primary">Herramientas rápidas</Badge>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Calcula sin abrir un Excel
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  IRR/MOIC con distribuciones intermedias, WACC completo (CAPM), EV→Equity bridge,
                  análisis de apalancamiento y Accretion/Dilution express — todo en herramientas instantáneas.
                </p>
                <Link href="/login" className={cn(buttonVariants(), "gap-2")}>
                  Abrir herramientas <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "IRR / MOIC", color: "bg-blue-500", desc: "Con distribuciones intermedias (XIRR)" },
                  { label: "WACC CAPM", color: "bg-purple-500", desc: "Ke + Kd after-tax, betas sectoriales" },
                  { label: "EV Bridge", color: "bg-emerald-500", desc: "EV → Equity con todos los ajustes" },
                  { label: "Leverage", color: "bg-orange-500", desc: "Deuda/EBITDA · ICR · DSCR · Debt/FCF" },
                ].map(({ label, color, desc }) => (
                  <div key={label} className="bg-secondary/50 rounded-xl p-4 border border-border">
                    <div className={`w-8 h-8 ${color} rounded-lg mb-2`} />
                    <p className="font-semibold text-sm text-foreground">{label}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Hub section ───────────────────────────────────────────────── */}
        <section id="hub" className="py-20 px-4 bg-gradient-to-br from-primary/5 to-primary/10 border-y border-primary/10">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="space-y-3">
                  {[
                    { label: "Software SaaS aeroespacial", type: "Venta", ev: "€93.5M", sector: "Tecnología" },
                    { label: "Clínica dental roll-up x4", type: "Capital", ev: "€13.3M", sector: "Healthcare" },
                    { label: "Mecanizado precisión familiar", type: "Venta", ev: "€27.9M", sector: "Industrial" },
                  ].map(item => (
                    <div key={item.label} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.sector}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{item.type}</span>
                        <p className="text-xs font-bold text-foreground mt-1">{item.ev}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <Badge variant="secondary" className="mb-4 text-primary">Deal Hub</Badge>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Marketplace privado de M&A
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Publica oportunidades de venta, búsqueda de capital o fusión — visibles o anónimas.
                  Compradores, fondos PE/VC y bancos de inversión pueden expresar interés y solicitar NDA.
                </p>
                <ul className="space-y-2 mb-6">
                  {["Publica anónimamente o con tu identidad", "Control total sobre quién te contacta", "NDA antes de revelar información", "Sin intermediarios, sin comisiones"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/demo" className={cn(buttonVariants(), "gap-2")}>
                  <Eye className="w-4 h-4" /> Ver demo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────────── */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4 text-primary">Proceso</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Tres pasos, análisis completo
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {steps.map(({ step, title, description }) => (
                <div key={step} className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-xl mb-5 shadow-lg shadow-primary/20">
                    {step}
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Metrics ───────────────────────────────────────────────────── */}
        <section className="py-16 px-4 bg-secondary/30 border-y border-border">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {metrics.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-primary mb-1">{value}</p>
                <p className="text-muted-foreground text-sm">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section id="faq" className="py-24 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4 text-primary">FAQ</Badge>
              <h2 className="text-3xl font-bold text-foreground">Preguntas frecuentes</h2>
            </div>
            <div className="space-y-4">
              {faqs.map(({ q, a }) => (
                <div key={q} className="bg-white rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-2 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />{q}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed pl-6">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA final ─────────────────────────────────────────────────── */}
        <section className="hero-gradient text-white py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Tu plataforma M&A, lista en 30 segundos</h2>
            <p className="text-blue-100/80 text-lg mb-8">Gratis, sin límites, sin tarjeta de crédito.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "bg-white text-primary hover:bg-blue-50 font-semibold px-10 shadow-lg")}>
                Crear cuenta gratis <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link href="/demo" className="inline-flex items-center justify-center h-11 px-8 rounded-lg border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-all gap-2">
                <Eye className="w-4 h-4" /> Ver demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-foreground text-white/60 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <BarChart3 className="w-3 h-3 text-white" />
            </div>
            <span className="text-white font-medium text-sm">DeepLBO</span>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} DeepLBO · Plataforma M&A para analistas PE/VC</p>
          <div className="flex gap-4 text-xs">
            <Link href="/aviso-legal" className="hover:text-white transition-colors">Aviso Legal</Link>
            <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-white transition-colors">Términos</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

const modules = [
  { label: "LBO",           color: "text-blue-600",   bg: "bg-blue-100",   desc: "10 secciones" },
  { label: "DCF",           color: "text-emerald-600", bg: "bg-emerald-100",desc: "6 secciones" },
  { label: "Fusiones A/D",  color: "text-purple-600", bg: "bg-purple-100", desc: "6 secciones" },
  { label: "Deal Score",    color: "text-amber-600",   bg: "bg-amber-100",  desc: "10 criterios" },
  { label: "Due Diligence", color: "text-rose-600",    bg: "bg-rose-100",   desc: "9 categorías" },
  { label: "Deal Hub",      color: "text-indigo-600",  bg: "bg-indigo-100", desc: "Marketplace" },
]

const features = [
  { icon: Zap,           title: "Cálculo en tiempo real",     highlight: true,
    description: "Cada cambio en los inputs actualiza instantáneamente todos los resultados, análisis de sensibilidad incluidos." },
  { icon: BarChart3,     title: "LBO completo — 10 secciones",highlight: false,
    description: "Overview, Company, Entry, P&L, Debt Schedule, Returns, Sensitivity, Comps, Deal Scoring y Due Diligence." },
  { icon: TrendingUp,    title: "DCF con WACC y sensibilidad", highlight: false,
    description: "CAPM completo, 5 años de FCFs, Terminal Value (Gordon/Exit Multiple), tabla de sensibilidad WACC×TGR." },
  { icon: Calculator,    title: "Fusiones M&A — Accretion/Dilution", highlight: false,
    description: "Modelo A/D completo: mix efectivo/acciones, sinergias 3 fases, EPS bridge yr1/yr2/full synergies." },
  { icon: ClipboardList, title: "Due Diligence Tracker",       highlight: false,
    description: "47 ítems en 9 categorías (Financial, Legal, Tax, Commercial, IT, HR, ESG...). Status, notas, responsable." },
  { icon: Star,          title: "Deal Scoring IC",             highlight: false,
    description: "10 criterios ponderados con spider chart. Recomendación automática para Investment Committee." },
  { icon: Users,         title: "Workspaces de equipo",        highlight: false,
    description: "Crea tu equipo, invita miembros via link y gestiona el acceso a los análisis del departamento." },
  { icon: Globe,         title: "Deal Hub marketplace",        highlight: false,
    description: "Publica oportunidades de venta o inversión — visibles o anónimas. Recibe intereses de compradores y fondos." },
  { icon: Download,      title: "Export PowerPoint profesional",highlight: false,
    description: "6 slides navy/gold listos para el IC. Export Excel y PDF próximamente." },
]

const steps = [
  { step: "1", title: "Crea tu cuenta",       description: "Registro en 30 segundos. Crea tu workspace de equipo o trabaja individualmente." },
  { step: "2", title: "Elige tu análisis",    description: "LBO, DCF o Fusión. Introduce los datos financieros y obtén resultados al instante." },
  { step: "3", title: "Analiza y presenta",   description: "Deal Scoring, DD checklist, y exporta a PowerPoint listo para el Investment Committee." },
]

const metrics = [
  { value: "3",    label: "Tipos de análisis" },
  { value: "47",   label: "Puntos de DD" },
  { value: "10",   label: "Criterios de scoring" },
  { value: "< 1s", label: "Tiempo de cálculo" },
]

const faqs = [
  { q: "¿Es gratis?",
    a: "Sí, completamente gratis. Crea tu cuenta, realiza todos los análisis LBO, DCF y Fusiones que quieras, usa el Deal Hub y las herramientas sin coste." },
  { q: "¿Para quién es DeepLBO?",
    a: "Para analistas de PE/VC, M&A advisors, directivos financieros, fundadores que buscan valorar su empresa e inversores que evalúan oportunidades." },
  { q: "¿Qué precisión tiene el cálculo de IRR?",
    a: "La IRR se aproxima con MOIC^(1/años)-1 sin distribuciones intermedias. Con distribuciones usa XIRR (Newton-Raphson). Para IRR exacta con covenants, exporta el Excel." },
  { q: "¿Cómo funciona el Deal Hub?",
    a: "Cualquier usuario puede publicar su empresa o búsqueda de capital. Puedes elegir publicar anónimamente. Los compradores e inversores expresan interés y puedes solicitar NDA antes de revelar información adicional." },
  { q: "¿Puedo usar DeepLBO con mi equipo?",
    a: "Sí. Crea un workspace, genera un link de invitación y tus colegas se unen con un click. El admin ve todos los análisis del equipo desde el panel de administración." },
  { q: "¿Mis datos son privados?",
    a: "Sí. Los análisis son privados y solo tú y tu equipo tienen acceso. El Deal Hub tiene controles de privacidad propios: puedes publicar anónimamente." },
]
