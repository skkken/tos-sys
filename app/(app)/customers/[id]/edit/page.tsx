import { notFound } from 'next/navigation'
import { CustomerForm } from '@/components/customers/customer-form'
import { getCustomer, updateCustomer } from '@/lib/actions/customer'

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const customer = await getCustomer(id)
  if (!customer) {
    notFound()
  }

  const updateAction = updateCustomer.bind(null, id)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">顧客を編集</h1>
      <CustomerForm customer={customer} action={updateAction} />
    </div>
  )
}
