/**
 * Tailwind 3 (NOT 4). NativeWind 4 compiles Tailwind 3 syntax into
 * React Native styles — Tailwind 4's CSS-first config has no RN
 * compiler yet. Don't `pnpm add tailwindcss@4`; it breaks the build.
 *
 * `content` must cover every file that writes a className, or the
 * class gets tree-shaken away and the element renders unstyled.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4f46e5',
          fg: '#ffffff',
        },
      },
    },
  },
  plugins: [],
};
