# aec-rfi-console

Interactive verification frontend for [aec-rfi-agent](https://github.com/ruilinlin/aec-rfi-agent) —
a revision-aware agent that drafts cited answers to construction RFIs and reports gaps
instead of guessing. Styled as a contract drawing sheet.

## Workspace layout

| Package | What it is |
|---|---|
| `packages/drafting-kit` | The construction-drawing design system: tokens (CAD lettering, line weights, verdict palette) and the five core components (SheetFrame, TitleBlock, VerdictStamp, CitationCallout, RevisionNote). Source-level workspace imports — no build step. |
| `apps/console` | Vite + React SPA. Replay-first: recorded scenarios always work; live mode unlocks behind a `/health` probe against the FastAPI backend. |
| `apps/blog` | Astro + MDX build-story blog. Static pages with interactive islands reusing the same drafting-kit components. |

## API contract sync

The backend contract lives as a committed snapshot (`packages/api-client/openapi.json`)
plus generated types (`src/schema.d.ts`). To sync after a backend API change:

```bash
# in aec-rfi-agent:
.venv/bin/python scripts/export_openapi.py --out ../aec-rfi-console/packages/api-client/openapi.json
# in aec-rfi-console:
pnpm --filter @rfi/api-client generate
```

Commit snapshot and generated types together - CI regenerates and fails on any diff
(hand-edited types or a stale generation can never land).

## Commands

```bash
pnpm install
pnpm lint        # biome check
pnpm typecheck   # all workspaces
pnpm build       # all workspaces
```

Node 22 (see `.nvmrc`), pnpm 9.

## Deployment (Cloudflare Workers, two Workers from one repo)

| Worker | Domain | Build command | Deploy command |
|---|---|---|---|
| `aec-rfi-console` | aec-rfi.ruilinsun.com | `pnpm --filter console build` | `npx wrangler deploy` (root `wrangler.jsonc`) |
| `aec-rfi-blog` | aec-rfi.blog.ruilinsun.com | `pnpm --filter blog build` | `npx wrangler deploy -c apps/blog/wrangler.jsonc` |

For both Workers in the Cloudflare dashboard: Root directory `/` (the monorepo installs at
the root; asset paths live in each wrangler config), and disable non-production branch
builds — PR quality gates are this repo's GitHub CI, and preview builds trip the Worker
name check. Bind domains under the project's Domains tab; if the two-level blog subdomain
stalls on certificate issuance, fall back to `aec-rfi-blog.ruilinsun.com`.
