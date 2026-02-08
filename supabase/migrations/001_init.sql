-- Create lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  language_from VARCHAR(50) NOT NULL CHECK (language_from IN ('japanese', 'ukrainian')),
  language_to VARCHAR(50) NOT NULL CHECK (language_to IN ('japanese', 'ukrainian')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create words table
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  japanese VARCHAR(255) NOT NULL,
  ukrainian VARCHAR(255) NOT NULL,
  furigana VARCHAR(255),
  pronunciation VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create card_statistics table for tracking user progress
CREATE TABLE card_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  correct INTEGER DEFAULT 0,
  incorrect INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_lessons_user_id ON lessons(user_id);
CREATE INDEX idx_words_lesson_id ON words(lesson_id);
CREATE INDEX idx_card_statistics_user_id ON card_statistics(user_id);
CREATE INDEX idx_card_statistics_lesson_id ON card_statistics(lesson_id);
CREATE INDEX idx_card_statistics_word_id ON card_statistics(word_id);

-- Enable Row Level Security (RLS) for lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own lessons
CREATE POLICY lessons_user_access ON lessons
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert lessons for themselves
CREATE POLICY lessons_user_insert ON lessons
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own lessons
CREATE POLICY lessons_user_update ON lessons
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own lessons
CREATE POLICY lessons_user_delete ON lessons
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS for words (access through lessons)
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can access words from their lessons
CREATE POLICY words_lesson_access ON words
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = words.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert words to their lessons
CREATE POLICY words_lesson_insert ON words
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = words.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update words in their lessons
CREATE POLICY words_lesson_update ON words
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = words.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = words.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete words from their lessons
CREATE POLICY words_lesson_delete ON words
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = words.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

-- Enable RLS for card_statistics
ALTER TABLE card_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for card_statistics
CREATE POLICY card_stats_user_access ON card_statistics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY card_stats_user_insert ON card_statistics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY card_stats_user_update ON card_statistics
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
