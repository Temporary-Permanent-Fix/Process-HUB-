import type { IssueComment } from '../types/issue'
import { supabase } from './supabaseClient'

interface CommentRow {
  id: string
  issue_id: string
  author_id: string
  author_username: string
  body: string
  created_at: number
}

function fromRow(row: CommentRow): IssueComment {
  return {
    id: row.id,
    issueId: row.issue_id,
    authorId: row.author_id,
    authorUsername: row.author_username,
    body: row.body,
    createdAt: row.created_at,
  }
}

export async function listComments(issueId: string): Promise<IssueComment[]> {
  const { data, error } = await supabase
    .from('issue_comments')
    .select('*')
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as CommentRow[]).map(fromRow)
}

export async function addComment(
  issueId: string,
  authorId: string,
  authorUsername: string,
  body: string,
): Promise<IssueComment> {
  const row = {
    issue_id: issueId,
    author_id: authorId,
    author_username: authorUsername,
    body,
    created_at: Date.now(),
  }
  const { data, error } = await supabase.from('issue_comments').insert(row).select().single()
  if (error) throw error
  return fromRow(data as CommentRow)
}

export function subscribeToComments(issueId: string, onInsert: (comment: IssueComment) => void): () => void {
  const channel = supabase
    .channel(`issue-comments-${issueId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'issue_comments', filter: `issue_id=eq.${issueId}` },
      (payload) => onInsert(fromRow(payload.new as CommentRow)),
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
