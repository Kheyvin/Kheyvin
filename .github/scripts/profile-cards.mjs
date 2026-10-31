// Genera dist/trophies.svg y dist/activity.svg con la API GraphQL de GitHub.
// Sin dependencias: requiere Node 20+ (fetch nativo).
// Uso: GITHUB_TOKEN=... node .github/scripts/profile-cards.mjs <usuario> [carpeta_salida]
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const [login, outDir = "dist"] = process.argv.slice(2);
if (!login || !process.env.GITHUB_TOKEN) {
  console.error("Uso: GITHUB_TOKEN=... node profile-cards.mjs <usuario> [carpeta_salida]");
  process.exit(1);
}

// Paleta del README (ver SETUP.md)
const C = {
  card: "#141417",
  border: "#232327",
  grid: "#1e1e23",
  neon: "#FF0A2E",
  crimson: "#C8102E",
  light: "#FF3B5C",
  text: "#b8b8c2",
  white: "#F2F2F5",
  grey: "#7a7a85",
  off: "#3a3a40",
};
const FONT = "'JetBrains Mono','Segoe UI',Ubuntu,monospace";
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

async function gql(query, variables = {}) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "profile-cards",
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (!res.ok || body.errors) throw new Error(`GraphQL ${res.status}: ${JSON.stringify(body.errors ?? body)}`);
  return body.data;
}

async function fetchProfile() {
  const { user } = await gql(
    `query($login: String!) {
      user(login: $login) {
        createdAt
        followers { totalCount }
        pullRequests { totalCount }
        issues { totalCount }
        contributionsCollection {
          contributionYears
          contributionCalendar { weeks { contributionDays { date contributionCount } } }
        }
      }
    }`,
    { login },
  );
  if (!user) throw new Error(`Usuario "${login}" no encontrado`);

  let stars = 0;
  let repos = 0;
  let after = null;
  do {
    const { user: { repositories: page } } = await gql(
      `query($login: String!, $after: String) {
        user(login: $login) {
          repositories(ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false, first: 100, after: $after) {
            totalCount
            nodes { stargazerCount }
            pageInfo { hasNextPage endCursor }
          }
        }
      }`,
      { login, after },
    );
    repos = page.totalCount;
    stars += page.nodes.reduce((sum, r) => sum + r.stargazerCount, 0);
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);

  // Commits de todos los años; las contribuciones privadas cuentan si el perfil las muestra
  let commits = 0;
  const years = user.contributionsCollection.contributionYears;
  if (years.length) {
    const now = new Date();
    const fields = years.map((y) => {
      const to = y === now.getUTCFullYear() ? now.toISOString() : `${y}-12-31T23:59:59Z`;
      return `y${y}: contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${to}") {
        totalCommitContributions restrictedContributionsCount }`;
    });
    const { user: perYear } = await gql(`query($login: String!) { user(login: $login) { ${fields.join("\n")} } }`, { login });
    for (const y of Object.values(perYear)) commits += y.totalCommitContributions + y.restrictedContributionsCount;
  }

  return {
    stats: {
      commits,
      stars,
      prs: user.pullRequests.totalCount,
      issues: user.issues.totalCount,
      repos,
      followers: user.followers.totalCount,
      years: (Date.now() - Date.parse(user.createdAt)) / (365.25 * 864e5),
    },
    days: user.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays).slice(-31),
  };
}

const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n));

// ---------- Trofeos ----------

const RANKS = ["C", "B", "A", "AA", "AAA", "S", "SS", "SSS"];
const TROPHIES = [
  { key: "commits", title: "Commits", steps: [1, 10, 100, 200, 500, 1000, 2000, 4000] },
  { key: "stars", title: "Estrellas", steps: [1, 10, 30, 50, 100, 200, 700, 2000] },
  { key: "prs", title: "Pull Requests", steps: [1, 10, 20, 50, 100, 200, 500, 1000] },
  { key: "issues", title: "Issues", steps: [1, 10, 20, 50, 100, 200, 500, 1000] },
  { key: "repos", title: "Repositorios", steps: [1, 10, 20, 30, 35, 40, 45, 50] },
  { key: "followers", title: "Seguidores", steps: [1, 10, 20, 50, 100, 200, 400, 1000] },
  {
    key: "years",
    title: "Experiencia",
    steps: [1, 2, 3, 4, 5, 7, 10, 15],
    format: (v) => (v < 1 ? "&lt; 1 año" :`${Math.floor(v)} año${Math.floor(v) === 1 ? "" : "s"}`),
  },
];

function trophy({ title, steps, format = compact }, value, x, i) {
  const W = 124;
  const level = steps.findLastIndex((s) => value >= s); // -1 = sin rango
  const rank = level < 0 ? "?" : RANKS[level];
  const color = level >= 5 ? C.neon : level >= 2 ? C.crimson : level >= 0 ? C.grey : C.off;
  const lo = level < 0 ? 0 : steps[level];
  const hi = steps[level + 1];
  const progress = hi === undefined ? 1 : Math.min(1, (value - lo) / (hi - lo));
  const bar = W - 32;

  return `<g transform="translate(${x},0)"><g class="t" style="animation-delay:${i * 0.12}s">
    <rect x=".5" y=".5" width="${W - 1}" height="149" rx="10" fill="${C.card}" stroke="${C.border}"/>
    <g transform="translate(${W / 2},48)" fill="${color}"${level >= 5 ? ' filter="url(#glow)"' : ""}>
      <path d="M-18,-24H18V-8A18,18 0 0 1 -18,-8Z"/>
      <path d="M-18,-19C-31,-19 -31,0 -14,2M18,-19C31,-19 31,0 14,2" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>
      <rect x="-3.5" y="9" width="7" height="9"/>
      <rect x="-14" y="18" width="28" height="6" rx="2"/>
    </g>
    <text x="${W / 2}" y="${rank.length > 2 ? 41 : 42}" text-anchor="middle" font-size="${rank.length > 2 ? 11 : 13}" font-weight="800" fill="#0b0b0e">${rank}</text>
    <text x="${W / 2}" y="98" text-anchor="middle" font-size="12" font-weight="700" fill="${C.white}">${title}</text>
    <text x="${W / 2}" y="116" text-anchor="middle" font-size="11" fill="${C.text}">${format(value)}</text>
    <rect x="16" y="130" width="${bar}" height="4" rx="2" fill="${C.border}"/>
    <rect x="16" y="130" width="${(bar * progress).toFixed(1)}" height="4" rx="2" fill="${color}"/>
  </g></g>`;
}

function trophiesSvg(stats) {
  const W = 124;
  const gap = 10;
  const width = TROPHIES.length * W + (TROPHIES.length - 1) * gap;
  const cards = TROPHIES.map((t, i) => trophy(t, stats[t.key], i * (W + gap), i)).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="150" viewBox="0 0 ${width} 150" font-family="${FONT}" role="img" aria-label="Trofeos de GitHub">
  <style>.t{animation:in .6s ease-out backwards}@keyframes in{from{opacity:0;transform:translateY(8px)}}</style>
  <defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  ${cards}
</svg>`;
}

// ---------- Gráfico de actividad ----------

function activitySvg(days) {
  const W = 1000;
  const H = 320;
  const L = 56;
  const R = 28;
  const T = 72;
  const B = 44;
  const pw = W - L - R;
  const ph = H - T - B;
  const counts = days.map((d) => d.contributionCount);
  const max = Math.max(4, Math.ceil(Math.max(...counts) / 4) * 4);
  const x = (i) => L + (i * pw) / (days.length - 1);
  const y = (v) => T + ph - (v / max) * ph;

  const line = counts.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const area = `${line}L${x(days.length - 1).toFixed(1)},${T + ph}L${L},${T + ph}Z`;
  const grid = [0, 1, 2, 3, 4]
    .map((k) => {
      const v = (max / 4) * k;
      return `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${C.grid}"/>
    <text x="${L - 12}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="${C.text}">${v}</text>`;
    })
    .join("\n    ");
  const labels = days
    .map((d, i) => (i % 2 ? "" : `<text x="${x(i).toFixed(1)}" y="${H - 18}" text-anchor="middle" font-size="11" fill="${C.text}">${Number(d.date.slice(8))}</text>`))
    .join("");
  const points = counts.map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.5"/>`).join("");
  const fmt = (date) => `${Number(date.slice(8))} ${MONTHS[Number(date.slice(5, 7)) - 1]}`;
  const total = counts.reduce((a, b) => a + b, 0);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}" role="img" aria-label="Actividad de los últimos ${days.length} días">
  <style>
    .line{stroke-dasharray:1;animation:draw 1.8s ease-out backwards}
    .fade{animation:fade 1s ease-out .9s backwards}
    @keyframes draw{from{stroke-dashoffset:1}}
    @keyframes fade{from{opacity:0}}
  </style>
  <defs>
    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.crimson}" stop-opacity=".55"/>
      <stop offset="100%" stop-color="${C.crimson}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="10" fill="#0b0b0e" stroke="${C.border}"/>
  <text x="${L - 24}" y="40" font-size="20" font-weight="700" fill="${C.neon}">Actividad</text>
  <text x="${L + 96}" y="40" font-size="13" fill="${C.text}">${fmt(days[0].date)} – ${fmt(days.at(-1).date)}</text>
  <text x="${W - R}" y="40" text-anchor="end" font-size="13" fill="${C.text}"><tspan fill="${C.white}" font-weight="700">${total}</tspan> contribuciones</text>
  <g>
    ${grid}
  </g>
  ${labels}
  <path class="fade" d="${area}" fill="url(#area)"/>
  <path class="line" d="${line}" pathLength="1" fill="none" stroke="${C.neon}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
  <g class="fade" fill="${C.light}">${points}</g>
</svg>`;
}

const { stats, days } = await fetchProfile();
await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "trophies.svg"), trophiesSvg(stats));
await writeFile(join(outDir, "activity.svg"), activitySvg(days));
console.log("Trofeos:", stats);
console.log(`Actividad: ${days.length} días → ${outDir}/activity.svg`);
