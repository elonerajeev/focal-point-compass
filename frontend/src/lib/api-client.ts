import { appEnv } from "@/lib/env";

export class ApiError extends Error {
  status: number;
  endpoint: string;

  constructor(message: string, status: number, endpoint: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.endpoint = endpoint;
  }
}

type NetworkErrorDetail = {
  endpoint: string;
  status?: number;
  message: string;
};

function emitNetworkError(detail: NetworkErrorDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("crm:network-error", { detail }));
}

function getStoredAuthToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("crm-auth-token") ?? "";
}

function buildUrl(endpoint: string) {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (appEnv.apiBaseUrl.startsWith("http")) {
    return new URL(normalizedEndpoint, appEnv.apiBaseUrl).toString();
  }
  return `${appEnv.apiBaseUrl.replace(/\/$/, "")}${normalizedEndpoint}`;
}

export async function requestJson<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const authToken = getStoredAuthToken();
  const response = await fetch(buildUrl(endpoint), {
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const message = body || response.statusText || "Request failed";
    emitNetworkError({ endpoint, status: response.status, message });
    throw new ApiError(message, response.status, endpoint);
  }

  return (await response.json()) as T;
}

export function isRemoteApiEnabled() {
  return appEnv.useRemoteApi && Boolean(appEnv.apiBaseUrl.trim());
}
