import { createClient as createBrowserClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user via browser client
    const browserClient = createBrowserClient()
    const {
      data: { user },
      error: userError,
    } = await browserClient.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use server client for delete operations
    const serverClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const lessonId = params.id

    // Verify lesson belongs to user
    const { data: lesson, error: lessonError } = await serverClient
      .from('lessons')
      .select('id')
      .eq('id', lessonId)
      .eq('user_id', user.id)
      .single()

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: 'Lesson not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete all words in lesson first
    const { error: deleteWordsError } = await serverClient
      .from('words')
      .delete()
      .eq('lesson_id', lessonId)

    if (deleteWordsError) {
      console.error('Error deleting words:', deleteWordsError)
      throw new Error(`Failed to delete words: ${deleteWordsError.message}`)
    }

    // Delete the lesson
    const { error: deleteLessonError } = await serverClient
      .from('lessons')
      .delete()
      .eq('id', lessonId)
      .eq('user_id', user.id)

    if (deleteLessonError) {
      console.error('Error deleting lesson:', deleteLessonError)
      throw new Error(`Failed to delete lesson: ${deleteLessonError.message}`)
    }

    return NextResponse.json(
      { success: true, message: 'Lesson deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete lesson error:', error.message || error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete lesson' },
      { status: 500 }
    )
  }
}
