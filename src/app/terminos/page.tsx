import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { AppFooter } from "@/components/shared/app-footer"

export const metadata = {
  title: "Términos de Uso | DeepLBO",
  description: "Términos y condiciones de uso de la plataforma DeepLBO.",
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      {/* Nav mínima */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">DeepLBO</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacidad" className="hover:text-foreground transition-colors">Política de privacidad</Link>
            <Link href="/hub" className="hover:text-foreground transition-colors">Deal Hub</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-border p-8 sm:p-10 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Términos y Condiciones de Uso</h1>
            <p className="text-sm text-muted-foreground">Última actualización: abril de 2026</p>
          </div>

          <Section title="1. Identificación del titular">
            <p>
              Estos Términos y Condiciones regulan el acceso y uso de la plataforma <strong>DeepLBO</strong>,
              accesible en <strong>deeplbo.com</strong> (en adelante, "la Plataforma"), titularidad de:
            </p>
            <DataTable rows={[
              ["Razón social", "Diego Perandones De Paz"],
              ["NIF / CIF", "71207003S"],
              ["Domicilio social", "Calle Tokio 26, 47008 Valladolid, España"],
              ["Email de contacto", "dperandonesdepaz@gmail.com"],
            ]} />
            <p className="mt-2">
              El acceso y uso de la Plataforma implica la aceptación plena y sin reservas de estos Términos.
              Si no estás de acuerdo, abstente de utilizar la Plataforma.
            </p>
          </Section>

          <Section title="2. Objeto y descripción del servicio">
            <p>
              DeepLBO es una plataforma de análisis financiero profesional orientada a analistas de Private
              Equity, Venture Capital, banca de inversión y profesionales del M&A. Ofrece las siguientes
              funcionalidades principales:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80 mt-2">
              <li>Modelos LBO (Leveraged Buyout) con análisis de sensibilidad y waterfall de retornos.</li>
              <li>Modelos DCF (Discounted Cash Flow) con múltiples escenarios.</li>
              <li>Análisis de fusiones y adquisiciones (merger model).</li>
              <li>Pipeline de operaciones con seguimiento de procesos M&A.</li>
              <li>Comparativas entre empresas y análisis de múltiplos de mercado.</li>
              <li>Deal Scoring y Due Diligence Tracker.</li>
              <li>Herramientas financieras auxiliares (WACC, IRR/MOIC, EV Bridge, Leverage, Accretion).</li>
              <li>
                <strong>Deal Hub:</strong> marketplace privado donde los usuarios pueden publicar oportunidades
                de inversión, venta, fusión o partnership de forma pública o anónima.
              </li>
            </ul>
            <p className="mt-2">
              La Plataforma opera actualmente en modo local (los datos se almacenan en el navegador del usuario).
              Nos reservamos el derecho a migrar a una infraestructura cloud en el futuro, notificándolo con
              antelación suficiente.
            </p>
          </Section>

          <Section title="3. Registro y acceso">
            <p>
              Algunas funcionalidades de la Plataforma requieren registro previo. Al registrarte, te comprometes a:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80 mt-2">
              <li>Proporcionar información veraz, completa y actualizada.</li>
              <li>Mantener la confidencialidad de tus credenciales de acceso.</li>
              <li>Notificarnos inmediatamente cualquier acceso no autorizado a tu cuenta.</li>
              <li>No ceder ni transferir tu cuenta a terceros.</li>
            </ul>
            <p className="mt-2">
              Nos reservamos el derecho a suspender o cancelar cuentas que incumplan estos Términos, sin necesidad
              de preaviso en casos de uso fraudulento o gravemente incorrecto.
            </p>
          </Section>

          <Section title="4. Uso del Deal Hub">
            <p>
              El Deal Hub es un marketplace privado. Al publicar una oportunidad, declaras y garantizas que:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80 mt-2">
              <li>Tienes autorización para publicar la información facilitada.</li>
              <li>La información es veraz en lo sustancial y no induce a error.</li>
              <li>No estás publicando información privilegiada, confidencial o cuya difusión sea ilegal.</li>
              <li>No utilizarás el Hub para actividades fraudulentas, spam o engaño.</li>
            </ul>
            <p className="mt-2 font-medium text-foreground">Limitación de responsabilidad del Hub:</p>
            <p className="mt-1">
              DeepLBO es únicamente un canal de publicación. <strong>No verifica la exactitud</strong> de los
              datos financieros ni de la información publicada por los usuarios. No actuamos como intermediario
              financiero, asesor de inversiones, broker ni agente de M&A. Toda la información publicada en el
              Hub es exclusivamente responsabilidad de su publicador. Los usuarios interesados deben realizar
              su propia due diligence antes de tomar cualquier decisión de inversión.
            </p>
          </Section>

          <Section title="5. Propiedad intelectual">
            <p>
              Todos los elementos de la Plataforma (diseño, código fuente, modelos financieros, textos, logotipos,
              iconografía) son propiedad de <strong>Diego Perandones De Paz</strong> o están licenciados a su
              favor, y están protegidos por la legislación española e internacional sobre propiedad intelectual
              e industrial.
            </p>
            <p className="mt-2">
              Se concede al usuario una licencia de uso personal, no exclusiva, intransferible y revocable para
              acceder y utilizar la Plataforma. Queda expresamente prohibido:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80 mt-2">
              <li>Reproducir, distribuir o explotar comercialmente cualquier elemento de la Plataforma.</li>
              <li>Realizar ingeniería inversa del código fuente.</li>
              <li>Eliminar o alterar avisos de propiedad intelectual.</li>
              <li>Utilizar la Plataforma para desarrollar productos o servicios competidores.</li>
            </ul>
            <p className="mt-2">
              Los análisis y modelos financieros creados por el usuario a través de la Plataforma son de su
              propiedad exclusiva.
            </p>
          </Section>

          <Section title="6. Limitación de responsabilidad">
            <p>
              DeepLBO proporciona herramientas de análisis financiero con fines informativos y profesionales.
              Las proyecciones, valoraciones y análisis generados por la Plataforma son estimaciones basadas en
              los datos introducidos por el usuario y no constituyen:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80 mt-2">
              <li>Asesoramiento financiero, de inversión o jurídico.</li>
              <li>Recomendaciones de compra, venta o cualquier operación financiera.</li>
              <li>Garantía de resultados futuros.</li>
            </ul>
            <p className="mt-2">
              En la medida máxima permitida por la ley aplicable, <strong>Diego Perandones De Paz</strong> no
              será responsable por daños directos, indirectos, incidentales, especiales o consecuentes derivados
              del uso o imposibilidad de uso de la Plataforma, incluyendo pérdidas económicas o de datos.
            </p>
          </Section>

          <Section title="7. Disponibilidad del servicio">
            <p>
              Nos esforzamos por mantener la Plataforma disponible de forma continua, pero no garantizamos
              disponibilidad ininterrumpida. Podemos realizar labores de mantenimiento, actualizaciones o
              interrupciones del servicio en cualquier momento, notificándolo cuando sea posible.
            </p>
            <p className="mt-2">
              Nos reservamos el derecho a modificar, suspender o discontinuar cualquier funcionalidad de la
              Plataforma con notificación previa razonable.
            </p>
          </Section>

          <Section title="8. Protección de datos">
            <p>
              El tratamiento de tus datos personales se rige por nuestra{" "}
              <Link href="/privacidad" className="text-primary hover:underline">Política de Privacidad</Link>,
              que forma parte integrante de estos Términos.
            </p>
          </Section>

          <Section title="9. Modificaciones de los términos">
            <p>
              Podemos actualizar estos Términos periódicamente para reflejar cambios en el servicio o en la
              normativa aplicable. Te notificaremos los cambios materiales mediante aviso en la Plataforma o
              por email. El uso continuado de la Plataforma tras la notificación implica la aceptación de los
              nuevos Términos.
            </p>
          </Section>

          <Section title="10. Legislación aplicable y jurisdicción">
            <p>
              Estos Términos se rigen por la legislación española. Para cualquier controversia derivada del
              acceso o uso de la Plataforma, las partes se someten, con renuncia expresa a cualquier otro fuero,
              a los Juzgados y Tribunales del domicilio del titular, salvo que la normativa aplicable establezca
              un fuero imperativo diferente en favor del consumidor.
            </p>
          </Section>

          <Section title="11. Contacto">
            <p>Para cualquier consulta sobre estos Términos:</p>
            <DataTable rows={[
              ["Email", "dperandonesdepaz@gmail.com"],
              ["Razón social", "Diego Perandones De Paz"],
              ["Dirección", "Calle Tokio 26, 47008 Valladolid, España"],
            ]} />
          </Section>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">{title}</h2>
      <div className="text-sm text-foreground/80 leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

function DataTable({ rows }: { rows: [string, string][] }) {
  return (
    <table className="mt-3 w-full text-sm border-collapse">
      <tbody className="divide-y divide-border">
        {rows.map(([k, v]) => (
          <tr key={k}>
            <td className="py-2 pr-4 font-medium text-muted-foreground w-40">{k}</td>
            <td className="py-2 text-foreground">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
