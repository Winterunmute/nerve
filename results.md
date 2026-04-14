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

## Identify why only the first task gets a - [ ] prefix

**Completed:** 2026-04-14 19:55:06

**Claude Code exited with code 143**

```
Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
```

---

## Fix the parsing logic so all task lines get - [ ] prefixes

**Completed:** 2026-04-14 20:16:01

**Claude Code exited with code 143**

```

```

---

## Verify fix handles edge cases — empty lines, lines starting with -, lines already starting with - [ ]

**Completed:** 2026-04-14 20:16:50

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
The updated regex `^[-*]\s*(?:\[[x ]\]\s*)?` now optionally consumes an existing `[ ]` or `[x]` token (case-insensitive) after the leading dash/asterisk.

Tracing all edge cases again with the fix:

| Input line | After new replace | After `- [ ] ` prefix | Result |
|---|---|---|---|
| `` (empty) | `` | filtered out | OK |
| `- foo` | `foo` | `- [ ] foo` | OK |
| `foo` (no prefix) | `foo` | `- [ ] foo` | OK |
| `- [ ] foo` | `foo` | `- [ ] foo` | OK |
| `- [x] foo` | `foo` | `- [ ] foo` | OK (re-queued as undone) |
| `- [X] foo` | `foo` | `- [ ] foo` | OK (case-insensitive) |
| `* [ ] foo` | `foo` | `- [ ] foo` | OK |

All edge cases handled. The regex change is minimal and surgical — it only adds an optional non-capturing group for the checkbox portion, falling back gracefully when it's absent.

---

## Update ~/sync/nerve/plan.md to note the fix

**Completed:** 2026-04-14 20:17:05

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
`plan.md` updated with the fix status, root cause, and the file/function where it was patched.

---

## Read nerve-context.js and trace all file paths it constructs on Windows

**Completed:** 2026-04-14 23:22:04

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Here are all the file paths constructed in `nerve-context.js`, with their Windows equivalents:

---

### `assembleContext(projectName, syncPath)`

| # | Expression | Example on Windows |
|---|---|---|
| 1 | `path.join(__dirname, 'nerve-ai.md')` | `C:\Users\<user>\AppData\Local\Programs\nerve\nerve-ai.md` (wherever Electron installs) |
| 2 | `path.join(home, 'CLAUDE.md')` | `C:\Users\<user>\CLAUDE.md` |
| 3 | `path.join(home, 'projects', 'zero-system', 'CLAUDE.md')` | `C:\Users\<user>\projects\zero-system\CLAUDE.md` |
| 4 | `path.join(syncPath, projectName)` → `syncDir` | depends on `syncPath` arg; e.g. `C:\Users\<user>\sync\<project>` |
| 5 | `path.join(syncDir, 'plan.md')` | `C:\Users\<user>\sync\<project>\plan.md` |
| 6 | `path.join(syncDir, 'tasks.md')` | `C:\Users\<user>\sync\<project>\tasks.md` |
| 7 | `path.join(syncDir, 'results.md')` | `C:\Users\<user>\sync\<project>\results.md` |
| 8 | `path.join(home, 'projects', projectName)` → `projDir` | `C:\Users\<user>\projects\<project>` |

### Inside `buildFileTree` and `collectSources`

| # | Expression | Note |
|---|---|---|
| 9 | `path.join(dir, e.name)` (recursive) | All subdirectory traversal under `projDir` — fully Windows-safe via `path.join` |
| 10 | `path.relative(projDir, f.path).replace(/\\/g, '/')` (line 124) | Converts Windows backslashes to `/` for display only; the actual path remains native |

---

### Observations

- All path construction uses `path.join`, so separators are correct on Windows.
- `os.homedir()` returns `C:\Users\<user>` on Windows — the `~/projects/zero-system/` and `~/CLAUDE.md` paths assume a Unix-style home layout that **won't exist on a typical Windows machine** unless the user has manually created those directories.
- `syncPath` is caller-supplied (from `main.js`), so its Windows form depends entirely on what `main.js` passes in. That value is the only external dependency not resolved in this file.
- Line 124 normalises backslashes to `/` for display in the assembled context string — this is intentional and correct.

---

## Verify os.homedir() + path.join resolves correctly for C:\Users\Ricka\projects\ on Windows

**Completed:** 2026-04-14 23:22:51

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
The code uses standard `path.join()` from Node.js throughout. Here's the analysis:

---

## Verification: `os.homedir()` + `path.join` on Windows (`C:\Users\Ricka\projects\`)

Node.js `path` module is **platform-aware** — on Windows it automatically uses `path.win32` semantics. Here's what each call in `nerve-context.js` resolves to on Windows with `os.homedir()` returning `C:\Users\Ricka`:

| Expression | Result |
|---|---|
| `os.homedir()` | `C:\Users\Ricka` |
| `path.join(home, 'CLAUDE.md')` | `C:\Users\Ricka\CLAUDE.md` |
| `path.join(home, 'projects', 'zero-system', 'CLAUDE.md')` | `C:\Users\Ricka\projects\zero-system\CLAUDE.md` |
| `path.join(home, 'projects', projectName)` | `C:\Users\Ricka\projects\<name>` |
| `path.join(syncPath, projectName)` (with `syncPath = C:\Users\Ricka\projects`) | `C:\Users\Ricka\projects\<name>` |
| `path.join(syncPath, projectName)` (trailing slash: `C:\Users\Ricka\projects\`) | `C:\Users\Ricka\projects\<name>` — `path.join` normalizes trailing separators |

**All calls are correct.** Key reasons:

1. **`os.homedir()` on Windows** returns the Windows home path in native format (`C:\Users\Ricka`), never with a trailing backslash.
2. **`path.join` normalizes separators** — trailing slashes, mixed `\`/`/`, and double separators are all collapsed.
3. **`path.relative()` at line 124** uses `replace(/\\/g, '/')` to convert backslashes to forward slashes for display — this is the only place where explicit slash handling is needed, and it's already there.

**No issues** — the code is safe for `C:\Users\Ricka\projects\` on Windows.

---

## Fix any path issues — ensure CLAUDE.md, plan.md, tasks.md, results.md and source files are found

**Completed:** 2026-04-14 23:25:36

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Done. Here's a summary of what changed:

**`nerve-context.js` — three fallback paths added:**

1. **`~/CLAUDE.md`** — if not found at `os.homedir()/CLAUDE.md` (Windows), falls back to `<syncPath>/CLAUDE.md`
2. **`~/projects/zero-system/CLAUDE.md`** — falls back to `<syncPath>/zero-system/CLAUDE.md`
3. **`~/projects/<project>/`** — if the native projects dir doesn't exist (Windows), falls back to `<syncPath>/<project>/` for the file tree and source file collection

**On Epyon, synced the convention files:**
- `~/CLAUDE.md` → `~/sync/CLAUDE.md`
- `~/projects/zero-system/CLAUDE.md` → `~/sync/zero-system/CLAUDE.md`

Syncthing will propagate these to `C:\Users\Ricka\sync\CLAUDE.md` and `C:\Users\Ricka\sync\zero-system\CLAUDE.md` on Eva-01, where the fallback paths will find them.

**Note:** The `~/sync/CLAUDE.md` and `~/sync/zero-system/CLAUDE.md` copies are static snapshots — they'll need to be re-copied if the originals change. A follow-up task could automate that (e.g. a symlink or a pipeline hook).

---

## Add a context summary to the chat window on load: list each source it found or skipped

**Completed:** 2026-04-14 23:26:58

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Done. Here's what changed across the three files:

**`nerve-context.js`** — `assembleContext()` now returns `{ context, summary }` instead of just the context string. As each source is checked, it pushes to `summary` with `{ label, status: 'found'|'skipped', note? }`. Sources tracked:
- `nerve-ai.md`
- `~/CLAUDE.md` (with fallback path noted if sync copy was used)
- `zero-system/CLAUDE.md` (same)
- `<project>/plan.md`, `tasks.md`, `results.md` (or "no project selected" if skipped)
- `<project>/ source files` (count and directory)

**`main.js`** — `get-context` handler destructures `{ context, summary }` and passes both back.

**`chat.html`** — `loadContext()` iterates `result.summary` and renders each item as a `found` (green `✓`) or `skipped` (dim `–`) message. Two new CSS classes (`found`, `skipped`) give visual distinction without conflating them with errors or system notices.

---

## Test by checking the context summary shows real files when zero-system project is selected in NERVE

**Completed:** 2026-04-14 23:28:29

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Node.js isn't installed on Epyon, and NERVE is an Electron app that runs on Eva-01 (Windows). I can't execute the app here, but I can fully trace through `nerve-context.js` against the actual files on disk. Here's what `assembleContext('zero-system', '/home/crux/sync')` would produce on Epyon:

**Expected context summary (all green ✓):**

| # | Item | File exists? | Result |
|---|------|-------------|--------|
| 1 | `nerve-ai.md` | `/home/crux/projects/nerve/nerve-ai.md` ✓ | found |
| 2 | `~/CLAUDE.md` | `/home/crux/CLAUDE.md` ✓ | found |
| 3 | `zero-system/CLAUDE.md` | `/home/crux/projects/zero-system/CLAUDE.md` ✓ | found |
| 4 | `zero-system/plan.md` | `/home/crux/sync/zero-system/plan.md` ✓ | found |
| 5 | `zero-system/tasks.md` | `/home/crux/sync/zero-system/tasks.md` ✓ | found |
| 6 | `zero-system/results.md` | `/home/crux/sync/zero-system/results.md` ✓ | found |
| 7 | `zero-system/ source files` | `~/projects/zero-system/` has `CLAUDE.md`, `README.md`, `plan.md`, `tasks.md`, `results.md`, `dashboard.sh`, `task-pipeline.sh` + `tools/README.md` | found (8 files) |

**The logic is correct.** All 7 sources resolve cleanly on Epyon — no skips, no fallbacks needed (all native paths hit directly, no sync-path fallback required).

**To verify visually on Eva-01:** Open NERVE, set sync path to the Syncthing sync folder, select `zero-system` from the project list, click the chat button — the chat window should show 7 green `✓` lines (no grey `–` skips) on load.

One caveat: on Windows, `~/projects/zero-system/` won't exist (that's Epyon-only). The code falls back to `<syncPath>/zero-system/` for the source files. That path exists at `<syncPath>\zero-system\` if Syncthing is syncing it — but it only contains `CLAUDE.md`, `plan.md`, `tasks.md`, `results.md` (not `dashboard.sh`, `task-pipeline.sh`). So on Eva-01 you'd see the source files line show 4 files from the sync path rather than 8 from the native path. That's expected and correct behavior.

---

## Read ~/projects/nerve/nerve-ai.md and ~/projects/nerve/chat.html

**Completed:** 2026-04-14 23:47:24

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Read both files. Here's a summary of what they are:

**`nerve-ai.md`** — the system prompt for the AI draft assistant. It defines:
- Role: Zero System dispatch drafting assistant (helps compose `plan.md` + `tasks.md` for Epyon)
- Output format: strict `## Plan` / `## Tasks` markdown, no preamble, no fences
- Behaviour rules: ask clarifying questions before drafting, reference loaded context, don't generate until explicitly asked

**`chat.html`** — the Electron chat UI for the AI Draft window. Key points:
- Uses **Ollama** locally (`qwen2.5-coder:7b` at `localhost:11434`) via streaming `fetch`
- On load, calls `ipcRenderer.invoke('get-context')` to get the system prompt + context summary (CLAUDE.md, plan.md, tasks.md, results.md, source files)
- Renders context load results as `found`/`skipped` lines
- **Send** button streams a normal chat turn; **Generate Draft** button injects a fixed `GENERATE_PROMPT` then parses the response for `## Plan` / `## Tasks` blocks
- On successful parse, fires `ipcRenderer.send('nerve-draft-ready', { plan, tasks })` to the main window
- Error handling distinguishes Ollama-not-running from other errors

What would you like to do with these?

---

## Rewrite nerve-ai.md: add explicit rule that Qwen must only reference files and paths it has actually seen in the provided context, never invent Maven commands, test runners, or tasks unrelated to the project

**Completed:** 2026-04-14 23:47:54

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
The rule is added at the end of the file as a distinct section with its own heading so it stands out and can't be missed. It covers:

- **No invented file paths** — must have been seen in loaded context
- **No assumed build commands** — Maven/Gradle/npm etc. only if the project actually uses them; explicitly calls out that the example dispatch's `./mvnw` is illustrative only
- **No assumed test runners or conventions** — ask how tests work before writing a test task
- **No guessed tech stack** — file extensions don't justify inferring a build system
- **Explicit override note** — the rule overrides pattern-matching defaults

---

## Add instruction: if context is missing or unclear, ask the user before drafting

**Completed:** 2026-04-14 23:48:19

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Added a new bullet under `## Behaviour` at line 102:

> **Ask when context is missing or unclear.** If no project files are loaded, or the loaded context does not answer a question you need to draft confidently (tech stack, file locations, build tool, test conventions), stop and ask the user before producing any dispatch. Do not fill gaps with assumptions or pattern-matching.

---

## Add instruction: the draft must reflect the conversation — do not generate a plan the user did not discuss

**Completed:** 2026-04-14 23:48:38

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Added the instruction as a new bullet in the Behaviour section, just before "On generate".

---

## Tighten the GENERATE_PROMPT in chat.html to be more directive about grounding

**Completed:** 2026-04-14 23:49:16

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
The updated `GENERATE_PROMPT` now:

- Replaces the vague "based on our conversation" placeholder with **explicit grounding constraints** listed before the template
- Bans invented paths, commands, and undiscussed tasks by name (mirrors the language in `nerve-ai.md`'s grounding rule)
- Changes `[write the full, detailed plan based on our conversation]` → `[full specification — only what was discussed and confirmed]` so the model's own template reminds it of the constraint as it fills in the blanks
- Refines the tasks bullet to "simple to complex, one discrete action each" to match the nerve-ai.md tasks format spec

---

## Update ~/sync/nerve/plan.md to note the fix

**Completed:** 2026-04-14 23:49:53

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
`~/sync/nerve/plan.md` updated. It now documents the grounding enforcement fix: what the problem was, the root cause, and the specific changes made to `nerve-ai.md` and `chat.html`. Syncthing will propagate this to Eva-01.

---

## Read ~/projects/nerve/index.html and find the load existing dropdown and project name input field

**Completed:** 2026-04-14 23:50:56

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Here are the two elements:

**Project name input** — line 245:
```html
<input type="text" id="projInput" placeholder="weather-app" />
```
`id="projInput"`, inside `.proj-row > .field` with label "Project".

**Load existing dropdown** — lines 259–261:
```html
<select id="projectSelect" style="...">
  <option value="">— select project to edit —</option>
</select>
```
`id="projectSelect"`, inside the `div` at line 256 with label "Load existing". Populated by `refreshProjects()` (line 363) and read by `loadProject()` (line 376).

---

## When a project is selected from the dropdown, auto-populate the project name input field with the selected value

**Completed:** 2026-04-14 23:51:12

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Now when you pick a project from the "Load existing" dropdown, the Project input field is auto-populated and the preview path updates — no need to click "load" first.

---

## Ensure this works both when loading an existing project and just selecting from the dropdown without clicking load

**Completed:** 2026-04-14 23:52:12

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Looking at the code, both paths are already handled correctly:

1. **Selecting from dropdown (no load click)** — the `change` event listener at line 310 fires and sets `projInput.value = this.value`, then calls `updatePreview()`.

2. **Clicking "load"** — `loadProject()` at line 379 sets `projInput.value = proj` (line 389) after the IPC call succeeds, then calls `updatePreview()`.

There's also a nice resilience property: since the `change` handler fires first on any dropdown selection, even if `loadProject()` fails (e.g. files don't exist yet), `projInput` was already populated by the `change` event.

The feature from the last commit is working for both cases — no changes needed.

---

## Test that dispatch still works correctly after auto-populate

**Completed:** 2026-04-14 23:52:55

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
I've reviewed the full code path. Here's the analysis:

**Auto-populate change** (lines 310-312 in `index.html`):
```javascript
document.getElementById('projectSelect').addEventListener('change', function () {
  if (this.value) { projInput.value = this.value; updatePreview() }
})
```

**Dispatch flow trace:**

1. `dispatch()` reads `projInput.value.trim()` — populated correctly whether the user typed it, selected from dropdown, or clicked "load"
2. `parseContent(editor.value)` — unchanged, parses `## Plan` and `## Tasks` sections
3. `ipcRenderer.invoke('save-project', { projectName: proj, syncPath, plan, tasks })` — unchanged
4. `save-project` handler in `main.js:134` — creates directory, writes `plan.md` and `tasks.md` with `- [ ] task` formatting — unchanged

**Verdict: dispatch is intact.** The auto-populate change only affects how `projInput` gets its value — via dropdown `change` event in addition to direct typing and the "load" button. It's completely orthogonal to the dispatch path.

**One scenario to be aware of:** If a user selects a project from the dropdown (auto-populating the name) but does *not* click "load", then edits the editor and dispatches — this will overwrite the existing project's files with the new editor content. This is the intended behavior (selecting just to set the name prefix), but it means selecting from the dropdown without loading is a destructive action on dispatch. No code change needed — just a UX awareness note.

---

## Read ~/projects/nerve/chat.html to understand current structure and Ollama fetch logic

**Completed:** 2026-04-15 00:10:35

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Here's a summary of `chat.html`'s structure and Ollama fetch logic:

## Structure

- **Titlebar** — drag region, project label, minimize/close buttons
- **Loading bar** — animated 2px strip shown during context load
- **Messages area** — flex column, scrollable, supports message types: `user`, `assistant`, `system`, `found`, `skipped`, `error`, `success`
- **Footer** — text input + send button + "generate draft" button + clear button

## Key globals

- `OLLAMA_MODEL = 'qwen2.5-coder:7b'`
- `OLLAMA_URL = 'http://localhost:11434/api/chat'`
- `conversationHistory` — array of `{role, content}` pairs
- `systemPrompt` — loaded via `ipcRenderer.invoke('get-context')` on `DOMContentLoaded`

## Ollama fetch logic (`streamOllama`, lines 408–475)

1. Prepends `systemPrompt` as a system message to `conversationHistory`
2. POSTs to `OLLAMA_URL` with `{ model, messages, stream: true }`
3. Reads the response as a `ReadableStream`, decoding NDJSON line-by-line
4. Accumulates `chunk.message.content` into `content`, updating the stream div live
5. On completion, pushes `{ role: 'assistant', content }` into `conversationHistory`
6. On connection errors, shows a hint to run `ollama serve`

## Generate draft flow (`handleGenerate`, lines 380–398)

- Sends a fixed `GENERATE_PROMPT` to Ollama
- Parses `## Plan` and `## Tasks` sections from the response via regex
- Sends parsed `{ plan, tasks }` to main process via `ipcRenderer.send('nerve-draft-ready', ...)`

---

## Add model selector dropdown to the chat titlebar — right side, compact, monospace style matching the aesthetic

**Completed:** 2026-04-15 00:11:39

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Looks clean. Here's what was added:

**Titlebar HTML** — a `<select id="modelSelect">` between the title text and window buttons, with `-webkit-app-region: no-drag` so it's clickable.

**CSS `.model-select`** — 11px monospace, `--green` text on `--surface2` background with `--border` outline, 22px height to sit compact in the 36px titlebar. Hover/focus states match the existing button style.

**`loadModels()`** — called on `DOMContentLoaded` alongside `loadContext()`. Fetches `http://localhost:11434/api/tags`, sorts model names alphabetically, pre-selects the current default (`qwen2.5-coder:7b`). If Ollama isn't running, falls back to the hardcoded default as a single option. The `change` listener keeps `OLLAMA_MODEL` in sync so subsequent requests use whatever's selected.

---

## On window load, fetch http://localhost:11434/api/tags and populate dropdown with available model names

**Completed:** 2026-04-15 00:11:59

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
The `loadModels()` function is already fully implemented at lines 308–334. It fetches `http://localhost:11434/api/tags` on `DOMContentLoaded`, populates the dropdown with sorted model names, and falls back to a placeholder if Ollama isn't running. The `modelSelect` element at line 240 is already in the DOM.

This task is already complete — no changes needed.

---

## Replace hardcoded OLLAMA_MODEL constant usage with the selected dropdown value

**Completed:** 2026-04-15 00:12:37

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Three changes made:

1. `let OLLAMA_MODEL` → `const OLLAMA_MODEL` — it's now a fixed default, not a mutable variable
2. Removed the `change` event listener that was mutating `OLLAMA_MODEL` — no longer needed
3. Removed the `OLLAMA_MODEL = names[0]` mutation in `loadModels` — just sets `modelSelect.value` directly
4. `streamOllama` now reads `modelSelect.value` directly at call time, so whatever is selected in the dropdown at that moment is what gets sent to Ollama

---

## Persist selected model to localStorage and restore on load

**Completed:** 2026-04-15 00:13:01

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Done. Changes made to `chat.html`:

- `loadModels()` reads `localStorage.getItem('nerve-model')` before populating the dropdown, then restores the saved selection if it's present in the available models list.
- Falls back to `OLLAMA_MODEL` constant, then first available model if the saved value isn't in the list.
- When Ollama is unreachable, seeds with the saved model (or the hardcoded default) rather than always showing `qwen2.5-coder:7b`.
- A `change` listener on `modelSelect` writes `localStorage.setItem('nerve-model', ...)` whenever the user picks a different model.

---

## If Ollama is unreachable, show "ollama offline" in the dropdown and disable it

**Completed:** 2026-04-15 00:13:33

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Changes made:

- **Offline state**: the `catch` block now clears the dropdown, adds a single `"ollama offline"` option with an empty value, disables the `<select>`, and dims it to `--muted` to match the visual language of other disabled controls.
- **localStorage guard**: the `change` listener skips saving when the value is empty, so a failed fetch won't overwrite the user's last-known good model selection.

---

## Handle the case where the previously saved model is no longer installed — fall back to first available

**Completed:** 2026-04-15 00:14:05

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Two changes:
- Dropped the intermediate `OLLAMA_MODEL` fallback — if the saved model is gone, go straight to first available (matches the task spec and avoids a pointless extra check)
- Added `localStorage.setItem` when falling back, so the stale entry is replaced and future loads don't repeat the same fallback

---

## Update ~/sync/nerve/plan.md to note the change

**Completed:** 2026-04-15 00:14:46

Warning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.
Done. Updated `/home/crux/sync/nerve/plan.md` with:

- A brief description of what NERVE is
- A dated changelog entry (2026-04-15) documenting all aspects of the Ollama model selector feature
- A high-level architecture diagram showing how the pieces fit together

---

