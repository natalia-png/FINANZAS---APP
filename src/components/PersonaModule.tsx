'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, getPersonaConfig, INCOME_CATEGORIES, EXPENSE_CATEGORIES, MONTHS } from '@/lib/types'
import type { UserProfile, Income, Expense, Debt } from '@/lib/types'
import MonthSelector from './MonthSelector'
import Navigation from './Navigation'

interface PersonaModuleProps {
  persona: UserProfile
}

type Tab = 'resumen' | 'ingresos' | 'gastos' | 'deudas'

export default function PersonaModule({ persona }: PersonaModuleProps) {
  const config = getPersonaConfig(persona)
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [tab, setTab] = useState<Tab>('resumen')
  const [incomes, setIncomes] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  const loadData = useCallback(async () => {
    setLoading(true)
    const [incRes, expRes, debtRes] = await Promise.all([
      supabase.from('incomes').select('*').eq('persona', persona).eq('month', month).eq('year', year).order('date', { ascending: false }),
      supabase.from('expenses').select('*').eq('persona', persona).eq('month', month).eq('year', year).order('date', { ascending: false }),
      supabase.from('debts').select('*').eq('persona', persona).order('created_at', { ascending: false }),
    ])
    setIncomes(incRes.data ?? [])
    setExpenses(expRes.data ?? [])
    setDebts(debtRes.data ?? [])
    setLoading(false)
  }, [persona, month, year])

  useEffect(() => { loadData() }, [loadData])

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const balance = totalIncome - totalExpenses
  const totalDebt = debts.filter(d => d.status !== 'paid').reduce((s, d) => s + (d.amount - d.amount_paid), 0)

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'resumen', label: 'Resumen', emoji: '📊' },
    { id: 'ingresos', label: 'Ingresos', emoji: '💰' },
    { id: 'gastos', label: 'Gastos', emoji: '💸' },
    { id: 'deudas', label: 'Deudas', emoji: '⚠️' },
  ]

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className={`${config.gradient} text-white px-6 pt-12 pb-8 rounded-b-3xl shadow-lg`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {config.emoji} {config.name}
            </h1>
            <p className="text-white/80 text-sm">Finanzas personales</p>
          </div>
          <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} accentColor="white" />
        </div>

        {/* Balance */}
        <div className="bg-white/20 rounded-2xl p-4">
          <p className="text-white/70 text-xs uppercase tracking-wide">Balance {MONTHS[month - 1]}</p>
          <p className={`text-3xl font-bold mt-1 ${balance < 0 ? 'text-red-200' : ''}`}>
            {loading ? '...' : formatCurrency(balance)}
          </p>
          <div className="flex gap-4 mt-2">
            <span className="text-white/80 text-xs">▲ {formatCurrency(totalIncome)}</span>
            <span className="text-white/80 text-xs">▼ {formatCurrency(totalExpenses)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex gap-1 bg-white/60 rounded-xl p-1 shadow-sm">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setShowForm(false) }}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                tab === t.id ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* RESUMEN */}
        {tab === 'resumen' && (
          <div className="space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-4">
                <p className="text-xs text-gray-400 mb-1">💰 Ingresos</p>
                <p className="text-xl font-bold text-green-500">{formatCurrency(totalIncome)}</p>
                <p className="text-xs text-gray-400 mt-1">{incomes.length} registros</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-xs text-gray-400 mb-1">💸 Gastos</p>
                <p className="text-xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
                <p className="text-xs text-gray-400 mt-1">{expenses.length} registros</p>
              </div>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs text-gray-400 mb-1">⚠️ Deudas pendientes</p>
              <p className="text-2xl font-bold text-amber-500">{formatCurrency(totalDebt)}</p>
              <p className="text-xs text-gray-400 mt-1">{debts.filter(d => d.status !== 'paid').length} deudas activas</p>
            </div>

            {/* Últimos gastos */}
            {expenses.length > 0 && (
              <div className="glass-card p-4">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">Últimos gastos</h3>
                <div className="space-y-2">
                  {expenses.slice(0, 5).map((e) => (
                    <div key={e.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-700">{e.description}</p>
                        <p className="text-xs text-gray-400">{e.category}</p>
                      </div>
                      <p className="text-sm font-semibold text-red-400">-{formatCurrency(e.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* INGRESOS */}
        {tab === 'ingresos' && (
          <div className="space-y-3 animate-fade-in">
            <button
              onClick={() => setShowForm(!showForm)}
              className={`w-full py-3 rounded-xl font-semibold text-white ${config.gradient} shadow-md`}
            >
              {showForm ? '✕ Cancelar' : '+ Agregar ingreso'}
            </button>

            {showForm && (
              <AddForm
                type="income"
                persona={persona}
                month={month}
                year={year}
                onSaved={() => { setShowForm(false); loadData() }}
                config={config}
              />
            )}

            {loading ? (
              <div className="text-center py-8 text-gray-400">Cargando...</div>
            ) : incomes.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-3xl mb-2">💰</p>
                <p className="text-gray-500 text-sm">Sin ingresos registrados este mes</p>
              </div>
            ) : (
              incomes.map((income) => (
                <TransactionCard
                  key={income.id}
                  id={income.id}
                  amount={income.amount}
                  description={income.description}
                  category={income.category}
                  date={income.date}
                  type="income"
                  onDelete={() => { deleteRecord('incomes', income.id); loadData() }}
                />
              ))
            )}
          </div>
        )}

        {/* GASTOS */}
        {tab === 'gastos' && (
          <div className="space-y-3 animate-fade-in">
            <button
              onClick={() => setShowForm(!showForm)}
              className={`w-full py-3 rounded-xl font-semibold text-white ${config.gradient} shadow-md`}
            >
              {showForm ? '✕ Cancelar' : '+ Agregar gasto'}
            </button>

            {showForm && (
              <AddForm
                type="expense"
                persona={persona}
                month={month}
                year={year}
                onSaved={() => { setShowForm(false); loadData() }}
                config={config}
              />
            )}

            {loading ? (
              <div className="text-center py-8 text-gray-400">Cargando...</div>
            ) : expenses.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-3xl mb-2">💸</p>
                <p className="text-gray-500 text-sm">Sin gastos registrados este mes</p>
              </div>
            ) : (
              expenses.map((expense) => (
                <TransactionCard
                  key={expense.id}
                  id={expense.id}
                  amount={expense.amount}
                  description={expense.description}
                  category={expense.category}
                  date={expense.date}
                  type="expense"
                  onDelete={() => { deleteRecord('expenses', expense.id); loadData() }}
                />
              ))
            )}
          </div>
        )}

        {/* DEUDAS */}
        {tab === 'deudas' && (
          <div className="space-y-3 animate-fade-in">
            <button
              onClick={() => setShowForm(!showForm)}
              className={`w-full py-3 rounded-xl font-semibold text-white ${config.gradient} shadow-md`}
            >
              {showForm ? '✕ Cancelar' : '+ Agregar deuda'}
            </button>

            {showForm && (
              <AddDebtForm
                persona={persona}
                onSaved={() => { setShowForm(false); loadData() }}
                config={config}
              />
            )}

            {loading ? (
              <div className="text-center py-8 text-gray-400">Cargando...</div>
            ) : debts.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-gray-500 text-sm">Sin deudas registradas</p>
              </div>
            ) : (
              debts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  onDelete={() => { deleteRecord('debts', debt.id); loadData() }}
                  onMarkPaid={() => markDebtPaid(debt.id)}
                />
              ))
            )}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )

  async function deleteRecord(table: string, id: string) {
    await supabase.from(table).delete().eq('id', id)
    loadData()
  }

  async function markDebtPaid(id: string) {
    await supabase.from('debts').update({ status: 'paid', amount_paid: debts.find(d => d.id === id)?.amount }).eq('id', id)
    loadData()
  }
}

// --- Sub-componentes ---

interface AddFormProps {
  type: 'income' | 'expense'
  persona: UserProfile
  month: number
  year: number
  onSaved: () => void
  config: ReturnType<typeof getPersonaConfig>
}

function AddForm({ type, persona, month, year, onSaved, config }: AddFormProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description || !category) return
    setSaving(true)
    const table = type === 'income' ? 'incomes' : 'expenses'
    await supabase.from(table).insert({
      amount: parseFloat(amount),
      description,
      category,
      date,
      month,
      year,
      persona,
    })
    setSaving(false)
    onSaved()
  }

  return (
    <form onSubmit={handleSave} className="glass-card p-4 space-y-3 animate-fade-in">
      <h3 className="font-semibold text-gray-800 text-sm">
        {type === 'income' ? '💰 Nuevo ingreso' : '💸 Nuevo gasto'}
      </h3>
      <input
        type="number"
        placeholder="Monto"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
      />
      <input
        type="text"
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
      >
        <option value="">Categoría...</option>
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
      />
      <button
        type="submit"
        disabled={saving}
        className={`w-full py-2 rounded-xl font-semibold text-white text-sm ${config.buttonClass} disabled:opacity-50`}
      >
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}

interface AddDebtFormProps {
  persona: UserProfile
  onSaved: () => void
  config: ReturnType<typeof getPersonaConfig>
}

function AddDebtForm({ persona, onSaved, config }: AddDebtFormProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [creditor, setCreditor] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('debts').insert({
      amount: parseFloat(amount),
      amount_paid: 0,
      description,
      creditor,
      due_date: dueDate || null,
      status: 'pending',
      persona,
    })
    setSaving(false)
    onSaved()
  }

  return (
    <form onSubmit={handleSave} className="glass-card p-4 space-y-3 animate-fade-in">
      <h3 className="font-semibold text-gray-800 text-sm">⚠️ Nueva deuda</h3>
      <input
        type="number"
        placeholder="Monto total de la deuda"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
      />
      <input
        type="text"
        placeholder="Descripción (ej: préstamo celular)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
      />
      <input
        type="text"
        placeholder="A quién le debo"
        value={creditor}
        onChange={(e) => setCreditor(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
      />
      <div>
        <label className="text-xs text-gray-500 block mb-1">Fecha límite (opcional)</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className={`w-full py-2 rounded-xl font-semibold text-white text-sm ${config.buttonClass} disabled:opacity-50`}
      >
        {saving ? 'Guardando...' : 'Guardar deuda'}
      </button>
    </form>
  )
}

interface TransactionCardProps {
  id: string
  amount: number
  description: string
  category: string
  date: string
  type: 'income' | 'expense'
  onDelete: () => void
}

function TransactionCard({ amount, description, category, date, type, onDelete }: TransactionCardProps) {
  return (
    <div className="glass-card p-4 flex justify-between items-center animate-fade-in">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
          type === 'income' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          {type === 'income' ? '💰' : '💸'}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{description}</p>
          <p className="text-xs text-gray-400">{category} · {new Date(date + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className={`text-sm font-bold ${type === 'income' ? 'text-green-500' : 'text-red-400'}`}>
          {type === 'income' ? '+' : '-'}{formatCurrency(amount)}
        </p>
        <button
          onClick={onDelete}
          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-400 hover:text-red-400 text-xs transition-all"
        >
          ×
        </button>
      </div>
    </div>
  )
}

interface DebtCardProps {
  debt: Debt
  onDelete: () => void
  onMarkPaid: () => void
}

function DebtCard({ debt, onDelete, onMarkPaid }: DebtCardProps) {
  const remaining = debt.amount - debt.amount_paid
  const percent = Math.round((debt.amount_paid / debt.amount) * 100)

  return (
    <div className={`glass-card p-4 animate-fade-in ${debt.status === 'paid' ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">{debt.description}</p>
          <p className="text-xs text-gray-400">A: {debt.creditor}</p>
        </div>
        <div className="flex gap-1">
          {debt.status !== 'paid' && (
            <button
              onClick={onMarkPaid}
              className="px-2 py-1 rounded-lg bg-green-100 text-green-600 text-xs font-medium"
            >
              Pagada
            </button>
          )}
          <button
            onClick={onDelete}
            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center text-xs text-gray-400 hover:text-red-400"
          >
            ×
          </button>
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Pagado: {formatCurrency(debt.amount_paid)}</span>
        <span>Pendiente: {formatCurrency(remaining)}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-amber-400 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      {debt.due_date && (
        <p className="text-xs text-gray-400 mt-2">
          Vence: {new Date(debt.due_date + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}
    </div>
  )
}
