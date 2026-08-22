# Google OAuth production setup

The frontend uses Supabase Auth with the PKCE flow. Google must redirect to
Supabase's callback endpoint; Supabase then redirects to the Vercel app.

## Supabase

In Authentication → Providers → Google:

1. Enable Google.
2. Add the Google OAuth Web client ID and client secret.
3. Set the Site URL to `https://case-screen-checker.vercel.app`.
4. Add these redirect URLs:
   - `https://case-screen-checker.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (local development only)

## Google Cloud

The OAuth client's **Authorized redirect URI** must be the callback URL shown
by Supabase, normally:

`https://mmnbybisijobjggginwj.supabase.co/auth/v1/callback`

Do not use the Vercel URL as Google's authorized redirect URI. The Vercel URL
belongs in Supabase's redirect allow list.

## Application behavior

The browser client uses `flowType: 'pkce'` and redirects to `/auth/callback`.
The callback exchanges the code with `exchangeCodeForSession`, then restores
the URL to `/`. If the provider is disabled, the app shows an actionable
message instead of navigating to Supabase's JSON error response.
