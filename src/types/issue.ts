export type IssueCategory =
  | 'shuttle'
  | 'autostore'
  | 'pick'
  | 'pack'
  | 'stow'
  | 'receive'
  | 'reverse_logistics'
  | 'expedition'

export type IssuePriority = 'nizka' | 'stredna' | 'vysoka'

export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface IssueAttachment {
  url: string
  type: 'image' | 'video'
  name: string
}

export interface Issue {
  id: string
  title: string
  description: string
  category: IssueCategory
  priority: IssuePriority
  status: IssueStatus
  reporterId: string
  reporterUsername: string
  assigneeId?: string
  assigneeUsername?: string
  attachments: IssueAttachment[]
  createdAt: number
}

export interface IssueComment {
  id: string
  issueId: string
  authorId: string
  authorUsername: string
  body: string
  createdAt: number
}

export const ISSUE_CATEGORIES: IssueCategory[] = [
  'shuttle',
  'autostore',
  'pick',
  'pack',
  'stow',
  'receive',
  'reverse_logistics',
  'expedition',
]

export const ISSUE_CATEGORY_LABELS: Record<IssueCategory, string> = {
  shuttle: 'Shuttle',
  autostore: 'AutoStore',
  pick: 'Pick',
  pack: 'Pack',
  stow: 'Stow',
  receive: 'Receive',
  reverse_logistics: 'Reverse Logistics',
  expedition: 'Expedition',
}

export const ISSUE_PRIORITIES: IssuePriority[] = ['nizka', 'stredna', 'vysoka']

export const ISSUE_PRIORITY_LABELS: Record<IssuePriority, string> = {
  nizka: 'Nízka',
  stredna: 'Stredná',
  vysoka: 'Vysoká',
}

export const ISSUE_STATUSES: IssueStatus[] = ['open', 'in_progress', 'resolved', 'closed']

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  open: 'Otvorený',
  in_progress: 'Rieši sa',
  resolved: 'Vyriešený',
  closed: 'Zatvorený',
}
