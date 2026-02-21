

# Fix: Keychain Race Condition Wiping Auth Tokens

## Root Cause

The `biometricStorage` adapter in `src/integrations/supabase/client.ts` has no concurrency control. Supabase Auth calls `getItem`/`setItem`/`removeItem` concurrently during session init and token refresh. Each call does a full read-modify-write cycle on the keychain, and concurrent calls overwrite each other, eventually wiping the store to `{}`.

## The Fix

Add a **serialized async queue** (mutex) so all keychain read-modify-write operations execute one at a time, preventing data loss.

## What Changes

### File: `src/integrations/supabase/client.ts`

Add a simple promise-based mutex before the `biometricStorage` object. All `setItem` and `removeItem` calls will be serialized through it, while `getItem` (read-only) can still proceed concurrently.

**Before (broken):**
```typescript
async setItem(key: string, value: string) {
  const store = await biometricStorage.getStore();  // read
  store[key] = value;                                // modify
  await biometricStorage.saveStore(store);           // write (RACE!)
}
```

**After (fixed):**
```typescript
// Simple mutex to serialize keychain writes
let writeQueue: Promise<void> = Promise.resolve();

function serialized<T>(fn: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(fn);
  writeQueue = result.then(() => {}, () => {});
  return result;
}

// ...
async setItem(key: string, value: string) {
  return serialized(async () => {
    const store = await biometricStorage.getStore();
    store[key] = value;
    await biometricStorage.saveStore(store);
  });
}
```

The same serialization wraps `removeItem`. `getItem` remains unchanged since reads don't mutate.

### Secondary: `KeychainError error 1`

This error comes from `src/lib/biometricAuth.ts` calling `NativeBiometric.getCredentials({ server: 'app.petlinkid.credentials' })` to check if biometric login credentials exist. When none are stored, the keychain throws error 1 (item not found). This is already caught and handled (returns `false`), so it is harmless. No code change needed — it is working as designed.

## Files Modified

| File | Change |
|------|--------|
| `src/integrations/supabase/client.ts` | Add write mutex to `setItem` and `removeItem` to prevent concurrent keychain clobbering |

## Impact

- Fixes auth token loss on iOS native that causes random sign-outs
- No database changes
- No new dependencies
- No visual/UI changes
