#!/usr/bin/env node
/**
 * Create a GitHub Release when npm publish succeeded but changesets did not
 * (e.g. delayed publish after Version Packages merge with no pending changesets).
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { loadEmdashReleaseConfig, readPackageVersion } from "./lib/emdash-release-config.mjs";

function extractChangelogSection(changelogPath, version) {
	if (!existsSync(changelogPath)) return `Release ${version}.`;

	const text = readFileSync(changelogPath, "utf8");
	const header = `## ${version}`;
	const start = text.indexOf(header);
	if (start === -1) return `Release ${version}. See ${changelogPath}.`;

	const bodyStart = start + header.length;
	const nextHeader = text.indexOf("\n## ", bodyStart);
	const section = text.slice(bodyStart, nextHeader === -1 ? undefined : nextHeader).trim();
	return section || `Release ${version}.`;
}

const config = loadEmdashReleaseConfig();
const primary = readPackageVersion(config.publishPackageDirs[0]);
const tag = `${config.githubRelease.tagPrefix}${primary.version}`;
const changelogPath = resolve(process.cwd(), config.githubRelease.notesFromChangelog);
const notes = extractChangelogSection(changelogPath, primary.version);

const existing = spawnSync(
	"gh",
	["release", "view", tag, "--repo", config.repo.github],
	{ encoding: "utf8" },
);
if (existing.status === 0) {
	console.log(`GitHub release ${tag} already exists.`);
	process.exit(0);
}

const create = spawnSync(
	"gh",
	[
		"release",
		"create",
		tag,
		"--repo",
		config.repo.github,
		"--title",
		tag,
		"--notes",
		notes,
	],
	{ encoding: "utf8", stdio: "inherit" },
);

process.exit(create.status ?? 1);
