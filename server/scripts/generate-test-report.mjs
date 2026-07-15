import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const jsonPath = path.join(root, 'test-report.json')
const outPath = path.join(root, 'test-report.html')

// Static knowledge of what each collection's REST surface actually exposes.
// Kept here (not derived) because it reflects route wiring, not test output.
const COLLECTIONS = [
  {
    name: 'User',
    files: ['auth.test.ts', 'users.test.ts'],
    crud: { create: 'covered', read: 'covered', update: 'covered', delete: 'gap' },
    note: 'Create via POST /api/auth/signup. No DELETE /api/users/:id endpoint exists.',
  },
  {
    name: 'Product',
    files: ['products.test.ts'],
    crud: { create: 'covered', read: 'covered', update: 'covered', delete: 'covered' },
    note: 'Full CRUD exposed at /api/products, writes gated to admin role.',
  },
  {
    name: 'Order',
    files: ['orders.test.ts'],
    crud: { create: 'covered', read: 'covered', update: 'gap', delete: 'gap' },
    note: 'Only POST / and GET / (own orders) exist. No status update or cancel endpoint.',
  },
  {
    name: 'ContactMessage',
    files: ['contact.test.ts'],
    crud: { create: 'covered', read: 'gap', update: 'gap', delete: 'gap' },
    note: 'Write-only inbox. No endpoint reads, updates, or deletes messages.',
  },
]

const CRUD_LABELS = { create: 'C', read: 'R', update: 'U', delete: 'D' }

function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function fmtMs(ms) {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms.toFixed(0)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function fmtClock(ms) {
  return new Date(ms).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

const raw = JSON.parse(readFileSync(jsonPath, 'utf-8'))

const byFile = new Map()
for (const tr of raw.testResults) {
  byFile.set(path.basename(tr.name), tr)
}

const collections = COLLECTIONS.map((col) => {
  const fileResults = col.files.map((f) => byFile.get(f)).filter(Boolean)
  const groups = new Map()
  let passed = 0
  let failed = 0
  let duration = 0

  for (const fr of fileResults) {
    const fileDuration = (fr.endTime ?? 0) - (fr.startTime ?? 0)
    duration += fileDuration
    for (const a of fr.assertionResults) {
      const groupTitle = a.ancestorTitles[a.ancestorTitles.length - 1] ?? fr.name
      if (!groups.has(groupTitle)) groups.set(groupTitle, [])
      groups.get(groupTitle).push(a)
      if (a.status === 'passed') passed += 1
      else if (a.status === 'failed') failed += 1
    }
  }

  const status = failed > 0 ? 'failed' : fileResults.length === 0 ? 'unknown' : 'passed'

  return { ...col, groups: [...groups.entries()], passed, failed, total: passed + failed, duration, status }
})

const totals = {
  suites: raw.numTotalTestSuites,
  tests: raw.numTotalTests,
  passed: raw.numPassedTests,
  failed: raw.numFailedTests,
  duration: Math.max(...raw.testResults.map((t) => t.endTime)) - Math.min(...raw.testResults.map((t) => t.startTime)),
}
const passRate = totals.tests === 0 ? 0 : Math.round((totals.passed / totals.tests) * 1000) / 10

function crudPill(kind, state) {
  const label = CRUD_LABELS[kind]
  const title = state === 'covered' ? `${kind} — tested` : `${kind} — no API endpoint`
  return `<span class="crud-pill crud-${state}" title="${esc(title)}">${label}</span>`
}

function renderCollectionCard(col) {
  const groupsHtml = col.groups
    .map(([title, tests]) => {
      const rows = tests
        .map((t) => {
          const dot = t.status === 'passed' ? 'pass' : t.status === 'failed' ? 'fail' : 'pending'
          const failMsg = t.status === 'failed' && t.failureMessages?.length
            ? `<pre class="fail-msg">${esc(t.failureMessages[0])}</pre>`
            : ''
          return `
            <li class="test-row">
              <span class="dot dot-${dot}" aria-hidden="true"></span>
              <span class="test-title">${esc(t.title)}</span>
              <span class="test-duration">${fmtMs(t.duration)}</span>
              ${failMsg}
            </li>`
        })
        .join('')
      return `
        <div class="endpoint-group">
          <h4>${esc(title)}</h4>
          <ul class="test-list">${rows}</ul>
        </div>`
    })
    .join('')

  return `
    <section class="suite-card status-${col.status}">
      <button class="suite-head" type="button" aria-expanded="true">
        <div class="suite-head-left">
          <span class="suite-status-stripe" aria-hidden="true"></span>
          <h3>${esc(col.name)}</h3>
          <div class="crud-row">
            ${crudPill('create', col.crud.create)}
            ${crudPill('read', col.crud.read)}
            ${crudPill('update', col.crud.update)}
            ${crudPill('delete', col.crud.delete)}
          </div>
        </div>
        <div class="suite-head-right">
          <span class="suite-score">${col.passed}/${col.total}</span>
          <span class="suite-duration">${fmtMs(col.duration)}</span>
          <svg class="chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </button>
      <p class="suite-note">${esc(col.note)}</p>
      <div class="suite-body">${groupsHtml}</div>
    </section>`
}

const html = `<title>API Test Report — Online Golf</title>
<style>
  :root {
    --bg: #eef0e2;
    --surface: #ffffff;
    --surface-2: #e7e9da;
    --border: #d3d6c4;
    --text: #182018;
    --text-muted: #55604f;
    --accent: #a97a1f;
    --accent-strong: #8a6416;
    --pass: #2f8f57;
    --pass-bg: rgba(47, 143, 87, 0.12);
    --fail: #c43e33;
    --fail-bg: rgba(196, 62, 51, 0.12);
    --neutral: #6b7563;
    --neutral-bg: rgba(107, 117, 99, 0.1);
    --font-display: Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', serif;
    --font-body: Candara, Calibri, 'Segoe UI', -apple-system, sans-serif;
    --font-mono: Consolas, 'Cascadia Mono', 'SF Mono', Menlo, 'Courier New', monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #10160f;
      --surface: #1a2119;
      --surface-2: #212a1f;
      --border: #303c2b;
      --text: #edefe6;
      --text-muted: #a9b3a0;
      --accent: #d2a441;
      --accent-strong: #e6be63;
      --pass: #4fae74;
      --pass-bg: rgba(79, 174, 116, 0.16);
      --fail: #e0574c;
      --fail-bg: rgba(224, 87, 76, 0.16);
      --neutral: #8a9385;
      --neutral-bg: rgba(138, 147, 133, 0.14);
    }
  }
  :root[data-theme='dark'] {
    --bg: #10160f;
    --surface: #1a2119;
    --surface-2: #212a1f;
    --border: #303c2b;
    --text: #edefe6;
    --text-muted: #a9b3a0;
    --accent: #d2a441;
    --accent-strong: #e6be63;
    --pass: #4fae74;
    --pass-bg: rgba(79, 174, 116, 0.16);
    --fail: #e0574c;
    --fail-bg: rgba(224, 87, 76, 0.16);
    --neutral: #8a9385;
    --neutral-bg: rgba(138, 147, 133, 0.14);
  }
  :root[data-theme='light'] {
    --bg: #eef0e2;
    --surface: #ffffff;
    --surface-2: #e7e9da;
    --border: #d3d6c4;
    --text: #182018;
    --text-muted: #55604f;
    --accent: #a97a1f;
    --accent-strong: #8a6416;
    --pass: #2f8f57;
    --pass-bg: rgba(47, 143, 87, 0.12);
    --fail: #c43e33;
    --fail-bg: rgba(196, 62, 51, 0.12);
    --neutral: #6b7563;
    --neutral-bg: rgba(107, 117, 99, 0.1);
  }

  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }
  .page { max-width: 920px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }
  h1, h2, h3, h4 { font-family: var(--font-display); font-weight: 700; text-wrap: balance; margin: 0; }
  code { font-family: var(--font-mono); background: var(--surface-2); padding: 0.1em 0.4em; border-radius: 3px; font-size: 0.85em; }

  .masthead {
    background: var(--surface);
    border: 1px solid var(--border);
    border-top: 4px solid var(--accent);
    border-radius: 10px;
    padding: 2rem 2rem 1.75rem;
  }
  .eyebrow {
    margin: 0 0 0.4rem;
    font-family: var(--font-body);
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent-strong);
    font-weight: 700;
  }
  .masthead h1 { font-size: clamp(1.9rem, 4vw, 2.6rem); }
  .run-meta {
    margin: 0.6rem 0 0;
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  .score-tiles {
    margin-top: 1.75rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
  }
  .tile {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.9rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .tile-hero { border-color: var(--pass); background: var(--pass-bg); }
  .tile-value {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    font-size: 1.7rem;
    font-weight: 600;
    color: var(--text);
  }
  .tile-hero .tile-value { color: var(--pass); }
  .tile-value-sub { font-size: 1rem; color: var(--text-muted); font-weight: 500; }
  .tile-label {
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .coverage, .suites { margin-top: 2.5rem; }
  .coverage h2, .suites h2 { font-size: 1.3rem; }
  .coverage-sub { margin: 0.35rem 0 1.1rem; color: var(--text-muted); font-size: 0.92rem; }
  .coverage-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 0.75rem;
  }
  .coverage-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.9rem 1rem;
  }
  .coverage-card h3 { font-size: 1.02rem; margin-bottom: 0.55rem; }
  .crud-row { display: flex; gap: 0.35rem; }
  .crud-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 6px;
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 0.82rem;
    border: 1px solid transparent;
  }
  .crud-covered { background: var(--pass-bg); color: var(--pass); border-color: var(--pass); }
  .crud-gap { background: transparent; color: var(--neutral); border-color: var(--border); border-style: dashed; }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    margin-top: 1rem;
    font-size: 0.82rem;
    color: var(--text-muted);
  }
  .legend span { display: inline-flex; align-items: center; gap: 0.45rem; }

  .suite-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    margin-top: 1rem;
    overflow: hidden;
  }
  .suite-head {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: transparent;
    border: none;
    cursor: pointer;
    font: inherit;
    color: inherit;
    text-align: left;
  }
  .suite-head:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
  .suite-head-left { display: flex; align-items: center; gap: 0.9rem; flex-wrap: wrap; }
  .suite-status-stripe {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    background: var(--pass);
    flex-shrink: 0;
  }
  .status-failed .suite-status-stripe { background: var(--fail); }
  .status-unknown .suite-status-stripe { background: var(--neutral); }
  .suite-head h3 { font-size: 1.15rem; }
  .suite-head-right { display: flex; align-items: center; gap: 0.9rem; color: var(--text-muted); }
  .suite-score {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    color: var(--text);
  }
  .suite-duration { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 0.85rem; }
  .chevron { width: 16px; height: 16px; transition: transform 0.18s ease; }
  .suite-head[aria-expanded='false'] .chevron { transform: rotate(-90deg); }
  .suite-note {
    margin: 0;
    padding: 0 1.25rem 0.9rem;
    color: var(--text-muted);
    font-size: 0.85rem;
    font-style: italic;
  }
  .suite-body { border-top: 1px solid var(--border); }
  .suite-head[aria-expanded='false'] + .suite-note + .suite-body { display: none; }

  .endpoint-group { padding: 0.9rem 1.25rem; border-bottom: 1px solid var(--border); }
  .endpoint-group:last-child { border-bottom: none; }
  .endpoint-group h4 {
    font-family: var(--font-body);
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    color: var(--text-muted);
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  .test-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.4rem; }
  .test-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.92rem;
  }
  .dot { width: 0.6rem; height: 0.6rem; border-radius: 50%; flex-shrink: 0; }
  .dot-pass { background: var(--pass); }
  .dot-fail { background: var(--fail); }
  .dot-pending { background: var(--neutral); }
  .test-duration {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    font-size: 0.78rem;
    color: var(--text-muted);
  }
  .fail-msg {
    grid-column: 1 / -1;
    margin: 0.3rem 0 0 1.2rem;
    padding: 0.6rem 0.75rem;
    background: var(--fail-bg);
    color: var(--fail);
    border-radius: 6px;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    white-space: pre-wrap;
    overflow-x: auto;
  }

  .page-footer {
    margin-top: 2.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border);
    color: var(--text-muted);
    font-size: 0.82rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .chevron { transition: none; }
  }
</style>
<div class="page">
  <header class="masthead">
    <div class="masthead-top">
      <p class="eyebrow">Online Golf &middot; server API</p>
      <h1>Test Scorecard</h1>
      <p class="run-meta">Run at ${fmtClock(raw.startTime)} &middot; vitest + supertest &middot; in-memory MongoDB</p>
    </div>
    <div class="score-tiles">
      <div class="tile tile-hero">
        <span class="tile-value">${totals.passed}<span class="tile-value-sub">/${totals.tests}</span></span>
        <span class="tile-label">Assertions passed</span>
      </div>
      <div class="tile">
        <span class="tile-value">${passRate}%</span>
        <span class="tile-label">Pass rate</span>
      </div>
      <div class="tile">
        <span class="tile-value">${totals.failed}</span>
        <span class="tile-label">Failed</span>
      </div>
      <div class="tile">
        <span class="tile-value">${totals.suites}</span>
        <span class="tile-label">Describe blocks</span>
      </div>
      <div class="tile">
        <span class="tile-value">${fmtMs(totals.duration)}</span>
        <span class="tile-label">Total duration</span>
      </div>
    </div>
  </header>

  <section class="coverage">
    <h2>CRUD coverage by collection</h2>
    <p class="coverage-sub">What the REST API actually exposes, not just what Mongoose supports.</p>
    <div class="coverage-grid">
      ${collections
        .map(
          (c) => `
        <div class="coverage-card">
          <h3>${esc(c.name)}</h3>
          <div class="crud-row">
            ${crudPill('create', c.crud.create)}
            ${crudPill('read', c.crud.read)}
            ${crudPill('update', c.crud.update)}
            ${crudPill('delete', c.crud.delete)}
          </div>
        </div>`,
        )
        .join('')}
    </div>
    <div class="legend">
      <span><span class="crud-pill crud-covered">C</span> tested against a real endpoint</span>
      <span><span class="crud-pill crud-gap">D</span> no endpoint exists — not tested</span>
    </div>
  </section>

  <section class="suites">
    <h2>Suite detail</h2>
    ${collections.map(renderCollectionCard).join('')}
  </section>

  <footer class="page-footer">
    <p>Generated by <code>server/scripts/generate-test-report.mjs</code> from vitest's JSON reporter. Re-run with <code>npm run test:report</code>.</p>
  </footer>
</div>
<script>
  document.querySelectorAll('.suite-head').forEach((btn) => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true'
      btn.setAttribute('aria-expanded', String(!expanded))
    })
  })
</script>
`

writeFileSync(outPath, html, 'utf-8')
console.log(`Report written to ${outPath}`)
