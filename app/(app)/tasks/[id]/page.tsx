import { notFound } from 'next/navigation'
import { getTask } from '@/lib/actions/task'
import { TaskDetail } from '@/components/tasks/task-detail'
import { DeleteTaskDialog } from '@/components/tasks/delete-task-dialog'

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const task = await getTask(id)

  if (!task) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <TaskDetail task={task} />
      <div className="flex justify-end">
        <DeleteTaskDialog
          taskId={task.id}
          taskTitle={task.title}
        />
      </div>
    </div>
  )
}
