// @ts-check

/** @typedef {import('vite').Alias} Alias */
/** @typedef {import('vite').PluginOption} PluginOption */

import * as path from 'path';
import * as tsr from 'tsconfig-resolver';

/** Returns a path with its slashes replaced with posix slashes. */
function normalize(/** @type {string} */ pathname) {
	return String(pathname).split(path.sep).join(path.posix.sep);
}

/** Returns a list of compiled aliases. */
function getConfigAlias(/** @type {tsr.TsConfigResultSuccess} */ tsconfig) {
	/** Compiler options from tsconfig.json or jsconfig.json. */
	const compilerOptions = Object(tsconfig.config.compilerOptions);

	// if no compilerOptions.baseUrl was defined, return null
	if (!compilerOptions.baseUrl)
		return null;

	// resolve the base url from the configuration file directory
	const baseUrl = path.posix.resolve(
		path.posix.dirname(normalize(tsconfig.path).replace(/^\/?/, '/')),
		normalize(compilerOptions.baseUrl)
	);

	/** List of compiled alias expressions. */
	const aliases = /** @type {Alias[]} */ ([]);

	// compile any alias expressions and push them to the list
	for (let [alias, values] of Object.entries(
		Object(compilerOptions.paths)
	)) {
		values = [].concat(/** @type {never[]} */(values));

		/** Regular Expression used to match a given path. */
		const find = new RegExp(
			`^${[...alias]
				.map((segment) => segment === '*' ? '(.+)' : segment.replace(/[\\^$*+?.()|[\]{}]/, '\\$&')
				)
				.join('')}$`
		);

		/** Internal index used to calculate the matching id in a replacement. */
		let matchId = 0;

		for (let value of values) {
			/** String used to replace a matched path. */
			const replacement = [...path.posix.resolve(baseUrl, value)]
				.map((segment) => (segment === '*' ? `$${++matchId}` : segment === '$' ? '$$' : segment))
				.join('');

			aliases.push({ find, replacement });
		}
	}

	return aliases;
}

function loadTSConfig(/** @type {string | undefined} */ cwd) {
	for (const searchName of ['tsconfig.json', 'jsconfig.json']) {
		const config = tsr.tsconfigResolverSync({ cwd, searchName });

		if (config.exists) {
			return config;
		}
	}

	return undefined;
}

/** Returns a Vite plugin used to alias paths from tsconfig.json and jsconfig.json. */
function configToAlias() {
	return /** @type {PluginOption} */ ({
		name: 'custom:config-alias',
		enforce: 'pre',
		config(userConfig) {
			const tsconfig = loadTSConfig(userConfig.root);

			if (!tsconfig) return {}

			/** Aliases from the tsconfig.json or jsconfig.json configuration. */
			const alias = getConfigAlias(tsconfig);

			// if no config alias was found, bypass this plugin
			if (!alias) return {}

			return {
				resolve: {
					alias
				}
			}
		},
	});
}

export default configToAlias
