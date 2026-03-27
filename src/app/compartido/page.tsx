'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, SHARED_CATEGORIES, MONTHS } from '@/lib/types'
import type { SharedExpense, Trip } from '@/lib/types'
import MonthSelector from '@/components/MonthSelector'
import Navigation from '@/components/Navigation'

type Tab = 'gastos' | 'viajes'

export default function CompartidoPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [tab, setTab] = useState<Tab>('gastos')
  const [expenses, setExpenses] = useState<SharedExpense[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showTripForm, setShowTripForm] = useState(false)
  const supabase = createClient()

  const loadData = useCallback(async () => {
    setLoading(true)
    const [expRes, tripRes] = await Promise.all([
      supabase.from('shared_expenses').select('*').eq('month', month).eq('year', year).order('date', { ascending: false }),
      supabase.from('trips').select('*').order('start_date', { ascending: false }),
    ])
    setExpenses(expRes.data ?? [])
    setTrips(tripRes.data ?? [])
    setLoading(false)
  }, [month, year])

  useEffect(() => { loadData() }, [loadData])

  const totalShared = expenses.reduce((s, e) => s + e.amount, 0)
  const natPaid = expenses.filter(e => e.paid_by === 'nat').reduce((s, e) => s + e.amount, 0)
  const alejoPaid = expenses.filter(e => e.paid_by === 'alejo').reduce((s, e) => s + e.amount, 0)

  // Cálculo de quién le debe a quién
  const diff = natPaid - alejoPaid
  let balanceText = ''
  if (Math.abs(diff) < 1000) {
    balanceText = '¡Están al día! 🎉'
  } else if (diff > 0) {
    balanceText = `Alejo le debe ${formatCurrency(diff / 2)} a Nat`
  } else {
    balanceText = `Nat le debe ${formatCurrency(Math.abs(diff) / 2)} a Alejo`
  }

  async function deleteExpense(id: string) {
    await supabase.from('shared_expenses').delete().eq('id', id)
    loadData()
  }

  async function deleteTrip(id: string) {
    await supabase.from('trips').delete().eq('id', id)
    loadData()
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="gradient-shared text-white px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">💚 Juntos</h1>
            <p className="text-white/80 text-sm">Gastos compartidos y viajes</p>
          </div>
          <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} accentColor="white" />
        </div>

        <div className="bg-white/20 rounded-2xl p-4">
          <p className="text-white/70 text-xs uppercase tracking-wide">Total compartido {MONTHS[month - 1]}</p>
          <p className="text-3xl font-bold mt-1">{loading ? '...' : formatCurrency(totalShared)}</p>
          <p className="text-white/90 text-sm mt-2 font-medium">{balanceText}</p>
        </div>
      </div>

      {/* Balance detalle */}
      {!loading && totalShared > 0 && (
        <div className="px-4 mt-4">
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">¿Quién pagó qué?</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-1"><span>🌸</span> Nat pagó</span>
                <span className="font-semibold text-pink-500">{formatCurrency(natPaid)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-1"><span>🚀</span> Alejo pagó</span>
                <span className="font-semibold text-blue-500">{formatCurrency(alejoPaid)}</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-500 text-center">{balanceText}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex gap-1 bg-white/60 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => { setTab('gastos'); setShowForm(false) }}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === 'gastos' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
          >
            💸 Gastos
          </button>
          <button
            onClick={() => { setTab('viajes'); setShowTripForm(false) }}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === 'viajes' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
          >
            ✈️ Viajes
          </button>
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* GASTOS COMPARTIDOS */}
        {tab === 'gastos' && (
          <div className="space-y-3 animate-fade-in">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full py-3 rounded-xl font-semibold text-white gradient-shared shadow-md"
            >
              {showForm ? '✕ Cancelar' : '+ Agregar gasto compartido'}
            </button>

            {showForm && (
              <AddSharedExpenseForm
                month={month}
                year={year}
                trips={trips}
                onSaved={() => { setShowForm(false); loadData() }}
              />
            )}

            {loading ? (
              <div className="text-center py-8 text-gray-400">Cargando...</div>
            ) : expenses.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-3xl mb-2">🤝</p>
                <p className="text-gray-500 text-sm">Sin gastos compartidos este mes</p>
              </div>
            ) : (
              expenses.map((expense) => (
                <SharedExpenseCard
                  key={expense.id}
                  expense={expense}
                  onDelete={() => deleteExpense(expense.id)}
                />
              ))
            )}
          </div>
        )}

        {/* VIAJES */}
        {tab === 'viajes' && (
          <div className="space-y-3 animate-fade-in">
            <button
              onClick={() => setShowTripForm(!showTripForm)}
              className="w-full py-3 rounded-xl font-semibold text-white gradient-shared shadow-md"
            >
              {showTripForm ? '✕ Cancelar' : '+ Nuevo viaje'}
            </button>

            {showTripForm && (
              <AddTripForm onSaved={() => { setShowTripForm(false); loadData() }} />
            )}

            {loading ? (
              <div className="text-center py-8 text-gray-400">Cargando...</div>
            ) : trips.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-3xl mb-2">✈️</p>
                <p className="text-gray-500 text-sm">Sin viajes registrados aún</p>
                <p className="text-gray-400 text-xs mt-1">¡Planeen su próxima aventura!</p>
              </div>
            ) : (
              trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  expenses={expenses.filter(e => e.trip_id === trip.id)}
                  onDelete={() => deleteTrip(trip.id)}
                />
              ))
            )}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}

// --- Sub-componentes ---

function AddSharedExpenseForm({
  month, year, trips, onSaved
}: {
  month: number; year: number; trips: Trip[]; onSaved: () => void
}) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paidBy, setPaidBy] = useState<'nat' | 'alejo'>('nat')
  const [tripId, setTripId] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('shared_expenses').insert({
      amount: parseFloat(amount),
      description,
      category,
      date,
      month,
      year,
      paid_by: paidBy,
      split_type: 'equal',
      trip_id: tripId || null,
    })
    setSaving(false)
    onSaved()
  }

  return (
    <form onSubmit={handleSave} className="glass-card p-4 space-y-3 animate-fade-in">
      <h3 className="font-semibold text-gray-800 text-sm">🤝 Nuevo gasto compartido</h3>
      <input
        type="number"
        placeholder="Monto"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
      />
      <input
        type="text"
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
      >
        <option value="">Categoría...</option>
        {SHARED_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <div>
        <label className="text-xs text-gray-500 block mb-1">¿Quién pagó?</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPaidBy('nat')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${paidBy === 'nat' ? 'gradient-nat text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
          >
            🌸 Nat
          </button>
          <button
            type="button"
            onClick={() => setPaidBy('alejo')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${paidBy === 'alejo' ? 'gradient-alejo text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
          >
            🚀 Alejo
          </button>
        </div>
      </div>
      {trips.length > 0 && (
        <select
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
        >
          <option value="">Sin viaje asociado</option>
          {trips.map((t) => <option key={t.id} value={t.id}>✈️ {t.name}</option>)}
        </select>
      )}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
      />
      <button
        type="submit"
        disabled={saving}
        className="w-full py-2 rounded-xl font-semibold text-white text-sm gradient-shared disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}

function AddTripForm({ onSaved }: { onSaved: () => void }) {
  const [name, setName] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('trips').insert({
      name,
      destination,
      start_date: startDate,
      end_date: endDate || null,
      budget: parseFloat(budget) || 0,
    })
    setSaving(false)
    onSaved()
  }

  return (
    <form onSubmit={handleSave} className="glass-card p-4 space-y-3 animate-fade-in">
      <h3 className="font-semibold text-gray-800 text-sm">✈️ Nuevo viaje</h3>
      <input
        type="text"
        placeholder="Nombre del viaje (ej: Cartagena 2025)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
      />
      <input
        type="text"
        placeholder="Destino"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
      />
      <input
        type="number"
        placeholder="Presupuesto total"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Fecha inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Fecha fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full py-2 rounded-xl font-semibold text-white text-sm gradient-shared disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Crear viaje'}
      </button>
    </form>
  )
}

function SharedExpenseCard({ expense, onDelete }: { expense: SharedExpense; onDelete: () => void }) {
  return (
    <div className="glass-card p-4 flex justify-between items-center animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg">🤝</div>
        <div>
          <p className="text-sm font-medium text-gray-800">{expense.description}</p>
          <p className="text-xs text-gray-400">
            {expense.category} · Pagó {expense.paid_by === 'nat' ? '🌸 Nat' : '🚀 Alejo'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold text-emerald-600">{formatCurrency(expense.amount)}</p>
        <button
          onClick={onDelete}
          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center text-xs text-gray-400 hover:text-red-400 transition-all"
        >
          ×
        </button>
      </div>
    </div>
  )
}

function TripCard({ trip, expenses, onDelete }: { trip: Trip; expenses: SharedExpense[]; onDelete: () => void }) {
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const budgetPercent = trip.budget > 0 ? Math.min(Math.round((totalSpent / trip.budget) * 100), 100) : 0

  return (
    <div className="glass-card p-4 animate-fade-in">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-800 flex items-center gap-1">
            ✈️ {trip.name}
          </p>
          <p className="text-xs text-gray-400">📍 {trip.destination}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(trip.start_date + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
            {trip.end_date ? ` → ${new Date(trip.end_date + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
          </p>
        </div>
        <button
          onClick={onDelete}
          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center text-xs text-gray-400 hover:text-red-400"
        >
          ×
        </button>
      </div>

      {trip.budget > 0 && (
        <>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Gastado: {formatCurrency(totalSpent)}</span>
            <span>Presupuesto: {formatCurrency(trip.budget)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${budgetPercent >= 90 ? 'bg-red-400' : 'bg-emerald-400'}`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{budgetPercent}% del presupuesto usado</p>
        </>
      )}

      <p className="text-xs text-gray-400 mt-2">{expenses.length} gastos en este viaje</p>
    </div>
  )
}
