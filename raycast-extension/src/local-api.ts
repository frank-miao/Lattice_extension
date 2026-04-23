export interface LatticeStatus {
  ok: boolean;
  apiVersion: string;
  appVersion: string;
  capabilities: string[];
  readOnly: boolean;
  baseURL: string;
  browserExtensionEnabled: boolean;
}

export function getApiBaseUrl(port: unknown): string {
  const normalizedPort = typeof port === "string" ? port.trim() : "";
  return `http://127.0.0.1:${normalizedPort || "29467"}/api/v1`;
}

export function hasCapability(
  status: Pick<LatticeStatus, "ok" | "capabilities"> | undefined,
  capability: string,
): boolean {
  return Boolean(status?.ok && status.capabilities.includes(capability));
}
