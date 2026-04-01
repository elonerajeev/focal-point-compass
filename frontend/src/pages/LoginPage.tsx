import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/contexts/ThemeContext";

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
  client: "Client",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pendingSwitchRole = searchParams.get("switchRole") as UserRole | null;

  const { login, switchRole } = useAuth();
  const { setRole } = useTheme();
  const [email, setEmail] = useState("john@crmpro.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const user = await login({ email, password });
      setRole(user.role);

      // If we came here from a "Switch Role" request, try to apply it now
      if (pendingSwitchRole && pendingSwitchRole !== user.role) {
        const result = await switchRole(pendingSwitchRole);
        if (result.success) {
          setRole(pendingSwitchRole);
        }
        // If ROLE_MISMATCH, just continue with the user's actual role — no error shown
      }

      navigate("/overview");
    } catch {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 rounded-3xl border border-border bg-card p-8 shadow-card">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Sign in</p>
          <h1 className="mt-3 text-3xl font-display font-semibold text-foreground">Welcome back</h1>
          {pendingSwitchRole ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to switch to{" "}
              <span className="font-semibold text-primary">{roleLabels[pendingSwitchRole]}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your credentials to continue into the workspace.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <label className="space-y-2 text-sm font-semibold text-foreground">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-foreground">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </label>
        </div>

        {error && <p className="text-xs font-semibold text-destructive">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-105"
        >
          {pendingSwitchRole ? `Sign in as ${roleLabels[pendingSwitchRole]}` : "Sign in"}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Need an account?{" "}
          <button type="button" onClick={() => navigate("/signup")} className="text-primary underline">
            Create one
          </button>
          .
        </p>
      </form>
    </div>
  );
}
