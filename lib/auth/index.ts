import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { createAuthServerClient } from '@/lib/supabase/auth-server'

export async function requireAuth() {
  const supabase = await createAuthServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    }
  }

  return { user, errorResponse: null }
}

export async function requireAuthPage() {
  const supabase = await createAuthServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return user
}
