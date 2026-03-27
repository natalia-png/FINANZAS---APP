import { formatCurrency } from '@/lib/types'

interface StatCardProps {
  label: string
  amount: number
  emoji: string
  color: string
  bgColor: string
  subtitle?: string
}

export default function StatCard({ label, amount, emoji, color, bgColor, subtitle }: StatCardProps) {
  return (
    <div className="glass-card p-4 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-xl font-bold mt-1" style={{ color }}>
            {formatCurrency(amount)}
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: bgColor }}>
          {emoji}
        </div>
      </div>
    </div>
  )
}
