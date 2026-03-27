'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import MonthSelector from '@/components/MonthSelector'
import { formatCurrency, MONTHS } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface Summary {
  natIncome: number
  natExpenses: number
  alejoIncome: number
  alejoExpenses: number
  sharedExpenses: number
  natDebtTotal: number
  alejoDebtTotal: number
  natSavings: number
  alejoSavings: number
  natSavingsGoal: number
  alejoSavingsGoal: number
  sharedSavings: number
  sharedSavingsGoal: number
}

export default function Dashboard() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [summary, setSummary] = useState<Summary>({
    natIncome: 0, natExpenses: 0,
    alejoIncome: 0, alejoExpenses: 0,
    sharedExpenses: 0, natDebtTotal: 0, alejoDebtTotal: 0,
    natSavings: 0, alejoSavings: 0, natSavingsGoal: 0, alejoSavingsGoal: 0,
    sharedSavings: 0, sharedSavingsGoal: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSummary()
  }, [month, year])

  async function loadSummary() {
    setLoading(true)
    const supabase = createClient()

    const [natIncomeRes, natExpRes, alejoIncomeRes, alejoExpRes, sharedRes, natDebtRes, alejoDebtRes, natSavingsRes, alejoSavingsRes, natGoalRes, alejoGoalRes, sharedSavingsRes, sharedSavingsGoalRes] =
      await Promise.all([
        supabase.from('incomes').select('amount').eq('persona', 'nat').eq('month', month).eq('year', year),
        supabase.from('expenses').select('amount').eq('persona', 'nat').eq('month', month).eq('year', year),
        supabase.from('incomes').select('amount').eq('persona', 'alejo').eq('month', month).eq('year', year),
        supabase.from('expenses').select('amount').eq('persona', 'alejo').eq('month', month).eq('year', year),
        supabase.from('shared_expenses').select('amount').eq('month', month).eq('year', year),
        supabase.from('debts').select('amount, amount_paid').eq('persona', 'nat').neq('status', 'paid'),
        supabase.from('debts').select('amount, amount_paid').eq('persona', 'alejo').neq('status', 'paid'),
        supabase.from('savings').select('amount, type').eq('persona', 'nat'),
        supabase.from('savings').select('amount, type').eq('persona', 'alejo'),
        supabase.from('saving_goals').select('target_amount').eq('persona', 'nat').maybeSingle(),
        supabase.from('saving_goals').select('target_amount').eq('persona', 'alejo').maybeSingle(),
        supabase.from('shared_savings').select('amount, type'),
        supabase.from('shared_saving_goals').select('target_amount').limit(1).maybeSingle(),
      ])

    const sum = (rows: { amount: number }[] | null) =>
      (rows ?? []).reduce((acc, r) => acc + r.amount, 0)
    const debtSum = (rows: { amount: number; amount_paid: number }[] | null) =>
      (rows ?? []).reduce((acc, r) => acc + (r.amount - r.amount_paid), 0)
    const savingsSum = (rows: { amount: number; type: 'deposit' | 'withdrawal' }[] | null) =>
      (rows ?? []).reduce((acc, r) => acc + (r.type === 'deposit' ? r.amount : -r.amount), 0)

    setSummary({
      natIncome: sum(natIncomeRes.data),
      natExpenses: sum(natExpRes.data),
      alejoIncome: sum(alejoIncomeRes.data),
      alejoExpenses: sum(alejoExpRes.data),
      sharedExpenses: sum(sharedRes.data),
      natDebtTotal: debtSum(natDebtRes.data),
      alejoDebtTotal: debtSum(alejoDebtRes.data),
      natSavings: savingsSum(natSavingsRes.data),
      alejoSavings: savingsSum(alejoSavingsRes.data),
      natSavingsGoal: natGoalRes.data?.target_amount ?? 0,
      alejoSavingsGoal: alejoGoalRes.data?.target_amount ?? 0,
      sharedSavings: savingsSum(sharedSavingsRes.data),
      sharedSavingsGoal: sharedSavingsGoalRes.data?.target_amount ?? 0,
    })
    setLoading(false)
  }

  const natBalance = summary.natIncome - summary.natExpenses
  const alejoBalance = summary.alejoIncome - summary.alejoExpenses

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="gradient-nat text-white px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">Finanzas 💕</h1>
            <p className="text-white/80 text-sm">Nat & Alejo</p>
          </div>
          <MonthSelector
            month={month}
            year={year}
            onChange={(m, y) => { setMonth(m); setYear(y) }}
            accentColor="white"
          />
        </div>

        {/* Balance total */}
        <div className="bg-white/20 rounded-2xl p-4 mt-2">
          <p className="text-white/70 text-xs uppercase tracking-wide">Ahorros del mes</p>
          <p className="text-3xl font-bold mt-1">
            {loading ? '...' : formatCurrency(natBalance + alejoBalance)}
          </p>
          <p className="text-white/70 text-xs mt-1">
            Entre los dos · {MONTHS[month - 1]} {year}
          </p>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Cards personas */}
        <div className="grid grid-cols-2 gap-3">
          {/* Nat */}
          <Link href="/nat">
            <div className="glass-card p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full gradient-nat flex items-center justify-center text-sm">🌸</div>
                <span className="font-semibold text-gray-800">Nat</span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-400">Ingresos</p>
                  <p className="text-sm font-bold text-green-500">{loading ? '...' : formatCurrency(summary.natIncome)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Gastos</p>
                  <p className="text-sm font-bold text-red-400">{loading ? '...' : formatCurrency(summary.natExpenses)}</p>
                </div>
                <div className="pt-1 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Balance</p>
                  <p className={`text-sm font-bold ${natBalance >= 0 ? 'text-pink-500' : 'text-red-500'}`}>
                    {loading ? '...' : formatCurrency(natBalance)}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Alejo */}
          <Link href="/alejo">
            <div className="glass-card p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full gradient-alejo flex items-center justify-center text-sm">🚀</div>
                <span className="font-semibold text-gray-800">Alejo</span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-400">Ingresos</p>
                  <p className="text-sm font-bold text-green-500">{loading ? '...' : formatCurrency(summary.alejoIncome)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Gastos</p>
                  <p className="text-sm font-bold text-red-400">{loading ? '...' : formatCurrency(summary.alejoExpenses)}</p>
                </div>
                <div className="pt-1 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Balance</p>
                  <p className={`text-sm font-bold ${alejoBalance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                    {loading ? '...' : formatCurrency(alejoBalance)}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Deudas */}
        <div className="glass-card p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span>⚠️</span> Deudas pendientes
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 flex items-center gap-1"><span>🌸</span> Nat</p>
              <p className="text-lg font-bold text-amber-500 mt-1">
                {loading ? '...' : formatCurrency(summary.natDebtTotal)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 flex items-center gap-1"><span>🚀</span> Alejo</p>
              <p className="text-lg font-bold text-amber-500 mt-1">
                {loading ? '...' : formatCurrency(summary.alejoDebtTotal)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Ahorro individual</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Nat</p>
              <p className="text-lg font-bold text-pink-500 mt-1">
                {loading ? '...' : formatCurrency(summary.natSavings)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Meta: {summary.natSavingsGoal > 0 ? formatCurrency(summary.natSavingsGoal) : 'sin definir'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Alejo</p>
              <p className="text-lg font-bold text-blue-500 mt-1">
                {loading ? '...' : formatCurrency(summary.alejoSavings)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Meta: {summary.alejoSavingsGoal > 0 ? formatCurrency(summary.alejoSavingsGoal) : 'sin definir'}
              </p>
            </div>
          </div>
        </div>

        <Link href="/compartido">
          <div className="glass-card p-4 hover:shadow-md transition-all">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800">Ahorro juntos</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Meta: {summary.sharedSavingsGoal > 0 ? formatCurrency(summary.sharedSavingsGoal) : 'sin definir'}
                </p>
                <p className="text-2xl font-bold text-emerald-500 mt-2">
                  {loading ? '...' : formatCurrency(summary.sharedSavings)}
                </p>
              </div>
              <span className="text-gray-300 text-2xl">â€º</span>
            </div>
          </div>
        </Link>

        {/* Compartido */}
        <Link href="/compartido">
          <div className="glass-card p-4 hover:shadow-md transition-all">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full gradient-shared flex items-center justify-center text-xs">💚</div>
                  <h3 className="font-semibold text-gray-800">Juntos este mes</h3>
                </div>
                <p className="text-xs text-gray-400">Salidas y gastos compartidos</p>
                <p className="text-2xl font-bold text-emerald-500 mt-2">
                  {loading ? '...' : formatCurrency(summary.sharedExpenses)}
                </p>
              </div>
              <span className="text-gray-300 text-2xl">›</span>
            </div>
          </div>
        </Link>

        {/* Acceso rápido */}
        <div className="grid grid-cols-3 gap-2">
          <Link href="/nat?tab=ingresos">
            <div className="glass-card p-3 text-center hover:shadow-md transition-all">
              <div className="text-lg">💰</div>
              <p className="text-xs text-gray-500 mt-1">Ingreso</p>
              <p className="text-xs text-pink-400 font-medium">Nat</p>
            </div>
          </Link>
          <Link href="/alejo?tab=ingresos">
            <div className="glass-card p-3 text-center hover:shadow-md transition-all">
              <div className="text-lg">💰</div>
              <p className="text-xs text-gray-500 mt-1">Ingreso</p>
              <p className="text-xs text-blue-400 font-medium">Alejo</p>
            </div>
          </Link>
          <Link href="/compartido?tab=nuevo">
            <div className="glass-card p-3 text-center hover:shadow-md transition-all">
              <div className="text-lg">🤝</div>
              <p className="text-xs text-gray-500 mt-1">Compartido</p>
              <p className="text-xs text-emerald-400 font-medium">Juntos</p>
            </div>
          </Link>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
