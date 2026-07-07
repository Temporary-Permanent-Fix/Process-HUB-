export type Purpose = 'analyza' | 'predikcia' | 'fakturacia'

export type Status = 'online' | 'vyvoj' | 'chyba'

export interface Tool {
  id: string
  name: string
  icon: string
  purpose: Purpose
  status: Status
  url?: string
  note?: string
  createdAt: number
}

export const PURPOSE_LABELS: Record<Purpose, string> = {
  analyza: 'Analýza',
  predikcia: 'Predikcia',
  fakturacia: 'Fakturácia',
}

export const STATUS_LABELS: Record<Status, string> = {
  online: 'Online',
  vyvoj: 'Vo vývoji',
  chyba: 'Chyba',
}

export const STATUS_DESCRIPTIONS: Record<Status, string> = {
  online: 'Funguje',
  vyvoj: 'Obmedzené použitie',
  chyba: 'URL nie je nastavené',
}
