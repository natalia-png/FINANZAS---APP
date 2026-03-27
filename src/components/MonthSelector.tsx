'use client'

import { MONTHS } from '@/lib/types'

interface MonthSelectorProps {
  month: number
  year: number
  onChange: (month: number, year: number) => void
  accentColor?: string
}

export default function MonthSelector({ month, year, onChange, accentColor = '#e879a0' }: MonthSelectorProps) {
  const prevMonth = () => {
    if (month === 1) onChange(12, year - 1)
    else onChange(month - 1, year)
  }

  const nextMonth = () => {
    const now = new Date()
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)) return
    if (month === 12) onChange(1, year + 1)
    else onChange(month + 1, year)
  }

  const isCurrentMonth = () => {
    const now = new Date()
    return month === now.getMonth() + 1 && year === now.getFullYear()
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={prevMonth}
        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:shadow-md transition-all"
      >
        ‹
      </button>
      <div className="text-center">
        <p className="font-semibold text-gray-800 text-sm">
          {MONTHS[month - 1]} {year}
        </p>
        {isCurrentMonth() && (
          <p className="text-xs" style={{ color: accentColor }}>mes actual</p>
        )}
      </div>
      <button
        onClick={nextMonth}
        disabled={isCurrentMonth()}
        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ›
      </button>
    </div>
  )
}
