import type { Issue, IssueAttachment, IssueCategory, IssuePriority, IssueStatus } from '../types/issue'
import { supabase } from './supabaseClient'

export interface NewIssue {
  title: string
  description: string
  category: IssueCategory
  priority: IssuePriority
  attachments: IssueAttachment[]
}

export type IssueChangeEvent =
  | { type: 'insert'; issue: Issue }
  | { type: 'update'; issue: Issue }
  | { type: 'delete'; id: string }

interface IssueRow {
  id: string
  title: string
  description: string
  category: IssueCategory
  priority: IssuePriority
  status: IssueStatus
  reporter_id: string
  reporter_username: string
  assignee_id: string | null
  assignee_username: string | null
  attachments: IssueAttachment[]
  created_at: number
}

function fromRow(row: IssueRow): Issue {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    reporterId: row.reporter_id,
    reporterUsername: row.reporter_username,
    assigneeId: row.assignee_id ?? undefined,
    assigneeUsername: row.assignee_username ?? undefined,
    attachments: row.attachments ?? [],
    createdAt: row.created_at,
  }
}

class SupabaseIssuesRepository {
  async list(): Promise<Issue[]> {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as IssueRow[]).map(fromRow)
  }

  async create(input: NewIssue, reporterId: string, reporterUsername: string): Promise<Issue> {
    const row = {
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      status: 'open' as IssueStatus,
      reporter_id: reporterId,
      reporter_username: reporterUsername,
      attachments: input.attachments,
      created_at: Date.now(),
    }
    const { data, error } = await supabase.from('issues').insert(row).select().single()
    if (error) throw error
    return fromRow(data as IssueRow)
  }

  async setStatus(id: string, status: IssueStatus): Promise<Issue> {
    const { data, error } = await supabase
      .from('issues')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return fromRow(data as IssueRow)
  }

  async setAssignee(id: string, assigneeId: string | null, assigneeUsername: string | null): Promise<Issue> {
    const { data, error } = await supabase
      .from('issues')
      .update({ assignee_id: assigneeId, assignee_username: assigneeUsername })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return fromRow(data as IssueRow)
  }

  subscribe(onChange: (event: IssueChangeEvent) => void): () => void {
    const channel = supabase
      .channel('issues-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'issues' },
        (payload) => onChange({ type: 'insert', issue: fromRow(payload.new as IssueRow) }),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'issues' },
        (payload) => onChange({ type: 'update', issue: fromRow(payload.new as IssueRow) }),
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'issues' },
        (payload) => onChange({ type: 'delete', id: (payload.old as IssueRow).id }),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}

export const issuesRepository = new SupabaseIssuesRepository()
