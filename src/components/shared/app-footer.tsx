import Link from "next/link"
import { BarChart3 } from "lucide-react"

export function AppFooter() {
  return (
    <footer className="bg-foreground text-white/60 py-6 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
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
  )
}
