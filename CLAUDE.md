# nerve

## Project Plan

## Plan
Read ~/CLAUDE.md and ~/projects/zero-system/CLAUDE.md first.
Restart after changes: systemctl --user restart task-pipeline

Fix a bug in NERVE (Electron app at ~/projects/nerve/) where the
tasks.md written to the sync folder only has the first task with a
- [ ] prefix. Remaining tasks are written as plain text and ignored
by the Zero System pipeline. The bug is in how the textarea content
is parsed from the textarea and written to tasks.md. Find it and fix it.
