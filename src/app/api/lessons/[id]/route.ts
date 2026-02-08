import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth token from Authorization header
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - no auth token' },
        { status: 401 }
      )
    }

    const authToken = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Create server client
    const serverClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user from JWT token
    const {
      data: { user },
      error: userError,
    } = await serverClient.auth.getUser(authToken)

    if (userError || !user) {
      console.error('User error:', userError)
      return NextResponse.json(
        { error: 'Unauthorized - invalid user' },
        { status: 401 }
      )
    }

    const lessonId = params.id

    // Verify lesson belongs to user
    const { data: lesson, error: lessonError } = await serverClient
      .from('lessons')
      .select('id')
      .eq('id', lessonId)
      .eq('user_id', user.id)
      .single()

    if (lessonError) {
      console.error('Lesson query error:', lessonError)
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    if (!lesson) {
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
      // Continue - words might not exist
    }

    // Delete the lesson
    const { error: deleteLessonError } = await serverClient
      .from('lessons')
      .delete()
      .eq('id', lessonId)
      .eq('user_id', user.id)

    if (deleteLessonError) {
      console.error('Error deleting lesson:', deleteLessonError)
      return NextResponse.json(
        { error: `Failed to delete lesson: ${deleteLessonError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Lesson deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete lesson error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete lesson' },
      { status: 500 }
    )
  }
}
