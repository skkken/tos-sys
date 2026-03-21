import { TaskForm } from '@/components/tasks/task-form'
import { createTask } from '@/lib/actions/task'
import { getProjects } from '@/lib/actions/project'

export default async function NewTaskPage() {
  const projects = await getProjects({ status: 'active' })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">タスクを新規作成</h1>
      <TaskForm projects={projects} action={createTask} />
    </div>
  )
}
