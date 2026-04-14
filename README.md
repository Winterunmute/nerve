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

## The name

**N.E.R.V.E.** — Neural Execution Relay Via Epyon

Part of the Zero System ecosystem:
- **Zero System** — the automation pipeline on Epyon
- **Epyon** — the ThinkPad X220 running it all
- **Eva-01** — the Windows desktop, home of NERVE
- **NERVE** — the dispatch interface connecting them
