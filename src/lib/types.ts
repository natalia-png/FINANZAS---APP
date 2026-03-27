export type UserProfile = 'nat' | 'alejo'

export interface Profile {
  id: string
  email: string
  name: string
  persona: UserProfile
  avatar_color: string
  created_at: string
}

export interface Income {
  id: string
  user_id: string
  amount: number
  category: string
  description: string
  date: string
  month: number
  year: number
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  amount: number
  category: string
  description: string
  date: string
  month: number
  year: number
  is_recurring: boolean
  created_at: string
}

export interface Debt {
  id: string
  user_id: string
  amount: number
  amount_paid: number
  description: string
  creditor: string
  status: 'pending' | 'partial' | 'paid'
  due_date: string | null
  created_at: string
}

export interface SavingGoal {
  id: string
  persona: UserProfile
  target_amount: number
  updated_at: string
}

export interface SavingMovement {
  id: string
  persona: UserProfile
  type: 'deposit' | 'withdrawal'
  amount: number
  description: string
  date: string
  month: number
  year: number
  created_at: string
}

export interface SharedSavingGoal {
  id: string
  target_amount: number
  updated_at: string
}

export interface SharedSavingMovement {
  id: string
  type: 'deposit' | 'withdrawal'
  amount: number
  description: string
  contributed_by: UserProfile
  date: string
  month: number
  year: number
  created_at: string
}

export interface SharedExpense {
  id: string
  amount: number
  description: string
  category: string
  date: string
  month: number
  year: number
  paid_by: UserProfile
  split_type: 'equal' | 'nat' | 'alejo'
  trip_id: string | null
  created_at: string
}

export interface Trip {
  id: string
  name: string
  destination: string
  start_date: string
  end_date: string | null
  budget: number
  created_at: string
}

export const INCOME_CATEGORIES = [
  'Salario', 'Freelance', 'Inversiones', 'Regalo', 'Ventas', 'Otro'
]

export const EXPENSE_CATEGORIES = [
  'Comida', 'Transporte', 'Entretenimiento', 'Ropa', 'Salud',
  'Educación', 'Hogar', 'Servicios', 'Suscripciones', 'Otro'
]

export const SAVING_MOVEMENT_TYPES = [
  { value: 'deposit', label: 'Aporte' },
  { value: 'withdrawal', label: 'Retiro' },
] as const

export const SHARED_CATEGORIES = [
  'Restaurante', 'Viaje', 'Supermercado', 'Entretenimiento',
  'Transporte', 'Alojamiento', 'Actividades', 'Otro'
]

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getPersonaConfig(persona: UserProfile) {
  if (persona === 'nat') {
    return {
      name: 'Nat',
      gradient: 'gradient-nat',
      color: 'var(--nat-primary)',
      light: 'var(--nat-light)',
      dark: 'var(--nat-dark)',
      emoji: '🌸',
      textColor: 'text-pink-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      buttonClass: 'bg-pink-500 hover:bg-pink-600 text-white',
    }
  }
  return {
    name: 'Alejo',
    gradient: 'gradient-alejo',
    color: 'var(--alejo-primary)',
    light: 'var(--alejo-light)',
    dark: 'var(--alejo-dark)',
    emoji: '🚀',
    textColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white',
  }
}
