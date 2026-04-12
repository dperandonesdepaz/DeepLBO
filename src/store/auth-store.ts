"use client"

import { supabase } from "@/lib/supabase"

// ─── Public API ──────────────────────────────────────────────────────────────

export async function registerAccount(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function loginAccount(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { ok: false, error: "Email o contraseña incorrectos" }
  return { ok: true }
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function logoutAccount() {
  await supabase.auth.signOut()
}

/** Send password reset email (Supabase handles it) */
export async function sendPasswordResetEmail(
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/** Update password (after the user clicks the reset link and is logged in) */
export async function updatePassword(
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
