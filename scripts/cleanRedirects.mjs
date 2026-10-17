/**
 * MindSparQ Education & Technology (mindsparqeducation.com.np)
 * Cloudflare Workers deploy guard.
 *
 * SPA deep-link routing is handled entirely by `assets.not_found_handling =
 * "single-page-application"` in wrangler.jsonc. Shipping a `_redirects` file
 * with a wildcard-to-index rule (e.g. `/*  /index.html  200`) is redundant and
 * is rejected by the Cloudflare API at version upload with:
 *
 *   Invalid _redirects configuration:
 *   Line 1: Infinite loop detected in this rule. This would cause a redirect to
 *   strip `.html` or `/index` and end up triggering this rule again.
 *   [code: 100324]
 *
 * Older commits and Cloudflare's build-output cache can re-introduce that file,
 * so we defensively strip it from both the Vite source folder (`public/`) and the
 * deploy output folder (`dist/`) before wrangler runs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const TARGETS = [
  path.join(ROOT_DIR, 'public', '_redirects'),
  path.join(ROOT_DIR, 'dist', '_redirects')
];

let removed = 0;

for (const target of TARGETS) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { force: true });
    removed += 1;
    console.log(`[MindSparQ Deploy] Removed stale _redirects file: ${target}`);
  }
}

if (removed === 0) {
  console.log('[MindSparQ Deploy] No stale _redirects files found.');
}
