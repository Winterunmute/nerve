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
3. Write your dispatch using `## Plan` and `## Tasks` sections
4. Click **◉ dispatch to epyon**
5. NERVE creates the folder and files in your sync folder
6. Syncthing pushes to Epyon
7. Zero System picks it up and starts building

## Dispatch format

```
## Plan
Describe what you want Epyon to build. Include tech constraints,
existing files to modify, and any conventions to follow.

## Tasks
- First task
- Second task
- Third task
```

## Scheduling tasks

To defer processing until a specific time, add a `run at HH:MM` directive as
the **very first line** of the Plan section (before any other text):

```
run at 22:30

## Plan
Describe what you want Epyon to build...

## Tasks
- First task
```

- Uses 24-hour clock, zero-padded: `run at 02:00`, `run at 22:30`, `run at 09:15`
- Must be the very first line — no leading blank lines
- If the time has already passed when Epyon receives the dispatch, it schedules
  for the same time the next day
- Zero System logs `[project] Scheduled for HH:MM — waiting Xs` and re-triggers
  at the right time automatically

## The name

**N.E.R.V.E.** — Neural Execution Relay Via Epyon

Part of the Zero System ecosystem:
- **Zero System** — the automation pipeline on Epyon
- **Epyon** — the ThinkPad X220 running it all
- **Eva-01** — the Windows desktop, home of NERVE
- **NERVE** — the dispatch interface connecting them
