'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCustomer } from '@/lib/actions/customer'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'

interface DeleteCustomerDialogProps {
  customerId: string
  customerName: string
}

export function DeleteCustomerDialog({
  customerId,
  customerName,
}: DeleteCustomerDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteCustomer(customerId)
    if (result.success) {
      router.push('/customers')
    } else {
      setIsDeleting(false)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="destructive" size="sm" />}
      >
        削除
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>顧客を削除しますか？</DialogTitle>
          <DialogDescription>
            「{customerName}」を非アクティブにします。この操作により一覧から除外されますが、データは保持されます。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            キャンセル
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? '削除中...' : '削除する'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
