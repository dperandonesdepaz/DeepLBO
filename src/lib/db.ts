import { supabase } from './supabase'

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// ─── LBO Analyses ─────────────────────────────────────────────────────────────
export async function dbGetAllLBO() {
  const { data } = await supabase
    .from('lbo_analyses')
    .select('id, name, inputs, updated_at, created_at')
    .order('updated_at', { ascending: false })
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    name: r.name as string,
    inputs: r.inputs,
    updatedAt: r.updated_at as string,
  }))
}

export async function dbUpsertLBO(id: string, name: string, inputs: object) {
  const userId = await getCurrentUserId()
  if (!userId) return
  await supabase.from('lbo_analyses').upsert(
    { id, user_id: userId, name, inputs, updated_at: new Date().toISOString() },
    { onConflict: 'id' }
  )
}

export async function dbGetLBO(id: string) {
  const { data } = await supabase.from('lbo_analyses').select('*').eq('id', id).maybeSingle()
  if (!data) return null
  return { id: data.id as string, name: data.name as string, inputs: data.inputs, updatedAt: data.updated_at as string }
}

export async function dbDeleteLBO(id: string) {
  await supabase.from('lbo_analyses').delete().eq('id', id)
}

// ─── DCF Analyses ─────────────────────────────────────────────────────────────
export async function dbGetAllDCF() {
  const { data } = await supabase
    .from('dcf_analyses')
    .select('id, name, inputs, updated_at, created_at')
    .order('updated_at', { ascending: false })
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    name: r.name as string,
    inputs: r.inputs,
    updatedAt: r.updated_at as string,
    createdAt: r.created_at as string,
  }))
}

export async function dbUpsertDCF(id: string, name: string, inputs: object) {
  const userId = await getCurrentUserId()
  if (!userId) return
  await supabase.from('dcf_analyses').upsert(
    { id, user_id: userId, name, inputs, updated_at: new Date().toISOString() },
    { onConflict: 'id' }
  )
}

export async function dbGetDCF(id: string) {
  const { data } = await supabase.from('dcf_analyses').select('*').eq('id', id).maybeSingle()
  if (!data) return null
  return { id: data.id as string, name: data.name as string, inputs: data.inputs, updatedAt: data.updated_at as string, createdAt: data.created_at as string }
}

export async function dbDeleteDCF(id: string) {
  await supabase.from('dcf_analyses').delete().eq('id', id)
}

// ─── Merger Analyses ──────────────────────────────────────────────────────────
export async function dbGetAllMerger() {
  const { data } = await supabase
    .from('merger_analyses')
    .select('id, name, inputs, updated_at, created_at')
    .order('updated_at', { ascending: false })
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    name: r.name as string,
    inputs: r.inputs,
    updatedAt: r.updated_at as string,
    createdAt: r.created_at as string,
  }))
}

export async function dbUpsertMerger(id: string, name: string, inputs: object) {
  const userId = await getCurrentUserId()
  if (!userId) return
  await supabase.from('merger_analyses').upsert(
    { id, user_id: userId, name, inputs, updated_at: new Date().toISOString() },
    { onConflict: 'id' }
  )
}

export async function dbGetMerger(id: string) {
  const { data } = await supabase.from('merger_analyses').select('*').eq('id', id).maybeSingle()
  if (!data) return null
  return { id: data.id as string, name: data.name as string, inputs: data.inputs, updatedAt: data.updated_at as string, createdAt: data.created_at as string }
}

export async function dbDeleteMerger(id: string) {
  await supabase.from('merger_analyses').delete().eq('id', id)
}

// ─── Profiles ─────────────────────────────────────────────────────────────────
export async function dbGetProfile() {
  const userId = await getCurrentUserId()
  if (!userId) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  return data
}

export async function dbUpdateProfile(partial: { name?: string; email?: string; company?: string; role?: string; workspace_id?: string | null }) {
  const userId = await getCurrentUserId()
  if (!userId) return
  await supabase.from('profiles').update({ ...partial, updated_at: new Date().toISOString() }).eq('id', userId)
}

// ─── Workspaces ───────────────────────────────────────────────────────────────
export async function dbCreateWorkspace(name: string, description: string, inviteCode: string) {
  const userId = await getCurrentUserId()
  if (!userId) return null
  const { data } = await supabase.from('workspaces')
    .insert({ name, description, invite_code: inviteCode, owner_id: userId })
    .select().maybeSingle()
  return data
}

export async function dbGetMyWorkspace() {
  const userId = await getCurrentUserId()
  if (!userId) return null
  // Owner or member
  const { data: member } = await supabase
    .from('workspace_members').select('workspace_id').eq('user_id', userId).maybeSingle()
  const wsId = member?.workspace_id
  if (!wsId) {
    // Check if owner
    const { data: owned } = await supabase.from('workspaces').select('*').eq('owner_id', userId).maybeSingle()
    return owned
  }
  const { data: ws } = await supabase.from('workspaces').select('*').eq('id', wsId).maybeSingle()
  return ws
}

export async function dbGetWorkspaceByCode(inviteCode: string) {
  const { data } = await supabase.from('workspaces').select('*').eq('invite_code', inviteCode).maybeSingle()
  return data
}

export async function dbJoinWorkspace(workspaceId: string) {
  const userId = await getCurrentUserId()
  if (!userId) return false
  const { error } = await supabase.from('workspace_members')
    .upsert({ workspace_id: workspaceId, user_id: userId, role: 'member' }, { onConflict: 'workspace_id,user_id' })
  if (error) return false
  await supabase.from('profiles').update({ workspace_id: workspaceId }).eq('id', userId)
  return true
}

export async function dbLeaveWorkspace(workspaceId: string) {
  const userId = await getCurrentUserId()
  if (!userId) return
  await supabase.from('workspace_members').delete().eq('workspace_id', workspaceId).eq('user_id', userId)
  await supabase.from('profiles').update({ workspace_id: null }).eq('id', userId)
}

export async function dbGetWorkspaceMembers(workspaceId: string) {
  const { data } = await supabase.from('workspace_members').select('*').eq('workspace_id', workspaceId)
  return data ?? []
}

// ─── Hub Listings ─────────────────────────────────────────────────────────────
export async function dbGetHubListings() {
  const { data } = await supabase
    .from('hub_listings')
    .select('*')
    .in('status', ['active', 'under_loi'])
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function dbCreateHubListing(listing: Record<string, unknown>) {
  const userId = await getCurrentUserId()
  if (!userId) return null
  const { data } = await supabase.from('hub_listings')
    .insert({ ...listing, owner_id: userId })
    .select().maybeSingle()
  return data
}

export async function dbUpdateHubListing(id: string, partial: Record<string, unknown>) {
  await supabase.from('hub_listings').update({ ...partial, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function dbDeleteHubListing(id: string) {
  await supabase.from('hub_listings').delete().eq('id', id)
}

export async function dbExpressInterest(listingId: string, contact: { name: string; email: string; firm?: string; message: string; nda: boolean }) {
  await supabase.from('hub_interests').insert({ listing_id: listingId, ...contact })
}

export async function dbGetHubInterests(listingId: string) {
  const { data } = await supabase.from('hub_interests').select('*').eq('listing_id', listingId).order('created_at')
  return data ?? []
}

// ─── DD Checklists ────────────────────────────────────────────────────────────
export async function dbGetDD(analysisId: string) {
  const { data } = await supabase.from('dd_checklists').select('*').eq('analysis_id', analysisId).maybeSingle()
  return data
}

export async function dbSaveDD(analysisId: string, analysisName: string, items: unknown[]) {
  const userId = await getCurrentUserId()
  if (!userId) return
  await supabase.from('dd_checklists').upsert(
    { analysis_id: analysisId, user_id: userId, analysis_name: analysisName, items, updated_at: new Date().toISOString() },
    { onConflict: 'analysis_id' }
  )
}

// ─── Deal Scores ──────────────────────────────────────────────────────────────
export async function dbGetScore(analysisId: string) {
  const { data } = await supabase.from('deal_scores').select('*').eq('analysis_id', analysisId).maybeSingle()
  return data
}

export async function dbSaveScore(analysisId: string, criteria: unknown[], recommendation: string, summaryNotes: string) {
  const userId = await getCurrentUserId()
  if (!userId) return
  await supabase.from('deal_scores').upsert(
    { analysis_id: analysisId, user_id: userId, criteria, recommendation, summary_notes: summaryNotes, updated_at: new Date().toISOString() },
    { onConflict: 'analysis_id' }
  )
}
