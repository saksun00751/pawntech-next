import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function generateDeviceId(count: number): string {
  return `PT${1000 + count + 1}`
}

export function calcInterest(amount: number, rate: number, dateIn: Date): number {
  const today = new Date()
  const days = Math.ceil((today.getTime() - dateIn.getTime()) / 86400000)
  const months = Math.max(1, Math.ceil(days / 30))
  return Math.round(amount * (rate / 100) * months)
}

export function formatTHB(n: number): string {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 0 })
}

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function isOverdue(dueDate: Date | string): boolean {
  return new Date(dueDate) < new Date()
}

export function getDaysLeft(dueDate: Date | string): number {
  return Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000)
}
