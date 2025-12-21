import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { buildCors, json } from '../_shared/cors.ts';
import { makeAnonClient, makeServiceClient, must } from '../_shared/clients.ts';

const PROD_ENDPOINT = 'https://buy.itunes.apple.com/verifyReceipt';
const SANDBOX_ENDPOINT = 'https://sandbox.itunes.apple.com/verifyReceipt';

const SHARED_SECRET = must('APPLE_IAP_SHARED_SECRET');
const EXPECTED_BUNDLE_ID = must('APPLE_IAP_BUNDLE_ID');
const ALLOWED_PRODUCT_IDS = [
  must('APPLE_PRO_MONTHLY_PRODUCT_ID'),
  must('APPLE_PRO_YEARLY_PRODUCT_ID'),
];

interface ApplePurchase {
  product_id?: string;
  transaction_id?: string;
  original_transaction_id?: string;
  expires_date_ms?: string;
  purchase_date_ms?: string;
  cancellation_date_ms?: string;
}

interface ApplePendingRenewalInfo {
  product_id?: string;
  auto_renew_status?: string;
  expiration_intent?: string;
}

interface AppleReceiptResponse {
  status: number;
  environment?: string;
  latest_receipt_info?: ApplePurchase[];
  receipt?: {
    bundle_id?: string;
    in_app?: ApplePurchase[];
  };
  pending_renewal_info?: ApplePendingRenewalInfo[];
}

async function callApple(endpoint: string, receiptData: string): Promise<AppleReceiptResponse> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'receipt-data': receiptData,
      password: SHARED_SECRET,
      'exclude-old-transactions': true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Apple verification failed with status ${response.status}`);
  }

  return await response.json() as AppleReceiptResponse;
}

async function verifyReceipt(receiptData: string): Promise<AppleReceiptResponse> {
  const productionResult = await callApple(PROD_ENDPOINT, receiptData);

  // 21007 indicates the receipt is for the sandbox/TestFlight environment
  if (productionResult.status === 21007) {
    return await callApple(SANDBOX_ENDPOINT, receiptData);
  }

  return productionResult;
}

function pickLatestPurchase(result: AppleReceiptResponse) {
  const candidates = [
    ...(result.latest_receipt_info ?? []),
    ...(result.receipt?.in_app ?? []),
  ].filter((p) => p.product_id && ALLOWED_PRODUCT_IDS.includes(p.product_id));

  if (!candidates.length) return null;

  candidates.sort((a, b) => {
    const aDate = Number(a.expires_date_ms ?? a.purchase_date_ms ?? 0);
    const bDate = Number(b.expires_date_ms ?? b.purchase_date_ms ?? 0);
    return bDate - aDate;
  });

  return candidates[0];
}

function computeStatus(purchase: ApplePurchase, renewals?: ApplePendingRenewalInfo[]): 'active' | 'canceled' {
  const expiresAt = purchase.expires_date_ms ? Number(purchase.expires_date_ms) : undefined;
  const renewal = renewals?.find((r) => r.product_id === purchase.product_id);

  if (purchase.cancellation_date_ms) return 'canceled';
  if (renewal?.expiration_intent) return 'canceled';
  if (renewal?.auto_renew_status === '0') return 'canceled';
  if (expiresAt && expiresAt < Date.now()) return 'canceled';
  return 'active';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: buildCors(req) });

  try {
    const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization');
    if (!authHeader) return json(req, { error: 'Missing auth header' }, 401);

    const anonClient = makeAnonClient(authHeader);
    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) return json(req, { error: 'Unauthorized' }, 401);

    let body: any;
    try {
      body = await req.json();
    } catch {
      return json(req, { error: 'Invalid JSON body' }, 400);
    }

    const receiptData: string | undefined = body?.receiptData || body?.receipt;
    const productId: string | undefined = body?.productId;
    const clientTransactionId: string | undefined = body?.transactionId;

    if (!receiptData) return json(req, { error: 'Missing receipt data' }, 400);
    if (productId && !ALLOWED_PRODUCT_IDS.includes(productId)) {
      return json(req, { error: 'Unknown productId for this app' }, 400);
    }

    const validation = await verifyReceipt(receiptData);
    if (validation.status !== 0) {
      const message = validation.status === 21002
        ? 'The receipt could not be parsed.'
        : `Apple receipt validation failed (${validation.status}).`;
      return json(req, { error: message }, 400);
    }

    const bundleId = validation.receipt?.bundle_id;
    if (!bundleId || bundleId !== EXPECTED_BUNDLE_ID) {
      return json(req, { error: 'Receipt bundle mismatch for this app' }, 400);
    }

    const latestPurchase = pickLatestPurchase(validation);
    if (!latestPurchase) {
      return json(req, { error: 'No matching purchase found in receipt' }, 404);
    }

    const originalTransactionId = latestPurchase.original_transaction_id
      ?? latestPurchase.transaction_id
      ?? clientTransactionId;

    if (!originalTransactionId) {
      return json(req, { error: 'Missing transaction identifier in receipt' }, 400);
    }

    const status = computeStatus(latestPurchase, validation.pending_renewal_info);
    const expiresAt = latestPurchase.expires_date_ms
      ? new Date(Number(latestPurchase.expires_date_ms)).toISOString()
      : null;
    const resolvedProductId = latestPurchase.product_id ?? productId;
    const billingInterval = resolvedProductId === ALLOWED_PRODUCT_IDS[0]
      ? 'month'
      : resolvedProductId === ALLOWED_PRODUCT_IDS[1]
        ? 'year'
        : null;

    const serviceClient = makeServiceClient();
    const { data: existingTransaction, error: txError } = await serviceClient
      .from('apple_iap_transactions')
      .select('user_id')
      .eq('original_transaction_id', originalTransactionId)
      .maybeSingle();

    if (txError) throw txError;
    if (existingTransaction && existingTransaction.user_id !== user.id) {
      return json(req, { error: 'Receipt already linked to another account' }, 409);
    }

    if (existingTransaction) {
      const { error: updateTxError } = await serviceClient
        .from('apple_iap_transactions')
        .update({
          product_id: resolvedProductId ?? 'unknown',
          environment: validation.environment ?? 'production',
          last_seen_at: new Date().toISOString(),
        })
        .eq('original_transaction_id', originalTransactionId);

      if (updateTxError) throw updateTxError;
    } else {
      const { error: insertTxError } = await serviceClient
        .from('apple_iap_transactions')
        .insert({
          user_id: user.id,
          original_transaction_id: originalTransactionId,
          product_id: resolvedProductId ?? 'unknown',
          environment: validation.environment ?? 'production',
          last_seen_at: new Date().toISOString(),
        });

      if (insertTxError) throw insertTxError;
    }

    const { error: updateError } = await serviceClient
      .from('profiles')
      .update({
        plan_v2: 'PRO',
        subscription_status: status,
        plan_source: 'apple',
        next_billing_at: expiresAt,
        plan_updated_at: new Date().toISOString(),
        billing_interval: billingInterval,
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return json(req, {
      ok: true,
      environment: validation.environment ?? 'production',
      product_id: resolvedProductId,
      status,
      expires_at: expiresAt,
      transaction_id: originalTransactionId,
    });
  } catch (error: any) {
    console.error('validate-apple-receipt error', error);
    return json(req, { error: error?.message ?? String(error) }, 500);
  }
});
