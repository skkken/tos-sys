'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { receiptCreateSchema, type PaymentMethod } from '@/lib/validations/receipt'
import type { OCRResult } from '@/lib/types/receipt'

interface ReceiptFormProps {
  storagePath: string
  ocrResult: OCRResult
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'card', label: 'カード' },
  { value: 'cash', label: '現金' },
  { value: 'other', label: 'その他' },
]

export function ReceiptForm({ storagePath, ocrResult }: ReceiptFormProps) {
  const router = useRouter()
  const ocrIncomplete = !ocrResult.amount || !ocrResult.date || !ocrResult.storeName

  const [amount, setAmount] = useState(ocrResult.amount?.toString() ?? '')
  const [date, setDate] = useState(ocrResult.date ?? '')
  const [storeName, setStoreName] = useState(ocrResult.storeName ?? '')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const formData = {
      amount: Number(amount),
      date,
      store_name: storeName,
      payment_method: paymentMethod,
      storage_path: storagePath,
    }

    const result = receiptCreateSchema.safeParse(formData)
    if (!result.success) {
      const flat = result.error.flatten()
      setError(flat.formErrors[0] ?? Object.values(flat.fieldErrors).flat()[0] ?? 'バリデーションエラー')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? '保存に失敗しました')
      }

      router.push('/receipts')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {ocrIncomplete && (
        <p className="text-sm text-muted-foreground rounded-md bg-muted p-3">
          一部の項目を読み取れませんでした。手動で入力してください。
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">金額（円）</Label>
        <Input
          id="amount"
          type="number"
          min="1"
          step="1"
          required
          placeholder="例: 1500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">日付</Label>
        <Input
          id="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="storeName">店名</Label>
        <Input
          id="storeName"
          type="text"
          required
          placeholder="例: コンビニ○○店"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">立替区分</Label>
        <Select
          value={paymentMethod}
          onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
          required
        >
          <SelectTrigger id="paymentMethod">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? '保存中...' : '保存'}
      </Button>
    </form>
  )
}
