import { notFound } from 'next/navigation'
import { getCustomer } from '@/lib/actions/customer'
import { CustomerDetail } from '@/components/customers/customer-detail'
import { DeleteCustomerDialog } from '@/components/customers/delete-customer-dialog'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const customer = await getCustomer(id)

  if (!customer) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <CustomerDetail customer={customer} />
      <div className="flex justify-end">
        <DeleteCustomerDialog
          customerId={customer.id}
          customerName={customer.name}
        />
      </div>
    </div>
  )
}
