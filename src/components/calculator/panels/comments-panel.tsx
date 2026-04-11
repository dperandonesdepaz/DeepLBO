"use client"

import { useEffect, useState } from "react"
import { MessageSquare, X, Send, Check, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { useCommentsStore } from "@/store/comments-store"
import { useAnalysisStore } from "@/store/analysis-store"
import { cn } from "@/lib/utils"

const SECTION_LABELS: Record<string, string> = {
  general: "General", overview: "Resumen", company: "Empresa",
  entry: "Entrada", pl: "P&L y FCF", debt: "Deuda",
  returns: "Retornos", sensitivity: "Sensibilidad",
}
const SECTIONS = Object.keys(SECTION_LABELS)

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min  = Math.floor(diff / 60000)
  const hrs  = Math.floor(min / 60)
  if (hrs > 0) return `hace ${hrs}h`
  if (min > 0) return `hace ${min}m`
  return "ahora"
}

export function CommentsPanel({ onClose }: { onClose: () => void }) {
  const { analysisId, activeSection } = useAnalysisStore()
  const { comments, init, addComment, addReply, resolveComment, deleteComment, authorName, setAuthorName } = useCommentsStore()
  const [text, setText] = useState("")
  const [section, setSection] = useState(activeSection ?? "general")
  const [filterSection, setFilterSection] = useState("all")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  useEffect(() => { init() }, [init])

  const analysisComments = comments
    .filter(c => c.analysisId === analysisId)
    .filter(c => filterSection === "all" || c.section === filterSection)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !analysisId) return
    addComment(analysisId, section, text)
    setText("")
  }

  function handleReply(commentId: string) {
    if (!replyText.trim()) return
    addReply(commentId, replyText)
    setReplyText("")
    setReplyingTo(null)
  }

  return (
    <div className="fixed right-0 top-14 bottom-0 z-30 w-80 bg-white border-l border-border flex flex-col shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Comentarios</span>
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">
            {analysisComments.filter(c => !c.resolved).length}
          </span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Filter */}
      <div className="px-3 py-2 border-b border-border shrink-0">
        <select
          value={filterSection}
          onChange={e => setFilterSection(e.target.value)}
          className="w-full h-7 px-2 text-xs bg-secondary border-0 rounded-lg outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">Todas las secciones</option>
          {SECTIONS.map(s => <option key={s} value={s}>{SECTION_LABELS[s]}</option>)}
        </select>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {analysisComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <MessageSquare className="w-8 h-8 text-primary/20 mb-2" />
            <p className="text-xs text-muted-foreground">Sin comentarios todavía</p>
          </div>
        ) : (
          analysisComments.map(c => (
            <div
              key={c.id}
              className={cn("rounded-lg border p-3 space-y-2 transition-colors", c.resolved ? "border-border bg-secondary/30 opacity-60" : "border-border bg-white")}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full", "bg-primary/10 text-primary")}>
                      {SECTION_LABELS[c.section] ?? c.section}
                    </span>
                    <span className="text-[9px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{c.text}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => resolveComment(c.id)} title={c.resolved ? "Reabrir" : "Resolver"}>
                    <Check className={cn("w-3.5 h-3.5", c.resolved ? "text-green-500" : "text-muted-foreground hover:text-green-500")} />
                  </button>
                  <button onClick={() => deleteComment(c.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                  </button>
                </div>
              </div>

              {/* Replies */}
              {c.replies.length > 0 && (
                <div className="pl-2 border-l-2 border-primary/20 space-y-1.5">
                  {c.replies.map(r => (
                    <div key={r.id}>
                      <span className="text-[9px] text-muted-foreground">{timeAgo(r.createdAt)}</span>
                      <p className="text-xs text-foreground">{r.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              {replyingTo === c.id ? (
                <div className="flex gap-1">
                  <input
                    autoFocus
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Respuesta..."
                    className="flex-1 h-7 px-2 text-xs border border-border rounded-md outline-none focus:border-primary"
                    onKeyDown={e => { if (e.key === "Enter") handleReply(c.id) }}
                  />
                  <button onClick={() => handleReply(c.id)} className="p-1 bg-primary text-white rounded-md">
                    <Send className="w-3 h-3" />
                  </button>
                  <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-secondary rounded-md">
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setReplyingTo(c.id); setReplyText("") }}
                  className="text-[10px] text-primary hover:underline"
                >
                  Responder
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* New comment form */}
      <div className="border-t border-border p-3 shrink-0 space-y-2">
        <div className="flex gap-2">
          <select
            value={section}
            onChange={e => setSection(e.target.value)}
            className="flex-1 h-7 px-2 text-xs bg-secondary border-0 rounded-lg outline-none focus:ring-1 focus:ring-primary"
          >
            {SECTIONS.map(s => <option key={s} value={s}>{SECTION_LABELS[s]}</option>)}
          </select>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Escribe un comentario..."
            rows={2}
            className="flex-1 px-2 py-1.5 text-xs border border-border rounded-lg outline-none focus:border-primary resize-none"
            onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleSubmit(e as any) }}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-2 bg-primary text-white rounded-lg disabled:opacity-50 self-end"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
