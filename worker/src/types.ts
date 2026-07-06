export interface Vulnerability {
  id: string;
  package: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  fixedIn?: string;
  url?: string;
  cvssScore?: number;
  cweId?: string;
  remediation?: string;
}

export interface ScanSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  cvssAvg?: number;
  topVulns?: Array<{ id: string; package: string; severity: string; cvssScore?: number }>;
}

export interface ScanResult {
  results: Vulnerability[];
  summary: ScanSummary;
  sbom?: SbomEntry[];
  report?: string;
}

export interface SbomEntry {
  name: string;
  version: string;
  type: "npm" | "docker" | "system";
  license?: string;
  purl?: string;
}

export type ScanType = "DEPENDENCY" | "DOCKER";

export interface ScanJob {
  id: number;
  type: ScanType;
  target: string;
  packageJson?: string | null;
}

export interface ScanEngine {
  name: string;
  type: string;
  description?: string;
  scan(job: ScanJob): Promise<ScanResult>;
}
