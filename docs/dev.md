# Developer Documentation

## Project Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Code Quality

### Type Checking

```bash
# Run TypeScript compiler without emitting files
npx tsc --noEmit
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Dead Code Analysis

### Running the Report

```bash
# Generate dead code candidates report
node scripts/dead-code-report.mjs
```

This will create:
- `reports/dead-code-candidates.csv` - CSV format for spreadsheet analysis
- `reports/dead-code-candidates.json` - JSON format for programmatic processing

### Understanding the Report

The analysis:
1. Starts from entry points (`main.tsx`, `App.tsx`)
2. Follows all static imports
3. Resolves `@/` aliases to `src/`
4. Reports files not reachable from entry points

**Note**: The analysis may report false positives for:
- Files imported dynamically (`import()`)
- Files used in route definitions
- Files referenced in configuration
- Type definition files

Always manually verify before deleting.

## Database Migrations

Changes to the database schema should be made through Supabase migrations.

Location: `supabase/migrations/`

## Edge Functions

Edge functions are located in `supabase/functions/`.

Available functions:
- `invite-family` - Create pet invitations
- `accept-invite` - Accept a pet invitation
- `delete-account` - Delete user account and data
- `export-data` - Export all user data
- `check-subscription` - Check user subscription status
- `create-checkout` - Create Stripe checkout session
- `customer-portal` - Access Stripe customer portal
- `get-invoices` - Get user invoices
- `public-pet-contact` - Handle lost pet contact requests

## RBAC System

Role-based access control is implemented in `src/rbac/`.

Components:
- `roles.ts` - Role definitions
- `guards.ts` - Permission guards
- `useRole.ts` - Hook to get user's role
- `Readonly.tsx` - Component for read-only UI

See `docs/rbac.md` for detailed documentation.

## Testing Checklist

Before deploying:

- [ ] Run type check: `npx tsc --noEmit`
- [ ] Run linter: `npm run lint`
- [ ] Test authentication flow
- [ ] Test RBAC permissions (owner/family/caregiver)
- [ ] Test invite flow
- [ ] Test data export
- [ ] Test account deletion (in dev environment only!)
- [ ] Check responsive design
- [ ] Test dark mode

## Environment Variables

Required environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

See `.env.example` for full list with descriptions.

## Performance Monitoring

Check bundle size after changes:

```bash
npm run build
```

Review the build output for size warnings.

## Security

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Review RLS policies before deployment
- Test with different user roles
- Validate all user inputs
- Sanitise data before display

## Debugging

### Console Logging

Use the logger utility for consistent logging:

```typescript
import { log } from '@/lib/log';

log.info('User action', { userId, action });
log.warn('Potential issue', { details });
log.error('Error occurred', error);
```

Production logs are automatically suppressed.

### Supabase Logs

Check edge function logs in the Supabase dashboard:
```
Dashboard > Edge Functions > Function > Logs
```

### Network Debugging

Use browser DevTools Network tab to inspect:
- API requests
- Edge function calls
- Authentication flow
- Storage operations
