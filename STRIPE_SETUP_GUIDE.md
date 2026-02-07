# Stripe Subscription Setup Guide

This guide will help you complete the Stripe integration for MacroMini's subscription system.

## What's Been Implemented

✅ **Database Schema** - Subscription tracking fields added to Supabase
✅ **Usage Limits** - Free tier limited to 10 analyses/month
✅ **Stripe Integration** - Checkout and webhook handlers created
✅ **UI Components** - Pricing page and subscription status widget
✅ **API Routes** - Usage tracking in analyze endpoint

---

## Setup Steps

### 1. Run Supabase Migration

Execute the SQL migration to add subscription fields to your database:

1. Go to your Supabase project → SQL Editor
2. Open `supabase/migration-subscriptions.sql`
3. Copy all contents and run in SQL Editor
4. Verify tables were updated (check `profiles` table for new columns)

### 2. Create Stripe Account & Products

#### A. Sign up for Stripe
- Go to [stripe.com](https://stripe.com) and create an account
- Use **Test Mode** for development (toggle in top-right)

#### B. Create Product & Price
1. Dashboard → Products → **+ Add Product**
2. Product details:
   - **Name:** MacroMini Pro
   - **Description:** Unlimited food analyses
   - **Pricing model:** Recurring
   - **Price:** $9.99 USD
   - **Billing period:** Monthly
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_...`)

### 3. Configure Environment Variables

#### Local Development (`.env.local`)
Add these to your `.env.local` file:

```env
# Supabase (add if missing)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_ID_PRO_MONTHLY=price_your-price-id
```

**Where to find Stripe keys:**
- Dashboard → Developers → API keys
- **Publishable key:** `pk_test_...` (safe to expose)
- **Secret key:** `sk_test_...` (keep secret)
- **Price ID:** From step 2B above

#### Vercel Production
Add the same environment variables in Vercel:
- Project Settings → Environment Variables
- Add each variable for **Production**, **Preview**, and **Development**

### 4. Setup Stripe Webhook (Important!)

Webhooks allow Stripe to notify your app when payments succeed/fail.

#### For Local Development (using Stripe CLI)
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret (whsec_...)
# Add to .env.local as STRIPE_WEBHOOK_SECRET
```

#### For Production (Vercel)
1. Stripe Dashboard → Developers → Webhooks → **+ Add endpoint**
2. **Endpoint URL:** `https://your-app.vercel.app/api/stripe/webhook`
3. **Events to listen for:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. Copy the **Signing secret** (whsec_...)
6. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### 5. Test the Integration

#### A. Test Free Tier Limits
1. Start your dev server: `npm run dev`
2. Sign up/login
3. Go to `/capture` and analyze 10 photos
4. On the 11th attempt, you should see: "Free tier limit reached"

#### B. Test Upgrade Flow
1. Dashboard should show usage (e.g., "7 of 10 used")
2. Click "Upgrade to Pro" button
3. Should redirect to Stripe checkout
4. Use test card: `4242 4242 4242 4242` (any future date, any CVC)
5. Complete payment
6. Webhook should fire and update your subscription to "pro"
7. Dashboard should no longer show usage limits

#### C. Test Unlimited Analyses (Pro)
1. After upgrading, try analyzing more than 10 photos
2. Should work without limits

---

## Pricing Tiers

### Free Tier
- 10 analyses per month
- Resets monthly
- All core features included

### Pro Tier ($9.99/month)
- Unlimited analyses
- All free features
- Priority support
- Early access to new features

---

## How It Works

### Usage Tracking Flow
```
User analyzes photo
  ↓
API checks subscription_tier & analyses_count
  ↓
If free && count >= 10 → Block with upgrade message
  ↓
If allowed → Call OpenAI API
  ↓
Increment analyses_count
  ↓
Log usage in analyses_log table
```

### Subscription Flow
```
User clicks "Upgrade to Pro"
  ↓
POST /api/stripe/checkout → Creates Stripe session
  ↓
Redirect to Stripe Checkout page
  ↓
User enters payment details
  ↓
Stripe processes payment
  ↓
Webhook fires: checkout.session.completed
  ↓
Update user profile:
  - subscription_tier = 'pro'
  - subscription_status = 'active'
  - stripe_subscription_id = sub_xxx
  ↓
User can now analyze unlimited photos
```

---

## Important Files

| File | Purpose |
|------|---------|
| `supabase/migration-subscriptions.sql` | Database schema for subscriptions |
| `src/app/api/analyze/route.ts` | Usage limits & tracking |
| `src/app/api/stripe/checkout/route.ts` | Create checkout session |
| `src/app/api/stripe/webhook/route.ts` | Handle payment events |
| `src/app/(app)/upgrade/page.tsx` | Pricing page |
| `src/components/ui/subscription-status.tsx` | Usage widget |
| `src/lib/types.ts` | TypeScript types |

---

## Troubleshooting

### "Free tier limit reached" not working
- Check if migration ran successfully
- Verify `analyses_count` column exists in `profiles` table
- Check browser console for errors

### Checkout session fails
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check `STRIPE_PRICE_ID_PRO_MONTHLY` matches your Stripe product
- Look at API logs in Vercel or local terminal

### Webhook not firing
- **Local:** Make sure Stripe CLI is running (`stripe listen`)
- **Production:** Verify webhook endpoint URL is correct
- Check webhook logs in Stripe Dashboard → Developers → Webhooks

### Subscription not updating after payment
- Check webhook logs for errors
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check Supabase logs for database errors
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set

---

## Cost Estimates

### Per-User Cost (Free Tier)
- 10 analyses/month × $0.015/analysis = **$0.15/user/month**

### With Subscriptions ($9.99/month)
- Break-even at: ~667 analyses/month
- Most users do 20-50 analyses/month
- **Profit margin:** ~$9.50-$9.80/user/month

---

## Next Steps

1. ✅ Run database migration
2. ✅ Create Stripe products
3. ✅ Add environment variables
4. ✅ Setup webhooks
5. ✅ Test locally
6. ✅ Deploy to Vercel
7. ✅ Test production
8. 🎉 Launch!

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Vercel function logs
3. Check Stripe webhook logs
4. Check Supabase logs

Questions? Open an issue or reach out to support.
