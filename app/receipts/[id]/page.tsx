import { notFound } from 'next/navigation'
import { requireAuthPage } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { getReceiptSignedUrl } from '@/lib/services/storage'
import { ReceiptDetail } from '@/components/receipts/receipt-detail'

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAuthPage()
  const { id } = await params
  const supabase = createServerClient()

  const { data: receipt, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !receipt) notFound()

  const imageUrl = await getReceiptSignedUrl(supabase, receipt.storage_path)

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <ReceiptDetail receipt={receipt} imageUrl={imageUrl} />
    </div>
  )
}
