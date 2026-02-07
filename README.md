# Antigravity Monitor

Static (no-build) GitHub Pages dashboard to monitor Antigravity proxy quotas by calling Google Cloud Code internal APIs.

## What This Does
- Google OAuth sign-in via Google Identity Services (GSI) token client (implicit access token flow)
- Calls Cloud Code internal endpoints:
  - `POST https://cloudcode-pa.googleapis.com/v1internal:loadCodeAssist` (subscription tier)
  - `POST https://cloudcode-pa.googleapis.com/v1internal:fetchAvailableModels` (per-model quota info)
  - Fallback host: `https://daily-cloudcode-pa.googleapis.com`
- Dark, mobile-responsive dashboard showing:
  - user info + tier badge
  - per-model quota bars with remaining %
  - reset countdowns
  - auto-refresh (default 30s)

## Setup
1. Create an OAuth 2.0 Client ID in Google Cloud Console:
   - Application type: **Web application**
   - Authorized JavaScript origins: your GitHub Pages origin (for example `https://<user>.github.io`)
2. Open the app and enter the Client ID in **Settings**.

## Notes
- This is a pure frontend app; it stores your settings and token in browser `localStorage`.
- Browsers generally do not allow setting the real `User-Agent` header from JavaScript. The app still sends the other required Cloud Code headers (`X-Goog-Api-Client`, `Client-Metadata`) as specified in `BRIEF.md`.

