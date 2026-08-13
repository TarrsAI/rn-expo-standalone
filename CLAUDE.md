# Architecture (locked)

When you add or change code in this repo, **follow these rules**. They
are not preferences — they are how this template is supposed to work.
Deviating is a bug.

## Scope — what this template IS and ISN'T

**IS**: a thin React Native (Expo) mobile client that talks to a
SEPARATE backend over HTTP. The backend can be `express-postgres`,
`express-supabase`, `fastapi-postgres`, or anyone else's API — this
template doesn't care.

**IS NOT**: a place to put a database. Don't add `lib/db/`, don't
install `pg` / `sequelize` / `prisma` / `drizzle`. A mobile binary that
holds a Postgres connection string has shipped that connection string
to every user who installs it.

**IS NOT**: a web app. It renders on web (that's how the Tarrs preview
works — see below), but every design decision assumes a phone.

This is the mobile sibling of `nextjs-standalone`. Same philosophy,
same `lib/api.ts` shape, different renderer.

## Stack — pinned

| Concern | Choice | Don't substitute |
|---|---|---|
| Framework | **Expo SDK 57** (managed / CNG — no checked-in `ios/` or `android/`) | Don't `expo prebuild` and commit the native folders unless you genuinely need custom native code. Once they're committed, config plugins stop applying and every SDK upgrade becomes a manual merge. |
| Routing | **`expo-router` (file-based, `src/app/`), typed routes ON** | No React Navigation wired by hand. `expo-router` IS React Navigation underneath — configure it through the file tree and `<Stack.Screen>` / `<Tabs.Screen>` options. |
| Tabs | **`Tabs` from `expo-router`** | NOT `expo-router/unstable-native-tabs`. Native tabs need a `.web.tsx` fork to render in the Tarrs preview; the classic tab bar renders identically on all three platforms. |
| Language | **TypeScript, `strict: true`** | No `.js` app files, no `any` to silence an error. |
| Styling | **NativeWind 4 + Tailwind 3** (`className`) | No `StyleSheet.create` for new code, no styled-components, no UI kit (NativeUI / Tamagui / gluestack / RN Paper). Inline `style={}` is fine ONLY for values Tailwind can't express (e.g. a computed safe-area inset). |
| Tailwind version | **Tailwind `^3.4`** | **Do NOT upgrade to Tailwind 4.** NativeWind 4 compiles Tailwind 3 syntax into RN styles; Tailwind 4's CSS-first engine has no RN compiler. (NativeWind 5 preview pairs with TW4 — not stable, not pinned here.) |
| Data fetching | **`fetch` via the typed `api()` wrapper in `src/lib/api.ts`** | No `axios`. No TanStack Query / SWR / RTK Query **until you have a concrete need** — see "No state library" below. |
| State | **`useState` / `useContext`** | No Redux / Zustand / Jotai / MobX preinstalled — see below. |
| Icons | **`@expo/vector-icons`** (bundles FontAwesome 6 **Free**, Ionicons, MaterialIcons) | **No FA Pro.** This is a public repo; an `.npmrc` auth token here would leak. |
| Package manager | **pnpm**, with `node-linker=hoisted` in `.npmrc` | Don't delete that line — see `.npmrc` for why. Don't add transitive deps (e.g. `react-native-css-interop`) to `package.json` to work around a resolution error. |
| Env vars | **`EXPO_PUBLIC_*` in `.env`** (gitignored; `.env.example` committed) | Anything not prefixed `EXPO_PUBLIC_` is not in the bundle. Anything that IS prefixed is **public** — never a secret. |

### No state / data library — on purpose

This template ships with neither. That is a decision, not an omission:
most screens are one `useState` + one `api()` call, and a query cache
you didn't need is a cache you have to invalidate correctly forever.

Add one **when a concrete need appears**, not preemptively:

- **TanStack Query** — when you have server data on ≥3 screens that must
  stay in sync, or you need retry/refetch-on-focus/pagination.
- **Zustand** — when ≥3 unrelated screens read the same client-side
  state (auth session, cart) and prop-drilling has become the problem.

Until then, don't. Same rule as `nextjs-standalone`.

## Folder layout

```
src/
  app/                    expo-router file tree — a file here IS a route
    _layout.tsx           root: imports global.css (boots NativeWind),
                          providers, root <Stack>
    (tabs)/
      _layout.tsx         the tab bar (Home + Settings)
      index.tsx           Home — smoke test; DELETE when you start building
      settings.tsx        Settings placeholder
    +not-found.tsx        404 route
  components/             shared UI. Screen / Card / Button — deliberately tiny
  lib/
    api.ts                Typed fetch wrapper. The ONLY place that knows
                          the backend base URL. Reads EXPO_PUBLIC_API_URL.
  global.css              Tailwind directives. Imported once, in app/_layout.tsx.
assets/images/            icon, splash, adaptive-icon, favicon
app.json                  Expo config (name, scheme, bundle ids, plugins)
eas.json                  build profiles: dev / staging / live
babel.config.js           NativeWind jsxImportSource + preset — both required
metro.config.js           withNativeWind(input: './src/global.css')
tailwind.config.js        content globs + nativewind/preset
nativewind-env.d.ts       NativeWind className types + `declare module '*.css'`
```

There is **no** `src/db/`, **no** ORM models, **no** server code. The
backend owns business logic.

`@/*` maps to `./src/*` (see `tsconfig.json`). Import as
`@/lib/api`, `@/components/Card` — not `../../lib/api`.

## Tarrs-specific: the preview pane is WEB, not native

`pnpm dev` runs `expo start --web --port 8081`. The Tarrs sandbox
preview pane shows **that web build**, served through Caddy on the
project's `<service>-<id>.dev.tarrsapp.io` host.

**What this means in practice:**

- The preview is **react-native-web**. It looks like the app and it
  proves your layout, routing, styling and API calls work — but it is
  NOT the native runtime.
- Anything that touches real device APIs (camera, push notifications,
  biometrics, haptics, background tasks, native gestures, `expo-*`
  modules with native code) will either no-op or behave differently on
  web. **Do not report "works in the preview" as "works on the phone."**
- Test native behavior one of two ways:
  1. **`pnpm dev:native`** → `expo start --tunnel`, then scan the QR
     with **Expo Go** on a real phone. The tunnel is required: the
     sandbox has no LAN path to your phone, so plain `--lan` / `--localhost`
     will not connect.
  2. **EAS dev build** (`dev` profile) — needed once you add any
     library with native code that Expo Go doesn't bundle.

**Keep port 8081.** It's what the project's `infra-architecture.yml`
service entry declares, and the sandbox's devserver watchdog decides the
app is alive by opening a **TCP connection** to that port — it never
reads a response, so all that matters is that Metro binds the port the
spec names. Changing the script's port without changing the spec leaves
the watchdog connecting to a dead port and killing the process in a
restart loop.

## Tarrs-specific: EAS builds

`eas.json` profiles are named **`dev` / `staging` / `live`** to match
Tarrs's environment names. The platform's **Environments → Deployment**
panel drives builds by selecting the profile whose name equals the
environment.

- **Don't rename or delete a profile.** That silently breaks that
  environment's build button.
- **Never run `eas submit` (or `eas build --profile staging|live`) by
  hand from inside the sandbox.** Apple/Google credentials are held
  server-side by the platform and injected into a CodeBuild job. A
  hand-run submit either fails on missing credentials or ships an
  unsigned, untracked binary that the platform has no record of.
  `eas build --profile dev` locally is fine.
- `appVersionSource: "remote"` — EAS owns the build number. Don't also
  hand-bump `ios.buildNumber` / `android.versionCode` in `app.json`.

## Before any EAS build: set real bundle identifiers

`app.json` ships placeholders:

```json
"ios":     { "bundleIdentifier": "com.example.app" }
"android": { "package":          "com.example.app" }
```

**You must replace both with the real reverse-DNS id** (e.g.
`io.acme.fieldapp`) before the first EAS build. Reasons:

- `com.example.*` is rejected by App Store Connect and Google Play.
- The bundle id is the app's permanent identity on EAS and in the
  stores. Changing it after the first build orphans the credentials and
  creates a *second* app — you cannot rename your way out of it.

Also set a real `name`, `slug`, and `scheme` (the scheme is the deep-link
prefix, `rnexpostandalone://` by default).

## Every backend call goes through `lib/api.ts`

```ts
import { api, ApiError } from '@/lib/api';

const { posts } = await api<{ posts: Post[] }>('/api/posts');
await api('/api/posts', { method: 'POST', body: { title }, token });
```

The wrapper owns: base URL, JSON encode/decode, `Authorization: Bearer`,
`credentials: 'include'`, a 15s timeout, and error shaping into
`ApiError { status, message, body }`. Branch on `err.status` — `401` →
sign out, `4xx` → show the message, `5xx`/`0` → offer retry.

Don't call bare `fetch()` in a component. Don't hardcode a URL.

## Auth shape

Mobile has no reliable cookie jar, so the default is a **bearer token**
the backend issues, passed via `api(..., { token })`. Store it in
`expo-secure-store` (add it when you add auth) — **never**
`AsyncStorage`, which is plaintext on disk.

`credentials: 'include'` is already set so the same code path works
against a cookie-session backend when running on web.

## What NOT to do

- ❌ Don't install `pg` / `prisma` / `drizzle` / `@supabase/*` service-role clients. No DB in a mobile client.
- ❌ Don't put a secret in an `EXPO_PUBLIC_*` var. It ships in the binary.
- ❌ Don't upgrade to Tailwind 4 — NativeWind 4 can't compile it.
- ❌ Don't add a UI kit. The 3 components in `src/components/` are a floor, not a framework; build your own on top.
- ❌ Don't use `StyleSheet.create` for new code — `className` only.
- ❌ Don't commit `ios/` or `android/` (they're gitignored for a reason).
- ❌ Don't install FA Pro. Public repo; the token would leak. `@expo/vector-icons` has FontAwesome 6 Free.
- ❌ Don't remove `node-linker=hoisted` from `.npmrc`.
- ❌ Don't claim a native feature works because the web preview rendered.
- ❌ Don't change `pnpm dev`'s port without updating the project's `infra-architecture.yml`.

## Verify before you hand back

```bash
pnpm install
pnpm typecheck          # tsc --noEmit
pnpm lint
pnpm build:web          # expo export --platform web — catches bundler/resolver breaks
npx expo-doctor         # must stay 20/20
```

`pnpm build:web` is the one that catches NativeWind/Metro/babel
misconfiguration; `typecheck` alone will not.

`expo-doctor` is the one that catches config drift — deps that don't
match the SDK, and `app.json` keys that a newer SDK dropped from its
schema (SDK 57 removed `newArchEnabled` and `android.edgeToEdgeEnabled`;
new architecture is the default now). It must report **20/20**. If you
add a dependency, install it with `npx expo install <pkg>`, not
`pnpm add` — that's what picks the version matching this SDK.

## What to do when in doubt

Read `src/lib/api.ts` + `src/app/_layout.tsx` + `src/app/(tabs)/index.tsx`
— they're the canonical example. Expo's versioned docs for this exact
SDK: https://docs.expo.dev/versions/v57.0.0/
