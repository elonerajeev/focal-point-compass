#!/usr/bin/env node
/**
 * CRM Full Health Check Script
 * Run: node scripts/test-api.js
 * Tests: frontend build + all backend API endpoints
 */

const { execSync } = require("child_process");
const BASE = "http://localhost:3000";
const CREDS = { email: "admin@crmpro.com", password: "Password123!" };

const COLORS = {
  green: "\x1b[32m", red: "\x1b[31m", yellow: "\x1b[33m",
  cyan: "\x1b[36m", bold: "\x1b[1m", reset: "\x1b[0m",
};

const ok  = (msg) => console.log(`  ${COLORS.green}✅${COLORS.reset} ${msg}`);
const err = (msg) => console.log(`  ${COLORS.red}❌${COLORS.reset} ${msg}`);
const hdr = (msg) => console.log(`\n${COLORS.bold}${COLORS.cyan}${msg}${COLORS.reset}`);

async function req(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function run() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}╔══════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}║   CRM Full Health Check              ║${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}╚══════════════════════════════════════╝${COLORS.reset}`);

  let passed = 0, failed = 0;

  const check = (label, status, expected = 200) => {
    const ok_status = Array.isArray(expected) ? expected.includes(status) : status === expected;
    if (ok_status) { ok(`${label} → ${status}`); passed++; }
    else { err(`${label} → ${status} (expected ${expected})`); failed++; }
  };

  // ── 0. Frontend TypeScript check ────────────────────────────────────────
  hdr("0. Frontend TypeScript");
  try {
    execSync("npx tsc --noEmit", {
      cwd: `${__dirname}/../../frontend`,
      stdio: "pipe",
    });
    ok("TypeScript compilation → no errors");
    passed++;
  } catch (e) {
    const output = e.stdout?.toString() ?? e.stderr?.toString() ?? "";
    const errorLines = output.split("\n").filter(l => l.includes("error TS")).slice(0, 5);
    err(`TypeScript errors found:`);
    errorLines.forEach(l => console.log(`     ${COLORS.red}${l.trim()}${COLORS.reset}`));
    failed++;
  }

  // ── 1. Health ──────────────────────────────────────────────────────────
  hdr("1. Health");
  const health = await req("GET", "/api/health");
  check("GET /api/health", health.status);

  // ── 2. Auth ────────────────────────────────────────────────────────────
  hdr("2. Authentication");
  const login = await req("POST", "/api/auth/login", CREDS);
  check("POST /api/auth/login", login.status);

  const token = login.data?.accessToken;
  if (!token) { err("No token — skipping authenticated tests"); process.exit(1); }

  const me = await req("GET", "/api/auth/me", null, token);
  check("GET /api/auth/me", me.status);

  const badLogin = await req("POST", "/api/auth/login", { email: "x@x.com", password: "wrong" });
  check("POST /api/auth/login (wrong creds → 401)", badLogin.status, 401);

  // ── 3. Core Resources ──────────────────────────────────────────────────
  hdr("3. Core Resources");
  const endpoints = [
    ["GET", "/api/dashboard"],
    ["GET", "/api/clients"],
    ["GET", "/api/projects"],
    ["GET", "/api/tasks"],
    ["GET", "/api/team-members"],
    ["GET", "/api/invoices"],
    ["GET", "/api/notes"],
    ["GET", "/api/hiring"],
    ["GET", "/api/candidates"],
    ["GET", "/api/attendance"],
    ["GET", "/api/payroll"],
    ["GET", "/api/conversations"],
    ["GET", "/api/reports"],
    ["GET", "/api/reports/analytics"],
    ["GET", "/api/system/theme-previews"],
    ["GET", "/api/system/integrations"],
    ["GET", "/api/preferences"],
  ];

  for (const [method, path] of endpoints) {
    const r = await req(method, path, null, token);
    check(`${method} ${path}`, r.status, [200, 304]);
  }

  // ── 4. CRUD Tests ──────────────────────────────────────────────────────
  hdr("4. CRUD Operations");

  const newClient = await req("POST", "/api/clients", {
    name: "Test Client API", email: `test-${Date.now()}@api.com`,
    industry: "Technology", status: "pending",
  }, token);
  check("POST /api/clients (create)", newClient.status, 201);
  const clientId = newClient.data?.id;

  if (clientId) {
    const updateClient = await req("PATCH", `/api/clients/${clientId}`, { status: "active" }, token);
    check(`PATCH /api/clients/${clientId} (update)`, updateClient.status);
    const deleteClient = await req("DELETE", `/api/clients/${clientId}`, null, token);
    check(`DELETE /api/clients/${clientId} (delete)`, deleteClient.status);
  }

  const newNote = await req("POST", "/api/notes", { title: "API Test Note", content: "Test" }, token);
  check("POST /api/notes (create)", newNote.status, 201);
  const noteId = newNote.data?.id;
  if (noteId) {
    const deleteNote = await req("DELETE", `/api/notes/${noteId}`, null, token);
    check(`DELETE /api/notes/${noteId} (delete)`, deleteNote.status);
  }

  // ── 5. Auth Guards ─────────────────────────────────────────────────────
  hdr("5. Auth Guards (no token → 401)");
  for (const path of ["/api/clients", "/api/dashboard", "/api/team-members"]) {
    const r = await req("GET", path);
    check(`GET ${path} (no token → 401)`, r.status, 401);
  }

  // ── 6. Candidate Pipeline ──────────────────────────────────────────────
  hdr("6. Candidate Pipeline");
  const candidates = await req("GET", "/api/candidates", null, token);
  check("GET /api/candidates", candidates.status, [200, 304]);

  const offerCandidate = candidates.data?.data?.find(c => c.stage === "offer");
  if (offerCandidate) {
    const offerLetter = await req("POST", `/api/candidates/${offerCandidate.id}/offer-letter`, {
      joiningDate: "2026-05-01", offeredSalary: "$90,000/year",
    }, token);
    check(`POST /api/candidates/${offerCandidate.id}/offer-letter`, offerLetter.status);
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log(`\n${COLORS.bold}╔══════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.bold}║  Results: ${COLORS.green}${passed} passed${COLORS.reset}${COLORS.bold}, ${failed > 0 ? COLORS.red : COLORS.green}${failed} failed${COLORS.reset}${COLORS.bold} / ${total} total${COLORS.reset}${COLORS.bold}  ║${COLORS.reset}`);
  console.log(`${COLORS.bold}╚══════════════════════════════════════╝${COLORS.reset}\n`);

  if (failed > 0) process.exit(1);
}


run().catch(e => { console.error("Script error:", e.message); process.exit(1); });
