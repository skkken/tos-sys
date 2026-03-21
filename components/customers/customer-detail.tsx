import Link from 'next/link'
import type { Customer } from '@/lib/types/customer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card'

interface CustomerDetailProps {
  customer: Customer
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-2 border-b last:border-b-0">
      <dt className="text-muted-foreground font-medium">{label}</dt>
      <dd>{value || '—'}</dd>
    </div>
  )
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" render={<Link href="/customers" />}>
          ← 一覧に戻る
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {customer.name}
            <Badge
              variant={customer.status === 'active' ? 'default' : 'secondary'}
            >
              {customer.status === 'active' ? 'アクティブ' : '非アクティブ'}
            </Badge>
          </CardTitle>
          <CardAction>
            <Button variant="outline" size="sm" render={<Link href={`/customers/${customer.id}/edit`} />}>
              編集
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <dl className="text-sm">
            <DetailItem label="名前" value={customer.name} />
            <DetailItem label="名前（カナ）" value={customer.name_kana} />
            <DetailItem label="会社名" value={customer.company_name} />
            <DetailItem label="メールアドレス" value={customer.email} />
            <DetailItem label="電話番号" value={customer.phone} />
            <DetailItem label="郵便番号" value={customer.postal_code} />
            <DetailItem label="住所" value={customer.address} />
            <DetailItem label="担当者名" value={customer.contact_person} />
            <DetailItem label="備考" value={customer.notes} />
            <DetailItem label="作成日" value={formatDate(customer.created_at)} />
            <DetailItem label="更新日" value={formatDate(customer.updated_at)} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>関連データ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            請求書・見積もり・契約等の関連データは、各機能の実装後に表示されます。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
