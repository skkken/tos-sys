import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { apiError } from '@/lib/errors'
import type { User } from '@supabase/supabase-js'

type SupabaseClient = ReturnType<typeof createServerClient>

export interface ApiContext<
  P extends Record<string, string> = Record<string, string>,
> {
  supabase: SupabaseClient
  user: User
  params: P
}

export interface PublicContext<
  P extends Record<string, string> = Record<string, string>,
> {
  supabase: SupabaseClient
  params: P
}

export function withAuth<
  P extends Record<string, string> = Record<string, string>,
>(handler: (req: NextRequest, ctx: ApiContext<P>) => Promise<NextResponse>) {
  return async (
    req: NextRequest,
    routeCtx?: { params: Promise<P> }
  ): Promise<NextResponse> => {
    const { user, errorResponse } = await requireAuth()
    if (errorResponse) return errorResponse

    const supabase = createServerClient()
    const params = routeCtx?.params ? await routeCtx.params : ({} as P)

    try {
      return await handler(req, { supabase, user: user!, params })
    } catch (e) {
      return apiError(e, req.nextUrl.pathname, req.method)
    }
  }
}

export function withPublic<
  P extends Record<string, string> = Record<string, string>,
>(
  handler: (req: NextRequest, ctx: PublicContext<P>) => Promise<NextResponse>
) {
  return async (
    req: NextRequest,
    routeCtx?: { params: Promise<P> }
  ): Promise<NextResponse> => {
    const supabase = createServerClient()
    const params = routeCtx?.params ? await routeCtx.params : ({} as P)

    try {
      return await handler(req, { supabase, params })
    } catch (e) {
      return apiError(e, req.nextUrl.pathname, req.method)
    }
  }
}
