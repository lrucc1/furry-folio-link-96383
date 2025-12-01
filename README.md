# PetLinkID

A comprehensive pet management platform for Australian pet owners.

## Project info

**URL**: https://lovable.dev/projects/8cd4ae6a-383c-4c64-9222-187a7ecfa42a

## Quick Start

### Prerequisites
- Node.js 18+ and npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- A Google Maps API key (for address autocomplete features)

### Setup

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys (see Security section below)

# Start development server
npm run dev
```

### Available Scripts

```sh
npm run dev         # Start development server
npm run build       # Build for production
npm run typecheck   # Run TypeScript type checking
npm run lint        # Run ESLint
npm run lint:fix    # Auto-fix linting issues
npm run preview     # Preview production build
```

### Apple Sign-In configuration

Apple Sign-In uses bundle-aware client IDs. Define an environment variable for each bundle ID found in your Capacitor configs (`capacitor.config.ts`, `capacitor.config.production.ts`). The variable name is `VITE_APPLE_CLIENT_ID_<BUNDLE_ID>`, where the bundle ID is uppercased and non-alphanumeric characters are replaced with `_`.

Example (for `com.petlinkid.app`):

```env
# .env.development
VITE_APPLE_CLIENT_ID_COM_PETLINKID_APP=your.dev.client.id

# .env.production
VITE_APPLE_CLIENT_ID_COM_PETLINKID_APP=your.production.client.id
```

At runtime, the iOS app will read the bundle ID from Capacitor, resolve the matching client ID, and log a clear error if the expected variable is missing or malformed. Use `npm run validate:env -- --env=production` to confirm the required keys are present before releasing.

## Security

### API Keys & Secrets

**CRITICAL**: Never commit real API keys to version control.

1. **Google Maps API Key** (required for address autocomplete):
   - Create a key at [Google Cloud Console](https://console.cloud.google.com/)
   - Restrict to your domains in Application restrictions
   - Enable only: Maps JavaScript API, Places API
   - Rotate every 90 days
   - Add to `.env` as `VITE_GOOGLE_MAPS_API_KEY`

2. **Supabase Keys**:
   - Managed automatically by Lovable Cloud
   - Never expose service role key in client code

3. **Stripe Keys**:
   - Use publishable key for client, secret key for edge functions only
   - Store in Lovable Cloud secrets management

### Best Practices

- ✅ Use `.env.example` as a template (no real values)
- ✅ Keep production secrets in Lovable Cloud
- ✅ Enable domain restrictions on Google API keys
- ✅ Rotate API keys regularly (every 90 days)
- ❌ Never hardcode API keys in source code
- ❌ Never commit `.env` file to Git

## Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn-ui + Tailwind CSS
- **Backend**: Lovable Cloud (Supabase)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Payments**: Stripe
- **Maps**: Google Maps API

## Development

### Code Quality

Type checking and linting run automatically in CI:

```sh
npm run typecheck  # Must pass before merge
npm run lint       # Must pass before merge
```

### Logging

Use the environment-aware logger instead of console:

```typescript
import log from '@/lib/log';

log.debug('Development-only message');  // Silent in production
log.info('Info message');                // Silent in production
log.warn('Warning message');             // Always logged
log.error('Error message');              // Always logged
```

## Data Handling

- **Backups**: Automatic daily backups via Lovable Cloud
- **Retention**: User data retained according to Australian Privacy Act
- **Security**: Row-Level Security (RLS) enforced on all tables
- **Breach Response**: Contact support@petlinkid.com for security concerns

See [Privacy Policy](/privacy) and [Data Handling](/data-handling) for details.

## Deployment

Deploy via [Lovable](https://lovable.dev/projects/8cd4ae6a-383c-4c64-9222-187a7ecfa42a):

1. Click **Share → Publish**
2. Your app is live at `*.lovable.app`
3. Optional: Connect custom domain in Project > Settings > Domains

Read more: [Custom Domain Setup](https://docs.lovable.dev/features/custom-domain)

## Editing the Code

### Use Lovable (Recommended)
Visit [Lovable Project](https://lovable.dev/projects/8cd4ae6a-383c-4c64-9222-187a7ecfa42a) and start prompting. Changes commit automatically.

### Use Your IDE
Clone repo, make changes, push. Changes sync to Lovable.

### GitHub Codespaces
Click Code → Codespaces → New codespace for cloud IDE.

### Direct GitHub Edit
Click pencil icon on any file to edit in browser.

## Support

- **Documentation**: [docs.lovable.dev](https://docs.lovable.dev)
- **Issues**: Use GitHub Issues
- **Security**: security@petlinkid.com
- **General**: support@petlinkid.com

## License

Proprietary - All rights reserved
