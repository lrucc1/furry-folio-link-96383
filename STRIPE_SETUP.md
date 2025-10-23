# Stripe Configuration Guide

This application uses Stripe for subscription payments. Follow these steps to configure Stripe in your Lovable project.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Access to your Lovable project's environment settings

## Step 1: Get Your Stripe Keys

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Click "Developers" in the left sidebar
3. Click "API keys"
4. Copy your **Publishable key** (starts with `pk_`)
5. Copy your **Secret key** (starts with `sk_`) - keep this secure!

## Step 2: Create Products and Prices

1. In Stripe Dashboard, go to "Products" → "Add product"
2. Create a product called "PetLinkID Pro" (or your app name)
3. Add two prices to this product:
   - **Monthly**: $2.99 AUD per month (recurring)
   - **Yearly**: $28.99 AUD per year (recurring)
4. Copy the Price IDs:
   - Monthly price ID (starts with `price_`)
   - Yearly price ID (starts with `price_`)

## Step 3: Configure Environment Variables in Lovable

Add these environment variables in your Lovable project settings:

### Client-Side (Public)
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
VITE_STRIPE_PRICE_PRO_MONTHLY_AUD=price_...
VITE_STRIPE_PRICE_PRO_YEARLY_AUD=price_...
```

### Server-Side (Secret - only in Edge Functions)
```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
```

**Important**: The secret key should ONLY be used in Edge Functions, never in client-side code.

## Step 4: Test Mode vs Live Mode

- **Test Mode**: Use `pk_test_` and `sk_test_` keys for development
- **Live Mode**: Use `pk_live_` and `sk_live_` keys for production

Make sure to create prices in the same mode as your keys!

## Step 5: Configure Stripe Customer Portal (Optional)

To allow users to manage their subscriptions:

1. In Stripe Dashboard, go to "Settings" → "Billing" → "Customer portal"
2. Click "Activate test link" or "Activate live link"
3. Configure what customers can do (update payment method, cancel, etc.)
4. Save changes

## Troubleshooting

### "Checkout is not configured"
- Verify all four environment variables are set correctly
- Check that price IDs match your Stripe products
- Ensure you're using the correct mode (test vs live)

### "Invalid API key"
- Verify publishable and secret keys are from the same Stripe mode
- Check for extra spaces or characters when copying keys

### Checkout not opening
- Check browser console for errors
- Verify the `create-checkout` Edge Function is deployed
- Check Edge Function logs in Lovable Cloud

## Security Best Practices

1. **Never commit** `.env` files to version control
2. **Rotate keys** every 90 days
3. **Use test mode** during development
4. **Restrict API keys** in Stripe Dashboard (IP allowlist for secret keys)
5. **Monitor** failed payments and suspicious activity

## Support

- Stripe Documentation: https://stripe.com/docs
- Lovable Documentation: https://docs.lovable.dev
- For app-specific issues, check Edge Function logs in Lovable Cloud
