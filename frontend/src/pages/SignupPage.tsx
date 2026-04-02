import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { UserRole } from "@/contexts/ThemeContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { setRole } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setLocalRole] = useState<UserRole>("employee");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const user = await signup({ name, email, password, role });
      setRole(user.role);
      navigate("/overview");
    } catch {
      setError("Unable to create account. Try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 rounded-3xl border border-border bg-card p-8 shadow-card">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Create account</p>
          <h1 className="mt-3 text-3xl font-display font-semibold text-foreground">Join the workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a role and we’ll personalize your layout.
          </p>
        </div>

        <div className="space-y-4">
          <label className="space-y-2 text-sm font-semibold text-foreground">
            Full name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-foreground">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-foreground">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-foreground">
            Role
            <select
              value={role}
              onChange={(event) => setLocalRole(event.target.value as UserRole)}
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {(["employee", "client"] as UserRole[]).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <p className="text-xs font-semibold text-destructive">{error}</p>
        )}

        <button
          type="submit"
          className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-105"
        >
          Create account
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account? <button type="button" onClick={() => navigate("/login")} className="text-primary underline">Sign in</button>.
        </p>
      </form>
    </div>
  );
}
