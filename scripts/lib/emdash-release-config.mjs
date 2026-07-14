import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_CONFIG = {
	publishPackageDirs: [
		"packages/emdash-plugin-md-draft",
		"packages/mcp-emdash-drafts",
	],
	githubRelease: {
		tagPrefix: "v",
		notesFromChangelog: "packages/emdash-plugin-md-draft/CHANGELOG.md",
	},
	emdash: {
		minPeerVersion: "0.14.0",
		pluginPackage: "@emplugins/emdash-plugin-md-draft",
	},
	repo: {
		github: "EmPlugins/EmPost",
		baseBranch: "main",
	},
};

export function loadEmdashReleaseConfig(cwd = process.cwd()) {
	const configPath = resolve(cwd, ".cursor/emdash-release.json");
	if (!existsSync(configPath)) {
		return { ...DEFAULT_CONFIG, configPath: null };
	}

	const raw = JSON.parse(readFileSync(configPath, "utf8"));
	return {
		...DEFAULT_CONFIG,
		...raw,
		publishPackageDirs: raw.publish?.packageDirs ?? DEFAULT_CONFIG.publishPackageDirs,
		githubRelease: {
			...DEFAULT_CONFIG.githubRelease,
			...raw.publish?.githubRelease,
		},
		configPath,
	};
}

export function readPackageVersion(packageDir, cwd = process.cwd()) {
	const pkgPath = resolve(cwd, packageDir, "package.json");
	const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
	return { name: pkg.name, version: pkg.version, dir: packageDir };
}
