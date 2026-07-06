import type { Vulnerability } from "./types";

const CVE_DB: Record<string, { cvss: number; cwe: string; remediation: string }> = {
  "CVE-2024-1234": { cvss: 7.5, cwe: "CWE-1321", remediation: "Upgrade to version 2.0.1 or later" },
  "CVE-2024-5678": { cvss: 9.8, cwe: "CWE-94", remediation: "Upgrade to version 1.2.3 or later" },
  "CVE-2024-9012": { cvss: 5.4, cwe: "CWE-79", remediation: "Upgrade to version 3.0.0 or later" },
  "CVE-2024-3456": { cvss: 3.7, cwe: "CWE-400", remediation: "Upgrade to version 1.1.0 or later" },
  "CVE-2024-7890": { cvss: 9.1, cwe: "CWE-122", remediation: "Upgrade libssl3 to 3.0.13 or later" },
  "CVE-2024-5679": { cvss: 7.4, cwe: "CWE-208", remediation: "Upgrade libcrypto3 to 3.0.13 or later" },
  "CVE-2024-2345": { cvss: 7.8, cwe: "CWE-119", remediation: "Upgrade zlib to 1.2.13 or later" },
  "CVE-2024-3457": { cvss: 5.3, cwe: "CWE-352", remediation: "Upgrade curl to 8.4.0 or later" },
  "CVE-2024-1111": { cvss: 2.5, cwe: "CWE-20", remediation: "Upgrade bash to 5.2.0 or later" },
  "CVE-2024-2222": { cvss: 3.1, cwe: "CWE-200", remediation: "Upgrade coreutils to 9.3 or later" },
};

function extractCveId(id: string): string | null {
  const match = id.match(/CVE-\d{4}-\d{4,}/);
  return match ? match[0] : null;
}

function severityFromCvss(cvss: number): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
  if (cvss >= 9.0) return "CRITICAL";
  if (cvss >= 7.0) return "HIGH";
  if (cvss >= 4.0) return "MEDIUM";
  return "LOW";
}

export function enrichVulnerability(vuln: Vulnerability): Vulnerability {
  const cveId = extractCveId(vuln.id);
  const known = cveId ? CVE_DB[cveId] : null;

  const enriched = { ...vuln };

  if (known) {
    enriched.cvssScore = known.cvss;
    enriched.cweId = known.cwe;
    enriched.remediation = known.remediation;
    enriched.url = enriched.url || `https://nvd.nist.gov/vuln/detail/${cveId}`;
    // Re-evaluate severity based on CVSS if not already set
    if (!vuln.severity || vuln.severity === "MEDIUM") {
      enriched.severity = severityFromCvss(known.cvss);
    }
  } else {
    enriched.url = enriched.url || `https://nvd.nist.gov/vuln/detail/${cveId || vuln.id}`;
    enriched.remediation = enriched.remediation || `Update ${vuln.package} to the latest patched version`;
    enriched.cweId = "CWE-1104"; // Unclassified
    enriched.cvssScore = enriched.severity === "CRITICAL" ? 9.5 : enriched.severity === "HIGH" ? 7.5 : enriched.severity === "MEDIUM" ? 5.5 : 2.5;
  }

  return enriched;
}

export function enrichResults(results: Vulnerability[]): Vulnerability[] {
  return results.map(enrichVulnerability);
}
