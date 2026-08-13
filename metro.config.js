// Metro bundles for iOS, Android AND web. The only customisation here
// is NativeWind's Tailwind transformer — it compiles `src/global.css`
// and rewrites `className` into RN styles at build time.
//
// Don't hand-edit the resolver/transformer beyond this. If you need a
// new asset type, use `config.resolver.assetExts.push(...)` below the
// withNativeWind() call so NativeWind's own wiring stays intact.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './src/global.css' });
