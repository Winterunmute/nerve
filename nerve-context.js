const fs = require('fs')
const path = require('path')
const os = require('os')

const SKIP_DIRS = new Set([
  'node_modules', 'target', '.git', 'build', 'dist',
  '.gradle', '__pycache__', '.mvn', '.idea', '.vscode',
  'out', 'bin', '.cache', 'coverage', '.nyc_output'
])
const SOURCE_EXTS = new Set(['.md', '.java', '.js', '.ts', '.sh', '.py', '.json', '.yaml', '.yml', '.txt'])
const SOURCE_CAP = 24000 // ~6000 tokens

function readSafe(p) {
  try {
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null
  } catch {
    return null
  }
}

function buildFileTree(dir, indent = '', depth = 0) {
  if (depth > 7) return ''
  let out = ''
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return ''
  }
  entries = entries
    .filter(e => !SKIP_DIRS.has(e.name) && !e.name.startsWith('.'))
    .sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  for (const e of entries) {
    out += indent + (e.isDirectory() ? '/' : ' ') + e.name + '\n'
    if (e.isDirectory()) {
      out += buildFileTree(path.join(dir, e.name), indent + '  ', depth + 1)
    }
  }
  return out
}

function collectSources(dir, budget = { remaining: SOURCE_CAP }) {
  const files = []
  if (budget.remaining <= 0) return files
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return files
  }
  for (const e of entries) {
    if (budget.remaining <= 0) break
    if (SKIP_DIRS.has(e.name) || e.name.startsWith('.')) continue
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      files.push(...collectSources(full, budget))
    } else if (SOURCE_EXTS.has(path.extname(e.name).toLowerCase())) {
      try {
        let content = fs.readFileSync(full, 'utf8')
        if (content.length > budget.remaining) {
          content = content.slice(0, budget.remaining) + '\n[...truncated]'
          budget.remaining = 0
        } else {
          budget.remaining -= content.length
        }
        files.push({ path: full, content })
      } catch {}
    }
  }
  return files
}

async function assembleContext(projectName, syncPath) {
  const home = os.homedir()
  const parts = []
  const summary = [] // { label, status: 'found'|'skipped', note? }

  function found(label, note) { summary.push({ label, status: 'found', note }) }
  function skipped(label, note) { summary.push({ label, status: 'skipped', note }) }

  // 1. nerve-ai.md — system prompt and format spec
  const nerveAiPath = path.join(__dirname, 'nerve-ai.md')
  const nerveAi = readSafe(nerveAiPath)
  if (nerveAi) {
    parts.push(nerveAi)
    found('nerve-ai.md')
  } else {
    skipped('nerve-ai.md', 'not found')
  }

  // 2. Zero System conventions
  // Prefer ~/CLAUDE.md (native on Epyon); fall back to <syncPath>/CLAUDE.md (available on Windows via Syncthing)
  const homeClaude = path.join(home, 'CLAUDE.md')
  const syncClaude = syncPath ? path.join(syncPath, 'CLAUDE.md') : null
  const homeConventionsRaw = readSafe(homeClaude)
  const homeConventions = homeConventionsRaw
    || (syncClaude ? readSafe(syncClaude) : null)
  if (homeConventions) {
    parts.push(`## Zero System Conventions (~/CLAUDE.md)\n\n${homeConventions}`)
    found('~/CLAUDE.md', homeConventionsRaw ? null : `via ${syncClaude}`)
  } else {
    skipped('~/CLAUDE.md', 'not found')
  }

  // Prefer ~/projects/zero-system/CLAUDE.md; fall back to <syncPath>/zero-system/CLAUDE.md
  const nativeZero = path.join(home, 'projects', 'zero-system', 'CLAUDE.md')
  const syncZero   = syncPath ? path.join(syncPath, 'zero-system', 'CLAUDE.md') : null
  const zeroConventionsRaw = readSafe(nativeZero)
  const zeroConventions = zeroConventionsRaw
    || (syncZero ? readSafe(syncZero) : null)
  if (zeroConventions) {
    parts.push(`## Zero System Project Conventions (~/projects/zero-system/CLAUDE.md)\n\n${zeroConventions}`)
    found('zero-system/CLAUDE.md', zeroConventionsRaw ? null : `via ${syncZero}`)
  } else {
    skipped('zero-system/CLAUDE.md', 'not found')
  }

  // 3. Existing dispatch context for this project
  if (projectName && syncPath) {
    const syncDir = path.join(syncPath, projectName)
    const existingPlan    = readSafe(path.join(syncDir, 'plan.md'))
    const existingTasks   = readSafe(path.join(syncDir, 'tasks.md'))
    const existingResults = readSafe(path.join(syncDir, 'results.md'))
    if (existingPlan || existingTasks || existingResults) {
      const lines = [`## Existing Dispatch Context — ${projectName}`]
      if (existingPlan)    lines.push(`\n### plan.md\n${existingPlan}`)
      if (existingTasks)   lines.push(`\n### tasks.md\n${existingTasks}`)
      if (existingResults) lines.push(`\n### results.md\n${existingResults}`)
      parts.push(lines.join('\n'))
    }
    if (existingPlan)    found(`${projectName}/plan.md`)
    else                 skipped(`${projectName}/plan.md`, 'not found')
    if (existingTasks)   found(`${projectName}/tasks.md`)
    else                 skipped(`${projectName}/tasks.md`, 'not found')
    if (existingResults) found(`${projectName}/results.md`)
    else                 skipped(`${projectName}/results.md`, 'not found')
  } else {
    skipped('dispatch context', projectName ? 'no sync path' : 'no project selected')
  }

  // 4. Project file tree + source files
  // Prefer ~/projects/<project>/ (native on Epyon); fall back to <syncPath>/<project>/ (available on Windows)
  if (projectName) {
    const nativeProjDir = path.join(home, 'projects', projectName)
    const syncProjDir   = syncPath ? path.join(syncPath, projectName) : null
    const projDir = fs.existsSync(nativeProjDir) ? nativeProjDir
      : (syncProjDir && fs.existsSync(syncProjDir) ? syncProjDir : null)

    if (projDir) {
      const tree = buildFileTree(projDir)
      if (tree) {
        parts.push(`## Project File Tree — ${projDir}\n\`\`\`\n${tree}\`\`\``)
      }

      // 5. Key source files (capped at ~6000 tokens)
      const sources = collectSources(projDir)
      if (sources.length > 0) {
        const sourceParts = [`## Key Source Files — ${projDir}`]
        for (const f of sources) {
          const rel = path.relative(projDir, f.path).replace(/\\/g, '/')
          const ext = path.extname(f.path).slice(1) || 'text'
          sourceParts.push(`\n### ${rel}\n\`\`\`${ext}\n${f.content}\n\`\`\``)
        }
        parts.push(sourceParts.join('\n'))
        found(`${projectName}/ source files`, `${sources.length} file${sources.length !== 1 ? 's' : ''} from ${projDir}`)
      } else {
        skipped(`${projectName}/ source files`, 'none found')
      }
    } else {
      skipped(`${projectName}/ project dir`, 'not found locally or in sync path')
    }
  }

  return { context: parts.join('\n\n---\n\n'), summary }
}

module.exports = { assembleContext }
