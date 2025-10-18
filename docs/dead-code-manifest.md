# Dead Code Removal Manifest

## Overview

This document tracks the identification and removal of unused code files from the PetLinkID project.

## Analysis Date

Last analysis: _To be run with `node scripts/dead-code-report.mjs`_

## How to Run Analysis

```bash
node scripts/dead-code-report.mjs
```

This generates:
- `reports/dead-code-candidates.csv` - List of potentially unused files with sizes
- `reports/dead-code-candidates.json` - Detailed JSON report

## Review Process

For each candidate file:

1. ✅ **Verify** - Confirm the file is not used via:
   - Dynamic imports (`import()`)
   - Route registration
   - Config files
   - Public assets

2. 📝 **Document** - Note why it's safe to delete

3. 🗑️ **Delete** - Remove the file and update imports

4. ✅ **Test** - Ensure app builds and runs

## Exclusions

Files excluded from analysis (intentionally kept):
- Test files (`*.test.ts`, `*.spec.ts`)
- Story files (`*.stories.ts`)
- Public assets
- Configuration files
- Type definitions

## Removed Files

### Phase 1: _Date_

| File | Reason | Size (bytes) |
|------|--------|--------------|
| _None yet_ | - | - |

**Total saved**: 0 KB

### Phase 2: _Date_

_To be filled when phase 2 is complete_

## Files Kept (False Positives)

Files that appear unused but are actually needed:

| File | Reason to Keep |
|------|----------------|
| `src/vite-env.d.ts` | Type definitions for Vite |
| `src/types/google-maps.d.ts` | Type definitions for Google Maps |

## Impact

- **Bundle size reduction**: 0 KB (after phase 1)
- **Maintenance improvement**: Fewer files to maintain
- **Build time**: Potentially faster builds

## Next Steps

1. Run analysis regularly (monthly)
2. Review new candidates
3. Document and remove safe files
4. Track metrics over time

## Notes

- Always backup before bulk deletions
- Run full test suite after removals
- Check for breaking changes in routes
- Review dynamic imports carefully
