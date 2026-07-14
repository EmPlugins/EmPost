#!/usr/bin/env node
/**
 * Publish monorepo packages with an explicit project .npmrc from NPM_TOKEN / NODE_AUTH_TOKEN.
 * Treats "already published" (npm E403) as success so Release re-runs are idempotent.
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { loadEmdashReleaseConfig, readPackageVersion } from "./lib/emdash-release-config.mjs";

const ALREADY_PUBLISHED = /cannot publish over the previously published versions/i;

const token = process.env.NPM_TOKEN || process.env.NODE_AUTH_TOKEN;
if (!token) {
	console.error("NPM_TOKEN or NODE_AUTH_TOKEN is required for publish");
	process.exit(1);
}

const config = loadEmdashReleaseConfig();
const npmrcPath = resolve(process.cwd(), ".npmrc");
const contents = [
	"registry=https://registry.npmjs.org/",
	"//registry.npmjs.org/:_authToken=${NPM_TOKEN}",
	"always-auth=true",
	"",
].join("\n");

writeFileSync(npmrcPath, contents, { mode: 0o600 });

const env = { ...process.env, NPM_TOKEN: token, NODE_AUTH_TOKEN: token };

const whoami = spawnSync("npm", ["whoami", "--registry", "https://registry.npmjs.org/"], {
	env,
	encoding: "utf8",
	stdio: ["ignore", "pipe", "pipe"],
});
if (whoami.status !== 0) {
	console.error("npm whoami failed — NPM_TOKEN cannot authenticate");
	console.error(whoami.stderr || whoami.stdout);
	if (existsSync(npmrcPath)) unlinkSync(npmrcPath);
	process.exit(1);
}
console.log(`npm whoami: ${whoami.stdout.trim()}`);

let published = 0;
let skipped = 0;

for (const dir of config.publishPackageDirs) {
	const pkg = readPackageVersion(dir);
	console.log(`Publishing ${pkg.name}@${pkg.version} from ${dir}`);

	const publish = spawnSync(
		"npm",
		["publish", "--access", "public", "--registry", "https://registry.npmjs.org/"],
		{ cwd: resolve(process.cwd(), dir), env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
	);

	if (publish.status === 0) {
		published += 1;
		console.log(publish.stdout || `+ ${pkg.name}@${pkg.version}`);
		continue;
	}

	const err = `${publish.stderr || ""}\n${publish.stdout || ""}`;
	if (ALREADY_PUBLISHED.test(err)) {
		skipped += 1;
		console.log(`Already published ${pkg.name}@${pkg.version}, skipping.`);
		continue;
	}

	console.error(err.trim());
	if (existsSync(npmrcPath)) unlinkSync(npmrcPath);
	process.exit(publish.status ?? 1);
}

if (existsSync(npmrcPath)) unlinkSync(npmrcPath);
console.log(`Done. Published ${published}, skipped ${skipped} (already on npm).`);
