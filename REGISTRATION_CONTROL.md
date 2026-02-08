# Registration Control Feature

## Setup Instructions

### Step 1: Run SQL Migration in Supabase

1. Go to **Supabase Dashboard** → Your Project
2. **SQL Editor** → **New Query**
3. Copy & paste content from `supabase/migrations/002_app_settings.sql`
4. Run the query

This creates:
- `app_settings` table (store registration_enabled flag)
- `admin_users` table (track admin accounts)
- RLS policies for security

### Step 2: Make Your User an Admin (Optional)

To allow yourself to change registration status:

```sql
INSERT INTO admin_users (user_id, role) VALUES (
  'YOUR_USER_ID_HERE',
  'admin'
);
```

Get your user ID from `Supabase → Authentication → Users`

---

## How It Works

### Frontend (AuthForm.tsx)
- Loads settings from `/api/settings` on mount
- Shows warning if registration is disabled
- Disables signup button/link when `registration_enabled = false`

### Backend API

#### GET /api/settings (Public)
Returns all app settings:
```json
{
  "registration_enabled": true,
  "maintenance_mode": false
}
```

#### PUT /api/settings (Admin Only)
Update a setting (requires Bearer token):
```bash
curl -X PUT http://localhost:3000/api/settings \
  -H "Authorization: Bearer <auth_token>" \
  -H "Content-Type: application/json" \
  -d '{"key": "registration_enabled", "value": false}'
```

---

## Usage

### Disable Registration
```bash
PUT /api/settings
{
  "key": "registration_enabled",
  "value": false
}
```

**Result:** Users see "Реєстрація наразі недоступна" message

### Enable Registration
```bash
PUT /api/settings
{
  "key": "registration_enabled",
  "value": true
}
```

**Result:** Signup form becomes available again

---

## Current Status

- ✅ Database tables created
- ✅ API endpoints implemented
- ✅ Frontend checks registration status
- ⏳ Need to run SQL migration in Supabase
- ⏳ Optional: Make your user an admin

---

## To Make Changes "On the Fly"

Once deployed to Vercel:

1. Get your auth token (from localStorage in browser console):
```javascript
// Run in console
const { data: { session } } = await supabaseClient.auth.getSession();
console.log(session.access_token);
```

2. Call API:
```bash
curl -X PUT https://flashcards-gamma-gold-91.vercel.app/api/settings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"key": "registration_enabled", "value": false}'
```

---

## Future Improvements

- Add Admin Panel UI for managing settings
- Add email whitelist/blacklist
- Add registration request approval flow
- Add notification emails for admins
