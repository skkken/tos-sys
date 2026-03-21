'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTask } from '@/lib/actions/task'
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

interface DeleteTaskDialogProps {
  taskId: string
  taskTitle: string
}

export function DeleteTaskDialog({
  taskId,
  taskTitle,
}: DeleteTaskDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteTask(taskId)
    if (result.success) {
      router.push('/tasks')
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
          <DialogTitle>タスクを削除しますか？</DialogTitle>
          <DialogDescription>
            「{taskTitle}」を削除します。この操作は取り消せません。
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
