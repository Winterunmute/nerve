# Results

## Read ~/projects/nerve/main.js and ~/projects/nerve/index.html to understand how tasks are parsed from the textarea and written to tasks.md

**Completed:** 2026-04-14 19:34:37

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
**Root cause:** `index.html:312` — `/^##\s*Tasks\s*\n([\s\S]*?)$/mi`

- The `m` (multiline) flag makes `$` match end of *any* line, not just end of string
- The lazy `?` makes `[\s\S]*?` capture as little as possible
- Together: the regex stops after the first task line

**Fix:** Changed to `([\s\S]*)` — greedy, no trailing anchor — captures everything from `## Tasks\n` to end of string.

The `save-project` handler in `main.js:144` already correctly wraps each parsed task with `- [ ] `, so once all tasks are captured the output will be correct.

---

