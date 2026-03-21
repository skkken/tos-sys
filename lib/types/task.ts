export interface Task {
  id: string
  title: string
  description: string | null
  project_id: string | null
  status: 'todo' | 'in_progress' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  user_id: string
}

export interface TaskWithProject extends Task {
  projects: { id: string; name: string } | null
}
