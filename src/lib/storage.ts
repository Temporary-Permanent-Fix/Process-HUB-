import type { Tool } from '../types/tool'
import { supabase } from './supabaseClient'

export type NewTool = Omit<Tool, 'id' | 'createdAt'>
export type ToolUpdate = Omit<Tool, 'id' | 'createdAt'>

export type ToolChangeEvent =
  | { type: 'insert'; tool: Tool }
  | { type: 'update'; tool: Tool }
  | { type: 'delete'; id: string }

/**
 * Storage abstraction so the backend (Supabase today) can later be swapped
 * for a different API without touching the rest of the app — only this
 * file's implementation changes.
 */
export interface ToolsRepository {
  list(): Promise<Tool[]>
  create(tool: NewTool): Promise<Tool>
  update(id: string, patch: ToolUpdate): Promise<Tool>
  remove(id: string): Promise<void>
  /** Live updates from other clients/tabs. Returns an unsubscribe function. */
  subscribe(onChange: (event: ToolChangeEvent) => void): () => void
}

interface ToolRow {
  id: string
  name: string
  icon: string
  purpose: Tool['purpose']
  status: Tool['status']
  url: string | null
  note: string | null
  created_at: number
}

function fromRow(row: ToolRow): Tool {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    purpose: row.purpose,
    status: row.status,
    url: row.url ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  }
}

class SupabaseToolsRepository implements ToolsRepository {
  async list(): Promise<Tool[]> {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as ToolRow[]).map(fromRow)
  }

  async create(tool: NewTool): Promise<Tool> {
    const row = {
      id: crypto.randomUUID(),
      name: tool.name,
      icon: tool.icon,
      purpose: tool.purpose,
      status: tool.status,
      url: tool.url ?? null,
      note: tool.note ?? null,
      created_at: Date.now(),
    }
    const { data, error } = await supabase.from('tools').insert(row).select().single()
    if (error) throw error
    return fromRow(data as ToolRow)
  }

  async update(id: string, patch: ToolUpdate): Promise<Tool> {
    const { data, error } = await supabase
      .from('tools')
      .update({
        name: patch.name,
        icon: patch.icon,
        purpose: patch.purpose,
        status: patch.status,
        url: patch.url ?? null,
        note: patch.note ?? null,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return fromRow(data as ToolRow)
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('tools').delete().eq('id', id)
    if (error) throw error
  }

  subscribe(onChange: (event: ToolChangeEvent) => void): () => void {
    const channel = supabase
      .channel('tools-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tools' },
        (payload) => onChange({ type: 'insert', tool: fromRow(payload.new as ToolRow) }),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tools' },
        (payload) => onChange({ type: 'update', tool: fromRow(payload.new as ToolRow) }),
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'tools' },
        (payload) => onChange({ type: 'delete', id: (payload.old as ToolRow).id }),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}

export const toolsRepository: ToolsRepository = new SupabaseToolsRepository()
