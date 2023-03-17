import esbuild from "esbuild";
import process from "process";
import builtins from 'builtin-modules'
import * as dotenv from 'dotenv'
import { existsSync } from 'fs'

const banner =
	`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = (process.argv[2] === 'production');

console.log('using .env')
dotenv.config({path: '.env'})

const mainEnvFile = prod ? '.env.prod' : '.env.dev'
console.log(`using ${mainEnvFile}`)
dotenv.config({
	path: mainEnvFile
})

if (prod && existsSync('.env.local.prod')) {
	console.log('using .env.local.prod')
	dotenv.config({path: '.env.local.prod', override: true})
}
else if (!prod && existsSync('.env.local.dev')) {
	console.log('using .env.local.dev')
	dotenv.config({path: '.env.local.dev', override: true})
}

for (const key in process.env) {
	if (key.startsWith('OBSIDIAN_APP')) {
		console.log(key, '=', process.env[key])
	}
}

const define = [
	'OBSIDIAN_APP_UPDATE_CHECKER_URL',
	'OBSIDIAN_APP_RELEASE_POLLING_SECONDS',
	'OBSIDIAN_APP_INSTALLED_VERSION_POLLING_SECONDS',
	'OBSIDIAN_APP_ENABLE_REDUX_LOGGER',
	'OBSIDIAN_APP_SIMULATE_UPDATE_PLUGINS',
	'OBSIDIAN_APP_HIDE_THIS_PLUGINS_UPDATES',
	'OBSIDIAN_APP_THIS_PLUGIN_ID',
	'OBSIDIAN_APP_SHOW_STATUS_BAR_ICON_ALL_PLATFORMS',
	'OBSIDIAN_APP_SHOW_RIBBON_ICON_ALL_PLATFORMS',
	'OBSIDIAN_APP_ACTION_BAR_LOCATION_MIDDLE',
].reduce((prev, current) => {
	prev[`process.env.${current}`] = JSON.stringify(process.env[current])
	return prev
}, {})

esbuild.build({
	banner: {
		js: banner,
	},
	entryPoints: ['src/main.tsx'],
	bundle: true,
	external: [
		'obsidian',
		'electron',
		'@codemirror/autocomplete',
		'@codemirror/collab',
		'@codemirror/commands',
		'@codemirror/language',
		'@codemirror/lint',
		'@codemirror/search',
		'@codemirror/state',
		'@codemirror/view',
		'@lezer/common',
		'@lezer/highlight',
		'@lezer/lr',
		...builtins],
	format: 'cjs',
	watch: !prod,
	target: 'es2018',
	logLevel: "info",
	sourcemap: prod ? false : 'inline',
	treeShaking: true,
	outfile: 'main.js',
	minify: prod,
	define,
}).catch(() => process.exit(1));
