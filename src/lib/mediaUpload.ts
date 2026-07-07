import type { IssueAttachment } from '../types/issue'
import { supabase } from './supabaseClient'

const BUCKET = 'issue-media'
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

export function isSupportedMediaFile(file: File): boolean {
  return file.type.startsWith('image/') || file.type.startsWith('video/')
}

export function isFileTooLarge(file: File): boolean {
  return file.size > MAX_FILE_SIZE
}

export async function uploadIssueMedia(file: File): Promise<IssueAttachment> {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file)
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return {
    url: data.publicUrl,
    type: file.type.startsWith('video/') ? 'video' : 'image',
    name: file.name,
  }
}
