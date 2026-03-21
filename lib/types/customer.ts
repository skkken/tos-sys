export interface Customer {
  id: string
  name: string
  name_kana: string | null
  company_name: string | null
  email: string | null
  phone: string | null
  postal_code: string | null
  address: string | null
  contact_person: string | null
  notes: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  user_id: string
}
