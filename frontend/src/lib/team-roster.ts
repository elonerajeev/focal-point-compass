import { useSyncExternalStore } from "react";

import { readStoredJSON, writeStoredJSON } from "@/lib/preferences";
import type { TeamMemberRecord } from "@/types/crm";

const SHARED_TEAM_MEMBERS_KEY = "crm-team-members-shared";
const LEGACY_TEAM_MEMBER_KEYS = ["crm-team-members-admin", "crm-team-members-manager", "crm-team-members-employee"] as const;
const TEAM_MEMBERS_EVENT = "crm-team-members-updated";
const EMPTY_TEAM_MEMBERS: TeamMemberRecord[] = [];

let cachedSnapshotSignature = "";
let cachedSnapshot: TeamMemberRecord[] = EMPTY_TEAM_MEMBERS;

export function normalizeTeamMember(member: TeamMemberRecord): TeamMemberRecord {
  return {
    ...member,
    warningCount: member.warningCount ?? 0,
    suspendedAt: member.suspendedAt ?? null,
    terminationEligibleAt: member.terminationEligibleAt ?? null,
    handoverCompletedAt: member.handoverCompletedAt ?? null,
    terminatedAt: member.terminatedAt ?? null,
    separationNote: member.separationNote ?? "",
  };
}

function readLegacyTeamMembers(): TeamMemberRecord[] {
  return LEGACY_TEAM_MEMBER_KEYS.flatMap((key) => readStoredJSON<TeamMemberRecord[]>(key, []));
}

function getSnapshotSignature() {
  if (typeof window === "undefined") {
    return cachedSnapshotSignature;
  }

  const sharedRaw = window.localStorage.getItem(SHARED_TEAM_MEMBERS_KEY);
  if (sharedRaw) {
    return `shared:${sharedRaw}`;
  }

  const legacyRaw = LEGACY_TEAM_MEMBER_KEYS.map((key) => `${key}:${window.localStorage.getItem(key) ?? ""}`).join("|");
  return legacyRaw === LEGACY_TEAM_MEMBER_KEYS.map((key) => `${key}:`).join("|") ? "__empty__" : `legacy:${legacyRaw}`;
}

function readSnapshotForSignature(signature: string) {
  if (signature === "__empty__") {
    return EMPTY_TEAM_MEMBERS;
  }

  if (signature.startsWith("shared:")) {
    const raw = signature.slice("shared:".length);
    try {
      return (JSON.parse(raw) as TeamMemberRecord[]).map(normalizeTeamMember);
    } catch {
      return EMPTY_TEAM_MEMBERS;
    }
  }

  const legacy = readLegacyTeamMembers();
  return legacy.length ? legacy.map(normalizeTeamMember) : EMPTY_TEAM_MEMBERS;
}

export function readSharedTeamMembersSnapshot(): TeamMemberRecord[] {
  const signature = getSnapshotSignature();
  if (signature === cachedSnapshotSignature) {
    return cachedSnapshot;
  }

  cachedSnapshotSignature = signature;
  cachedSnapshot = readSnapshotForSignature(signature);
  return cachedSnapshot;
}

export function writeSharedTeamMembersSnapshot(members: TeamMemberRecord[]) {
  const normalized = members.map(normalizeTeamMember);
  writeStoredJSON(SHARED_TEAM_MEMBERS_KEY, normalized);
  cachedSnapshot = normalized;
  cachedSnapshotSignature = `shared:${JSON.stringify(normalized)}`;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(TEAM_MEMBERS_EVENT));
  }
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === SHARED_TEAM_MEMBERS_KEY || LEGACY_TEAM_MEMBER_KEYS.includes(event.key as (typeof LEGACY_TEAM_MEMBER_KEYS)[number])) {
      callback();
    }
  };

  const handleCustomUpdate = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(TEAM_MEMBERS_EVENT, handleCustomUpdate);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(TEAM_MEMBERS_EVENT, handleCustomUpdate);
  };
}

export function useSharedTeamMembers() {
  return useSyncExternalStore(subscribe, readSharedTeamMembersSnapshot, () => EMPTY_TEAM_MEMBERS);
}

export function findTeamMemberByEmail(members: TeamMemberRecord[], email?: string | null) {
  if (!email) return null;
  const normalizedEmail = email.toLowerCase();
  return members.find((member) => member.email.toLowerCase() === normalizedEmail) ?? null;
}
