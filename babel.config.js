// NativeWind needs BOTH halves of this file:
//   - jsxImportSource: 'nativewind'  → makes `className` a valid prop
//   - 'nativewind/babel' preset      → hoists the compiled styles
// Removing either one makes every `className` silently do nothing.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
