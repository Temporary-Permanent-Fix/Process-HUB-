import { ICON_NAMES, getIcon } from '../lib/icons'

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-1.5 rounded border border-border bg-bg p-2 sm:grid-cols-10">
      {ICON_NAMES.map((name) => {
        const Icon = getIcon(name)
        const selected = name === value
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            title={name}
            aria-pressed={selected}
            className={`flex aspect-square items-center justify-center rounded border transition-colors ${
              selected
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-transparent text-textDim hover:border-border hover:bg-panelHover hover:text-text'
            }`}
          >
            <Icon size={16} />
          </button>
        )
      })}
    </div>
  )
}
