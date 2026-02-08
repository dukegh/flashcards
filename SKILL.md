# Flash Cards Word Manager Skill

Manage vocabulary in your Flash Cards lessons via natural language.

## Usage

Request examples:
- "Add to the 'Greetings' lesson: こんばんは - good evening, またね - see you"
- "Додай до уроку 'Привітання' нові картки: こんばんは - добрий вечір, またね - пока"
- "Add words to Numbers: 一 - one, 二 - two, 三 - three"

## How It Works

1. **Parse natural language** - I extract lesson name and word pairs
2. **Validate format** - Word pairs must be "japanese - ukrainian" or "japanese - english"
3. **Add to database** - Insert words into the lesson via Supabase
4. **Confirm** - Show what was added

## Installation

```bash
cd /Users/duke/.openclaw/workspace/flashcards
npm install @supabase/supabase-js
```

## Command Line Usage

```bash
# Using the Node script (requires .env.local)
npm run add-words "Привітання" "こんばんは - добрий вечір" "またね - пока"

# Or directly with environment variables
NEXT_PUBLIC_SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." \
node scripts/add-words.js "Привітання" "こんばんは - добрий вечір" "またね - пака"
```

## Supported Formats

✅ **Japanese → Ukrainian/English:**
- `こんにちは - hello`
- `おはいう - good morning`
- `ありがとう - thank you`

✅ **With furigana (optional):**
- Parse from Japanese text with furigana

## Lesson Names

Available lessons (case-insensitive):
- Привіти / Greetings
- Числа 1-10 / Numbers
- Дні тижня / Days of week
- Овочі та фрукти / Fruits & vegetables
- Сім'я / Family
- Кольори / Colors
- Школа / School

## Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Get from: `/Users/duke/.openclaw/workspace/flashcards/.env.local`

## Examples

### Via Natural Language (through me)
```
"Add to Greetings: おはいう - good morning, こんばんは - good evening"
```

### Via CLI Script
```bash
node scripts/add-words.js "Numbers" "一 - one" "二 - two" "三 - three"
```

## Notes

- Lesson names are case-insensitive (matches "greetings", "GREETINGS", "привітання", etc.)
- If lesson not found, script will error with lesson name
- Words are added to the logged-in user's lessons only (via RLS)
