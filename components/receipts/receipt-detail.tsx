'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateLong } from '@/lib/format'

const PAYMENT_LABELS: Record<string, string> = {
  card: 'カード',
  cash: '現金',
  other: 'その他',
}

const PAYMENT_OPTIONS = [
  { value: 'card', label: 'カード' },
  { value: 'cash', label: '現金' },
  { value: 'other', label: 'その他' },
] as const

interface Receipt {
  id: string
  amount: number
  date: string
  store_name: string
  payment_method: string
  storage_path: string
  created_at: string
  updated_at: string
}

interface Props {
  receipt: Receipt
  imageUrl: string
}

export function ReceiptDetail({ receipt, imageUrl }: Props) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [amount, setAmount] = useState(String(receipt.amount))
  const [date, setDate] = useState(receipt.date)
  const [storeName, setStoreName] = useState(receipt.store_name)
  const [paymentMethod, setPaymentMethod] = useState(receipt.payment_method)

  async function handleSave() {
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/receipts/${receipt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          date,
          store_name: storeName,
          payment_method: paymentMethod,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || '更新に失敗しました')
      }
      setIsEditing(false)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : '更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/receipts/${receipt.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || '削除に失敗しました')
      }
      router.push('/receipts')
    } catch (e) {
      setError(e instanceof Error ? e.message : '削除に失敗しました')
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/receipts" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-bold">領収書詳細</h1>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="領収書画像"
        className="w-full rounded-lg border object-contain"
      />

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">金額（円）</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              min="1"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">店名</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">立替区分</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            >
              {PAYMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? '保存中...' : '保存'}
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
              キャンセル
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-muted-foreground">金額</dt>
              <dd className="text-xl font-semibold">{formatCurrency(receipt.amount)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">日付</dt>
              <dd>{formatDateLong(receipt.date)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">店名</dt>
              <dd>{receipt.store_name || '(未設定)'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">立替区分</dt>
              <dd>{PAYMENT_LABELS[receipt.payment_method] ?? receipt.payment_method}</dd>
            </div>
          </dl>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 size-4" />
              編集
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('この領収書を削除しますか？')) handleDelete()
              }}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 size-4" />
              {isDeleting ? '削除中...' : '削除'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
