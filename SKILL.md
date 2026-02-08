# Flash Cards Word Manager Skill

Manage vocabulary in your Flash Cards lessons via natural language and CSV imports.

## 🎯 Usage

### 1️⃣ Add Words Directly (Natural Language)

Request examples:
- "Add to the 'Greetings' lesson: こんばんは - good evening, またね - see you"
- "Додай до уроку 'Привітання' нові картки: こんばんは - добрий вечір, またね - пока"
- "Add words to Numbers: 一 - one, 二 - two, 三 - three"

### 2️⃣ Import from Quizlet (CSV)

If you have a lesson in Quizlet, export it as CSV and I'll import it!

**Steps to export from Quizlet:**
1. Open your Quizlet lesson
2. Click **Menu (three dots)** → **Export**
3. Select **CSV** format
4. Copy the data

**Then ask me:**
> "Import my Quizlet lesson 'Дієслова 1'" and paste CSV data

Or use a CSV file like:
```
Japanese,Ukrainian
あいます,зустрічатися
あそびます,розважатися
あらいます,мити
```

## How It Works

1. **Parse natural language** - I extract lesson name and word pairs
2. **Validate format** - Word pairs must be "japanese - ukrainian"
3. **Add to database** - Insert words into the lesson via Supabase
4. **Confirm** - Show what was added

## Command Line Usage

### Add words directly:
```bash
npm run add-words "Привітання" "こんばんは - добрий вечір" "またね - пока"
```

### Import from CSV:
```bash
npm run import-csv "Дієслова 1" ./path/to/file.csv

# Or with explicit credentials:
NEXT_PUBLIC_SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." \
node scripts/import-csv.js "Дієслова 1" ./words.csv
```

## Scripts

- **scripts/add-words.js** - Add individual words via CLI
- **scripts/import-csv.js** - Import from CSV (Quizlet export)
- **scripts/nlp-add-words.py** - Parse natural language (Python version)

## Supported Formats

✅ **Japanese → Ukrainian:**
- `こんにちは - hello`
- `あいます - встречаться`
- `日本語 - Japanese language`

✅ **CSV with headers:**
```
Japanese,Ukrainian
word1,translation1
word2,translation2
```

## Lessons Available

Create any lesson name, or add to existing:
- Привіти / Greetings
- Дієслова 1 / Verbs 1
- Числа 1-10 / Numbers 1-10
- Дні тижня / Days of week
- Овочі та фрукти / Fruits & vegetables
- Сім'я / Family
- Кольори / Colors
- Школа / School
- (or any custom lesson name)

## Notes

- Lesson names are case-insensitive
- Words are added to the logged-in user's lessons (via RLS)
- Each word needs both Japanese and Ukrainian/English parts
