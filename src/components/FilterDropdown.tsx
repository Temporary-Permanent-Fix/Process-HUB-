import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
}

interface FilterDropdownProps {
  label: string
  options: FilterOption[]
  selected: string[]
  onChange: (values: string[]) => void
}

export default function FilterDropdown({ label, options, selected, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs uppercase tracking-wide transition-colors ${
          selected.length > 0
            ? 'border-accent bg-accent/15 text-accent'
            : 'border-border text-textDim hover:bg-panelHover'
        }`}
      >
        {label}
        {selected.length > 0 && <span className="text-[10px]">({selected.length})</span>}
        <ChevronDown size={12} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1.5 w-56 rounded border border-borderStrong bg-panel p-2 shadow-lg">
          <div className="max-h-64 overflow-y-auto">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-textDim hover:bg-panelHover"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="accent-accent"
                />
                <span className="uppercase tracking-wide">{opt.label}</span>
              </label>
            ))}
          </div>

          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-1 w-full rounded border-t border-border px-2 py-1.5 text-left text-xs uppercase tracking-wide text-textFaint hover:text-accent"
            >
              Vymazať výber
            </button>
          )}
        </div>
      )}
    </div>
  )
}
