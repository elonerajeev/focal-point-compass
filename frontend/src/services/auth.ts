import { readStoredJSON, readStoredString, writeStoredJSON, writeStoredString, removeStoredValue } from "@/lib/preferences";
import { isRemoteApiEnabled, requestJson } from "@/lib/api-client";
import type { UserRole } from "@/contexts/ThemeContext";
import type { PaymentMode } from "@/types/crm";

export type AuthCredentials = {
  name?: string;
  email: string;
  password: string;
  role?: UserRole;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId: string;
  department: string;
  team: string;
  designation: string;
  manager: string;
  workingHours: string;
  officeLocation: string;
  timeZone: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  paymentMode: PaymentMode;
  payrollCycle: string;
  payrollDueDate: string;
  joinedAt: string;
  location: string;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
};

const AUTH_USER_KEY = "crm-auth-user";
const AUTH_TOKEN_KEY = "crm-auth-token";
const AUTH_REFRESH_KEY = "crm-auth-refresh-token";

function getMockProfile(role: UserRole): Omit<AuthUser, "id" | "name" | "email" | "role"> {
  switch (role) {
    case "admin":
      return {
        employeeId: "EMP-1001",
        department: "Operations",
        team: "Platform Ops",
        designation: "Admin Lead",
        manager: "Executive Team",
        workingHours: "09:30 - 18:30",
        officeLocation: "HQ - Floor 4",
        timeZone: "Asia/Calcutta",
        baseSalary: 145000,
        allowances: 22000,
        deductions: 7800,
        paymentMode: "bank-transfer",
        payrollCycle: "Mar 2026",
        payrollDueDate: "Apr 05, 2026",
        joinedAt: "2023-09-18",
        location: "Head Office",
      };
    case "manager":
      return {
        employeeId: "EMP-2042",
        department: "Management",
        team: "Growth Team",
        designation: "Workspace Manager",
        manager: "Director of Operations",
        workingHours: "10:00 - 19:00",
        officeLocation: "Hybrid Desk",
        timeZone: "Asia/Calcutta",
        baseSalary: 128000,
        allowances: 18000,
        deductions: 6500,
        paymentMode: "bank-transfer",
        payrollCycle: "Mar 2026",
        payrollDueDate: "Apr 05, 2026",
        joinedAt: "2024-01-12",
        location: "Hybrid",
      };
    case "employee":
      return {
        employeeId: "EMP-3187",
        department: "Delivery",
        team: "Client Delivery",
        designation: "Product Specialist",
        manager: "Team Manager",
        workingHours: "09:00 - 18:00",
        officeLocation: "HQ - Floor 2",
        timeZone: "Asia/Calcutta",
        baseSalary: 72000,
        allowances: 12000,
        deductions: 3200,
        paymentMode: "upi",
        payrollCycle: "Mar 2026",
        payrollDueDate: "Apr 05, 2026",
        joinedAt: "2024-05-06",
        location: "Remote",
      };
    case "client":
      return {
        employeeId: "CLT-4408",
        department: "Client Success",
        team: "Account Care",
        designation: "Client Contact",
        manager: "Account Owner",
        workingHours: "09:00 - 17:00",
        officeLocation: "External",
        timeZone: "Asia/Calcutta",
        baseSalary: 0,
        allowances: 0,
        deductions: 0,
        paymentMode: "upi",
        payrollCycle: "Mar 2026",
        payrollDueDate: "Apr 05, 2026",
        joinedAt: "2025-02-20",
        location: "External",
      };
  }
}

function createMockSession(credentials: AuthCredentials): AuthSession {
  const role = credentials.role ?? (credentials.email.endsWith("@client.com") ? "client" : "employee");
  const name = credentials.name ?? (role === "client" ? "Client User" : "Workspace User");
  const user: AuthUser = {
    id: `user-${Math.random().toString(36).slice(2, 10)}`,
    name,
    email: credentials.email,
    role,
    ...getMockProfile(role),
  };

  return {
    user,
    accessToken: `mock-${user.id}`,
    refreshToken: `refresh-${user.id}`,
  };
}

function persistSession(session: AuthSession | null) {
  if (!session) {
    removeStoredValue(AUTH_USER_KEY);
    removeStoredValue(AUTH_TOKEN_KEY);
    removeStoredValue(AUTH_REFRESH_KEY);
    return;
  }

  writeStoredJSON(AUTH_USER_KEY, session.user);
  writeStoredString(AUTH_TOKEN_KEY, session.accessToken);
  if (session.refreshToken) {
    writeStoredString(AUTH_REFRESH_KEY, session.refreshToken);
  }
}

export function getStoredAuthUser() {
  return readStoredJSON<AuthUser | null>(AUTH_USER_KEY, null);
}

export function getStoredAuthToken() {
  return readStoredString(AUTH_TOKEN_KEY, "");
}

export function getStoredRefreshToken() {
  return readStoredString(AUTH_REFRESH_KEY, "");
}

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthSession> {
    if (!isRemoteApiEnabled()) {
      const session = createMockSession(credentials);
      persistSession(session);
      return session;
    }

    const session = await requestJson<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    persistSession(session);
    return session;
  },

  async signup(credentials: AuthCredentials): Promise<AuthSession> {
    if (!isRemoteApiEnabled()) {
      const session = createMockSession({ ...credentials, role: credentials.role ?? "employee" });
      persistSession(session);
      return session;
    }

    const session = await requestJson<AuthSession>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    persistSession(session);
    return session;
  },

  async me(): Promise<AuthSession | null> {
    const token = getStoredAuthToken();
    const storedUser = getStoredAuthUser();
    if (!token || !storedUser) {
      return null;
    }

    if (!isRemoteApiEnabled()) {
      return { user: storedUser, accessToken: token, refreshToken: getStoredRefreshToken() || undefined };
    }

    try {
      const session = await requestJson<AuthSession>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      persistSession(session);
      return session;
    } catch {
      // Token is invalid or user no longer exists — clear everything
      persistSession(null);
      return null;
    }
  },
  async updateProfile(input: Partial<Pick<AuthUser, "name" | "department" | "team" | "designation" | "manager" | "workingHours" | "officeLocation" | "timeZone" | "location">>): Promise<AuthUser> {
    const stored = getStoredAuthUser();
    if (!isRemoteApiEnabled()) {
      const updated = { ...stored!, ...input };
      writeStoredJSON(AUTH_USER_KEY, updated);
      return updated;
    }
    const { user } = await requestJson<{ user: AuthUser }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    const merged = { ...stored!, ...user };
    writeStoredJSON(AUTH_USER_KEY, merged);
    return merged;
  },

  /**
   * Verify current session is valid, then switch to targetRole.
   * Admin can switch to any role without re-authentication.
   * Other roles must re-authenticate to switch roles.
   */
  async switchRole(targetRole: UserRole): Promise<AuthUser> {
    const token = getStoredAuthToken();
    const stored = getStoredAuthUser();

    if (!token || !stored) {
      throw new Error("NO_SESSION");
    }

    if (!isRemoteApiEnabled()) {
      // Mock mode: admin can switch freely, others need to match their role
      if (stored.role === "admin") {
        const updated: AuthUser = {
          ...stored,
          role: targetRole,
          ...getMockProfile(targetRole),
          id: stored.id,
          name: stored.name,
          email: stored.email,
        };
        writeStoredJSON(AUTH_USER_KEY, updated);
        return updated;
      }
      
      // Non-admin users can only "switch" to their own role (no actual switch)
      if (stored.role !== targetRole) {
        throw new Error("ROLE_MISMATCH");
      }
      return stored;
    }

    // Real API: call backend switch-role endpoint
    try {
      const { user } = await requestJson<{ user: AuthUser }>("/auth/switch-role", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetRole }),
      });

      // Update stored user with new role
      const updated = { ...stored, ...user };
      writeStoredJSON(AUTH_USER_KEY, updated);
      return updated;
    } catch (err: unknown) {
      // Check if it's a 403 (forbidden) - means user doesn't have permission
      if (err && typeof err === "object" && "status" in err && err.status === 403) {
        throw new Error("ROLE_MISMATCH");
      }
      throw new Error("NO_SESSION");
    }
  },

  async logout(): Promise<void> {
    if (isRemoteApiEnabled() && getStoredAuthToken()) {
      try {
        await requestJson("/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getStoredAuthToken()}`,
          },
        });
      } catch {
        // Local logout should still succeed.
      }
    }

    persistSession(null);
  },
};
