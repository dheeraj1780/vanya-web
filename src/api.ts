// Mirrors ../plant-companion-flutter_2/lib/api/client.dart's envelope
// handling exactly — same backend, same response shape.
import { API_BASE_URL } from './config';
import type { ChangePlanData, CreateSubscriptionData, Entitlement, SignInData, SubscriptionStatusData } from './types';

export class ApiException extends Error {
  errorCode: string;
  statusCode: number;
  traceId: string;
  constructor(message: string, errorCode: string, statusCode: number, traceId: string) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.traceId = traceId;
  }
}

function requestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function request<T>(path: string, options: { method?: string; token?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'request-id': requestId(),
    'ngrok-skip-browser-warning': 'true', // harmless no-op against a non-ngrok backend, needed for dev
  };
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`;

  // The backend is a free-tier Render service that cold-starts (up to
  // ~60s) after inactivity — this had NO timeout at all, so a request
  // made right as it was spinning up just hung with the caller's spinner
  // stuck forever and no error ever thrown (see e.g. Upgrade.tsx's
  // downgrade button, which looked like it "did nothing" for exactly this
  // reason). 70s gives a cold start room to finish before we give up.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 70_000);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new ApiException('The server is taking too long to respond. Please try again in a moment.', 'TIMEOUT', 0, 'unknown');
    }
    throw new ApiException('Could not reach the server. Check your connection and try again.', 'NETWORK_ERROR', 0, 'unknown');
  } finally {
    clearTimeout(timeoutId);
  }

  const envelope = await response.json();
  if (!envelope.success) {
    throw new ApiException(envelope.message || 'Request failed', envelope.error || 'UNKNOWN_ERROR', envelope.status_code || response.status, envelope.trace_id || 'unknown');
  }
  return envelope.data as T;
}

export const api = {
  signInWithFirebase: (identityToken: string) =>
    request<SignInData>('/auth/signin', { method: 'POST', body: { provider: 'firebase', identity_token: identityToken } }),

  getEntitlement: (token: string) => request<Entitlement>('/entitlement', { token }),

  createSubscription: (token: string, plan: 'green_thumb' | 'photosynthesis_phd') =>
    request<CreateSubscriptionData>('/billing/razorpay/create-subscription', { method: 'POST', token, body: { plan } }),

  getSubscriptionStatus: (token: string) => request<SubscriptionStatusData>('/billing/subscription-status', { token }),

  // Downgrade only (a strictly cheaper active plan) -- no Checkout, no
  // new charge; see backend's billing_service.change_plan.
  changePlan: (token: string, plan: 'green_thumb' | 'photosynthesis_phd') =>
    request<ChangePlanData>('/billing/razorpay/change-plan', { method: 'POST', token, body: { plan } }),

  cancelSubscription: (token: string) => request<{ message: string }>('/billing/razorpay/cancel-subscription', { method: 'POST', token }),
};
