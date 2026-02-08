#!/usr/bin/env node

/**
 * Add words to a lesson via CLI
 * Usage: node scripts/add-words.js "Привітання" "こんばんは - добрий вечір" "またね - пока"
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Error: Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function addWords() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node scripts/add-words.js "Lesson Title" "japanese - ukrainian" "japanese - ukrainian" ...');
    process.exit(1);
  }

  const lessonTitle = args[0];
  const wordPairs = args.slice(1);

  try {
    // Find lesson by title
    const { data: lessons, error: lessonError } = await supabase
      .from('lessons')
      .select('id, user_id')
      .ilike('title', lessonTitle)
      .limit(1);

    if (lessonError) throw lessonError;
    if (!lessons || lessons.length === 0) {
      console.error(`Error: Lesson "${lessonTitle}" not found`);
      process.exit(1);
    }

    const lesson = lessons[0];
    console.log(`✓ Found lesson: ${lessonTitle} (ID: ${lesson.id})`);

    // Parse and add words
    const wordsToAdd = wordPairs.map(pair => {
      const [japanese, ukrainian] = pair.split('-').map(s => s.trim());
      if (!japanese || !ukrainian) {
        throw new Error(`Invalid format: "${pair}". Expected "japanese - ukrainian"`);
      }
      return { japanese, ukrainian };
    });

    console.log(`\nAdding ${wordsToAdd.length} words...`);

    for (const word of wordsToAdd) {
      const { data, error } = await supabase
        .from('words')
        .insert({
          lesson_id: lesson.id,
          japanese: word.japanese,
          ukrainian: word.ukrainian,
        })
        .select();

      if (error) {
        console.error(`✗ Failed to add "${word.japanese}": ${error.message}`);
      } else {
        console.log(`✓ Added: ${word.japanese} → ${word.ukrainian}`);
      }
    }

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addWords();
