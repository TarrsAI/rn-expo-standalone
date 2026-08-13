/// <reference types="nativewind/types" />

// Lets `import '../global.css'` in src/app/_layout.tsx typecheck.
// Metro handles the actual CSS via NativeWind's transformer; TypeScript
// just needs to know the module exists. Keep this file committed —
// `expo-env.d.ts` is generated and gitignored, so it can't be relied on
// for a clean-clone `pnpm typecheck`.
declare module '*.css';
