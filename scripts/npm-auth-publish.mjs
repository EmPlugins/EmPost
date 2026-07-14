#!/usr/bin/env node
/**
 * Publish monorepo packages with an explicit project .npmrc from NPM_TOKEN / NODE_AUTH_TOKEN.
 * Avoids pnpm/changesets auth gaps (EOTP / 404) in CI.
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const token = process.env.NPM_TOKEN || process.env.NODE_AUTH_TOKEN;
if (!token) {
	console.error("NPM_TOKEN or NODE_AUTH_TOKEN is required for publish");
	process.exit(1);
}

const publishDirs = [
	"packages/emdash-plugin-md-draft",
	"packages/mcp-emdash-drafts",
];

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

for (const dir of publishDirs) {
	const pkgPath = resolve(process.cwd(), dir, "package.json");
	const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
	console.log(`Publishing ${pkg.name}@${pkg.version} from ${dir}`);

	const publish = spawnSync(
		"npm",
		["publish", "--access", "public", "--registry", "https://registry.npmjs.org/"],
		{ cwd: resolve(process.cwd(), dir), env, encoding: "utf8", stdio: "inherit" },
	);

	if (publish.status !== 0) {
		if (existsSync(npmrcPath)) unlinkSync(npmrcPath);
		process.exit(publish.status ?? 1);
	}
}

if (existsSync(npmrcPath)) unlinkSync(npmrcPath);
console.log("Published all packages.");
