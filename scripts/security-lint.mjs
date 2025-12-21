import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const allowlist = new Set([
  'src/components/ui/chart.tsx',
]);

const rg = (pattern) => {
  try {
    return execSync(`rg -n "${pattern}" src`, { encoding: 'utf8' }).trim();
  } catch (error) {
    if (error.status === 1) return '';
    throw error;
  }
};

const checkDangerousHtml = () => {
  const matches = rg('dangerouslySetInnerHTML');
  if (!matches) return;

  const violations = matches
    .split('\n')
    .map((line) => line.split(':')[0])
    .filter((file) => !allowlist.has(file));

  if (violations.length) {
    throw new Error(`dangerouslySetInnerHTML found outside allowlist: ${violations.join(', ')}`);
  }
};

const checkTokenLogging = () => {
  const patterns = [
    'console\\.(log|warn|error)\\([^)]*(access_token|refresh_token|id_token)',
    'console\\.(log|warn|error)\\([^)]*supabase.*token',
  ];

  for (const pattern of patterns) {
    const matches = rg(pattern);
    if (matches) {
      throw new Error(`Potential token logging detected:\n${matches}`);
    }
  }
};

const run = () => {
  checkDangerousHtml();
  checkTokenLogging();
  console.log('[security-lint] OK');
};

run();
