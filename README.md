# N.E.R.V.E.
### Neural Execution Relay Via Epyon

Electron tray app for dispatching tasks to the Zero System automation pipeline on Epyon (ThinkPad X220). Eva-01 (Windows) sends commands; Epyon executes them via Claude Code.

## Setup

### Prerequisites
- Node.js 18+ on Windows
- Syncthing running and synced to Epyon
- Sync folder at `C:\Users\<you>\sync` (or browse to choose another)

### Install and run

```
npm install
npm start
```

### Build a portable .exe

```
npm run build
```

## Usage

1. Click the tray icon to open NERVE
2. Enter a **project name** or pick one from **Load existing**
3. Write your dispatch in the editor
4. Click **◉ dispatch to epyon**

NERVE writes files to your sync folder → Syncthing pushes to Epyon → Zero System picks them up and runs Claude Code.

## Dispatch modes

### Plan-only / auto-plan (default)

Check **auto-plan** in the footer. Write only a `## Plan` section. Zero System passes the full plan to a single Claude Code session — Claude breaks down and executes the work itself. Uses one session per dispatch instead of one per task.

```
## Plan
Describe what you want Epyon to build. Claude will figure out
the steps and execute them in one session.
```

### Plan + tasks

Uncheck **auto-plan**. Write both sections. Zero System runs one Claude Code session per task line, marking each done as it goes.

```
## Plan
Describe context, constraints, and conventions.

## Tasks
- First task
- Second task
- Third task
```

## Scheduling

Check **schedule** in the footer and set a time (24-hour, e.g. `08:00`). NERVE writes a `scheduling.md` alongside the dispatch. Zero System defers execution until that time, then deletes the file.

If the time has already passed today, execution is deferred to the same time tomorrow.

## Load existing

The **Load existing** dropdown lists projects already in your sync folder. Select one and click **load** to pull its current `plan.md` + `tasks.md` into the editor for editing and re-dispatch.

## Draft with AI

Click **✦ draft with AI** to open the AI chat panel. Select a local Ollama model, describe what you want, and receive a draft `## Plan` / `## Tasks` pre-filled into the editor. Review and dispatch from there.

## Onboard a GitHub repo

Click **⊕ onboard**, enter a GitHub repo (`user/repo` or full URL), and click **confirm**. NERVE dispatches a `zero-onboard` plan to clone and set up the repo on Epyon.

## The name

**N.E.R.V.E.** — Neural Execution Relay Via Epyon

Part of the Zero System ecosystem:
- **Zero System** — the automation pipeline on Epyon
- **Epyon** — the ThinkPad X220 running it all
- **Eva-01** — the Windows desktop, home of NERVE
- **NERVE** — the dispatch interface connecting them
