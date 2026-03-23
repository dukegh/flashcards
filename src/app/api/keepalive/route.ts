import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const startedAt = Date.now()
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[keepalive] unauthorized request')
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[keepalive] missing server environment variables')
    return NextResponse.json(
      { ok: false, error: 'Missing Supabase server environment variables' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase
    .from('lessons')
    .select('id', { head: false })
    .limit(1)

  if (error) {
    console.error('[keepalive] supabase query failed', {
      message: error.message,
      durationMs: Date.now() - startedAt,
    })
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    )
  }

  const result = {
    ok: true,
    checkedAt: new Date().toISOString(),
    rows: data?.length ?? 0,
    durationMs: Date.now() - startedAt,
  }

  console.log('[keepalive] success', result)

  return NextResponse.json(result)
}
