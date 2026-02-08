#!/usr/bin/env node

/**
 * Import words from CSV file
 * Usage: node scripts/import-csv.js "Lesson Name" ./words.csv
 * 
 * CSV format:
 * Japanese,Ukrainian
 * あいます,зустрічатися
 * あそびます,розважатися
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  
  // Skip header
  const dataLines = lines.slice(1);
  
  return dataLines.map(line => {
    // Handle CSV with comma or tab delimiter
    const delimiter = line.includes('\t') ? '\t' : ',';
    const parts = line.split(delimiter).map(p => p.trim().replace(/^"|"$/g, ''));
    
    if (parts.length < 2) {
      return null;
    }
    
    return {
      japanese: parts[0],
      ukrainian: parts[1]
    };
  }).filter(w => w !== null);
}

async function importCSV() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node scripts/import-csv.js "Lesson Name" ./path/to/file.csv [user_id]');
    console.error('Example: node scripts/import-csv.js "Дієслова 1" ./words.csv abc123def456');
    process.exit(1);
  }

  const lessonTitle = args[0];
  const filePath = args[1];
  const userId = args[2];

  try {
    // Read CSV file
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const words = parseCSV(content);

    if (words.length === 0) {
      console.error('Error: No words found in CSV');
      process.exit(1);
    }

    console.log(`📝 Parsed ${words.length} words from CSV`);

    // Find or create lesson
    const { data: lessons, error: lessonError } = await supabase
      .from('lessons')
      .select('id, user_id')
      .ilike('title', lessonTitle)
      .limit(1);

    if (lessonError) throw lessonError;

    let lessonId;
    if (!lessons || lessons.length === 0) {
      console.log(`ℹ️  Lesson not found, creating new lesson: "${lessonTitle}"`);
      
      // Use provided user_id or get from existing lessons
      let targetUserId = userId;
      
      if (!targetUserId) {
        // Get user_id from first existing lesson
        const { data: anyLessons } = await supabase
          .from('lessons')
          .select('user_id')
          .limit(1);
        
        if (!anyLessons || anyLessons.length === 0) {
          console.error('Error: No lessons found and no user_id provided');
          console.error('Usage: node scripts/import-csv.js "Lesson Name" ./file.csv [user_id]');
          process.exit(1);
        }
        targetUserId = anyLessons[0].user_id;
      }
      
      const { data: newLesson, error: createError } = await supabase
        .from('lessons')
        .insert({
          title: lessonTitle,
          description: `Imported from Quizlet`,
          language_from: 'japanese',
          language_to: 'ukrainian',
          user_id: targetUserId,
        })
        .select()
        .single();

      if (createError) throw createError;
      lessonId = newLesson.id;
      console.log(`✓ Created new lesson: ${lessonTitle}`);
    } else {
      lessonId = lessons[0].id;
      console.log(`✓ Found lesson: ${lessonTitle}`);
    }

    // Add words
    console.log(`\nImporting ${words.length} words...`);
    let successCount = 0;
    let errorCount = 0;

    for (const word of words) {
      try {
        const { data, error } = await supabase
          .from('words')
          .insert({
            lesson_id: lessonId,
            japanese: word.japanese,
            ukrainian: word.ukrainian,
          })
          .select();

        if (error) {
          console.error(`✗ "${word.japanese}": ${error.message}`);
          errorCount++;
        } else {
          console.log(`✓ Added: ${word.japanese} → ${word.ukrainian}`);
          successCount++;
        }
      } catch (err) {
        console.error(`✗ "${word.japanese}": ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`   Success: ${successCount}/${words.length}`);
    if (errorCount > 0) {
      console.log(`   Errors: ${errorCount}`);
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

importCSV();
