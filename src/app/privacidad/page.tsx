import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { AppFooter } from "@/components/shared/app-footer"

export const metadata = {
  title: "Política de Privacidad | DeepLBO",
  description: "Política de privacidad y tratamiento de datos personales de DeepLBO.",
}

export default function PrivacidadPage() {
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
            <Link href="/terminos" className="hover:text-foreground transition-colors">Términos de uso</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Iniciar sesión</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-border p-8 sm:p-10 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Política de Privacidad</h1>
            <p className="text-sm text-muted-foreground">Última actualización: abril de 2026</p>
          </div>

          <Section title="1. Responsable del tratamiento">
            <p>
              En cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo (RGPD) y la Ley
              Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD),
              te informamos que el responsable del tratamiento de tus datos personales es:
            </p>
            <DataTable rows={[
              ["Razón social", "Diego Perandones De Paz"],
              ["NIF / CIF", "71207003S"],
              ["Domicilio social", "Calle Tokio 26, 47008 Valladolid, España"],
              ["Email de contacto", "dperandonesdepaz@gmail.com"],
              ["Sitio web", "deeplbo.com"],
            ]} />
          </Section>

          <Section title="2. Datos que recopilamos">
            <p>Recopilamos los siguientes datos personales en función de cómo utilices la plataforma:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80">
              <li><strong>Datos de registro:</strong> nombre, dirección de correo electrónico, empresa o firma profesional.</li>
              <li><strong>Datos de uso:</strong> análisis financieros creados, configuraciones de workspace, accesos a la plataforma (almacenados localmente en tu navegador mediante <code>localStorage</code>).</li>
              <li><strong>Datos del Deal Hub:</strong> información de oportunidades publicadas, mensajes de expresión de interés, dirección de email del publicador.</li>
              <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador, sistema operativo, páginas visitadas y tiempos de acceso (logs del servidor).</li>
              <li><strong>Cookies:</strong> ver la sección 7 de esta política.</li>
            </ul>
          </Section>

          <Section title="3. Finalidad y base jurídica del tratamiento">
            <p>Tratamos tus datos para las siguientes finalidades:</p>
            <table className="w-full text-sm border-collapse mt-3">
              <thead>
                <tr className="bg-secondary text-left">
                  <th className="px-3 py-2 font-semibold text-foreground rounded-tl-lg">Finalidad</th>
                  <th className="px-3 py-2 font-semibold text-foreground rounded-tr-lg">Base jurídica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["Prestación del servicio (análisis LBO, DCF, M&A)", "Ejecución del contrato (art. 6.1.b RGPD)"],
                  ["Gestión del Deal Hub y publicación de oportunidades", "Ejecución del contrato (art. 6.1.b RGPD)"],
                  ["Comunicaciones del servicio (cambios, incidencias)", "Interés legítimo (art. 6.1.f RGPD)"],
                  ["Análisis estadístico y mejora de la plataforma", "Interés legítimo (art. 6.1.f RGPD)"],
                  ["Envío de comunicaciones comerciales (si lo has aceptado)", "Consentimiento (art. 6.1.a RGPD)"],
                  ["Cumplimiento de obligaciones legales", "Obligación legal (art. 6.1.c RGPD)"],
                ].map(([fin, base]) => (
                  <tr key={fin}>
                    <td className="px-3 py-2 text-foreground/80">{fin}</td>
                    <td className="px-3 py-2 text-muted-foreground">{base}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="4. Destinatarios y transferencias internacionales">
            <p>
              No cedemos tus datos a terceros con fines comerciales. Podemos compartirlos con encargados del
              tratamiento que prestan servicios técnicos necesarios para el funcionamiento de la plataforma
              (hosting, infraestructura cloud, análisis de rendimiento), siempre bajo un acuerdo de encargo de
              tratamiento conforme al RGPD.
            </p>
            <p className="mt-2">
              Algunos proveedores pueden estar ubicados fuera del Espacio Económico Europeo. En tal caso,
              nos aseguramos de que existan garantías adecuadas (cláusulas contractuales tipo aprobadas por la
              Comisión Europea, decisiones de adecuación, etc.).
            </p>
          </Section>

          <Section title="5. Plazos de conservación">
            <p>Conservamos tus datos durante el tiempo necesario para la prestación del servicio y durante los
              plazos legales aplicables:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80 mt-2">
              <li>Datos de cuenta: mientras la cuenta esté activa y hasta <strong>5 años</strong> tras su baja para atender reclamaciones.</li>
              <li>Datos del Deal Hub: mientras el anuncio esté activo y hasta <strong>2 años</strong> tras su cierre.</li>
              <li>Datos de facturación: <strong>6 años</strong> conforme al Código de Comercio.</li>
              <li>Logs técnicos: máximo <strong>12 meses</strong>.</li>
            </ul>
          </Section>

          <Section title="6. Tus derechos">
            <p>Como titular de los datos, puedes ejercer los siguientes derechos:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80 mt-2">
              <li><strong>Acceso:</strong> conocer qué datos tratamos sobre ti.</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
              <li><strong>Supresión ("derecho al olvido"):</strong> solicitar la eliminación de tus datos.</li>
              <li><strong>Limitación:</strong> restringir el tratamiento en determinadas circunstancias.</li>
              <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado y legible por máquina.</li>
              <li><strong>Oposición:</strong> oponerte al tratamiento basado en interés legítimo.</li>
              <li><strong>Retirada del consentimiento</strong> en cualquier momento, sin afectar a la licitud del tratamiento previo.</li>
            </ul>
            <p className="mt-3">
              Para ejercer cualquiera de estos derechos, envía un email a <strong>dperandonesdepaz@gmail.com</strong> con asunto
              "Ejercicio de derechos RGPD", adjuntando copia de tu documento de identidad. Te responderemos en
              el plazo máximo de <strong>1 mes</strong> (prorrogable 2 meses en casos complejos).
            </p>
            <p className="mt-2">
              Si consideras que el tratamiento no es conforme a la normativa, puedes presentar una reclamación
              ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong> en{" "}
              <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer"
                className="text-primary hover:underline">www.aepd.es</a>.
            </p>
          </Section>

          <Section title="7. Cookies y tecnologías similares">
            <p>DeepLBO utiliza las siguientes tecnologías de almacenamiento local:</p>
            <table className="w-full text-sm border-collapse mt-3">
              <thead>
                <tr className="bg-secondary text-left">
                  <th className="px-3 py-2 font-semibold text-foreground rounded-tl-lg">Tecnología</th>
                  <th className="px-3 py-2 font-semibold text-foreground">Nombre / Clave</th>
                  <th className="px-3 py-2 font-semibold text-foreground rounded-tr-lg">Finalidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["localStorage", "deeplbo_analyses", "Almacenamiento local de análisis financieros LBO"],
                  ["localStorage", "deeplbo_hub_listings", "Listados del Deal Hub (datos locales)"],
                  ["localStorage", "deeplbo_workspace_*", "Configuración de workspace y perfil"],
                  ["sessionStorage", "deeplbo_jump_section", "Navegación interna entre secciones"],
                ].map(([tipo, clave, fin]) => (
                  <tr key={clave}>
                    <td className="px-3 py-2 text-muted-foreground">{tipo}</td>
                    <td className="px-3 py-2 font-mono text-xs text-foreground/80">{clave}</td>
                    <td className="px-3 py-2 text-foreground/80">{fin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-sm text-muted-foreground">
              Estos datos se almacenan exclusivamente en tu dispositivo y no se transmiten a nuestros servidores
              mientras la plataforma opera en modo local. Puedes eliminarlos desde la configuración de tu navegador
              o desde Ajustes → Borrar todos mis análisis dentro de la plataforma.
            </p>
          </Section>

          <Section title="8. Seguridad">
            <p>
              Aplicamos medidas técnicas y organizativas apropiadas para proteger tus datos personales frente a
              accesos no autorizados, pérdida accidental, destrucción o alteración. Entre ellas: cifrado en
              tránsito (HTTPS/TLS), control de acceso por roles, revisiones periódicas de seguridad y
              copias de seguridad regulares.
            </p>
            <p className="mt-2">
              No obstante, ningún sistema de transmisión por Internet es 100% seguro. Si detectas alguna
              vulnerabilidad, notifícalo responsablemente a <strong>dperandonesdepaz@gmail.com</strong>.
            </p>
          </Section>

          <Section title="9. Menores de edad">
            <p>
              DeepLBO es una plataforma profesional dirigida a analistas financieros, fondos de inversión y
              profesionales del M&A. No está destinada a menores de 18 años ni recopilamos conscientemente
              datos de menores. Si detectas que un menor ha facilitado datos, contacta con nosotros para
              proceder a su eliminación inmediata.
            </p>
          </Section>

          <Section title="10. Modificaciones de esta política">
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos los cambios
              materiales mediante un aviso en la plataforma o por email. La fecha de "Última actualización"
              al inicio de este documento refleja siempre la versión vigente.
            </p>
          </Section>

          <Section title="11. Contacto">
            <p>
              Para cualquier consulta sobre esta Política de Privacidad o sobre el tratamiento de tus datos:
            </p>
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
