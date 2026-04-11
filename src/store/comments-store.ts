"use client"

import { create } from "zustand"

export interface Comment {
  id: string
  analysisId: string
  section: string        // "overview" | "company" | "entry" | "pl" | "debt" | "returns" | "sensitivity" | "general"
  author: string
  text: string
  createdAt: string
  resolved: boolean
  replies: CommentReply[]
}

export interface CommentReply {
  id: string
  author: string
  text: string
  createdAt: string
}

const LS_KEY = "deeplbo_comments"

function load(): Comment[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") ?? [] } catch { return [] }
}
function save(comments: Comment[]) {
  if (typeof window !== "undefined") localStorage.setItem(LS_KEY, JSON.stringify(comments))
}
function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

interface CommentsState {
  comments: Comment[]
  authorName: string
  init: () => void
  setAuthorName: (name: string) => void
  addComment: (analysisId: string, section: string, text: string) => void
  addReply: (commentId: string, text: string) => void
  resolveComment: (commentId: string) => void
  deleteComment: (commentId: string) => void
  getByAnalysis: (analysisId: string) => Comment[]
  getBySection: (analysisId: string, section: string) => Comment[]
  getUnresolvedCount: (analysisId: string) => number
}

export const useCommentsStore = create<CommentsState>()((set, get) => ({
  comments: [],
  authorName: "Tú",
  init: () => set({ comments: load() }),
  setAuthorName: (name) => set({ authorName: name }),
  addComment: (analysisId, section, text) => {
    const comment: Comment = {
      id: genId(),
      analysisId, section,
      author: get().authorName,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      resolved: false,
      replies: [],
    }
    const updated = [comment, ...get().comments]
    save(updated)
    set({ comments: updated })
  },
  addReply: (commentId, text) => {
    const updated = get().comments.map(c => {
      if (c.id !== commentId) return c
      return {
        ...c,
        replies: [...c.replies, {
          id: genId(),
          author: get().authorName,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        }],
      }
    })
    save(updated)
    set({ comments: updated })
  },
  resolveComment: (commentId) => {
    const updated = get().comments.map(c => c.id === commentId ? { ...c, resolved: !c.resolved } : c)
    save(updated)
    set({ comments: updated })
  },
  deleteComment: (commentId) => {
    const updated = get().comments.filter(c => c.id !== commentId)
    save(updated)
    set({ comments: updated })
  },
  getByAnalysis: (analysisId) => get().comments.filter(c => c.analysisId === analysisId),
  getBySection: (analysisId, section) => get().comments.filter(c => c.analysisId === analysisId && c.section === section),
  getUnresolvedCount: (analysisId) => get().comments.filter(c => c.analysisId === analysisId && !c.resolved).length,
}))
