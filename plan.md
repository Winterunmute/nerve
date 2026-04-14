Read ~/CLAUDE.md and ~/projects/zero-system/CLAUDE.md first.

# N.E.R.V.E. — Project Plan

Neural Execution Relay Via Epyon. Electron tray app on Eva-01 (Windows) that
dispatches tasks to Epyon via Syncthing-synced task files.

---

## Current State

NERVE has a built-in chat window (`chat.html`) that talks to a local Ollama
instance for AI assistance within the app.

### Changes (2026-04-15)

**Dynamic Ollama model selector added to chat UI:**

- Model dropdown added to the chat titlebar (right side, compact, monospace
  style matching the aesthetic)
- On load, fetches `http://localhost:11434/api/tags` and populates the
  dropdown with available model names
- Replaces the previous hardcoded `OLLAMA_MODEL` constant
- Selected model is persisted to `localStorage` and restored on next load
- If Ollama is unreachable, the dropdown shows "ollama offline" and is
  disabled
- If the previously saved model is no longer installed, falls back to the
  first available model

---

## Architecture

```
Eva-01 (Windows)
  NERVE tray app (Electron)
    ├── index.html      — dispatch UI (project + task entry, send to Epyon)
    ├── chat.html       — embedded Ollama chat panel
    └── main.js         — Electron shell, tray, Syncthing sync logic

  Syncthing ──► ~/sync/<project>/ on Epyon ──► Zero System pipeline
```
