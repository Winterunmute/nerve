Read ~/CLAUDE.md and ~/projects/zero-system/CLAUDE.md first.

## Change Log

### 2026-04-16 — Structured form UI in chat window

Added a form/chat toggle button to the chat window header. When form mode is
active the existing AI chat flow is hidden (not removed) and a structured form
is shown in its place with:

- **Goal textarea** — free-text description of the task
- **File multi-select** — populated from the loaded project file tree context
- **Constraints input** — optional freeform constraints
- **Task count radio** — how many tasks to generate

On submit the form assembles a `plan.md` and a tasks stub, then fires the
`nerve-draft-ready` IPC event to populate the main textarea exactly as if the
user had typed it. The AI chat flow is toggled back into view when chat mode is
re-selected.