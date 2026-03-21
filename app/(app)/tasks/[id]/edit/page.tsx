import { notFound } from 'next/navigation'
import { TaskForm } from '@/components/tasks/task-form'
import { getTask, updateTask } from '@/lib/actions/task'
import { getProjects } from '@/lib/actions/project'

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const task = await getTask(id)
  if (!task) {
    notFound()
  }

  const projects = await getProjects({ status: 'active' })
  const updateAction = updateTask.bind(null, id)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">タスクを編集</h1>
      <TaskForm task={task} projects={projects} action={updateAction} />
    </div>
  )
}
