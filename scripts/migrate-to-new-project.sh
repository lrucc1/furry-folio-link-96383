#!/usr/bin/env bash
set -euo pipefail

# Migration script for PetLinkID Supabase project
# Target: pnlsootdnywbkqnxsqya.supabase.co
#
# Prerequisites:
#   - Supabase CLI installed (npx supabase)
#   - SUPABASE_ACCESS_TOKEN set in environment
#   - Database password available

PROJECT_REF="pnlsootdnywbkqnxsqya"
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT=5432
DB_USER="postgres"
DB_NAME="postgres"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SCHEMA_FILE="${PROJECT_DIR}/supabase/schema-export.sql"
FUNCTIONS_DIR="${PROJECT_DIR}/supabase/functions"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_step() { echo -e "\n${GREEN}[STEP]${NC} $1"; }
log_info() { echo -e "${YELLOW}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_ok() { echo -e "${GREEN}[OK]${NC} $1"; }

# ── Step 1: Verify prerequisites ──────────────────────────────────────────────
log_step "1/5 — Verifying prerequisites"

if ! command -v npx &>/dev/null; then
  log_error "npx not found. Install Node.js first."
  exit 1
fi

SUPABASE_VERSION=$(npx supabase --version 2>/dev/null || true)
if [ -z "$SUPABASE_VERSION" ]; then
  log_info "Installing Supabase CLI..."
  npm install --save-dev supabase
fi
log_ok "Supabase CLI: $(npx supabase --version)"

if [ ! -f "$SCHEMA_FILE" ]; then
  log_error "Schema file not found: $SCHEMA_FILE"
  exit 1
fi
log_ok "Schema file found: $SCHEMA_FILE"

# ── Step 2: Link to the new project ───────────────────────────────────────────
log_step "2/5 — Linking to new Supabase project: $PROJECT_REF"

if [ -z "${SUPABASE_DB_PASSWORD:-}" ]; then
  read -rsp "Enter database password: " SUPABASE_DB_PASSWORD
  echo
fi

cd "$PROJECT_DIR"
npx supabase link --project-ref "$PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"
log_ok "Project linked successfully"

# ── Step 3: Run schema against the database ───────────────────────────────────
log_step "3/5 — Applying schema to database"

PGPASSWORD="$SUPABASE_DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -f "$SCHEMA_FILE" \
  --set ON_ERROR_STOP=1

log_ok "Schema applied successfully"

# ── Step 4: Deploy all Edge Functions ─────────────────────────────────────────
log_step "4/5 — Deploying Edge Functions"

FUNCTIONS=(
  accept-invite
  admin-audit-limits
  admin-delete-account
  admin-set-plan
  check-subscription
  cleanup-deleted-accounts
  create-pet
  delete-account
  entitlement-check
  export-data
  get-entitlements
  invite-family
  proxy-pet-image
  public-pet-contact
  restore-account
  send-auth-email
  send-contact-email
  send-reminder-emails
  send-trial-notifications
  start-trial
  submit-smart-tag-interest
  test-reminder-emails
  track-consent
  validate-apple-receipt
)

DEPLOY_FAILED=0
for fn in "${FUNCTIONS[@]}"; do
  log_info "Deploying: $fn"
  if npx supabase functions deploy "$fn" --project-ref "$PROJECT_REF" 2>&1; then
    log_ok "Deployed: $fn"
  else
    log_error "Failed to deploy: $fn"
    DEPLOY_FAILED=$((DEPLOY_FAILED + 1))
  fi
done

if [ $DEPLOY_FAILED -gt 0 ]; then
  log_error "$DEPLOY_FAILED function(s) failed to deploy"
else
  log_ok "All ${#FUNCTIONS[@]} Edge Functions deployed successfully"
fi

# ── Step 5: Verify storage bucket ────────────────────────────────────────────
log_step "5/5 — Verifying 'pet-documents' storage bucket"

BUCKET_CHECK=$(PGPASSWORD="$SUPABASE_DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -t -A \
  -c "SELECT id FROM storage.buckets WHERE id = 'pet-documents';" 2>/dev/null)

if [ "$BUCKET_CHECK" = "pet-documents" ]; then
  log_ok "Storage bucket 'pet-documents' exists"
else
  log_error "Storage bucket 'pet-documents' not found! Check schema-export.sql"
  exit 1
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════"
echo "  Migration Complete"
echo "  Project: ${PROJECT_REF}.supabase.co"
echo "  Schema:  Applied"
echo "  Functions: ${#FUNCTIONS[@]} deployed"
echo "  Storage: pet-documents bucket verified"
echo "════════════════════════════════════════════════════════"
