import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getCustomers } from '@/lib/actions/customer'
import { CustomerTable } from '@/components/customers/customer-table'
import { CustomerSearchBar } from '@/components/customers/customer-search-bar'
import { Button } from '@/components/ui/button'

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    status?: string
    sortBy?: string
    sortOrder?: string
  }>
}) {
  const params = await searchParams
  const search = params.search ?? ''
  const status = (params.status as 'active' | 'inactive' | 'all') ?? 'active'
  const sortBy = (params.sortBy as 'name' | 'company_name' | 'created_at') ?? 'created_at'
  const sortOrder = (params.sortOrder as 'asc' | 'desc') ?? 'desc'

  const customers = await getCustomers({ search, status, sortBy, sortOrder })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">顧客一覧</h1>
        <Button render={<Link href="/customers/new" />}>
          <Plus className="size-4" />
          新規作成
        </Button>
      </div>
      <CustomerSearchBar
        defaultSearch={search}
        defaultStatus={status}
        defaultSortBy={sortBy}
        defaultSortOrder={sortOrder}
      />
      <CustomerTable customers={customers} />
    </div>
  )
}
