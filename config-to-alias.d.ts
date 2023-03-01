import type { PluginOption } from 'vite'

/** Returns a Vite plugin used to alias paths from tsconfig.json and jsconfig.json. */
declare function configToAlias(): PluginOption

export default configToAlias
