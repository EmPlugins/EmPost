#!/usr/bin/env node
/**
 * Verify npm registry versions and GitHub Release tag for the current package.json versions.
 */
import { spawnSync } from "node:child_process";
import { loadEmdashReleaseConfig, readPackageVersion } from "./lib/emdash-release-config.mjs";

const config = loadEmdashReleaseConfig();
const packages = config.publishPackageDirs.map((dir) => readPackageVersion(dir));
const expectedVersion = packages[0]?.version;

if (!expectedVersion) {
	console.error("No publishable packages configured.");
	process.exit(1);
}

const linked = packages.every((pkg) => pkg.version === expectedVersion);
if (!linked) {
	console.error("Linked packages have mismatched versions:");
	for (const pkg of packages) console.error(`  ${pkg.name}: ${pkg.version}`);
	process.exit(1);
}

let ok = true;

for (const pkg of packages) {
	const view = spawnSync(
		"npm",
		["view", pkg.name, "version", "--registry", "https://registry.npmjs.org/"],
		{ encoding: "utf8" },
	);
	const npmVersion = (view.stdout || "").trim();
	if (view.status !== 0 || npmVersion !== expectedVersion) {
		ok = false;
		console.error(`npm: ${pkg.name} expected ${expectedVersion}, got ${npmVersion || "(missing)"}`);
	} else {
		console.log(`npm: ${pkg.name}@${npmVersion}`);
	}
}

const tag = `${config.githubRelease.tagPrefix}${expectedVersion}`;
const gh = spawnSync("gh", ["release", "view", tag, "--repo", config.repo.github], {
	encoding: "utf8",
});

if (gh.status === 0) {
	console.log(`github: release ${tag} exists`);
} else {
	ok = false;
	console.error(`github: release ${tag} missing — run: pnpm release:github`);
}

process.exit(ok ? 0 : 1);
