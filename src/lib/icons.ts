import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Boxes,
  Package,
  Truck,
  Warehouse,
  Mountain,
  Receipt,
  FileText,
  FileSpreadsheet,
  Calculator,
  Wallet,
  CreditCard,
  Database,
  Server,
  Gauge,
  Radar,
  Map,
  Route,
  Clock,
  Settings,
  Wrench,
  Cpu,
  Network,
  Shield,
  AlertTriangle,
  ClipboardList,
  Box,
} from 'lucide-react'

// Curated set of icons relevant to internal business tooling — kept short so the
// picker grid stays scannable rather than dumping the entire lucide icon set.
const ICON_MAP = {
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Boxes,
  Package,
  Truck,
  Warehouse,
  Mountain,
  Receipt,
  FileText,
  FileSpreadsheet,
  Calculator,
  Wallet,
  CreditCard,
  Database,
  Server,
  Gauge,
  Radar,
  Map,
  Route,
  Clock,
  Settings,
  Wrench,
  Cpu,
  Network,
  Shield,
  AlertTriangle,
  ClipboardList,
} satisfies Record<string, LucideIcon>

export const ICON_NAMES = Object.keys(ICON_MAP) as Array<keyof typeof ICON_MAP>

export type IconName = (typeof ICON_NAMES)[number]

const FALLBACK_ICON: LucideIcon = Box

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name as keyof typeof ICON_MAP] ?? FALLBACK_ICON
}
