/**
 * eSignatures.com client — reusable contract service for all SuperSeller products.
 * API docs: https://esignatures.com/docs/api
 *
 * Usage:
 *   await sendContract({ templateId, signerName, signerEmail, fields });
 *   await getContractStatus(contractId);
 */

import { logger } from "../utils/logger";

const API_BASE = "https://esignatures.com/api";

function getToken(): string {
  const token = process.env.ESIGNATURES_API_KEY;
  if (!token) throw new Error("ESIGNATURES_API_KEY not set");
  return token;
}

// --- Templates ---
/** SuperSeller AI Services Agreement — the default template for all products */
export const TEMPLATES = {
  services: "99de20b5-2bb9-4439-9532-e00902fe6824",
};

interface Signer {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

interface SendContractOptions {
  templateId?: string;
  title?: string;
  signers: Signer[];
  placeholderFields: Record<string, string>;
  metadata?: string;
  sendReminders?: boolean;
  redirectUrl?: string;
  customWebhookUrl?: string;
}

interface SendContractResult {
  contractId: string;
  status: string;
  signers: {
    id: string;
    name: string;
    email: string;
    status: string;
    signUrl?: string;
  }[];
}

/**
 * Send a contract for signature.
 * Returns contract ID and signer URLs.
 */
export async function sendContract(options: SendContractOptions): Promise<SendContractResult> {
  const {
    templateId = TEMPLATES.services,
    title,
    signers,
    placeholderFields,
    metadata,
    sendReminders = true,
    redirectUrl,
    customWebhookUrl,
  } = options;

  const token = getToken();

  const body: Record<string, unknown> = {
    template_id: templateId,
    signers: signers.map((s) => ({
      name: s.name,
      email: s.email,
      phone: s.phone,
      company_name: s.company,
    })),
    placeholder_fields: Object.entries(placeholderFields).map(([api_key, value]) => ({
      api_key,
      value,
    })),
    emails: {
      send_reminders: sendReminders,
    },
  };

  if (title) body.title = title;
  if (metadata) body.metadata = metadata;
  if (redirectUrl) body.redirect_url = redirectUrl;
  if (customWebhookUrl) body.custom_webhook_url = customWebhookUrl;

  logger.info({ msg: "Sending contract for signature", templateId, signerCount: signers.length });

  const res = await fetch(`${API_BASE}/contracts?token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (data.status === "error") {
    logger.error({ msg: "eSignatures contract send failed", error: data.data });
    throw new Error(`eSignatures error: ${data.data?.error_message || JSON.stringify(data.data)}`);
  }

  const contract = data.data;
  logger.info({ msg: "Contract sent", contractId: contract.contract?.id, status: contract.contract?.status });

  return {
    contractId: contract.contract?.id,
    status: contract.contract?.status || "sent",
    signers: (contract.signers || []).map((s: Record<string, string>) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      status: s.status || "pending",
      signUrl: s.sign_page_url,
    })),
  };
}

/**
 * Get contract status.
 */
export async function getContractStatus(contractId: string) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/contracts/${contractId}?token=${token}`);
  const data = await res.json();
  if (data.status === "error") {
    throw new Error(`eSignatures error: ${data.data?.error_message}`);
  }
  return data.data;
}

/**
 * List all contracts (optionally filtered).
 */
export async function listContracts(params?: { status?: string; limit?: number }) {
  const token = getToken();
  const qs = new URLSearchParams({ token });
  if (params?.status) qs.set("status", params.status);
  if (params?.limit) qs.set("limit", String(params.limit));
  const res = await fetch(`${API_BASE}/contracts?${qs.toString()}`);
  const data = await res.json();
  return data.data || [];
}

/**
 * List all templates.
 */
export async function listTemplates() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/templates?token=${token}`);
  const data = await res.json();
  return data.data || [];
}

interface ServiceContractParams {
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  serviceName: string;
  scope: string;
  deliverables: string;
  timeline: string;
  setupFee: string;
  monthlyFee: string;
  paymentTerms: string;
  startDate?: string;
}

/**
 * Send a SuperSeller AI Services Agreement.
 * Works for any product: Instagram Autopilot, TourReel, FB Bot, etc.
 */
export async function sendServiceContract(params: ServiceContractParams): Promise<SendContractResult> {
  const startDate =
    params.startDate ||
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return sendContract({
    title: `SuperSeller AI — ${params.serviceName} — ${params.clientCompany}`,
    signers: [
      {
        name: params.clientName,
        email: params.clientEmail,
        company: params.clientCompany,
      },
    ],
    placeholderFields: {
      client_name: params.clientName,
      client_company: params.clientCompany,
      client_email: params.clientEmail,
      service_name: params.serviceName,
      start_date: startDate,
      project_scope: params.scope,
      deliverables: params.deliverables,
      timeline: params.timeline,
      setup_fee: params.setupFee,
      monthly_fee: params.monthlyFee,
      payment_terms: params.paymentTerms,
    },
    metadata: `${params.serviceName} | ${params.clientCompany}`.slice(0, 199),
    redirectUrl: "https://superseller.agency/thank-you",
    customWebhookUrl: "https://superseller.agency/api/webhooks/esignatures",
  });
}
