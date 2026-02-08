import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const lessonId = params.id

    // Verify lesson belongs to user (RLS will enforce, but check here too)
    const { data: lesson, error: lessonError } = await supabase
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

    // Delete all words in lesson (cascade delete handled by DB)
    const { error: deleteWordsError } = await supabase
      .from('words')
      .delete()
      .eq('lesson_id', lessonId)

    if (deleteWordsError) {
      throw deleteWordsError
    }

    // Delete the lesson
    const { error: deleteLessonError } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)
      .eq('user_id', user.id)

    if (deleteLessonError) {
      throw deleteLessonError
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
