# Pricing Update Summary - PetLinkID

## Date: 2025

## New Pricing Structure

### Premium Plan
- **Monthly**: $4.49 AUD/month
- **Annual**: $48.44 AUD/year (10% discount - only shown on Stripe checkout)
- **Features**:
  - Up to 5 pets
  - Family sharing (up to 5 members)
  - VetShare - Share medical records with vets via QR code
  - Unlimited custom lost pet posters
  - Document storage (50MB)
  - Priority support
  - Advanced health tracking

### Family Plan
- **Monthly**: $7.99 AUD/month
- **Features**:
  - Everything in Premium
  - Unlimited pets
  - Family sharing (up to 10 members)
  - Multi-household sharing
  - VetShare - Share medical records with vets via QR code
  - Document storage (200MB)
  - Priority support

### Free Plan
- **Price**: $0 (no change)
- **Features**:
  - Up to 1 pet
  - Basic pet profiles
  - Lost pet alerts
  - Health reminders
  - 1 free lost-pet poster

---

## Stripe Products & Prices Created

### Premium (Updated)
- **Product ID**: `prod_TGGcRtzlK6vz7A`
- **Monthly Price ID**: `price_1SJk4yEhyEZfSSpN8x8KqTGY` ($4.49 AUD/month)
- **Annual Price ID**: `price_1SJk5EEhyEZfSSpNpADhN5AQ` ($48.44 AUD/year)

### Family (Updated)
- **Product ID**: `prod_TGGcY3nKNalPuA`
- **Monthly Price ID**: `price_1SJk5TEhyEZfSSpNKpDL6ZyO` ($7.99 AUD/month)

---

## Files Updated

### Frontend Components
1. **src/pages/Pricing.tsx**
   - Updated SUBSCRIPTION_TIERS with new prices
   - Added `priceIdAnnual` for Premium plan
   - Added annual subscription button (Premium only)
   - Updated `handleSubscribe` to support annual billing

2. **src/pages/Index.tsx**
   - Updated pricing display on homepage
   - Premium: $4.49/month
   - Family: $7.99/month

3. **src/pages/Account.tsx**
   - Updated `getTierPrice()` helper
   - Updated product IDs for tier matching
   - Premium: $4.49, Family: $7.99

4. **src/components/ManageSubscriptionModal.tsx**
   - Updated tier prices
   - Updated product IDs

5. **src/pages/admin/Dashboard.tsx**
   - Updated MRR calculation: `(premium * 4.49) + (family * 7.99)`

### Backend
- **supabase/functions/create-checkout/index.ts**: No changes required (already supports any priceId)

---

## User Experience

### Pricing Page
- **Free Plan**: Shows "Free Forever" button
- **Premium Plan**: 
  - "Subscribe Monthly" button ($4.49/month)
  - "Subscribe Annually (10% off)" button ($48.44/year) - **NEW**
- **Family Plan**: "Subscribe Monthly" button ($7.99/month)

### Annual Discount
- Only available for Premium plan
- 10% discount: $4.49 × 12 = $53.88 → $48.44/year
- Annual option only visible on Pricing page, not mentioned elsewhere in the app

### Checkout Flow
1. User clicks "Subscribe Monthly" or "Subscribe Annually (10% off)"
2. Opens Stripe Checkout in new tab with appropriate price ID
3. Stripe handles payment processing
4. Redirects to /account on success

---

## Migration Notes

### Old Products (Deprecated)
- Premium (Old): `prod_TBUW3WogN0dEtQ` - $9.99/month ❌
- Family (Old): `prod_TBUX7Ubgxwr3co` - $14.99/month ❌

### New Products (Active)
- Premium (New): `prod_TGGcRtzlK6vz7A` - $4.49/month ✅
- Premium Annual (New): `prod_TGGcf3kSLGuP3p` - $48.44/year ✅
- Family (New): `prod_TGGcY3nKNalPuA` - $7.99/month ✅

### Existing Subscribers
- Grandfathered at old pricing until they manually change plans
- Can upgrade/downgrade to new pricing via Account page

---

## Testing Checklist

- [ ] Pricing page displays correct prices
- [ ] Premium shows both monthly and annual options
- [ ] Family shows only monthly option
- [ ] Stripe checkout opens with correct price ID
- [ ] Monthly checkout works for Premium
- [ ] Annual checkout works for Premium (10% off)
- [ ] Monthly checkout works for Family
- [ ] Account page shows correct pricing
- [ ] Admin dashboard MRR calculation accurate
- [ ] Homepage displays updated pricing

---

## Deployment Notes

1. **Old price IDs remain valid** for existing subscribers
2. **New price IDs** will be used for all new subscriptions
3. **No database migrations needed** (pricing stored in code)
4. **Stripe products created** and active immediately
5. **Both environments** (web & ios_free) updated automatically

---

**Status**: ✅ Complete
**Updated by**: Lovable AI
**Date**: 2025-01-19
