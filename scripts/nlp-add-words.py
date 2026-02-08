#!/usr/bin/env python3
"""
Natural Language Word Adder for Flash Cards
Parse natural language and add words to lessons
"""

import re
import os
import sys
from supabase import create_client, Client

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print("Error: Missing Supabase credentials")
    print("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

def parse_request(text: str):
    """
    Parse natural language request and extract lesson name + word pairs
    
    Examples:
    - "Додай до уроку Привітання нові картки: こんばんは - добрий вечір, またね - пока"
    - "Add to Greetings: こんにちは - hello, さようなら - goodbye"
    - "Add words to Numbers: 一 - one, 二 - two, 三 - three"
    """
    
    # Pattern 1: "... lesson_name ... : word_pairs"
    match = re.search(
        r"(?:урок|lesson|до|to)\s+['\"]?([^:'\"]+)['\"]?\s*(?::|нові|new)?.*?:\s*(.+?)$",
        text,
        re.IGNORECASE | re.DOTALL
    )
    
    if not match:
        # Try simpler pattern
        match = re.search(
            r"(?:додай|add)\s+(?:до|to)?\s+['\"]?([^'\"]+)['\"]?\s*:?\s*(.+?)$",
            text,
            re.IGNORECASE | re.DOTALL
        )
    
    if not match:
        raise ValueError(f"Could not parse request: {text}")
    
    lesson_name = match.group(1).strip().strip("'\"")
    word_pairs_text = match.group(2).strip()
    
    # Split word pairs by comma
    pairs = [p.strip() for p in re.split(r',|;', word_pairs_text) if p.strip()]
    
    words = []
    for pair in pairs:
        # Split by dash/hyphen
        parts = re.split(r'\s*[-–—]\s*', pair)
        if len(parts) == 2:
            words.append({
                'japanese': parts[0].strip(),
                'ukrainian': parts[1].strip()
            })
        else:
            raise ValueError(f"Invalid word pair format: {pair}")
    
    return lesson_name, words

async def add_words_to_lesson(lesson_name: str, words: list):
    """Find lesson and add words to it"""
    
    # Find lesson (case-insensitive)
    try:
        response = supabase.table('lessons').select('id').ilike(
            'title', f"%{lesson_name}%"
        ).limit(1).execute()
        
        lessons = response.data
        if not lessons:
            print(f"❌ Lesson '{lesson_name}' not found")
            return False
        
        lesson_id = lessons[0]['id']
        print(f"✓ Found lesson: {lesson_name} (ID: {lesson_id})")
        
        # Add words
        print(f"\nAdding {len(words)} words...")
        
        for word in words:
            response = supabase.table('words').insert({
                'lesson_id': lesson_id,
                'japanese': word['japanese'],
                'ukrainian': word['ukrainian']
            }).execute()
            
            if response.data:
                print(f"✓ Added: {word['japanese']} → {word['ukrainian']}")
            else:
                print(f"✗ Failed to add {word['japanese']}")
        
        print("\n✅ Done!")
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/nlp-add-words.py \"Request text\"")
        print("\nExamples:")
        print('  python scripts/nlp-add-words.py "Додай до уроку Привітання: こんばんは - добрий вечір, またね - пока"')
        print('  python scripts/nlp-add-words.py "Add to Greetings: おはいう - good morning"')
        sys.exit(1)
    
    request_text = ' '.join(sys.argv[1:])
    
    try:
        lesson_name, words = parse_request(request_text)
        print(f"📝 Parsed request:")
        print(f"   Lesson: {lesson_name}")
        print(f"   Words: {len(words)}")
        
        # Since supabase is sync, we can't use async directly
        # Use sync methods instead
        
        # Find lesson
        response = supabase.table('lessons').select('id').ilike(
            'title', f"%{lesson_name}%"
        ).limit(1).execute()
        
        lessons = response.data
        if not lessons:
            print(f"❌ Lesson '{lesson_name}' not found")
            sys.exit(1)
        
        lesson_id = lessons[0]['id']
        print(f"✓ Found lesson: {lesson_name} (ID: {lesson_id})")
        
        # Add words
        print(f"\nAdding {len(words)} words...")
        
        for word in words:
            response = supabase.table('words').insert({
                'lesson_id': lesson_id,
                'japanese': word['japanese'],
                'ukrainian': word['ukrainian']
            }).execute()
            
            if response.data:
                print(f"✓ Added: {word['japanese']} → {word['ukrainian']}")
            else:
                print(f"✗ Failed to add {word['japanese']}")
        
        print("\n✅ Done!")
        
    except ValueError as e:
        print(f"❌ Parse error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
