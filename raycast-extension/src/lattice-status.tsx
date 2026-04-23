import { Detail, getPreferenceValues, showToast, Toast } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useEffect } from "react";
import { getApiBaseUrl, LatticeStatus } from "./local-api";

const { port } = getPreferenceValues<Preferences.LatticeStatus>();
const BASE = getApiBaseUrl(port);

export default function Command() {
  const { data, isLoading, error } = useFetch<LatticeStatus>(`${BASE}/status`);

  useEffect(() => {
    if (error) {
      showToast({ style: Toast.Style.Failure, title: "Lattice not reachable", message: error.message });
    }
  }, [error]);

  const md = isLoading
    ? "Checking connection…"
    : error
      ? `## Connection Failed\n\nCould not reach Lattice at \`${BASE}\`.\n\nMake sure the Lattice app is running.`
      : [
          "## Lattice is Running",
          `**API Version:** ${data?.apiVersion}`,
          `**App Version:** ${data?.appVersion}`,
          `**Read Only:** ${data?.readOnly ? "Yes" : "No"}`,
          `**Browser Extension:** ${data?.browserExtensionEnabled ? "Enabled" : "Disabled"}`,
          `**Base URL:** ${data?.baseURL || BASE.replace(/\/api\/v1$/, "")}`,
          `**Capabilities:** ${data?.capabilities?.join(", ") || "—"}`,
        ].join("\n\n");

  return <Detail isLoading={isLoading} markdown={md} />;
}
