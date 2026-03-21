import Link from 'next/link'
import type { Customer } from '@/lib/types/customer'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface CustomerTableProps {
  customers: Customer[]
}

export function CustomerTable({ customers }: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        該当する顧客がありません
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>名前</TableHead>
          <TableHead>会社名</TableHead>
          <TableHead>メールアドレス</TableHead>
          <TableHead>電話番号</TableHead>
          <TableHead>ステータス</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <Link
                href={`/customers/${customer.id}`}
                className="font-medium text-primary hover:underline"
              >
                {customer.name}
              </Link>
            </TableCell>
            <TableCell>{customer.company_name ?? '—'}</TableCell>
            <TableCell>{customer.email ?? '—'}</TableCell>
            <TableCell>{customer.phone ?? '—'}</TableCell>
            <TableCell>
              <Badge
                variant={customer.status === 'active' ? 'default' : 'secondary'}
              >
                {customer.status === 'active' ? 'アクティブ' : '非アクティブ'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
