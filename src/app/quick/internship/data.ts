// Personal study page: the IITG-TIC internship (admin console, backend, database).
// Reachable only by its direct link; not in the sitemap, the /quick index or llms.txt.

export type DiagramId = "architecture" | "request" | "rls" | "hmac" | "erd" | "ratelimit" | "review" | "release" | "webhook";

export type Block =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "steps"; items: string[] }
  | { kind: "code"; label?: string; code: string }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "diagram"; id: DiagramId; caption: string }
  | { kind: "tip"; title: string; text: string }
  | { kind: "say"; text: string }
  | { kind: "check"; items: [string, string][] };

export type Module = { id: string; title: string; minutes: number; intro: string; blocks: Block[] };

// -----------------------------------------------------------------------------
// The 60-second pitch
// -----------------------------------------------------------------------------
export const pitch = [
  "From 13 July to October 2026 I interned at the IIT Guwahati Technology Incubation Centre (IITG-TIC) with one teammate, Jeu Machahary. We rebuilt the centre's web platform: a public website, a founder console where startups apply for incubation, a job board, and an admin console for TIC staff.",
  "My part was the staff side: the **TIC admin console**, the **backend** behind every staff action, and the **database** it all runs on. The stack is SvelteKit 2 with TypeScript, Supabase (PostgreSQL, Auth, Storage) and Vercel.",
  "The main idea is defence in two layers. The server checks the person's role on every request, and **Row Level Security** policies in PostgreSQL refuse anything the server did not mean to allow. Every change is written to an **audit log by database triggers**, so nothing can skip it.",
  "I shipped it as numbered releases, tic-admin v1 to v27 and v29, each one a pull request: SQL migration first, then the API route, then the screen. The result: 16 console sections, 6 staff roles, 21 tables with RLS in 34 migrations. We handed it over on 9 October 2026, and I was the contact for backend and database questions.",
];

export const facts: [string, string][] = [
  ["Organisation", "IIT Guwahati Technology Incubation Centre (IITG-TIC), Technology Complex, IIT Guwahati"],
  ["Duration", "13 July 2026 – October 2026 (certificate dated 2 November 2026)"],
  ["Guide", "Mr. Sanket Umap, Programme Outreach Officer"],
  ["Certified by", "Ms. Urmi Buragohain, CEO, IITG-TIC"],
  ["Team", "2 interns: me (admin console, backend, database) and Jeu Machahary (website, founder side, emails, AI assistant, review process)"],
  ["Stack", "SvelteKit 2 + Svelte 5, TypeScript, Supabase (PostgreSQL, Auth, Storage), Vercel, Resend, Cloudflare Turnstile"],
  ["My releases", "tic-admin v1–v27 and v29 · 32 commits on main · feature branch + pull requests"],
  ["Size", "16 console sections · 6 staff roles + founder · 21 tables · 34 migrations · 43 API routes · 4 storage buckets"],
  ["Handover", "9 October 2026 to the centre's website agency; I was named backend/database contact"],
];

// -----------------------------------------------------------------------------
// Learning modules
// -----------------------------------------------------------------------------
export const modules: Module[] = [
  {
    id: "big-picture",
    title: "The project in one picture",
    minutes: 4,
    intro: "Before any detail, be able to draw this from memory. Examiners love \"draw the architecture\".",
    blocks: [
      { kind: "p", text: "IITG-TIC's old website needed a developer for every change, incubation applications travelled through email, and nobody could see who had approved what. The new platform has **four faces on one codebase**: the public website, the founder console, the job board and the TIC admin console." },
      { kind: "diagram", id: "architecture", caption: "One SvelteKit app serves every visitor; it talks to Supabase and a few outside services, never the browser directly." },
      { kind: "table", head: ["Part", "Who uses it", "Who built it"], rows: [
        ["Public website (70+ page templates)", "Anyone", "Jeu"],
        ["Founder console + 8-step application", "Startup founders", "Jeu"],
        ["Job board", "TIC, startups, candidates", "Jeu (board) · me (console side)"],
        ["TIC admin console (16 sections)", "TIC staff, 6 roles", "**Me**"],
        ["Backend: /api/tic-admin routes, sessions, guards", "Every staff action", "**Me**"],
        ["Database: 21 tables, RLS, triggers, buckets", "Everything", "**Me**"],
        ["Emails, AI assistant, review process", "Founders and staff", "Jeu"],
      ] },
      { kind: "diagram", id: "review", caption: "The six-step review chain (process designed by Jeu with the CEO) runs inside my console; each role sees only its step." },
      { kind: "say", text: "\"My work was the part nobody outside sees but everybody depends on: the console the TIC team uses daily, and the database rules that keep each organisation's data apart.\"" },
      { kind: "check", items: [
        ["Why one app instead of separate apps for the site and the console?", "One database, one sign-in and one audit log. A change made in the console shows on the website on the next load, and there is only one set of access rules to keep correct."],
        ["What was out of scope for you?", "The public site, founder console, emails and AI assistant (Jeu's), and the production deployment on TIC's own server, which went to their web agency."],
      ] },
    ],
  },
  {
    id: "web-basics",
    title: "Web fundamentals you must be able to explain",
    minutes: 6,
    intro: "Every feature sits on HTTP. These are the questions that come before any framework question.",
    blocks: [
      { kind: "p", text: "A browser sends an **HTTP request** (method, URL, headers, optional body) and the server answers with a **response** (status code, headers, body). HTTP is **stateless**: the server does not remember you between requests, which is why we need cookies and sessions." },
      { kind: "table", head: ["Method", "Meaning", "In my backend"], rows: [
        ["GET", "Read, no side effects", "Load the users list, storage usage"],
        ["POST", "Create / perform an action", "Create a staff account, approve a request"],
        ["PATCH", "Partially update", "Change a role, move an application's stage"],
        ["DELETE", "Remove", "Delete an account or a file"],
      ] },
      { kind: "table", head: ["Status", "Meaning", "When my API returns it"], rows: [
        ["200 / 201", "OK / Created", "Action succeeded"],
        ["400", "Bad request", "Validation failed: a field is missing or invalid"],
        ["401", "Unauthorised (not signed in)", "No valid session cookie"],
        ["403", "Forbidden (signed in, not allowed)", "Your role cannot open this section"],
        ["404", "Not found", "Unknown id, or hidden from you on purpose"],
        ["409", "Conflict", "Deleting a file that is still in use"],
        ["429", "Too many requests", "Rate limit hit"],
        ["500", "Server error", "Something unexpected; logged, never leaks details"],
      ] },
      { kind: "tip", title: "401 vs 403 — the classic trap", text: "401 means \"I don't know who you are\" (authentication failed). 403 means \"I know who you are, and you may not do this\" (authorisation failed)." },
      { kind: "p", text: "**Rendering strategies.** CSR (client-side rendering) ships an empty page and builds it with JavaScript. SSR (server-side rendering) builds HTML on the server per request. SSG (static generation) builds HTML once at build time. Our platform uses **SSR**: the website's copy is edited in the console, so pre-built pages would show stale text; and console pages arrive with their data already in place, so there are no loading spinners." },
      { kind: "p", text: "**Cookies** are small values the browser sends back automatically. Flags matter: `HttpOnly` (JavaScript cannot read it, so XSS cannot steal it), `Secure` (HTTPS only), `SameSite=Lax` (not sent on most cross-site requests, which blocks most CSRF), `Max-Age` (expiry)." },
      { kind: "p", text: "**CSP (Content Security Policy)** is a header that tells the browser which sources may load scripts, styles, frames and so on. Our `svelte.config.js` sets `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'` and allows only Supabase, Turnstile and Vercel analytics. Even if someone injected a `<script>` tag, the browser would refuse to run a script from an unlisted origin." },
      { kind: "check", items: [
        ["Why is HTTP called stateless and how do you add state?", "Each request is independent. State is carried by a cookie the server sets after sign-in; the server reads and verifies it on every request."],
        ["What does SameSite=Lax protect against?", "Cross-site request forgery: the cookie is not attached to most requests started by another site, so a malicious page cannot make your browser act as you."],
      ] },
    ],
  },
  {
    id: "sveltekit",
    title: "SvelteKit: how the app is wired",
    minutes: 7,
    intro: "Know where code runs (server or browser) and which file does what. That is 80% of SvelteKit viva.",
    blocks: [
      { kind: "table", head: ["File", "Runs on", "Job"], rows: [
        ["+page.svelte", "Server (first render) and browser", "The page's markup and UI"],
        ["+page.server.ts → load()", "Server only", "Fetch exactly the data this person may see"],
        ["+server.ts", "Server only", "An API endpoint: GET / POST / PATCH / DELETE handlers"],
        ["+layout.svelte / +layout.server.ts", "Both / server", "Shared shell (sidebar) and shared data (the signed-in user)"],
        ["hooks.server.ts → handle()", "Server, every request", "Read the cookie, check the account and role, guard routes"],
        ["$lib/server/*", "Server only", "Secrets, database client with service key; the build fails if the browser imports it"],
      ] },
      { kind: "diagram", id: "request", caption: "Every staff request: hook → load or API route → database. The browser never holds a secret." },
      { kind: "code", label: "hooks.server.ts (simplified)", code: `export const handle: Handle = async ({ event, resolve }) => {
  const session = readSignedCookie(event.cookies.get('tic_admin'));
  if (session) event.locals.user = await currentAccount(session.userId); // re-check every request
  if (event.url.pathname.startsWith('/tic-admin') && !event.locals.user)
    redirect(303, '/login?next=/tic-admin');
  return resolve(event);
};` },
      { kind: "code", label: "An API route under /api/tic-admin (simplified)", code: `export const PATCH: RequestHandler = async ({ request, locals }) => {
  const actor = requireSection(locals.user, 'users');   // 401 / 403 if not allowed
  const body = UserUpdate.parse(await request.json());  // 400 if invalid
  if (!canManage(actor.role, body.targetRole)) error(403, 'Not allowed');
  const db = adminClient(actor);   // service-role client sending an x-actor-id header
  await db.from('profiles').update({ role: body.role }).eq('id', body.id);  // trigger logs who
  return json({ ok: true });
};` },
      { kind: "p", text: "**Svelte 5 runes** make reactivity explicit: `$state` declares reactive state, `$derived` computes a value from state, `$effect` runs side effects when what it reads changes, and `$props` receives component inputs. The compiler turns components into small direct DOM updates instead of shipping a virtual-DOM runtime, which keeps pages light." },
      { kind: "p", text: "**Environment variables.** `$env/static/private` and `$env/dynamic/private` are server-only (the service-role key, session secret). `$env/static/public` is for values prefixed `PUBLIC_` that are safe in the browser (the Supabase URL and publishable key). Importing a private env module into browser code is a build error — a guard rail, not a convention." },
      { kind: "p", text: "**Adapters** decide where the app runs: `adapter-auto` picked Vercel during development; TIC can switch to `adapter-node` to run on its own VPS behind Nginx. The code did not use any Vercel-only feature, so the move is a config change." },
      { kind: "check", items: [
        ["Where would you put the service-role key and why?", "In a private env var, read only by modules in $lib/server. It bypasses RLS, so it must never reach the browser."],
        ["What is the difference between load() in +page.server.ts and +page.ts?", "+page.server.ts always runs on the server and can use secrets; +page.ts can also run in the browser during client navigation, so it must not touch secrets."],
        ["Why did you avoid prerendering?", "Page copy is edited in the console; a prerendered page would freeze its text at build time and skip the request hook that records page views."],
      ] },
    ],
  },
  {
    id: "typescript",
    title: "TypeScript in 3 minutes",
    minutes: 3,
    intro: "You will be asked why TypeScript. Answer with a bug it prevents, not a definition.",
    blocks: [
      { kind: "p", text: "TypeScript adds static types to JavaScript; the compiler checks them and then removes them. SvelteKit generates types for every route, so `data` in a page knows exactly what its `load()` returned. If I rename a column in a query, every screen that used the old name turns red before release, not after." },
      { kind: "code", label: "A union type makes illegal roles impossible", code: `export const STAFF_ROLES = ['developer','admin','tic_admin','tic_ceo','tic_coordinator','tic_head'] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
// 'tic_chairman' is now a compile error everywhere it is used.` },
      { kind: "list", items: [
        "`as const` keeps the literal values so the type is the exact set of strings.",
        "`Record<StaffRole, RoleInfo>` forces every role to have an entry — forget one and the build fails.",
        "`svelte-check` ran before every release: 0 type errors at handover.",
      ] },
    ],
  },
  {
    id: "database",
    title: "Relational databases and SQL",
    minutes: 8,
    intro: "This is your strongest area — the database was yours. Expect deep questions here.",
    blocks: [
      { kind: "p", text: "A **relational database** stores data in tables (relations) of rows and columns, linked by keys. Each fact lives in one place, so it cannot disagree with itself. PostgreSQL is an open-source relational database with strong SQL support, constraints, triggers, JSON types and Row Level Security." },
      { kind: "diagram", id: "erd", caption: "The core of my schema. Arrows point from the parent to the rows that reference it." },
      { kind: "table", head: ["Term", "Meaning", "Example from my schema"], rows: [
        ["Primary key", "Uniquely identifies a row", "profiles.id (same as auth.users.id)"],
        ["Foreign key", "Column that must match a key in another table", "applications.company_id → companies.id"],
        ["1 : 1", "One row matches exactly one", "auth.users ↔ profiles"],
        ["1 : N", "One parent, many children", "companies → applications, jobs"],
        ["M : N", "Needs a junction table", "applications ↔ staff via application_reviewers"],
        ["Unique constraint", "No duplicates on these columns", "one score per (application, reviewer, step)"],
        ["Check constraint", "Rule every row must satisfy", "score between 0 and 100"],
      ] },
      { kind: "p", text: "**Normalisation** removes duplication. 1NF: atomic values, no repeating groups. 2NF: every non-key column depends on the whole key. 3NF: no non-key column depends on another non-key column. Example: I store `company_id` on a job, not the company's name — the name lives once in `companies`, so renaming a startup updates everywhere." },
      { kind: "code", label: "Constraints doing the validation for you", code: `create table application_scores (
  application_id uuid references applications(id) on delete cascade,
  reviewer_id    uuid references profiles(id),
  step           smallint not null,
  score          smallint not null check (score between 0 and 100),
  primary key (application_id, reviewer_id, step)   -- one score per reviewer per step
);` },
      { kind: "code", label: "A JOIN: staff names with their roles' pending items", code: `select a.id, c.company_name, a.review_stage
from applications a
join companies c on c.id = a.company_id
where a.review_stage = 1 and a.status = 'under-review'
order by a.created_at;` },
      { kind: "p", text: "**Indexes** make lookups fast (a B-tree on a column turns a full scan into a tree search, O(n) → O(log n)) at the cost of slower writes and some space. I indexed columns used in filters, like `startup_profiles (listed, stage)`." },
      { kind: "p", text: "**Transactions and ACID.** Atomicity: all or nothing. Consistency: constraints hold before and after. Isolation: concurrent transactions don't see each other's half-done work. Durability: once committed, it survives a crash. My rate limiter relies on one atomic `insert … on conflict do update` statement so two requests cannot both read a stale count." },
      { kind: "p", text: "**Migrations** are numbered SQL files that change the schema step by step (`20261012020000_startup_profiles.sql`). Applied in order, they rebuild the whole database from nothing — that is how TIC can recreate it on their own server. Rule I followed: apply the migration first, deploy the code that needs it second." },
      { kind: "check", items: [
        ["Why PostgreSQL and not MongoDB?", "The data is relational (founders → companies → applications → scores; jobs → applicants). Foreign keys, joins and constraints fit naturally, and Postgres has Row Level Security."],
        ["What does ON DELETE CASCADE do and where is it dangerous?", "Deleting the parent deletes its children automatically. Dangerous because it does not reach files in storage — I had to delete uploaded documents explicitly when an account was deleted."],
        ["Why json and not jsonb for page content?", "jsonb reorders object keys; the content editor needs fields in the order they appear on the page, and json keeps that order."],
      ] },
    ],
  },
  {
    id: "rls",
    title: "Supabase and Row Level Security",
    minutes: 7,
    intro: "The single most important idea in my part. Be able to write a policy on the board.",
    blocks: [
      { kind: "p", text: "**Supabase** is an open-source backend platform on top of PostgreSQL: it adds authentication, file storage, an auto-generated REST API (PostgREST) and a dashboard. The browser can query the database directly with a **publishable (anon) key** — which is only safe because **RLS** decides what that key may see." },
      { kind: "diagram", id: "rls", caption: "Two locks on the same door: my server code checks the role, and PostgreSQL checks the policy on every row." },
      { kind: "code", label: "Turn it on, then allow only what you mean", code: `alter table jobs enable row level security;   -- now nobody can read anything

create policy "jobs: public read open" on jobs for select
  to anon, authenticated
  using ( status = 'open'
          and (closes_on is null or closes_on >= current_date)
          and (owner = 'tic' or public.is_company_verified(company_id)) );` },
      { kind: "list", items: [
        "`USING (…)` filters which existing rows you can see, update or delete.",
        "`WITH CHECK (…)` validates the new row on insert/update (e.g. you can only insert rows for your own company).",
        "**RLS on, no policies** = locked to everyone except the service role. I used this for `audit_log`, `site_content`, `email_log`, `rate_limits` — server-only tables.",
        "**Service-role key** bypasses RLS entirely. It lives only on the server; every write passes the actor's id so the audit trigger knows who acted.",
        "**security definer** functions run with the owner's rights — powerful, so I revoked `execute` from public roles wherever a policy didn't need them.",
      ] },
      { kind: "code", label: "A helper used by many policies", code: `create function my_company_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from companies where owner_id = auth.uid()
  union
  select company_id from profiles where id = auth.uid() and member_status = 'approved'
$$;

create policy "job_applications: own startup reads" on job_applications for select
  to authenticated using ( job_id in (select id from jobs where company_id in (select my_company_ids())) );` },
      { kind: "tip", title: "The real bug RLS caught", text: "Early on, TIC staff could see applicants for a startup's job. One policy change — applicants readable only by the company that posted the role — fixed it for every screen at once. That is the argument for enforcing access in the database." },
      { kind: "check", items: [
        ["If the server already checks roles, why RLS?", "Defence in depth. A missed check in one route, or a future developer querying from the browser, still cannot read rows the policy forbids. OWASP ranks broken access control #1."],
        ["What does auth.uid() return?", "The id of the user in the request's JWT; null for anonymous requests."],
        ["How did you test policies?", "Signed in as each role and ran the same queries, confirming each saw only what it should; also checked the live schema matched the migrations before each release."],
      ] },
    ],
  },
  {
    id: "auth",
    title: "Authentication, sessions and crypto",
    minutes: 6,
    intro: "Know the difference between hashing, encryption and signing — it is asked every time.",
    blocks: [
      { kind: "table", head: ["", "Reversible?", "Key?", "Used for"], rows: [
        ["Hashing (SHA-256, bcrypt)", "No", "No (salt for passwords)", "Passwords, integrity checks"],
        ["Encryption (AES, RSA)", "Yes, with key", "Yes", "Hiding data (HTTPS, storage)"],
        ["Signing (HMAC, RSA/ECDSA signatures)", "Not hiding anything", "Yes", "Proving data wasn't changed and who made it"],
      ] },
      { kind: "p", text: "**Authentication** = who are you (password, Turnstile-protected sign-in via Supabase Auth). **Authorisation** = what may you do (role → sections, RLS). Passwords are never stored — Supabase Auth stores a salted bcrypt hash." },
      { kind: "diagram", id: "hmac", caption: "My session cookie: readable, but any change breaks the signature." },
      { kind: "code", label: "Signing and verifying the cookie (Node crypto)", code: `const payload = base64url(JSON.stringify({ userId, email, name, exp }));
const sig = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
const cookie = \`\${payload}.\${sig}\`;

// verify
const [p, s] = cookie.split('.');
const good = createHmac('sha256', SESSION_SECRET).update(p).digest();
if (!timingSafeEqual(good, Buffer.from(s, 'hex'))) reject();   // constant time
if (JSON.parse(fromBase64url(p)).exp < Date.now()) reject();` },
      { kind: "list", items: [
        "**Why constant-time comparison?** A normal `===` stops at the first wrong character; measuring response times could reveal the signature byte by byte. `timingSafeEqual` always takes the same time.",
        "**Why re-check the account every request?** The cookie proves identity, not current permission. If an admin is demoted or deactivated, the next click is refused — the check is memoised per request in a WeakMap, never across requests.",
        "**Rotating `SESSION_SECRET`** signs everybody out at once — the emergency button after a leak.",
        "**JWT vs my cookie:** a JWT is also a signed token (header.payload.signature), usually sent in a header. Supabase uses JWTs internally; for the console I used an HttpOnly cookie so scripts can't read it.",
      ] },
      { kind: "check", items: [
        ["Is the cookie payload secret?", "No — it's base64, anyone can read it. It is signed, not encrypted, so nobody can change it without the secret. Never put secrets in it."],
        ["What is a salt?", "Random data added to each password before hashing so identical passwords give different hashes and precomputed rainbow tables don't work."],
        ["What does Cloudflare Turnstile do and why re-verify on the server?", "It's a bot check that's usually invisible. The browser gets a token; the server must verify it with Cloudflare, otherwise a bot could post directly to the API and skip the widget."],
      ] },
    ],
  },
  {
    id: "rbac",
    title: "Roles and permissions (RBAC)",
    minutes: 4,
    intro: "\"One table that every layer reads\" is your best one-line answer here.",
    blocks: [
      { kind: "p", text: "**Role-based access control** gives permissions to roles, and roles to people. I kept one table in code — `ROLE_INFO` in `roles.ts` — saying which of the 16 console sections each role may open. The sidebar, the request hook, the API guard, the assistant's tools and the Roles page all read it, so they can never disagree." },
      { kind: "table", head: ["Role", "Opens", "Special"], rows: [
        ["Developer", "All 16 sections", "\"View as\" any account; rank 3"],
        ["Admin", "All sections", "Rank 2; sets passwords"],
        ["TIC Admin", "All sections", "Rank 1; day-to-day operations"],
        ["TIC CEO", "Pipeline + Activity", "Second step of review"],
        ["TIC Head", "Pipeline + Activity", "Signs off assigned applications"],
        ["TIC Coordinator", "Pipeline + Evaluation, Content, Email", "Scores screening calls"],
        ["Founder", "None here", "Uses the founder console"],
      ] },
      { kind: "code", label: "Rank stops privilege escalation", code: `function rank(role) { return role === 'developer' ? 3 : role === 'admin' ? 2 : role === 'tic_admin' ? 1 : 0; }
export const canManage = (actor, target) => rank(actor) >= rank(target);
// a TIC Admin cannot reset an Admin's password, demote them or delete them` },
      { kind: "list", items: [
        "**Least privilege:** each role gets the minimum it needs — a coordinator never sees applications not assigned to them.",
        "**Release v20–v27** built this in two days because changing a role's access is one edit.",
        "**23 Oct 2026:** my v27 branch merged into main, dropping the unused Chairman/President roles and hiding developer activity from other staff.",
      ] },
    ],
  },
  {
    id: "audit",
    title: "Audit logging with triggers",
    minutes: 3,
    intro: "\"How do you know who changed what?\" — answer: the database writes it, not the app.",
    blocks: [
      { kind: "p", text: "A **trigger** is a function PostgreSQL runs automatically on INSERT, UPDATE or DELETE. My `audit_trigger` writes a row to `audit_log` with the table, the row id, the action, the values before and after (`OLD` and `NEW`) and the actor. Because it lives in the database, no code path can forget to log." },
      { kind: "code", label: "The idea", code: `create function audit_trigger() returns trigger language plpgsql security definer as $$
begin
  insert into audit_log (table_name, row_id, action, before, after, actor)
  values (TG_TABLE_NAME, coalesce(NEW.id, OLD.id), TG_OP,
          to_jsonb(OLD), to_jsonb(NEW), public.audit_actor());
  return coalesce(NEW, OLD);
end $$;

create trigger audit_companies after insert or update or delete on companies
  for each row execute function audit_trigger();` },
      { kind: "list", items: [
        "`audit_actor()` returns the signed-in user (`auth.uid()`), or the `x-actor-id` header the server's per-request client sends, read through PostgREST.",
        "`handle_new_user` is another trigger: it creates a profile whenever Supabase Auth creates an account, so the browser never inserts profiles.",
        "The Activity screen labels entries **TRIGGER** (database) or **APP** (events like sign-in), and separates human visitors from bots in page views.",
      ] },
    ],
  },
  {
    id: "reliability",
    title: "Rate limits, webhooks and file storage",
    minutes: 5,
    intro: "Three small systems with big viva potential, because each has a clear \"why\".",
    blocks: [
      { kind: "diagram", id: "ratelimit", caption: "Fixed-window limiting: each address gets N requests per window; the counter row resets with the next window." },
      { kind: "code", label: "One atomic statement per request", code: `insert into rate_limits (bucket, identifier, window_start, count)
values ($1, $2, floor(extract(epoch from now()) / $3) * $3, 1)
on conflict (bucket, identifier, window_start)
do update set count = rate_limits.count + 1
returning count;   -- allowed while count <= limit` },
      { kind: "table", head: ["Algorithm", "Idea", "Trade-off"], rows: [
        ["Fixed window", "Count per clock window", "Simple; burst possible at window edges"],
        ["Sliding window", "Count over the last N seconds", "Smoother; more bookkeeping"],
        ["Token bucket", "Tokens refill at a rate; each request spends one", "Allows controlled bursts; common in APIs"],
        ["Leaky bucket", "Queue drains at a fixed rate", "Smooth output; adds delay"],
      ] },
      { kind: "tip", title: "Why in the database?", text: "Vercel runs many short-lived serverless instances that don't share memory. An in-memory counter would be per instance and reset on cold start — an attacker could bypass it by spreading requests. A database row is shared by all instances." },
      { kind: "diagram", id: "webhook", caption: "A webhook is the provider calling you. Verify it before trusting it." },
      { kind: "list", items: [
        "**Webhooks** from Resend report bounces and complaints. I rebuild `id.timestamp.body`, compute HMAC-SHA256 with the secret, compare in constant time, reject anything older than 5 minutes (replay), and store each event once (providers retry).",
        "**Signed URLs:** private buckets (application documents, resumes) are opened only through links that expire in 10 minutes.",
        "**Storage guard:** Postgres doesn't know which files are in use, so before deleting, the server searches content, templates, documents and resume records; if referenced it returns **409 Conflict**.",
        "**Resume retention:** PDF only, 2 MB max, 200 per role, deleted 90 days after the role ends with a warning email a week before — bounded storage on a 1 GB plan.",
      ] },
    ],
  },
  {
    id: "security",
    title: "Security: OWASP Top 10 (2025) mapped to my project",
    minutes: 5,
    intro: "Name the risk, then name the line of defence in your own system. That answer always scores.",
    blocks: [
      { kind: "table", head: ["OWASP 2025", "What it means", "My defence"], rows: [
        ["A01 Broken Access Control", "Users act outside their permissions", "Role check on every request + RLS on all 21 tables + rank checks"],
        ["A02 Security Misconfiguration", "Unsafe defaults, open settings", "Strict CSP, private env vars, RLS-on-by-default, revoked execute on definer functions"],
        ["A03 Software Supply Chain Failures", "Compromised or vulnerable dependencies", "Lockfile (pnpm), few dependencies, review updates — see the Axios story below"],
        ["A04 Cryptographic Failures", "Weak or missing crypto", "HTTPS, bcrypt passwords (Supabase), HMAC-signed cookies, constant-time compare"],
        ["A05 Injection", "Untrusted input run as code/SQL", "Parameterised queries via the Supabase client, validation on every field, HTML escaping"],
        ["A06 Insecure Design", "Missing security in the design itself", "Review chain as a state machine; illegal jumps impossible, not just discouraged"],
        ["A07 Authentication Failures", "Weak login/session handling", "Turnstile on sign-in, HttpOnly cookies, expiry, per-request re-check"],
        ["A08 Software or Data Integrity Failures", "Trusting unverified data/updates", "Signed webhooks with replay window; migrations reviewed in PRs"],
        ["A09 Logging & Alerting Failures", "Not noticing attacks", "Trigger-written audit log, email delivery log, activity screen"],
        ["A10 Mishandling of Exceptional Conditions", "Failing open or leaking on errors", "Session check fails closed; errors never show internals; email failure never breaks an action"],
      ] },
      { kind: "list", items: [
        "**XSS** (cross-site scripting): Svelte escapes text by default; CSP blocks unlisted script sources; cookies are HttpOnly so a script couldn't steal them anyway.",
        "**CSRF:** SameSite cookies, plus SvelteKit's built-in origin check on form submissions; a cross-site page can't attach our session cookie to its requests.",
        "**IDOR** (insecure direct object reference — changing an id in the URL to see someone else's data): RLS filters rows by owner, so a guessed id returns nothing.",
        "**Secrets:** the whole git history was scanned before the repository went public; no key had ever been committed.",
      ] },
    ],
  },
  {
    id: "workflow",
    title: "How I worked: Git, releases and serverless lessons",
    minutes: 3,
    intro: "Process questions are easy marks if you have concrete numbers.",
    blocks: [
      { kind: "diagram", id: "release", caption: "Every release: migration → API route → screen → pull request → deploy → verify." },
      { kind: "list", items: [
        "**Branching:** I worked on `feature/tic-admin`, opened a pull request per release, Jeu reviewed, then merge to `main` → Vercel deployed automatically.",
        "**Database first:** if the policy doesn't allow it, the screen can't do it — so screens rarely needed rewrites.",
        "**Checks before each PR:** `svelte-check` (types), ESLint + Prettier, unit tests (session validation fails closed), live schema check.",
        "**Serverless lessons:** in-memory counters reset (→ DB rate limits); fire-and-forget emails got cut off when the function froze (→ await every send); per-instance caches go stale (→ short TTL + clear on save).",
        "**Handover:** 34 migrations, `.env.example` listing every setting without values, README setup steps, admin manual and videos; I stayed contact for moving to self-hosted Supabase.",
      ] },
    ],
  },
];

// -----------------------------------------------------------------------------
// Up to date: recent events worth knowing (researched 27 November 2026)
// -----------------------------------------------------------------------------
export type News = {
  id: string;
  title: string;
  when: string;
  tag: string;
  what: string;
  how: string;
  fix: string;
  lesson: string;
  sources: { label: string; href: string }[];
};

export const news: News[] = [
  {
    id: "php2shell",
    title: "PHP2Shell — remote code execution in PHP itself",
    when: "Oct 2026 · CVE-2026-109618 and CVE-2026-109619",
    tag: "Critical · actively exploited",
    what: "Two flaws in the PHP engine, rated 9.2 (CVSS v4), let an attacker run commands on servers running PHP (mod_php and PHP-FPM). CISA added both to its Known Exploited Vulnerabilities list on 26 October 2026.",
    how: "A **use-after-free**: some worker-wide fields kept pointing at memory that belonged to one request. CVE-2026-109619 abuses the `session.upload_progress` callback, which fires on any POST before the application's code runs; leftover state from a failed request is read by the next request on the same worker. Reported exploit bodies are only ~450 bytes, so size-based firewall rules don't help.",
    fix: "Upgrade (fixes landed in 8.2.35, 8.3.36, 8.4.27, 8.5.12). Interim: set `session.upload_progress.enabled=0` and restart workers.",
    lesson: "Memory-safety bugs live below your code — a perfect app can still be exposed. That's why patching the runtime matters, and one reason TIC's platform runs on a managed Node runtime with few moving parts.",
    sources: [
      { label: "Tenable FAQ", href: "https://www.tenable.com/blog/php2shell-cve-2026-109618-cve-2026-109619-frequently-asked-questions-about-critical-php-remote" },
      { label: "Datadog Security Labs", href: "https://securitylabs.datadoghq.com/articles/php2shell-critical-vulnerabilities-in-php/" },
      { label: "NCSC-NL operational notes", href: "https://github.com/NCSC-NL/php2shell" },
    ],
  },
  {
    id: "php-nov",
    title: "PHP's 19 November 2026 security release",
    when: "19 Nov 2026 · PHP 8.5.13 / 8.4.28 / 8.3.37 / 8.2.36 (and 8.6.0)",
    tag: "Critical · just released",
    what: "A follow-up release fixing seven critical flaws reported at CVSS 9.2, several leading to remote code execution. Among them: PHP-FPM request smuggling (CVE-2026-129289), a session upload-progress RCE (CVE-2026-115560) disclosed two days after the PHP2Shell patches, and a session use-after-free that was an incomplete fix for PHP2Shell (CVE-2026-129481).",
    how: "Request smuggling needs a web server that reuses connections to PHP-FPM and an app that opens `php://input` without reading it fully — the server and PHP then disagree about where one request ends and the next begins.",
    fix: "Upgrade to the 19 November versions (they include the October fixes). Don't expose PHP-FPM listeners to untrusted networks; keep session upload progress disabled until patched. Counts differ between reports, so check the official advisory for your branch.",
    lesson: "An incomplete fix is common: patches get re-examined and attackers look right next to the last bug. Always re-test after a security update.",
    sources: [
      { label: "The Hacker News", href: "https://thehackernews.com/2026/11/php-fixes-7-critical-flaws-including.html" },
      { label: "Aikido", href: "https://www.aikido.dev/blog/php-security-release-19-november-2026-cve-2026-115560" },
      { label: "Unit 42", href: "https://unit42.paloaltonetworks.com/cve-2026-109618-cve-2026-109619/" },
    ],
  },
  {
    id: "react2shell",
    title: "React2Shell — the CVSS 10.0 bug in React Server Components",
    when: "Disclosed 3 Dec 2025 · CVE-2025-55182 (Next.js: CVE-2025-66478)",
    tag: "Critical · exploited in the wild",
    what: "An unauthenticated attacker could run code on a server with a single crafted HTTP request to an app using React Server Components (including Next.js App Router apps) — even apps that never wrote a Server Function.",
    how: "**Unsafe deserialization** of the React \"Flight\" protocol payload on the server: data from the request was turned back into objects in a way that let the attacker reach code execution. Affected react-server-dom-* 19.0–19.2.0; follow-up issues leaked source code (CVE-2025-55183) and allowed denial of service (CVE-2025-55184).",
    fix: "Patched in 19.0.1 / 19.1.2 / 19.2.1, with 19.2.3 covering the follow-ups; framework updates for Next.js. CISA listed it as known-exploited.",
    lesson: "Never trust serialized input from a client. It's the same principle behind my webhook checks and input validation: verify, then parse, then use. (Our platform is SvelteKit, not RSC — but the rguLAB site you're reading is React 19.3, which is past the fix.)",
    sources: [
      { label: "Tenable FAQ", href: "https://www.tenable.com/blog/react2shell-cve-2025-55182-react-server-components-rce" },
      { label: "Google Threat Intelligence", href: "https://cloud.google.com/blog/topics/threat-intelligence/threat-actors-exploit-react2shell-cve-2025-55182" },
      { label: "Datadog Security Labs", href: "https://securitylabs.datadoghq.com/articles/cve-2025-55182-react2shell-remote-code-execution-react-server-components/" },
    ],
  },
  {
    id: "sveltekit-nov",
    title: "SvelteKit advisories — our own framework",
    when: "12–13 Nov 2026 · CVE-2026-128116, -128118, -128121",
    tag: "Medium to High · check your config",
    what: "CVE-2026-128116: cross-origin script execution when `router.resolution` is set to `'server'` (fixed in 2.70.4 / 3.1.1). CVE-2026-128118: on SvelteKit 3.0.x, server-only modules imported via `src/params.js` could end up in browser bundles (fixed in 3.1.1). CVE-2026-128121: a prerendering issue in adapter-vercel/adapter-static.",
    how: "Mistakes in what the framework decides runs on the server versus what gets shipped to the browser — exactly the boundary I relied on for the service-role key.",
    fix: "Upgrade @sveltejs/kit (2.70.4+ or 3.1.1+) and the adapters.",
    lesson: "**Viva-ready answer:** our project is on SvelteKit 2.57 with the default router and no `src/params.js`, so these specific paths don't apply as configured — but the right move is still to upgrade, because \"not exploitable today\" changes with one config line.",
    sources: [
      { label: "OpenCVE: CVE-2026-128116", href: "https://app.opencve.io/cve/CVE-2026-128116" },
      { label: "OffSeq: CVE-2026-128118", href: "https://radar.offseq.com/threat/cve-2026-128118-cwe-200-exposure-of-sensitive-information-to-an-unauthorized-actor-in-sveltejs-kit-84f234518c9a88ef" },
    ],
  },
  {
    id: "axios",
    title: "The Axios npm compromise — supply chain in action",
    when: "30–31 Mar 2026 · axios@1.14.1 and 0.30.4",
    tag: "Supply chain · OWASP A03",
    what: "Attackers hijacked the npm account of Axios's lead maintainer (a library with 100M+ weekly downloads) and published versions that installed a cross-platform remote access trojan. Google attributed it to a North Korea-nexus actor. The bad versions were live for roughly two to three hours.",
    how: "Social engineering, then the attacker changed the account email and published straight from the npm CLI with a long-lived token — bypassing the project's normal CI-based publishing.",
    fix: "Pin known-good versions (1.14.0 / 0.30.3), rotate any credentials on machines that installed the bad versions, prefer trusted publishing and short-lived tokens. Late-2025's \"Shai-Hulud\" worm showed the same pattern at scale.",
    lesson: "Why OWASP 2025 created **A03 Software Supply Chain Failures**. Lockfiles, few dependencies and reviewing updates are real security work — I'd mention our pnpm lockfile and small dependency list.",
    sources: [
      { label: "Google Threat Intelligence", href: "https://cloud.google.com/blog/topics/threat-intelligence/north-korea-threat-actor-targets-axios-npm-package" },
      { label: "Datadog Security Labs", href: "https://securitylabs.datadoghq.com/articles/axios-npm-supply-chain-compromise/" },
      { label: "Unit 42: Shai-Hulud", href: "https://unit42.paloaltonetworks.com/npm-supply-chain-attack/" },
    ],
  },
  {
    id: "postgres",
    title: "Postgres and Supabase patching in 2026",
    when: "Through 2026",
    tag: "Our database",
    what: "Supabase rolled out PostgreSQL 15.19 and 17.11, a minor release reported to close 44 CVEs; one change stops pgcrypto decrypting old Blowfish/CAST5 data. Postgres 14 support ended 1 July 2026, the self-hosted image moved to Postgres 17, and Storage fixed a path-traversal bug. Roundups also report legacy API keys being retired in late 2026.",
    how: "Minor versions are security and bug fixes only — no schema changes — which is why managed platforms can roll them out automatically.",
    fix: "Keep projects on supported majors, read the changelog for breaking crypto changes, and when moving to the new API keys re-check that every client-reachable table has RLS on and tested.",
    lesson: "Exactly the advice I'd give TIC for the self-hosted move: track supported Postgres versions and treat RLS as the contract the keys depend on. (Some details come from third-party roundups; confirm on the Supabase changelog.)",
    sources: [
      { label: "Supabase changelog (security)", href: "https://supabase.com/changelog?tags=security" },
      { label: "Supabase self-hosting changelog", href: "https://github.com/supabase/supabase/blob/master/docker/CHANGELOG.md" },
    ],
  },
  {
    id: "outages",
    title: "November's outage cluster and the \"patch rush\"",
    when: "Nov 2026",
    tag: "Reliability · details still disputed",
    what: "A run of outages hit Microsoft (Outlook, Teams, Copilot on 11 November), AWS sign-in services, and several others. Some commentators blamed rushed patching after AI tools found many flaws at once; officials confirmed that link for only some incidents.",
    how: "Large systems fail at their seams: upgrades, identity services and dependencies everyone shares.",
    fix: "Staged rollouts, health checks and quick rollback — the same reason I verified every deploy and kept releases small.",
    lesson: "Security and reliability pull in the same direction only if changes are small, tested and reversible. Treat the specific numbers in early reports with caution.",
    sources: [
      { label: "TechRepublic timeline", href: "https://www.techrepublic.com/article/news-november-2026-tech-outages-timeline/" },
      { label: "PolitiFact", href: "https://politifact.com/article/2026/nov/19/tech-outages-artificial-intelligence-microsoft/" },
    ],
  },
  {
    id: "owasp",
    title: "OWASP Top 10:2025 is the new reference list",
    when: "Released Nov 2025",
    tag: "Standard",
    what: "Broken Access Control stays #1 (SSRF folded into it), Security Misconfiguration rises to #2, and two categories are new: Software Supply Chain Failures (A03) and Mishandling of Exceptional Conditions (A10).",
    how: "Ranked from contributed test data plus a community survey.",
    fix: "Use it as a checklist — see the mapping table in the Security module above.",
    lesson: "If asked \"which OWASP risk did your design target most?\" — A01. Two layers of access control and RLS on every table.",
    sources: [
      { label: "OWASP Top 10:2025", href: "https://owasp.org/Top10/2025/0x00_2025-Introduction/" },
      { label: "The Register", href: "https://www.theregister.com/2025/11/11/new_owasp_top_ten_broken/" },
    ],
  },
];

// -----------------------------------------------------------------------------
// Viva bank
// -----------------------------------------------------------------------------
export const viva: { topic: string; items: [string, string][] }[] = [
  {
    topic: "About the internship",
    items: [
      ["Introduce your internship in two sentences.", "I interned at IIT Guwahati's Technology Incubation Centre from 13 July to October 2026 and built the staff side of their new platform: the admin console, its backend and the database. It lets non-technical staff run applications, startups, jobs, accounts, website content and files, with every action checked and logged."],
      ["What problem did you solve?", "Every website change needed a developer, applications moved through email, and nothing recorded who approved what. The console gives staff self-service with role-based access and an audit trail."],
      ["What exactly did YOU build vs your teammate?", "Me: TIC admin console, /api/tic-admin backend, database (tables, RLS, triggers, buckets), roles and permissions, handover support. Jeu: overall design, public website, founder console and application form, job board, emails, AI assistant, review process, documentation."],
      ["Who was your guide and how did you work with the centre?", "Mr. Sanket Umap, Programme Outreach Officer. The CEO, Ms. Urmi Buragohain, explained the review process; the TIC team gave feedback on each release."],
      ["What was the hardest part?", "Designing access so that six staff roles and founders each see exactly the right data — and proving it, by enforcing it in the database with RLS and testing as each role."],
      ["What would you do differently?", "Write automated browser tests that sign in as each role from day one, and add a policy test suite in SQL so RLS regressions fail CI automatically."],
      ["How was the project handed over?", "On 9 October 2026 to the centre's website agency: public repo, 34 migrations, .env.example, README setup steps, admin manual and videos. I was named contact for backend and database questions and the self-hosted Supabase move."],
    ],
  },
  {
    topic: "Architecture and SvelteKit",
    items: [
      ["Explain the request lifecycle in your app.", "Hook reads and verifies the session cookie and re-checks the account → a server load function fetches only allowed data, or an API route validates and writes → HTML is rendered on the server → the browser hydrates it."],
      ["What is hydration?", "Making server-rendered HTML interactive by attaching the JavaScript event handlers in the browser, without re-rendering from scratch."],
      ["SSR vs CSR vs SSG — which did you use and why?", "SSR. Content is edited live in the console, so SSG would freeze it; CSR would show spinners and hurt SEO. SSR gives complete pages with fresh data."],
      ["What is hooks.server.ts?", "Code that runs on the server for every request before routing: our place for session verification, account re-checks, route guards and page-view logging."],
      ["Why SvelteKit over Next.js?", "Smaller browser bundles (Svelte compiles away), server load functions next to pages, simple file routing, and adapters that make moving from Vercel to a VPS a config change."],
      ["What are runes?", "Svelte 5's explicit reactivity primitives: $state, $derived, $effect, $props."],
      ["How do you keep secrets out of the browser?", "Private env modules and $lib/server imports; SvelteKit fails the build if browser code imports them."],
      ["What is an adapter?", "A build plugin that packages the app for a target: adapter-vercel for serverless, adapter-node for a long-running Node server."],
    ],
  },
  {
    topic: "Database and SQL",
    items: [
      ["How many tables and why that many?", "21. Core relational ones (profiles, companies, applications, scores, jobs, applicants, startup profiles, change requests) and server-only ones (content, email, audit, page views, rate limits, assistant chats, deleted accounts)."],
      ["What is a migration?", "A versioned SQL file that changes the schema. Applied in order, 34 migrations rebuild the whole database from scratch on any server."],
      ["Primary key vs foreign key?", "A primary key uniquely identifies a row in its table; a foreign key references a primary key in another table and enforces that the referenced row exists."],
      ["Explain normalisation with your example.", "Jobs store company_id, not the company name; the name lives once in companies. Changing it updates everywhere, with no inconsistent copies (3NF)."],
      ["What is an index and when not to add one?", "A structure (B-tree) that speeds up lookups. Avoid on columns rarely filtered or on small, write-heavy tables — each index slows writes and uses space."],
      ["What is ACID?", "Atomicity, Consistency, Isolation, Durability — guarantees that a transaction is all-or-nothing, keeps constraints, isn't disturbed by concurrent ones and survives crashes."],
      ["What is a trigger? Give your example.", "A function the database runs automatically on insert/update/delete. audit_trigger writes before/after values and the actor to audit_log; handle_new_user creates a profile for each new account."],
      ["What is a JOIN?", "Combining rows of two tables on a related column, e.g. applications joined to companies on company_id to show the startup's name."],
      ["What does ON DELETE CASCADE do?", "Deleting a parent row deletes its children. It doesn't touch storage files, so I delete documents explicitly."],
      ["Why json not jsonb for site content?", "jsonb reorders keys; the editor must keep fields in page order, which json preserves."],
    ],
  },
  {
    topic: "RLS, auth and roles",
    items: [
      ["What is Row Level Security?", "A PostgreSQL feature where policies attached to a table decide, per row, who can select, insert, update or delete. Checked on every query by the database itself."],
      ["USING vs WITH CHECK?", "USING filters existing rows you can read/update/delete; WITH CHECK validates the new row values on insert/update."],
      ["What happens with RLS enabled and no policy?", "Nobody except the service role (which bypasses RLS) can access the table. I used that for server-only tables."],
      ["Anon key vs service-role key?", "The anon/publishable key is safe in the browser because RLS applies to it. The service-role key bypasses RLS and lives only on the server."],
      ["Authentication vs authorisation?", "Authentication proves who you are; authorisation decides what you may do."],
      ["How is your session cookie protected?", "HMAC-SHA256 signature with a server secret, HttpOnly, Secure, SameSite, expiry, constant-time verification, and the account is re-checked every request."],
      ["Hashing vs encryption vs signing?", "Hashing is one-way (passwords). Encryption is reversible with a key (confidentiality). Signing proves integrity and origin (my cookie, webhooks)."],
      ["What is a timing attack?", "Inferring a secret from how long comparisons take. Prevented with constant-time comparison (timingSafeEqual)."],
      ["How do you stop privilege escalation?", "Role and status columns aren't writable by users (column grants), roles are changed only via the server, and rank checks stop managing anyone above your rank."],
      ["What is least privilege?", "Give each role the minimum access needed — e.g. coordinators see only assigned applications, only from the screening step onward."],
    ],
  },
  {
    topic: "Security and reliability",
    items: [
      ["Which OWASP risk is #1 and how did you address it?", "Broken Access Control. Two layers: role checks on every request and RLS policies on all 21 tables, plus rank checks for account management."],
      ["What is XSS and how is your app protected?", "Injected script running in another user's browser. Svelte escapes output by default, CSP restricts script sources, and session cookies are HttpOnly."],
      ["What is CSRF?", "Tricking a signed-in user's browser into sending an unwanted request. SameSite cookies and SvelteKit's origin check block it."],
      ["What is SQL injection and why aren't you vulnerable?", "Untrusted input executed as SQL. All queries go through the Supabase client with parameters, never string-built SQL, and inputs are validated."],
      ["Why store rate limits in the database?", "Serverless instances don't share memory and restart; a DB row is shared and atomic, so the limit can't be bypassed."],
      ["How do you verify a webhook?", "Recompute HMAC of id.timestamp.body with the secret, compare in constant time, reject if older than 5 minutes, and dedupe by event id."],
      ["What is a signed URL?", "A link that includes a signature and expiry, granting temporary access to a private file — ours expire in 10 minutes."],
      ["Why return 409 when deleting a file?", "Conflict: the file is still referenced by content or records; deleting would break a page or an application."],
      ["What is a supply chain attack? Give a recent example.", "Compromising a dependency so everyone who installs it is infected — e.g. the Axios npm compromise in March 2026 shipped a remote access trojan for a few hours."],
      ["What is PHP2Shell?", "Two critical PHP engine flaws (CVE-2026-109618/109619, Oct 2026): a use-after-free reachable through session upload progress, giving remote code execution; actively exploited, fixed by upgrading PHP."],
      ["What is React2Shell?", "CVE-2025-55182: unsafe deserialization in React Server Components' Flight protocol allowing unauthenticated remote code execution with CVSS 10.0, disclosed December 2025."],
      ["Did this month's SvelteKit advisories affect your project?", "Not as configured — we're on 2.57 with the default router and no src/params.js — but I'd still upgrade, because exposure depends on config that can change."],
    ],
  },
  {
    topic: "Process and tools",
    items: [
      ["How did you manage code?", "Git with a feature branch for the console, a pull request per release reviewed by my teammate, and automatic deploys from main."],
      ["What checks ran before a release?", "svelte-check for types, ESLint/Prettier, unit tests for the content schema and session validation, and a live schema check against the migrations."],
      ["What is CI/CD?", "Continuous integration (automatically building and checking every change) and continuous delivery/deployment (automatically shipping it). Vercel deployed every merge to main."],
      ["What is serverless?", "Running code as short-lived functions managed by the platform; you don't run a server, but you can't rely on memory or background work between requests."],
      ["What did you learn?", "Modelling a real workflow in a relational database, designing access control that can't be bypassed from the browser, and shipping in small reviewable steps."],
      ["Future scope?", "Self-hosted Supabase on TIC's server, reports on time spent per review step, staff digests, role-based automated tests, scheduled restore drills."],
    ],
  },
];

// -----------------------------------------------------------------------------
// Self-test quiz
// -----------------------------------------------------------------------------
export type QuizQ = { q: string; options: string[]; correct: number; why: string };

export const quiz: QuizQ[] = [
  { q: "A signed-in coordinator opens /tic-admin/users. Which status should the API return?", options: ["401", "403", "404", "409"], correct: 1, why: "They are authenticated but their role cannot open Users: forbidden, 403." },
  { q: "Which key may safely appear in browser code?", options: ["Service-role key", "Session secret", "Publishable (anon) key", "Resend API key"], correct: 2, why: "RLS applies to the publishable key, so it is designed to be public. The others bypass protections or authorise sending." },
  { q: "RLS is enabled on audit_log and there are no policies. Who can read it?", options: ["Everyone", "Signed-in users", "Only the service role / server", "Only the table owner's company"], correct: 2, why: "No policy means no access for anon/authenticated roles; the service role bypasses RLS." },
  { q: "Why compare HMAC signatures with timingSafeEqual?", options: ["It is faster", "It hides the payload", "It prevents timing attacks", "It decrypts the cookie"], correct: 2, why: "Normal comparison returns early on the first mismatch, leaking information through time." },
  { q: "Why are rate-limit counters kept in PostgreSQL rather than memory?", options: ["SQL is faster than RAM", "Serverless instances don't share memory and restart", "Vercel forbids variables", "To log IP addresses forever"], correct: 1, why: "A shared, atomic database row works across all instances." },
  { q: "Which SQL clause validates the NEW row on insert in a policy?", options: ["USING", "WITH CHECK", "RETURNING", "ON CONFLICT"], correct: 1, why: "WITH CHECK applies to the values being written; USING filters existing rows." },
  { q: "React2Shell (CVE-2025-55182) was fundamentally a…", options: ["SQL injection", "Unsafe deserialization bug", "Weak password policy", "DNS hijack"], correct: 1, why: "The server deserialized attacker-controlled Flight protocol data unsafely." },
  { q: "PHP2Shell's root cause was a…", options: ["Use-after-free", "Buffer overflow in nginx", "Missing CSRF token", "Expired TLS certificate"], correct: 0, why: "Worker-wide fields kept pointers to freed per-request memory." },
  { q: "Which OWASP 2025 category is NEW?", options: ["Injection", "Broken Access Control", "Software Supply Chain Failures", "Cryptographic Failures"], correct: 2, why: "A03 Software Supply Chain Failures (and A10 Mishandling of Exceptional Conditions) are new in 2025." },
  { q: "Which statement about my session cookie is TRUE?", options: ["It is encrypted so nobody can read it", "It is signed so nobody can change it without the secret", "It stores the password hash", "It never expires"], correct: 1, why: "It is base64 + HMAC signature: readable, tamper-evident, with an expiry." },
  { q: "Why does deleting an account also delete files explicitly?", options: ["ON DELETE CASCADE doesn't reach storage", "Files are faster to delete", "RLS requires it", "Git requires it"], correct: 0, why: "Storage objects live outside the relational tables, so cascades don't remove them." },
  { q: "The best one-line answer for \"why RLS if the server checks roles?\"", options: ["It's faster", "Defence in depth — a missed check still can't leak rows", "Supabase requires it for SQL", "It replaces authentication"], correct: 1, why: "Two independent layers: a bug in one is caught by the other." },
];

// -----------------------------------------------------------------------------
// Glossary
// -----------------------------------------------------------------------------
export const glossary: [string, string][] = [
  ["ACID", "Atomicity, Consistency, Isolation, Durability — transaction guarantees."],
  ["Adapter", "SvelteKit build target plugin (Vercel, Node, static)."],
  ["Audit log", "Record of who changed what and when; here written by triggers."],
  ["bcrypt", "Slow, salted password hashing algorithm."],
  ["CSP", "Content Security Policy — header limiting where scripts/styles may load from."],
  ["CSRF", "Cross-site request forgery — making a victim's browser send a request."],
  ["CVE / CVSS", "Public vulnerability id / 0–10 severity score."],
  ["Deserialization", "Turning bytes back into objects; dangerous on untrusted input."],
  ["HMAC", "Keyed hash used to sign data so tampering is detectable."],
  ["HttpOnly", "Cookie flag that hides the cookie from JavaScript."],
  ["Hydration", "Attaching interactivity to server-rendered HTML."],
  ["IDOR", "Accessing another user's object by changing an id."],
  ["JWT", "Signed token: header.payload.signature."],
  ["KEV", "CISA's Known Exploited Vulnerabilities catalog."],
  ["Least privilege", "Grant only the access a role needs."],
  ["Migration", "Versioned SQL file that changes the schema."],
  ["PostgREST", "Auto-generated REST API over Postgres used by Supabase."],
  ["Rate limiting", "Capping requests per client per time window."],
  ["RBAC", "Role-based access control."],
  ["RLS", "Row Level Security — per-row access policies in PostgreSQL."],
  ["Runes", "Svelte 5 reactivity primitives: $state, $derived, $effect, $props."],
  ["Service role", "Supabase key/role that bypasses RLS; server-only."],
  ["Signed URL", "Time-limited link to a private file."],
  ["SSR / CSR / SSG", "Server-side / client-side rendering / static generation."],
  ["Supply chain attack", "Compromising a dependency to reach its users."],
  ["Trigger", "Function the database runs automatically on row changes."],
  ["Turnstile", "Cloudflare's privacy-friendly bot check."],
  ["Use-after-free", "Memory bug: using memory after it was released."],
  ["Webhook", "An HTTP callback a provider sends to your server."],
  ["XSS", "Cross-site scripting — injected script running in a victim's browser."],
];
