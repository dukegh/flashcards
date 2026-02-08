import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// GET: Get app settings (public)
export async function GET(request: NextRequest) {
  try {
    const serverClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await serverClient
      .from('app_settings')
      .select('key, value')

    if (error) {
      throw error
    }

    // Convert to object format
    const settings = (data || []).reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {} as Record<string, boolean>)

    return NextResponse.json(settings, { status: 200 })
  } catch (error: any) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get settings' },
      { status: 500 }
    )
  }
}

// PUT: Update app settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const authToken = authHeader.substring(7)

    const serverClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify user is admin
    const { data: { user }, error: userError } = await serverClient.auth.getUser(authToken)

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid user' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: adminUser, error: adminError } = await serverClient
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json(
        { error: 'Not an admin' },
        { status: 403 }
      )
    }

    // Get request body
    const body = await request.json()
    const { key, value } = body

    if (!key || typeof value !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request: key and boolean value required' },
        { status: 400 }
      )
    }

    // Update setting
    const { data, error } = await serverClient
      .from('app_settings')
      .update({ 
        value,
        updated_at: new Date().toISOString(),
        updated_by: user.id
      })
      .eq('key', key)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    )
  }
}
