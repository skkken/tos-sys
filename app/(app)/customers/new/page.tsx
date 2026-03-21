import { CustomerForm } from '@/components/customers/customer-form'
import { createCustomer } from '@/lib/actions/customer'

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">顧客を新規作成</h1>
      <CustomerForm action={createCustomer} />
    </div>
  )
}
