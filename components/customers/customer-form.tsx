'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ActionState } from '@/lib/actions/customer'
import type { Customer } from '@/lib/types/customer'

interface CustomerFormProps {
  customer?: Customer
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
}

const initialState: ActionState = {
  success: false,
}

export function CustomerForm({ customer, action }: CustomerFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState)

  return (
    <form action={formAction} className="space-y-6">
      {state.message && !state.success && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            名前 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={customer?.name ?? ''}
            aria-invalid={!!state.errors?.name}
            required
          />
          {state.errors?.name && (
            <p className="text-sm text-destructive">{state.errors.name[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name_kana">名前カナ</Label>
          <Input
            id="name_kana"
            name="name_kana"
            defaultValue={customer?.name_kana ?? ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_name">会社名</Label>
          <Input
            id="company_name"
            name="company_name"
            defaultValue={customer?.company_name ?? ''}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={customer?.email ?? ''}
              aria-invalid={!!state.errors?.email}
            />
            {state.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">電話番号</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={customer?.phone ?? ''}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="postal_code">郵便番号</Label>
            <Input
              id="postal_code"
              name="postal_code"
              defaultValue={customer?.postal_code ?? ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_person">担当者名</Label>
            <Input
              id="contact_person"
              name="contact_person"
              defaultValue={customer?.contact_person ?? ''}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">住所</Label>
          <Input
            id="address"
            name="address"
            defaultValue={customer?.address ?? ''}
          />
        </div>

        {customer && (
          <div className="space-y-2">
            <Label htmlFor="status">ステータス</Label>
            <select
              id="status"
              name="status"
              defaultValue={customer.status}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="active">アクティブ</option>
              <option value="inactive">非アクティブ</option>
            </select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">備考</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={customer?.notes ?? ''}
            rows={4}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? '保存中...' : customer ? '更新する' : '作成する'}
        </Button>
        <Button
          variant="outline"
          render={<Link href={customer ? `/customers/${customer.id}` : '/customers'} />}
        >
          キャンセル
        </Button>
      </div>
    </form>
  )
}
