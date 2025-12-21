import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'TEST_USER_EMAIL',
  'TEST_USER_PASSWORD',
  'ALT_TEST_USER_EMAIL',
  'ALT_TEST_USER_PASSWORD',
];

const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
  ALT_TEST_USER_EMAIL,
  ALT_TEST_USER_PASSWORD,
  PUBLIC_PET_TOKEN,
} = process.env;

const makeClient = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const signIn = async (client, email, password) => {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data?.user) throw new Error(`Unable to sign in ${email}: ${error?.message ?? 'unknown error'}`);
  return data.user;
};

const runSecurityLint = () => {
  execSync('node scripts/security-lint.mjs', { stdio: 'inherit' });
};

const assertSupabaseStorageConfig = () => {
  const clientSource = readFileSync('src/integrations/supabase/client.ts', 'utf8');

  if (!clientSource.includes('Capacitor.isNativePlatform')) {
    throw new Error('Supabase client is missing native platform detection.');
  }

  if (!clientSource.includes('biometricStorage')) {
    throw new Error('Supabase client is missing native secure storage adapter.');
  }

  if (!clientSource.includes('warnIfNativeLocalStorage')) {
    throw new Error('Supabase client is missing native localStorage guardrail.');
  }

  console.log('[security-regression] ✓ Supabase storage configuration verified');
};

const run = async () => {
  console.log('[security-regression] Starting checks...');
  runSecurityLint();
  assertSupabaseStorageConfig();

  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    console.warn(`[security-regression] Missing env vars: ${missing.join(', ')}. Skipping live Supabase checks.`);
    return;
  }

  const clientA = makeClient();
  const clientB = makeClient();

  const userA = await signIn(clientA, TEST_USER_EMAIL, TEST_USER_PASSWORD);
  const userB = await signIn(clientB, ALT_TEST_USER_EMAIL, ALT_TEST_USER_PASSWORD);

  console.log('[security-regression] Authenticated test users.');

  // PT-001: Ensure profile plan fields cannot be tampered with by user
  const { error: planUpdateError } = await clientA
    .from('profiles')
    .update({ plan_v2: 'PRO', subscription_status: 'active' })
    .eq('id', userA.id);

  assert(planUpdateError, 'Expected plan update to be blocked for non-admin user.');
  console.log('[security-regression] ✓ Plan tampering blocked');

  // PT-002: Cross-user access attempt (IDOR-style)
  const { data: createdPet, error: createPetError } = await clientB
    .from('pets')
    .insert({ name: 'Security Test Pet', species: 'Dog', user_id: userB.id })
    .select('id')
    .single();

  if (createPetError || !createdPet) {
    throw new Error(`Unable to create pet for test user: ${createPetError?.message ?? 'unknown error'}`);
  }

  const { data: forbiddenPet } = await clientA
    .from('pets')
    .select('id')
    .eq('id', createdPet.id)
    .maybeSingle();

  assert(!forbiddenPet, 'Expected cross-user pet access to return no rows.');
  console.log('[security-regression] ✓ Cross-user pet access blocked');

  // PT-003: Admin role enforcement
  const adminAttempt = await clientA.functions.invoke('admin-audit-limits');
  assert(adminAttempt.error, 'Expected admin function to reject non-admin user.');
  console.log('[security-regression] ✓ Admin role enforcement verified');

  if (PUBLIC_PET_TOKEN) {
    const publicPet = await clientA.functions.invoke('public-pet-contact', {
      body: { public_token: PUBLIC_PET_TOKEN },
    });
    assert(!publicPet.error, 'Expected public pet lookup to succeed with valid token.');
    console.log('[security-regression] ✓ Public pet lookup works with token');
  } else {
    console.log('[security-regression] Skipping public pet lookup test (PUBLIC_PET_TOKEN not set).');
  }

  console.log('[security-regression] All checks completed.');
};

run().catch((error) => {
  console.error('[security-regression] Failed:', error.message);
  process.exit(1);
});
