import type { ClientSegment, ClientTier, ClientStatus } from "@prisma/client";

export function buildClientAvatar(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  return initials || "CL";
}

export function toDbClientSegment(segment: "Expansion" | "Renewal" | "New Business"): ClientSegment {
  switch (segment) {
    case "Expansion":
      return "Expansion";
    case "Renewal":
      return "Renewal";
    case "New Business":
      return "new_business";
  }
}

export function fromDbClientSegment(segment: ClientSegment): "Expansion" | "Renewal" | "New Business" {
  switch (segment) {
    case "Expansion":
      return "Expansion";
    case "Renewal":
      return "Renewal";
    case "new_business":
      return "New Business";
  }
}

export function fromDbClientStatus(status: ClientStatus): "active" | "pending" | "completed" {
  return status;
}

export function toDbClientStatus(status: "active" | "pending" | "completed"): ClientStatus {
  return status;
}

export function fromDbClientTier(tier: ClientTier): "Enterprise" | "Growth" | "Strategic" {
  return tier;
}

export function toDbClientTier(tier: "Enterprise" | "Growth" | "Strategic"): ClientTier {
  return tier;
}
