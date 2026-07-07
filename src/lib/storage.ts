import type { Tool } from '../types/tool'

const STORAGE_KEY = 'process-hub-tools'

/**
 * Storage abstraction so localStorage can later be swapped for an API/backend
 * without touching the rest of the app — only this file's implementation changes.
 */
export interface ToolsRepository {
  load(): Tool[]
  save(tools: Tool[]): void
}

class LocalStorageToolsRepository implements ToolsRepository {
  load(): Tool[] {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed as Tool[]
    } catch {
      return []
    }
  }

  save(tools: Tool[]): void {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tools))
  }
}

export const toolsRepository: ToolsRepository = new LocalStorageToolsRepository()

export function createSeedTools(): Tool[] {
  const now = Date.now()
  return [
    {
      id: crypto.randomUUID(),
      name: 'ZjazdyApp',
      icon: 'Mountain',
      purpose: 'analyza',
      status: 'vyvoj',
      note: 'Analýza zjazdov, čaká na dátový feed z prevádzky.',
      createdAt: now - 1000 * 60 * 60 * 24 * 3,
    },
    {
      id: crypto.randomUUID(),
      name: 'Kibana – TMS monitoring',
      icon: 'Activity',
      purpose: 'analyza',
      status: 'online',
      url: 'https://kibana.internal/tms',
      note: 'Monitoring transportného systému v reálnom čase.',
      createdAt: now - 1000 * 60 * 60 * 24 * 10,
    },
    {
      id: crypto.randomUUID(),
      name: 'SKLC3 kapacitný kalkulátor',
      icon: 'Boxes',
      purpose: 'predikcia',
      status: 'chyba',
      note: 'Predikcia kapacity skladu SKLC3, čaká na nasadenie.',
      createdAt: now - 1000 * 60 * 60 * 24 * 1,
    },
  ]
}
