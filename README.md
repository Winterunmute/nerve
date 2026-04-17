# N.E.R.V.E.
### Neural Execution Relay Via Epyon

The Zero System task dispatcher. Lives in your system tray on Eva-01 (Windows), dispatches tasks to Epyon.

A deliberate nod to the NERV organization from Evangelion — fitting for a system where Eva-01 sends commands to Epyon.

## Setup

### Prerequisites
- Node.js 18+ installed on Windows
- Your sync folder at `C:\Users\Ricka\sync`
- Syncthing running and connected to Epyon

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
2. Enter a project name
3. Write your dispatch (see formats below)
4. Click **◉ dispatch to epyon**
5. NERVE creates the folder and files in your sync folder
6. Syncthing pushes to Epyon
7. Zero System picks it up and starts building

## Dispatch formats

### Standard (tasks mode)
Write a `## Plan` and `## Tasks` section. Zero System runs one Claude Code session per task line and marks each done as it goes.

```
## Plan
Describe what you want Epyon to build. Include tech constraints,
existing files to modify, and any conventions to follow.

## Tasks
- First task
- Second task
- Third task
```

### Plan-only (auto-plan mode)
Check **auto-plan** in the footer. Write only a `## Plan` — no tasks needed. Zero System passes the full plan to a single Claude Code session and trusts Claude to break down and execute the work itself.

```
## Plan
Describe what you want Epyon to build. Claude will figure out
the steps and execute them in one session.
```

Plan-only mode uses one Claude Code session per work package instead of one per task line, which reduces usage significantly for complex requests.

## Scheduling tasks

To defer processing until a specific time, write a `scheduling.md` file into
the project's sync folder alongside `tasks.md`:

**`~/sync/<project>/scheduling.md`**
```
run at HH:MM
```

NERVE creates this file when a scheduled dispatch is sent. Zero System reads it
at the top of its drain loop before running any tasks.

- Uses 24-hour clock, zero-padded: `run at 02:00`, `run at 22:30`, `run at 09:15`
- `scheduling.md` is a one-shot file — Zero System deletes it after reading
- If the scheduled time has already passed, the task is queued for the same
  time the next day
- Zero System logs `[project] Scheduled for HH:MM via at — scheduling.md removed`
  and re-triggers automatically at the right time via `touch tasks.md`

## The name

**N.E.R.V.E.** — Neural Execution Relay Via Epyon

Part of the Zero System ecosystem:
- **Zero System** — the automation pipeline on Epyon
- **Epyon** — the ThinkPad X220 running it all
- **Eva-01** — the Windows desktop, home of NERVE
- **NERVE** — the dispatch interface connecting them
