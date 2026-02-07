# Antigravity Monitor - Project Brief

## What is this?
A standalone web app (GitHub Pages) that lets Antigravity Claude Proxy users check their Google AI Ultra quota usage in real-time. No backend needed — pure frontend.

## How Antigravity Quota Works
Antigravity proxy uses Google's Cloud Code internal API to access Claude/Gemini models. The quota comes from the user's Google One AI subscription (free/pro/ultra tiers).

### Key Google APIs (already reverse-engineered from Antigravity source):

1. **Fetch Model Quotas:**
   - `POST https://cloudcode-pa.googleapis.com/v1internal:fetchAvailableModels`
   - Headers: `Authorization: Bearer <oauth_token>`, `Content-Type: application/json`, `User-Agent: antigravity/1.16.5`, `X-Goog-Api-Client: google-cloud-sdk vscode_cloudshelleditor/0.1`, `Client-Metadata: {"ideType":"IDE_UNSPECIFIED","platform":"PLATFORM_UNSPECIFIED","pluginType":"GEMINI"}`
   - Body: `{"project": "<project_id>"}` (optional)
   - Returns: `{ models: { "claude-opus-4-6-thinking": { quotaInfo: { remainingFraction: 0.85, resetTime: "2026-02-08T01:15:27Z" } }, ... } }`

2. **Get Subscription Tier:**
   - `POST https://cloudcode-pa.googleapis.com/v1internal:loadCodeAssist`
   - Same auth headers
   - Body: `{"metadata":{"ideType":"IDE_UNSPECIFIED","platform":"PLATFORM_UNSPECIFIED","pluginType":"GEMINI","duetProject":"rising-fact-p41fc"}}`
   - Returns: subscription tier (free/pro/ultra), project ID
   - Tier parsing: paidTier.id contains "ultra" → ultra, "pro"/"premium" → pro, "free" → free

3. **Fallback endpoint:** `https://daily-cloudcode-pa.googleapis.com` (same paths)

## MVP Features
1. **Google OAuth Login** - user signs in with their Google account
2. **Dashboard showing:**
   - Subscription tier (free/pro/ultra) with badge
   - Per-model quota bars (remainingFraction as percentage)
   - Reset time countdown for each model
   - Auto-refresh every 30 seconds
3. **Models to display:** Claude (opus, sonnet) and Gemini (flash, pro) families
4. **Dark theme** - space/cyberpunk aesthetic like Antigravity Console

## Tech Stack
- Pure HTML/CSS/JS (no build tools, no framework)
- Google Identity Services (GSI) for OAuth
- Chart.js for visualizations (optional)
- Tailwind CSS via CDN
- Deployable to GitHub Pages (static files only)

## OAuth Setup Notes
- Need a Google Cloud OAuth 2.0 Client ID (web application type)
- Scopes needed: `openid email profile` + whatever scope grants access to cloudcode-pa.googleapis.com
  - Likely: `https://www.googleapis.com/auth/cloud-platform` or `https://www.googleapis.com/auth/generative-language`
  - Check Antigravity's OAuth code: they use `src/auth/oauth.js` with PKCE flow
- For GitHub Pages, the redirect URI will be the pages URL

## File Structure Target
```
index.html          - Main app
css/style.css       - Styles
js/app.js           - Main app logic
js/api.js           - Google API calls
js/auth.js          - OAuth handling
js/ui.js            - UI rendering
favicon.svg         - Icon
README.md           - Project docs
```

## Important
- This is a PUBLIC tool for the Antigravity community
- No secrets in the code (OAuth client ID is fine to expose for web apps)
- Must handle CORS - the Google APIs should work from browser with proper OAuth
- Graceful error handling when quota API fails
- Mobile-responsive
