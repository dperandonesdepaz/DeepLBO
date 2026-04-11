import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { AppFooter } from "@/components/shared/app-footer"

export const metadata = {
  title: "Aviso Legal | DeepLBO",
  description: "Aviso legal e información sobre el titular de DeepLBO conforme a la LSSI.",
}

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">DeepLBO</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacidad" className="hover:text-foreground transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-foreground transition-colors">Términos</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-border p-8 sm:p-10 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Aviso Legal</h1>
            <p className="text-sm text-muted-foreground">
              En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad
              de la Información y de Comercio Electrónico (LSSI-CE), se informa de los datos identificativos
              del titular de este sitio web.
            </p>
          </div>

          <Section title="1. Datos identificativos del titular">
            <table className="w-full text-sm border-collapse">
              <tbody className="divide-y divide-border">
                {[
                  ["Titular", "Diego Perandones De Paz"],
                  ["NIF", "71207003S"],
                  ["Domicilio", "Calle Tokio 26, 47008 Valladolid, España"],
                  ["Email de contacto", "dperandonesdepaz@gmail.com"],
                  ["Sitio web", "deeplbo.com"],
                  ["Actividad", "Plataforma de análisis financiero para profesionales del M&A y Private Equity"],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-2.5 pr-6 font-medium text-muted-foreground w-44 shrink-0">{k}</td>
                    <td className="py-2.5 text-foreground">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="2. Objeto y ámbito de aplicación">
            <p>
              El presente Aviso Legal regula el acceso y uso del sitio web <strong>DeepLBO</strong>, así como
              los contenidos y servicios disponibles en él. El acceso y la navegación por el sitio implican la
              aceptación expresa de las condiciones recogidas en este Aviso Legal.
            </p>
            <p>
              DeepLBO es una plataforma de análisis financiero profesional orientada a analistas de Private
              Equity, Venture Capital, banca de inversión y profesionales del sector M&A. Ofrece herramientas
              de modelización financiera (LBO, DCF, Fusiones), Deal Hub marketplace y otras utilidades para
              el análisis de inversiones.
            </p>
          </Section>

          <Section title="3. Propiedad intelectual e industrial">
            <p>
              Todos los contenidos del sitio web — incluyendo, sin carácter limitativo, textos, imágenes,
              código fuente, diseño gráfico, logotipos, modelos financieros y estructura — son propiedad de
              <strong> Diego Perandones De Paz</strong> o están debidamente licenciados, y están protegidos
              por la legislación española e internacional sobre propiedad intelectual e industrial.
            </p>
            <p>
              Queda expresamente prohibida la reproducción total o parcial, distribución, comunicación pública
              o transformación de dichos contenidos sin autorización previa y por escrito del titular, salvo
              que la ley lo permita expresamente.
            </p>
            <p>
              El nombre comercial <strong>DeepLBO</strong> y los elementos gráficos asociados son utilizados
              por el titular de este sitio. Cualquier uso no autorizado constituirá una infracción de los
              derechos de propiedad intelectual e industrial.
            </p>
          </Section>

          <Section title="4. Responsabilidad sobre los contenidos">
            <p>
              El titular no se responsabiliza de los daños o perjuicios que pudieran derivarse de la utilización
              de la información contenida en este sitio, de interrupciones del servicio, de fallos técnicos o
              de la presencia de virus u otros elementos dañinos. Asimismo, no garantiza la exactitud o
              actualización de los contenidos publicados.
            </p>
            <p>
              Los análisis financieros generados mediante las herramientas de la plataforma tienen carácter
              meramente informativo y no constituyen asesoramiento financiero, de inversión ni jurídico.
            </p>
          </Section>

          <Section title="5. Política de enlaces">
            <p>
              Este sitio puede contener enlaces a sitios web de terceros. El titular no controla dichos sitios
              ni se responsabiliza de sus contenidos, política de privacidad o prácticas. La inclusión de
              cualquier enlace no implica aprobación ni asociación con el sitio enlazado.
            </p>
          </Section>

          <Section title="6. Protección de datos">
            <p>
              El tratamiento de los datos personales de los usuarios se rige por la{" "}
              <Link href="/privacidad" className="text-primary hover:underline">Política de Privacidad</Link>{" "}
              de este sitio web, conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).
            </p>
          </Section>

          <Section title="7. Legislación aplicable y jurisdicción">
            <p>
              El presente Aviso Legal se rige por la legislación española, en particular por la Ley 34/2002
              de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).
            </p>
            <p>
              Para la resolución de cualquier controversia derivada del acceso o uso de este sitio web,
              las partes se someten a los Juzgados y Tribunales de Valladolid, con renuncia expresa a
              cualquier otro fuero, salvo que la normativa vigente establezca un fuero imperativo distinto.
            </p>
          </Section>

          <Section title="8. Modificaciones">
            <p>
              El titular se reserva el derecho a modificar, en cualquier momento y sin previo aviso, el
              contenido de este Aviso Legal para adaptarlo a novedades legislativas, jurisprudenciales o
              de otra índole. La fecha de la última actualización aparece al pie de este documento.
            </p>
            <p className="text-muted-foreground text-xs mt-2">Última actualización: abril de 2026</p>
          </Section>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">{title}</h2>
      <div className="text-sm text-foreground/80 leading-relaxed space-y-2">{children}</div>
    </section>
  )
}
