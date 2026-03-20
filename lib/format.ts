import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`
}

export function formatDate(date: Date | string, fmt: string = 'yyyy/MM/dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: ja })
}

export function formatDateLong(date: Date | string): string {
  return formatDate(date, 'yyyy年M月d日')
}
