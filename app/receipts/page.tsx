import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireAuthPage } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/format'

const PAYMENT_LABELS: Record<string, string> = {
  card: 'カード',
  cash: '現金',
  other: 'その他',
}

export default async function ReceiptsPage() {
  await requireAuthPage()
  const supabase = createServerClient()

  const { data: receipts } = await supabase
    .from('receipts')
    .select('*')
    .order('date', { ascending: false })

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">領収書一覧</h1>
        <Link
          href="/receipts/new"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          <Plus className="size-4" />
          新規登録
        </Link>
      </div>

      {!receipts?.length ? (
        <p className="py-12 text-center text-muted-foreground">
          領収書がありません
        </p>
      ) : (
        <div className="space-y-3">
          {receipts.map((r) => (
            <Link
              key={r.id}
              href={`/receipts/${r.id}`}
              className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {r.store_name || '(店名なし)'}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(r.date)} ・ {PAYMENT_LABELS[r.payment_method] ?? r.payment_method}
                  </p>
                </div>
                <p className="ml-4 shrink-0 text-lg font-semibold">
                  {formatCurrency(r.amount)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
