# prettier-plugin-svg-oneline

Prettier plugin that collapses inline `<svg>` elements onto a single line after normal formatting runs.

Useful when you want inline icon SVGs in your source without the visual noise of multi-line path markup.

## Usage

Add the plugin to your Prettier config:

```js
// prettier.config.js
export default {
  plugins: ["prettier-plugin-svg-oneline"],
};
```

Supports markdown/MDX, JavaScript/TypeScript, and HTML files.
