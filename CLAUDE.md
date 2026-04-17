# nerve

## Project Plan

Read ~/CLAUDE.md and ~/projects/zero-system/CLAUDE.md first.
Read ~/projects/nerve/index.html and main.js before making changes.

Two changes to NERVE:

1. Make auto-plan the default mode. Textarea shows only ## Plan
section by default. Add a small "add tasks" toggle that reveals
## Tasks section when needed. Auto-plan checkbox checked by default.

2. Add an "Onboard" button to NERVE that reveals a repo input field.
User pastes a GitHub URL or user/repo shorthand, clicks confirm,
and NERVE dispatches a plan-only work package to zero-system that
runs: zero-onboard <repo>
The work package plan should say:
"Run zero-onboard <repo> and report results to results.md"
Project name derived from repo name.

Keep all existing functionality intact.
Success: NERVE opens in auto-plan mode by default, onboard button
works and dispatches correctly.
