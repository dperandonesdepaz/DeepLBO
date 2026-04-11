"use client"

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthAccount {
  id: string
  email: string
  passwordHash: string       // simple btoa hash — Supabase will replace this
  securityQuestion: string
  securityAnswer: string     // stored lowercase trimmed
  createdAt: string
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_KEY     = "deeplbo_auth_accounts"
const LS_SESSION = "deeplbo_auth_session"   // current logged-in email

function loadAccounts(): Record<string, AuthAccount> {
  if (typeof window === "undefined") return {}
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") ?? {} } catch { return {} }
}

function saveAccounts(data: Record<string, AuthAccount>) {
  localStorage.setItem(LS_KEY, JSON.stringify(data))
}

// ─── Simple reversible "hash" — good enough for localStorage ─────────────────
// (Supabase will replace this with real bcrypt when connected)
function encodePassword(pwd: string): string {
  return btoa(encodeURIComponent(pwd))
}

function checkPassword(pwd: string, hash: string): boolean {
  return encodePassword(pwd) === hash
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function registerAccount(
  email: string,
  password: string,
  securityQuestion: string,
  securityAnswer: string,
): { ok: true } | { ok: false; error: string } {
  const accounts = loadAccounts()
  const key = email.toLowerCase().trim()
  if (accounts[key]) return { ok: false, error: "Este email ya está registrado" }
  accounts[key] = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    email: key,
    passwordHash: encodePassword(password),
    securityQuestion,
    securityAnswer: securityAnswer.toLowerCase().trim(),
    createdAt: new Date().toISOString(),
  }
  saveAccounts(accounts)
  return { ok: true }
}

export function loginAccount(
  email: string,
  password: string,
): { ok: true } | { ok: false; error: string } {
  const accounts = loadAccounts()
  const key = email.toLowerCase().trim()
  const account = accounts[key]
  if (!account) return { ok: false, error: "Email o contraseña incorrectos" }
  if (!checkPassword(password, account.passwordHash))
    return { ok: false, error: "Email o contraseña incorrectos" }
  // Save session
  localStorage.setItem(LS_SESSION, key)
  return { ok: true }
}

export function getSession(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(LS_SESSION)
}

export function logoutAccount() {
  localStorage.removeItem(LS_SESSION)
}

/** Step 1: check email exists and return its security question */
export function getSecurityQuestion(
  email: string,
): { ok: true; question: string } | { ok: false; error: string } {
  const accounts = loadAccounts()
  const account = accounts[email.toLowerCase().trim()]
  if (!account) return { ok: false, error: "No existe ninguna cuenta con ese email" }
  return { ok: true, question: account.securityQuestion }
}

/** Step 2: verify answer */
export function verifySecurityAnswer(
  email: string,
  answer: string,
): { ok: true } | { ok: false; error: string } {
  const accounts = loadAccounts()
  const account = accounts[email.toLowerCase().trim()]
  if (!account) return { ok: false, error: "Cuenta no encontrada" }
  if (account.securityAnswer !== answer.toLowerCase().trim())
    return { ok: false, error: "Respuesta incorrecta" }
  return { ok: true }
}

/** Step 3: set new password (call only after verifySecurityAnswer succeeds) */
export function resetPassword(
  email: string,
  newPassword: string,
): { ok: true } | { ok: false; error: string } {
  const accounts = loadAccounts()
  const key = email.toLowerCase().trim()
  if (!accounts[key]) return { ok: false, error: "Cuenta no encontrada" }
  accounts[key].passwordHash = encodePassword(newPassword)
  saveAccounts(accounts)
  return { ok: true }
}

export const SECURITY_QUESTIONS = [
  "¿Cuál es el nombre de tu primera mascota?",
  "¿En qué ciudad naciste?",
  "¿Cuál es el nombre de tu colegio o instituto?",
  "¿Cuál es la película favorita de tu infancia?",
  "¿Cuál es el apellido de soltera de tu madre?",
  "¿Cuál es el nombre de tu mejor amigo/a de la infancia?",
  "¿Cuál fue el nombre de tu primer jefe?",
]
