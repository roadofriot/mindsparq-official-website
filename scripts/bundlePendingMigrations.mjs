// Concatenates the idempotent migrations that production is missing into ONE file
// that can be pasted into Supabase Dashboard › SQL Editor › Run.
// Usage: node scripts/bundlePendingMigrations.mjs
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('supabase/migrations');
const files = [
  '20261015000004_super_admin_and_multi_author_blog.sql',
  '20261016000006_curriculum_resources_and_editorial_statuses.sql',
  '20261016000007_team_profiles_and_governance.sql',
  '20261017000008_cms_core.sql' // also contains the (idempotent) content_versions table from 05
];

const header = `-- =============================================================================
-- MindSparQ — APPLY PENDING MIGRATIONS (generated ${new Date().toISOString()})
-- Paste this whole file into Supabase Dashboard › SQL Editor and press "Run".
-- Every statement is idempotent: running it twice is safe.
-- =============================================================================\n\n`;

const body = files
  .map((f) => `-- >>>>>>>>>>>>>>>>>>>> ${f}\n${fs.readFileSync(path.join(dir, f), 'utf8').trim()}\n`)
  .join('\n');

fs.writeFileSync(path.resolve('supabase/APPLY_PENDING_MIGRATIONS.sql'), header + 'begin;\n\n' + body + '\ncommit;\n');
console.log('Wrote supabase/APPLY_PENDING_MIGRATIONS.sql');
