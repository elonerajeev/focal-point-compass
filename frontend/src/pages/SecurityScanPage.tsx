import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Package,
  Container,
  Plus,
  Loader2,
  Trash2,
  ExternalLink,
  Bug,
  AlertTriangle,
  Info,
} from "lucide-react";

import { crmService } from "@/services/crm";
import { useThreatScans } from "@/hooks/use-crm-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { RADIUS, SPACING, TEXT } from "@/lib/design-tokens";
import type { ThreatScanRecord } from "@/types/crm";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const severityConfig = {
  CRITICAL: { icon: ShieldX, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", label: "Critical" },
  HIGH: { icon: ShieldAlert, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30", label: "High" },
  MEDIUM: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "Medium" },
  LOW: { icon: Info, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/30", label: "Low" },
} as const;

const statusConfig = {
  PENDING: { color: "text-muted-foreground", bg: "bg-muted/30", label: "Pending" },
  RUNNING: { color: "text-blue-500", bg: "bg-blue-500/10", label: "Running" },
  COMPLETED: { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Completed" },
  FAILED: { color: "text-red-500", bg: "bg-red-500/10", label: "Failed" },
} as const;

function ScanStatusBadge({ status }: { status: ThreatScanRecord["status"] }) {
  const cfg = statusConfig[status];
  return (
    <Badge variant="outline" className={cn(cfg.bg, cfg.color, "border-0")}>
      {status === "RUNNING" && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
      {cfg.label}
    </Badge>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const cfg = severityConfig[severity as keyof typeof severityConfig] || severityConfig.LOW;
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn(cfg.bg, cfg.color, cfg.border, "gap-1")}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}

function ScanSummaryCards({ scan }: { scan: ThreatScanRecord }) {
  if (!scan.summary) return null;
  const items = [
    { label: "Critical", value: scan.summary.critical, cfg: severityConfig.CRITICAL },
    { label: "High", value: scan.summary.high, cfg: severityConfig.HIGH },
    { label: "Medium", value: scan.summary.medium, cfg: severityConfig.MEDIUM },
    { label: "Low", value: scan.summary.low, cfg: severityConfig.LOW },
  ];
  return (
    <div className="flex gap-2">
      {items.map(({ label, value, cfg }) => {
        const Icon = cfg.icon;
        return (
          <div key={label} className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium", cfg.bg, cfg.color)}>
            <Icon className="w-3.5 h-3.5" />
            {value} {label}
          </div>
        );
      })}
    </div>
  );
}

export default function SecurityScanPage() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [scanType, setScanType] = useState<"DEPENDENCY" | "DOCKER">("DEPENDENCY");
  const [target, setTarget] = useState("");
  const [packageJson, setPackageJson] = useState("");

  const { data, isLoading } = useThreatScans({
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  });

  const createScan = useMutation({
    mutationFn: (input: { type: "DEPENDENCY" | "DOCKER"; target: string; packageJson?: string }) =>
      crmService.createThreatScan(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threatcheck"] });
      setCreateOpen(false);
      setTarget("");
      setPackageJson("");
      toast.success("Scan started");
    },
    onError: () => toast.error("Failed to start scan"),
  });

  const deleteScan = useMutation({
    mutationFn: (id: number) => crmService.deleteThreatScan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threatcheck"] });
      toast.success("Scan deleted");
    },
    onError: () => toast.error("Failed to delete scan"),
  });

  const handleCreate = () => {
    if (!target.trim()) {
      toast.error("Please enter a target name");
      return;
    }
    createScan.mutate({ type: scanType, target: target.trim(), packageJson: packageJson.trim() || undefined });
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className={cn(TEXT.title, "flex items-center gap-2")}>
              <Shield className="w-6 h-6 text-cyan-500" />
              Security Scan
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Dependency &amp; container vulnerability scanning engine
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-1" /> New Scan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Security Scan</DialogTitle>
                <DialogDescription>
                  Choose a scan type and target to start a vulnerability assessment.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Scan Type</Label>
                  <Select value={scanType} onValueChange={(v: "DEPENDENCY" | "DOCKER") => setScanType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEPENDENCY">
                        <span className="flex items-center gap-2"><Package className="w-4 h-4" />Dependency Scan</span>
                      </SelectItem>
                      <SelectItem value="DOCKER">
                        <span className="flex items-center gap-2"><Container className="w-4 h-4" />Docker Image Scan</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target</Label>
                  <Input
                    placeholder={scanType === "DOCKER" ? "node:18-alpine" : "express"}
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {scanType === "DOCKER"
                      ? "Docker image name and tag (e.g. nginx:latest)"
                      : "npm package name (e.g. express@4.18.2)"}
                  </p>
                </div>
                {scanType === "DEPENDENCY" && (
                  <div className="space-y-2">
                    <Label>Package.json (optional)</Label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                      placeholder="Paste package.json content for custom dependency analysis"
                      value={packageJson}
                      onChange={(e) => setPackageJson(e.target.value)}
                    />
                  </div>
                )}
                <Button
                  className="w-full"
                  onClick={handleCreate}
                  disabled={createScan.isPending}
                >
                  {createScan.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning...</>
                  ) : (
                    <><Bug className="w-4 h-4 mr-2" /> Start Scan</>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div variants={item} className="flex gap-3">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All types</SelectItem>
              <SelectItem value="DEPENDENCY">Dependency</SelectItem>
              <SelectItem value="DOCKER">Docker</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All statuses</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="RUNNING">Running</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.data.length ? (
          <motion.div variants={item} className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ShieldCheck className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">No scans yet</p>
            <p className="text-sm">Start a new security scan to check for vulnerabilities.</p>
          </motion.div>
        ) : (
          <motion.div variants={item} className="space-y-3">
            {data.data.map((scan) => (
              <Card key={scan.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {scan.type === "DOCKER" ? (
                        <Container className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Package className="w-5 h-5 text-emerald-500" />
                      )}
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {scan.target}
                          <ScanStatusBadge status={scan.status} />
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {scan.type === "DOCKER" ? "Docker Image" : "Dependency"} &middot;{" "}
                          {new Date(scan.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {scan.status === "COMPLETED" && scan.summary && (
                        <ScanSummaryCards scan={scan} />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteScan.mutate(scan.id)}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {scan.status === "COMPLETED" && scan.results && scan.results.length > 0 && (
                  <CardContent>
                    <div className="space-y-1.5">
                      {scan.results.slice(0, 10).map((vuln, i) => {
                        const cfg = severityConfig[vuln.severity] || severityConfig.LOW;
                        const Icon = cfg.icon;
                        return (
                          <div key={`${vuln.id}-${i}`} className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                            cfg.bg, cfg.border, "border",
                          )}>
                            <Icon className={cn("w-4 h-4 shrink-0", cfg.color)} />
                            <div className="flex-1 min-w-0">
                              <span className="font-medium">{vuln.package}</span>
                              <span className="text-muted-foreground ml-2">{vuln.title}</span>
                            </div>
                            <SeverityBadge severity={vuln.severity} />
                            {vuln.fixedIn && (
                              <Badge variant="outline" className="text-xs shrink-0">
                                Fix: {vuln.fixedIn}
                              </Badge>
                            )}
                            {vuln.url && (
                              <a href={vuln.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                              </a>
                            )}
                          </div>
                        );
                      })}
                      {scan.results.length > 10 && (
                        <p className="text-xs text-muted-foreground text-center pt-1">
                          +{scan.results.length - 10} more findings
                        </p>
                      )}
                    </div>
                  </CardContent>
                )}
                {scan.status === "FAILED" && (
                  <CardContent>
                    <p className="text-sm text-red-500">{scan.error || "Scan failed"}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
