# Config to Alias

**Config to Alias** adds aliasing support to Vite from `tsconfig.json` or `jsconfig.json` files.

This is a standalone version of the `vite-plugin-config-alias` plugin built into Astro.

### Usage

Install **Config to Alias**.

```shell
npm install @astropub/config-to-alias
```

Add **Config to Alias** to your `astro.config.js`.

```js
import configToAlias from '@astropub/config-to-alias'

export default defineConfig({
  vite: {
    plugins: [
      configAliasVitePlugin()
    ]
  }
})
```

That’s it!

Now, use `paths` to create aliases in your `tsconfig.json`.

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "src:*": ["src/*"]
    }
  }
}
```

Or, use aliases in your JavaScript or TypeScript files.

```js
import * as utils from 'src:scripts/utils.astro'
```

Use aliases in your CSS files.

```js
@import 'src:styles/shared.css'
```
