# React Native app (Expo)

A mobile app starter — iOS, Android and web from one codebase. It talks
to a **separate backend** over HTTP, so pair it with `express-postgres`,
`express-supabase`, `fastapi-postgres`, or any API you already have.

## What's included

- **Expo SDK 57** + React Native 0.86, New Architecture on
- **Expo Router** — file-based routing, a working tab bar
  (Home + Settings)
- **TypeScript**, strict
- **NativeWind 4** — Tailwind classes in React Native (`className="..."`),
  same syntax as the web templates
- **`src/lib/api.ts`** — typed fetch wrapper with timeouts and real
  error objects, pointed at `EXPO_PUBLIC_API_URL`
- **`eas.json`** with `dev` / `staging` / `live` build profiles

No database, no auth library, no state library — the backend owns all of
that, and you add a state library only when you actually need one.

## The preview in Tarrs is the web version

When Tarrs shows your app in the preview pane, it's running the **web
build** (`expo start --web` on port 8081). That's genuinely your app —
same screens, same code, same styling — but rendered by the browser
instead of by iOS/Android.

So: layout, navigation, styling and API calls are all real in the
preview. **Device features are not.** Camera, push notifications,
biometrics, haptics and anything else that touches hardware needs a real
phone to test.

## Getting it on your phone

```bash
pnpm dev:native      # expo start --tunnel, then scan the QR code
```

Install **Expo Go** (App Store / Google Play), open it, scan the QR code
printed in the terminal. Your app loads on the device and hot-reloads as
you edit.

The `--tunnel` part matters: your phone and the Tarrs sandbox aren't on
the same network, so the tunnel is what connects them. It's already in
the script.

Once you add a library with native code that Expo Go doesn't ship, you
graduate to a **development build** — the `dev` profile in `eas.json`
builds one.

## Shipping to the App Store / Play Store

Use the **Environments → Deployment** panel in Tarrs. It runs the EAS
build for you with the store credentials held securely on the server —
you don't need to put an Apple key or a Google service account into your
project.

Before your first store build, set your real app identity in `app.json`
(`name`, `slug`, and the `com.example.app` bundle id / package). Those
placeholders will be rejected by both stores, and the bundle id can't be
changed later without creating a brand-new app listing.

## Local dev

```bash
pnpm install
cp .env.example .env      # point EXPO_PUBLIC_API_URL at your backend
pnpm dev                  # web preview on http://localhost:8081
```

| Script | What it does |
|---|---|
| `pnpm dev` | Web preview on port 8081 — what the Tarrs preview pane shows |
| `pnpm dev:native` | Tunnel + QR code for Expo Go on a real phone |
| `pnpm ios` / `pnpm android` | Simulator / emulator (needs Xcode / Android Studio locally) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm build:web` | Static web export — the best check that nothing is broken |

Tarrs port convention: Next.js frontend `3000`, Express backend `4000`,
FastAPI `8080`, **this app `8081`**. Nothing collides, so a mobile app
and its backend can run side by side in one sandbox.

## Environment variables

Only variables starting with `EXPO_PUBLIC_` reach the app — and they are
**public**, readable by anyone who downloads the app. Put API secrets in
your backend, never here.

```
EXPO_PUBLIC_API_URL=http://localhost:4000
```

`.env` is gitignored; `.env.example` is the committed template.

## Calling your backend

```ts
import { api } from '@/lib/api';

const { posts } = await api<{ posts: Post[] }>('/api/posts');
await api('/api/posts', { method: 'POST', body: { title }, token });
```

Everything goes through `src/lib/api.ts` — it's the one file that knows
your backend's URL, so switching environments is a single env var.
