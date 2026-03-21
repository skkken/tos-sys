export interface Project {
  id: string
  name: string
  description: string | null
  customer_id: string | null
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  user_id: string
}
