// Minimal test runner: bundles each tests/**/*.test.ts with esbuild (already installed by Vite)
// and runs it in Node. Tests use node:test and node:assert, so no extra dependency is needed.
import { build } from "esbuild";
import { readdirSync, mkdtempSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const testsDir = join(root, "tests");

const findTests = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return findTests(path);
    return entry.name.endsWith(".test.ts") ? [path] : [];
  });

const files = findTests(testsDir);
const outDir = mkdtempSync(join(tmpdir(), "motorcars-tests-"));
let failed = 0;

try {
  for (const file of files) {
    const outfile = join(outDir, relative(testsDir, file).replace(/[\\/]/g, "__").replace(/\.ts$/, ".mjs"));
    await build({
      entryPoints: [file],
      bundle: true,
      platform: "node",
      format: "esm",
      outfile,
      alias: { "@": join(root, "src") },
      logLevel: "warning",
    });
    const result = spawnSync(process.execPath, ["--test", "--test-reporter=spec", outfile], { stdio: "inherit" });
    if (result.status !== 0) failed++;
  }
} finally {
  rmSync(outDir, { recursive: true, force: true });
}

console.log(failed ? `\n${failed} test file(s) failed` : `\nAll ${files.length} test file(s) passed`);
process.exit(failed ? 1 : 0);
