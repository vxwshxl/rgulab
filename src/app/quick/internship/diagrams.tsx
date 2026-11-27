import type { DiagramId } from "./data";

// Theme-aware SVG diagrams: colours come from the design tokens, so they follow light/dark.
const C = {
  box: "var(--ds-bg-elevated)",
  muted: "var(--ds-bg-muted)",
  line: "var(--ds-border-strong)",
  accent: "var(--ds-accent)",
  accentSoft: "var(--ds-accent-subtle)",
  danger: "var(--ds-danger)",
  dangerSoft: "var(--ds-danger-subtle)",
  ok: "var(--ds-success)",
  okSoft: "var(--ds-success-subtle)",
  text: "var(--ds-fg)",
  sub: "var(--ds-fg-secondary)",
  blue: "var(--ds-hue-blue)",
  purple: "var(--ds-hue-purple)",
  orange: "var(--ds-hue-orange)",
};

type BoxProps = { x: number; y: number; w: number; h: number; title: string; sub?: string; fill?: string; stroke?: string; tc?: string };
function Box({ x, y, w, h, title, sub, fill = C.box, stroke = C.line, tc = C.text }: BoxProps) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={fill} stroke={stroke} strokeWidth={2} />
      <text x={x + w / 2} y={sub ? y + h / 2 - 6 : y + h / 2 + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill={tc}>
        {title}
      </text>
      {sub &&
        sub.split("\n").map((line, i) => (
          <text key={i} x={x + w / 2} y={y + h / 2 + 13 + i * 14} textAnchor="middle" fontSize={11.5} fill={C.sub}>
            {line}
          </text>
        ))}
    </g>
  );
}

function Arrow({ d, color = C.line, dashed, label, lx, ly }: { d: string; color?: string; dashed?: boolean; label?: string; lx?: number; ly?: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeDasharray={dashed ? "6 5" : undefined} markerEnd="url(#arrow)" />
      {label && (
        <text x={lx} y={ly} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.sub}>
          {label}
        </text>
      )}
    </g>
  );
}

function Defs() {
  return (
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="var(--ds-border-strong)" />
      </marker>
    </defs>
  );
}

function Svg({ w, h, label, children }: { w: number; h: number; label: string; children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className="h-auto w-full" style={{ fontFamily: "var(--font-sans)" }}>
      <Defs />
      {children}
    </svg>
  );
}

function Architecture() {
  return (
    <Svg w={860} h={380} label="Architecture: browser to SvelteKit on Vercel to Supabase and external services">
      <text x={20} y={26} fontSize={12} fontWeight={800} fill={C.sub}>BROWSER</text>
      <Box x={20} y={40} w={170} h={64} title="Visitor" sub="public website" />
      <Box x={20} y={120} w={170} h={64} title="Founder" sub="founder console" />
      <Box x={20} y={200} w={170} h={64} title="TIC staff" sub="admin console · 6 roles" fill={C.accentSoft} stroke={C.accent} />
      <rect x={250} y={30} width={290} height={300} rx={16} fill="none" stroke={C.line} strokeWidth={2} strokeDasharray="6 5" />
      <text x={265} y={52} fontSize={12} fontWeight={800} fill={C.sub}>VERCEL · SVELTEKIT 2 (SSR)</text>
      <Box x={270} y={64} w={250} h={56} title="hooks.server.ts" sub="verify cookie · re-check role" fill={C.accentSoft} stroke={C.accent} />
      <Box x={270} y={134} w={250} h={56} title="Pages + server load()" sub="74 page templates" />
      <Box x={270} y={204} w={250} h={56} title="API routes /api/*" sub="43 routes · guard · validate" fill={C.accentSoft} stroke={C.accent} />
      <Box x={270} y={274} w={250} h={44} title="Daily cron: resume clean-up" />
      <rect x={600} y={30} width={240} height={230} rx={16} fill="none" stroke={C.line} strokeWidth={2} strokeDasharray="6 5" />
      <text x={615} y={52} fontSize={12} fontWeight={800} fill={C.sub}>SUPABASE</text>
      <Box x={615} y={64} w={210} h={70} title="PostgreSQL" sub={"21 tables · RLS on all\ntriggers · audit log"} fill={C.accentSoft} stroke={C.accent} />
      <Box x={615} y={146} w={210} h={46} title="Auth" />
      <Box x={615} y={202} w={210} h={46} title="Storage · 4 buckets" />
      <Box x={600} y={282} w={115} h={60} title="Turnstile" sub="bot check" fill={C.muted} />
      <Box x={725} y={282} w={115} h={60} title="Resend" sub="email · webhooks" fill={C.muted} />
      <Arrow d="M190 72 L268 92" />
      <Arrow d="M190 152 L268 100" />
      <Arrow d="M190 232 L268 108" />
      <Arrow d="M520 162 L613 100" />
      <Arrow d="M520 232 L613 110" />
      <Arrow d="M520 240 L613 225" />
      <Arrow d="M520 250 L655 280" dashed />
      <Arrow d="M520 255 L770 280" dashed />
    </Svg>
  );
}

function RequestFlow() {
  return (
    <Svg w={860} h={250} label="Request flow through hook, load or API, and the database">
      <Box x={10} y={90} w={130} h={70} title="Browser" sub="cookie only" fill={C.muted} />
      <Box x={180} y={90} w={160} h={70} title="Hook" sub={"signature ok?\naccount + role ok?"} fill={C.accentSoft} stroke={C.accent} />
      <Box x={390} y={20} w={190} h={70} title="Server load()" sub="read allowed data" />
      <Box x={390} y={160} w={190} h={70} title="API route" sub={"validate · rate limit\nwrite as actor"} />
      <Box x={640} y={90} w={200} h={70} title="PostgreSQL + RLS" sub="policy checks each row" fill={C.accentSoft} stroke={C.accent} />
      <Arrow d="M140 125 L178 125" />
      <Arrow d="M340 115 L388 60" label="GET page" lx={340} ly={80} />
      <Arrow d="M340 135 L388 190" label="POST/PATCH" lx={340} ly={180} />
      <Arrow d="M580 55 L638 110" />
      <Arrow d="M580 195 L638 140" />
      <Box x={180} y={190} w={160} h={44} title="401 / 403" fill={C.dangerSoft} stroke={C.danger} />
      <Arrow d="M260 160 L260 188" color={C.danger} />
    </Svg>
  );
}

function Rls() {
  return (
    <Svg w={860} h={260} label="Defence in depth: server role check then database RLS">
      <Box x={10} y={95} w={150} h={70} title="Request" sub="from any client" fill={C.muted} />
      <Box x={220} y={95} w={190} h={70} title="Lock 1: server" sub={"role → sections table\nrank checks"} fill={C.accentSoft} stroke={C.accent} />
      <Box x={470} y={95} w={190} h={70} title="Lock 2: RLS" sub={"USING / WITH CHECK\nper row"} fill={C.accentSoft} stroke={C.accent} />
      <Box x={720} y={95} w={130} h={70} title="Rows" sub="only allowed ones" fill={C.okSoft} stroke={C.ok} />
      <Arrow d="M160 130 L218 130" />
      <Arrow d="M410 130 L468 130" />
      <Arrow d="M660 130 L718 130" />
      <Box x={220} y={200} w={190} h={44} title="bug here? →" fill={C.dangerSoft} stroke={C.danger} />
      <Box x={470} y={200} w={190} h={44} title="still blocked ✓" fill={C.okSoft} stroke={C.ok} />
      <text x={430} y={40} textAnchor="middle" fontSize={13} fontWeight={800} fill={C.text}>A mistake in one layer is caught by the other</text>
    </Svg>
  );
}

function Hmac() {
  return (
    <Svg w={860} h={220} label="HMAC signed session cookie">
      <Box x={10} y={30} w={220} h={70} title="payload" sub={"{ userId, email, name, exp }\n→ base64url"} />
      <Box x={10} y={130} w={220} h={60} title="SESSION_SECRET" sub="server only" fill={C.dangerSoft} stroke={C.danger} />
      <Box x={300} y={75} w={180} h={70} title="HMAC-SHA256" sub="keyed hash" fill={C.accentSoft} stroke={C.accent} />
      <Box x={550} y={75} w={300} h={70} title="cookie = payload . signature" sub="HttpOnly · Secure · SameSite · 30 days" fill={C.okSoft} stroke={C.ok} />
      <Arrow d="M230 65 L298 100" />
      <Arrow d="M230 160 L298 125" />
      <Arrow d="M480 110 L548 110" />
      <text x={700} y={180} textAnchor="middle" fontSize={12} fill={C.sub}>change one byte of the payload → signature no longer matches → rejected</text>
    </Svg>
  );
}

function T({ x, y, w, title, cols, hi }: { x: number; y: number; w: number; title: string; cols: string[]; hi?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={30 + cols.length * 18} rx={10} fill={C.box} stroke={hi ? C.accent : C.line} strokeWidth={2} />
      <rect x={x} y={y} width={w} height={26} rx={10} fill={hi ? C.accent : C.muted} stroke={hi ? C.accent : C.line} strokeWidth={2} />
      <text x={x + 10} y={y + 18} fontSize={12.5} fontWeight={800} fill={hi ? "var(--ds-accent-fg)" : C.text}>{title}</text>
      {cols.map((c, i) => (
        <text key={c} x={x + 10} y={y + 44 + i * 18} fontSize={11.5} fill={C.text} style={{ fontFamily: "var(--font-mono)" }}>{c}</text>
      ))}
    </g>
  );
}

function Erd() {
  return (
    <Svg w={860} h={420} label="Entity relationship diagram of the core tables">
      <T x={10} y={20} w={150} title="auth.users" cols={["id", "email"]} />
      <T x={210} y={20} w={170} title="profiles" cols={["id → auth.users", "role", "company_id"]} hi />
      <T x={430} y={20} w={190} title="companies" cols={["id, owner_id", "company_name", "status"]} hi />
      <T x={670} y={10} w={180} title="startup_profiles" cols={["company_id", "draft / published"]} />
      <T x={670} y={100} w={180} title="company_profile_changes" cols={["company_id", "requested edits"]} />
      <T x={120} y={200} w={200} title="applications" cols={["company_id", "review_stage 0–6", "status, reapply_from"]} hi />
      <T x={450} y={200} w={180} title="jobs" cols={["owner tic|startup", "closes_on, limit"]} />
      <T x={670} y={210} w={180} title="job_applications" cols={["job_id", "resume path"]} />
      <T x={10} y={320} w={190} title="application_reviewers" cols={["application_id", "staff, step"]} />
      <T x={220} y={320} w={190} title="application_scores" cols={["reviewer, step", "score 0–100"]} />
      <T x={430} y={320} w={190} title="evaluation_scores" cols={["coordinator", "criterion 0–10"]} />
      <Arrow d="M160 45 L208 45" label="1:1" lx={184} ly={36} />
      <Arrow d="M380 45 L428 45" label="owns" lx={404} ly={36} />
      <Arrow d="M620 40 L668 30" />
      <Arrow d="M620 60 L668 120" />
      <Arrow d="M480 104 L260 198" label="submits" lx={350} ly={150} />
      <Arrow d="M540 104 L540 198" label="posts" lx={565} ly={160} />
      <Arrow d="M630 230 L668 235" />
      <Arrow d="M180 284 L110 318" />
      <Arrow d="M220 284 L310 318" />
      <Arrow d="M290 284 L520 318" />
    </Svg>
  );
}

function RateLimit() {
  const windows = [
    { x: 40, n: 4, label: "10:00–11:00" },
    { x: 310, n: 10, label: "11:00–12:00" },
    { x: 580, n: 2, label: "12:00–13:00" },
  ];
  return (
    <Svg w={860} h={230} label="Fixed window rate limiting with a limit of 10 per hour">
      {windows.map((w) => (
        <g key={w.x}>
          <rect x={w.x} y={40} width={240} height={120} rx={12} fill={C.muted} stroke={C.line} strokeWidth={2} />
          <text x={w.x + 120} y={30} textAnchor="middle" fontSize={12} fontWeight={800} fill={C.sub}>{w.label}</text>
          {Array.from({ length: 12 }).map((_, i) => {
            const used = i < w.n;
            const blocked = i >= 10 && w.n >= 10;
            return (
              <rect key={i} x={w.x + 14 + (i % 6) * 37} y={58 + Math.floor(i / 6) * 48} width={28} height={36} rx={6}
                fill={blocked ? C.dangerSoft : used ? C.accent : C.box} stroke={blocked ? C.danger : C.line} strokeWidth={1.5} />
            );
          })}
          <text x={w.x + 120} y={185} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={w.n >= 10 ? C.danger : C.text}>
            count = {w.n}{w.n >= 10 ? " → 11th request gets 429" : ""}
          </text>
        </g>
      ))}
      <text x={430} y={215} textAnchor="middle" fontSize={12} fill={C.sub}>one row per (bucket, address, window) · atomic insert … on conflict do update</text>
    </Svg>
  );
}

function Review() {
  const steps = ["Admin check", "CEO review", "Screening call", "CEO recheck", "TIC heads", "Decision → live"];
  return (
    <Svg w={860} h={150} label="Six step review chain">
      {steps.map((s, i) => (
        <g key={s}>
          <Box x={10 + i * 142} y={40} w={124} h={60} title={`Step ${i + 1}`} sub={s} fill={i === 5 ? C.okSoft : C.box} stroke={i === 5 ? C.ok : C.line} />
          {i < 5 && <Arrow d={`M${134 + i * 142} 70 L${150 + i * 142} 70`} />}
        </g>
      ))}
      <text x={430} y={130} textAnchor="middle" fontSize={12} fill={C.sub}>review_stage 0–6 · moves only through server routes that check the actor&apos;s scope</text>
    </Svg>
  );
}

function Release() {
  const s = [
    ["Requirement", "TIC feedback"],
    ["Migration", "tables · RLS"],
    ["API route", "guard · validate"],
    ["Screen", "Svelte page"],
    ["Pull request", "reviewed, merged"],
    ["Deploy", "verify live schema"],
  ];
  return (
    <Svg w={860} h={170} label="Release cycle">
      {s.map(([t, sub], i) => (
        <g key={t}>
          <Box x={10 + i * 142} y={30} w={124} h={66} title={t} sub={sub} fill={i === 1 ? C.accentSoft : C.box} stroke={i === 1 ? C.accent : C.line} />
          {i < 5 && <Arrow d={`M${134 + i * 142} 63 L${150 + i * 142} 63`} />}
        </g>
      ))}
      <Arrow d="M780 98 C 700 160, 160 160, 72 100" dashed label="next release (v1 … v27, v29)" lx={430} ly={158} />
    </Svg>
  );
}

function Webhook() {
  return (
    <Svg w={860} h={200} label="Webhook verification">
      <Box x={10} y={60} w={150} h={70} title="Resend" sub="bounce / complaint" fill={C.muted} />
      <Box x={210} y={60} w={160} h={70} title="Signature ok?" sub="HMAC(id.ts.body)" fill={C.accentSoft} stroke={C.accent} />
      <Box x={420} y={60} w={160} h={70} title="Fresh?" sub="< 5 minutes old" fill={C.accentSoft} stroke={C.accent} />
      <Box x={630} y={60} w={220} h={70} title="Store once · suppress" sub="dedupe by event id" fill={C.okSoft} stroke={C.ok} />
      <Arrow d="M160 95 L208 95" />
      <Arrow d="M370 95 L418 95" />
      <Arrow d="M580 95 L628 95" />
      <Box x={290} y={150} w={210} h={40} title="else → 401, ignore" fill={C.dangerSoft} stroke={C.danger} />
    </Svg>
  );
}

export function Diagram({ id }: { id: DiagramId }) {
  switch (id) {
    case "architecture": return <Architecture />;
    case "request": return <RequestFlow />;
    case "rls": return <Rls />;
    case "hmac": return <Hmac />;
    case "erd": return <Erd />;
    case "ratelimit": return <RateLimit />;
    case "review": return <Review />;
    case "release": return <Release />;
    case "webhook": return <Webhook />;
  }
}
