import { useState, type FormEvent } from 'react'
import { Paperclip, X } from 'lucide-react'
import type { IssueAttachment, IssueCategory, IssuePriority } from '../types/issue'
import { ISSUE_CATEGORIES, ISSUE_CATEGORY_LABELS, ISSUE_PRIORITIES, ISSUE_PRIORITY_LABELS } from '../types/issue'
import { isFileTooLarge, isSupportedMediaFile, uploadIssueMedia } from '../lib/mediaUpload'
import type { NewIssue } from '../lib/issues'
import RivetCorners from './RivetCorners'

const PRIORITY_ACTIVE_CLASS: Record<IssuePriority, string> = {
  nizka: 'border-status-online bg-status-online/15 text-status-online',
  stredna: 'border-status-vyvoj bg-status-vyvoj/15 text-status-vyvoj',
  vysoka: 'border-status-chyba bg-status-chyba/15 text-status-chyba',
}

interface NewIssueModalProps {
  onClose: () => void
  onSubmit: (issue: NewIssue) => Promise<void>
}

export default function NewIssueModal({ onClose, onSubmit }: NewIssueModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<IssueCategory>(ISSUE_CATEGORIES[0])
  const [priority, setPriority] = useState<IssuePriority>('stredna')
  const [attachments, setAttachments] = useState<IssueAttachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        if (!isSupportedMediaFile(file)) {
          setError(`${file.name}: podporované sú len fotky a videá.`)
          continue
        }
        if (isFileTooLarge(file)) {
          setError(`${file.name}: súbor je väčší ako 50 MB.`)
          continue
        }
        const attachment = await uploadIssueMedia(file)
        setAttachments((prev) => [...prev, attachment])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nahratie súboru zlyhalo.')
    } finally {
      setUploading(false)
    }
  }

  function removeAttachment(url: string) {
    setAttachments((prev) => prev.filter((a) => a.url !== url))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        attachments,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa vytvoriť nahlásenie.')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="rivets relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded border border-borderStrong bg-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <RivetCorners />

        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide text-text">
            Nahlásiť problém
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-border p-1.5 text-textDim hover:bg-panelHover hover:text-text"
            aria-label="Zavrieť"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-textDim">Názov</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              placeholder="Stručný popis problému"
              className="w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-textDim">Oddelenie / systém</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ISSUE_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded border px-2 py-2 text-xs uppercase tracking-wide transition-colors ${
                    category === c
                      ? 'border-accent bg-accent/15 text-accent'
                      : 'border-border text-textDim hover:bg-panelHover'
                  }`}
                >
                  {ISSUE_CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-textDim">Dôležitosť</label>
            <div className="grid grid-cols-3 gap-2">
              {ISSUE_PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`rounded border px-2 py-2 text-xs uppercase tracking-wide transition-colors ${
                    priority === p
                      ? PRIORITY_ACTIVE_CLASS[p]
                      : 'border-border text-textDim hover:bg-panelHover'
                  }`}
                >
                  {ISSUE_PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-textDim">Popis</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Čo presne sa deje, kde a odkedy..."
              className="w-full resize-none rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-textDim">
              Foto / video <span className="text-textFaint normal-case">(voliteľné)</span>
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded border-2 border-dashed border-border px-3 py-3 text-xs uppercase tracking-wide text-textDim hover:border-accent/50 hover:text-accent">
              <Paperclip size={14} />
              {uploading ? 'Nahrávam...' : 'Vybrať súbory'}
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                disabled={uploading}
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
            </label>

            {attachments.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1">
                {attachments.map((a) => (
                  <li
                    key={a.url}
                    className="flex items-center justify-between rounded border border-border bg-bg px-2 py-1 text-xs text-textDim"
                  >
                    <span className="truncate">{a.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(a.url)}
                      className="ml-2 shrink-0 text-textFaint hover:text-status-chyba"
                      aria-label={`Odstrániť ${a.name}`}
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="text-xs text-status-chyba">{error}</p>}

          <div className="mt-2 flex items-center justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-border px-4 py-2 text-xs uppercase tracking-wide text-textDim hover:bg-panelHover"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="rounded border border-accent bg-accent/15 px-4 py-2 text-xs uppercase tracking-wide text-accent hover:bg-accent/25 disabled:opacity-50"
            >
              Nahlásiť
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
