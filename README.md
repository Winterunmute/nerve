# N.E.R.V.E.

**Neural Execution Relay Via Epyon**

Windows tray app for dispatching work to the [Zero System](https://github.com/Winterunmute/zero-system) automation pipeline. Write a task list or a free-form plan, hit dispatch, and Epyon runs it via Claude Code — while you get on with something else.

NERVE handles the dispatch side of a two-machine setup:

| Machine | Role |
|---------|------|
| **Eva-01** (Windows desktop) | Runs NERVE — you work here |
| **Epyon** (ThinkPad X220, Debian) | Runs Zero System — does the work |

Files sync between them via Syncthing. Zero System is NERVE-agnostic — the protocol is just files in a folder.

---

## Features

- **Two dispatch modes** — structured task lists or free-form auto-plan (Claude breaks down the work itself)
- **AI draft** — describe what you want in plain language; a local Ollama model drafts the `## Plan` / `## Tasks` for you before you dispatch
- **Scheduled dispatch** — set a time, NERVE writes a scheduling gate that Zero picks up and defers until then
- **Load existing** — pull a project's current plan back into the editor for editing and re-dispatch
- **Repo onboarding** — give NERVE a GitHub URL; it dispatches a `zero-onboard` task that clones and sets up the repo on Epyon

---

## Setup

### Prerequisites

- Node.js 18+ on Windows
- Syncthing running and synced to Epyon
- Sync folder at `C:\Users\<you>\sync` (or choose another path in settings)

### Install and run

```bash
npm install
npm start
```

### Build a portable .exe

```bash
npm run build
```

---

## Usage

1. Click the tray icon to open NERVE
2. Enter a project name or pick one from **Load existing**
3. Write your dispatch in the editor
4. Click **◉ dispatch to epyon**

NERVE writes files to your sync folder → Syncthing pushes to Epyon → Zero System picks them up and runs Claude Code.

---

## Dispatch Modes

### Auto-plan (default)

Check **auto-plan** in the footer. Write only a `## Plan` section. Zero passes the full plan to a single Claude Code session — Claude figures out the steps and executes them itself.

```markdown
## Plan
Refactor the auth module to use refresh tokens. Keep the existing
test suite green. Follow the conventions in CLAUDE.md.
```

One session per dispatch. Best for open-ended work.

### Plan + tasks

Uncheck **auto-plan**. Write both sections. Zero runs one Claude Code session per task line, committing after each.

```markdown
## Plan
Context, constraints, and conventions go here.

## Tasks
- [ ] First task
- [ ] Second task
- [ ] Third task
```

One session per task. Best for well-defined, parallelisable work.

---

## AI Draft (Ollama)

Click **✦ draft with AI** to open the chat panel. Select a local Ollama model, describe what you want in plain language, and get a ready-to-dispatch `## Plan` / `## Tasks` draft back in the editor. Review it, tweak if needed, then dispatch.

Keeps the drafting loop fully local — no API calls, no cost.

---

## Scheduling

Check **schedule** in the footer and set a time (24-hour, e.g. `08:00`). NERVE writes a `scheduling.md` alongside the dispatch. Zero defers execution until that time, then cleans up the gate file.

If the time has already passed today, execution is deferred to the same time tomorrow.

---

## Repo Onboarding

Click **⊕ onboard**, enter a GitHub repo (`user/repo` or full URL), and confirm. NERVE dispatches a `zero-onboard` plan to clone the repo on Epyon and generate onboarding documentation via Claude Code.

---

## The Naming

Part of the Zero System ecosystem, named after the mechs and organisations from *Neon Genesis Evangelion* and *Gundam Wing*:

| Name | What it is |
|------|-----------|
| **Zero System** | The automation pipeline running on Epyon |
| **Epyon** | ThinkPad X220 — the worker node |
| **Eva-01** | Windows desktop — the dispatch machine |
| **N.E.R.V.E.** | The tray app connecting them |

---

## License

MIT
