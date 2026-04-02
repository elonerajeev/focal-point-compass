import { useEffect } from "react";

import { toast } from "@/components/ui/sonner";
import { ErrorTracker } from "@/lib/error-tracker";

type NetworkErrorDetail = {
  endpoint: string;
  status?: number;
  message: string;
};

export default function NetworkErrorBridge() {
  useEffect(() => {
    const handleNetworkError = (event: Event) => {
      const detail = (event as CustomEvent<NetworkErrorDetail>).detail;
      if (!detail) return;

      const statusLabel =
        detail.status === 401
          ? "Unauthorized"
          : detail.status === 403
            ? "Forbidden"
            : detail.status === 500
              ? "Server error"
              : "Network error";

      toast.error(`${statusLabel}: ${detail.message}`, {
        description: `${detail.endpoint} could not be completed.`,
      });

      ErrorTracker.getInstance().captureError({
        message: `${statusLabel} on ${detail.endpoint}: ${detail.message}`,
      });

      if (detail.status === 401 && typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    };

    const handleAuthIssue = (event: Event) => {
      const detail = (event as CustomEvent<NetworkErrorDetail>).detail;
      if (!detail) return;
      toast.error("Authentication required", {
        description: `${detail.endpoint} returned ${detail.status ?? "an auth error"}.`,
      });
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    };

    window.addEventListener("crm:network-error", handleNetworkError);
    window.addEventListener("crm:auth-error", handleAuthIssue);

    return () => {
      window.removeEventListener("crm:network-error", handleNetworkError);
      window.removeEventListener("crm:auth-error", handleAuthIssue);
    };
  }, []);

  return null;
}
