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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

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
