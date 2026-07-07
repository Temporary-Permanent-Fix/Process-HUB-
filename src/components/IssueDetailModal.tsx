import { useEffect, useState, type FormEvent } from 'react'
import { Send, X } from 'lucide-react'
import type { Issue, IssueComment, IssueStatus } from '../types/issue'
import { ISSUE_STATUSES, ISSUE_STATUS_LABELS } from '../types/issue'
import { listComments, addComment, subscribeToComments } from '../lib/issueComments'
import { listProfiles, type Profile } from '../lib/profiles'
import { useAuth } from '../lib/AuthContext'
import IssueCategoryBadge from './IssueCategoryBadge'
import IssuePriorityBadge from './IssuePriorityBadge'
import RivetCorners from './RivetCorners'

const STATUS_ACTIVE_CLASS: Record<IssueStatus, string> = {
  open: 'border-textDim bg-textDim/15 text-text',
  in_progress: 'border-accent bg-accent/15 text-accent',
  resolved: 'border-status-online bg-status-online/15 text-status-online',
  closed: 'border-textFaint bg-textFaint/15 text-textFaint',
}

interface IssueDetailModalProps {
  issue: Issue
  canManage: boolean
  onClose: () => void
  onStatusChange: (id: string, status: IssueStatus) => Promise<void>
  onAssigneeChange: (id: string, assigneeId: string | null, assigneeUsername: string | null) => Promise<void>
}

export default function IssueDetailModal({
  issue,
  canManage,
  onClose,
  onStatusChange,
  onAssigneeChange,
}: IssueDetailModalProps) {
  const { session, profile } = useAuth()
  const [comments, setComments] = useState<IssueComment[]>([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [commentBody, setCommentBody] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listComments(issue.id)
      .then((loaded) => {
        if (!cancelled) setComments(loaded)
      })
      .finally(() => {
        if (!cancelled) setLoadingComments(false)
      })

    const unsubscribe = subscribeToComments(issue.id, (comment) => {
      setComments((prev) => (prev.some((c) => c.id === comment.id) ? prev : [...prev, comment]))
    })

    if (canManage) {
      listProfiles()
        .then(setProfiles)
        .catch(() => {})
    }

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [issue.id, canManage])

  async function handleAddComment(e: FormEvent) {
    e.preventDefault()
    const body = commentBody.trim()
    if (!body || !session || !profile) return
    setSubmittingComment(true)
    setError(null)
    try {
      await addComment(issue.id, session.user.id, profile.username, body)
      setCommentBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa pridať komentár.')
    } finally {
      setSubmittingComment(false)
    }
  }

  async function handleAssigneeSelect(value: string) {
    if (!value) {
      await onAssigneeChange(issue.id, null, null)
      return
    }
    const chosen = profiles.find((p) => p.id === value)
    if (chosen) await onAssigneeChange(issue.id, chosen.id, chosen.username)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="rivets relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded border border-borderStrong bg-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <RivetCorners />

        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide text-text">
            {issue.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded border border-border p-1.5 text-textDim hover:bg-panelHover hover:text-text"
            aria-label="Zavrieť"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <IssueCategoryBadge category={issue.category} />
          <IssuePriorityBadge priority={issue.priority} />
        </div>

        <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-textDim">
          {issue.description}
        </p>

        <p className="mb-4 text-xs text-textFaint">
          Nahlásil {issue.reporterUsername} · {new Date(issue.createdAt).toLocaleString('sk-SK')}
        </p>

        {issue.attachments.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {issue.attachments.map((a) =>
              a.type === 'video' ? (
                <video key={a.url} src={a.url} controls className="w-full rounded border border-border" />
              ) : (
                <a key={a.url} href={a.url} target="_blank" rel="noreferrer">
                  <img
                    src={a.url}
                    alt={a.name}
                    className="h-24 w-full rounded border border-border object-cover"
                  />
                </a>
              ),
            )}
          </div>
        )}

        {canManage && (
          <div className="mb-4 flex flex-col gap-3 rounded border border-border bg-bg p-3">
            <div>
              <span className="mb-1.5 block text-xs uppercase tracking-wide text-textDim">Stav</span>
              <div className="flex flex-wrap gap-1.5">
                {ISSUE_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onStatusChange(issue.id, s)}
                    className={`rounded border px-2.5 py-1 text-xs uppercase tracking-wide transition-colors ${
                      issue.status === s
                        ? STATUS_ACTIVE_CLASS[s]
                        : 'border-border text-textDim hover:bg-panelHover'
                    }`}
                  >
                    {ISSUE_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-xs uppercase tracking-wide text-textDim">Riešiteľ</span>
              <select
                value={issue.assigneeId ?? ''}
                onChange={(e) => handleAssigneeSelect(e.target.value)}
                className="w-full rounded border border-border bg-panel px-3 py-2 text-sm text-text outline-none focus:border-accent"
              >
                <option value="">Nepridelené</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.username}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col border-t border-border pt-4">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-textDim">Konverzácia</h3>

          {loadingComments ? (
            <p className="text-xs text-textFaint">Načítavam...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-textFaint">Zatiaľ žiadne komentáre.</p>
          ) : (
            <div className="mb-3 flex flex-col gap-2">
              {comments.map((c) => (
                <div key={c.id} className="rounded border border-border bg-bg px-3 py-2">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-bold text-text">{c.authorUsername}</span>
                    <span className="text-textFaint">{new Date(c.createdAt).toLocaleString('sk-SK')}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-textDim">{c.body}</p>
                </div>
              ))}
            </div>
          )}

          {error && <p className="mb-2 text-xs text-status-chyba">{error}</p>}

          <form onSubmit={handleAddComment} className="mt-auto flex gap-2">
            <input
              type="text"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Napísať komentár..."
              className="flex-1 rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentBody.trim()}
              className="flex items-center justify-center rounded border border-accent bg-accent/15 px-3 py-2 text-accent hover:bg-accent/25 disabled:opacity-50"
              aria-label="Odoslať komentár"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
