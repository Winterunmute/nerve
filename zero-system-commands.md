# Zero System — Command Reference

## Pipeline Control

```bash
# Start the pipeline
systemctl --user start task-pipeline.service

# Stop the pipeline (immediately)
systemctl --user stop task-pipeline.service

# Restart the pipeline
systemctl --user restart task-pipeline.service

# Check pipeline status
systemctl --user status task-pipeline.service

# Manual pause (finishes current task, then stops)
touch ~/sync/.pause

# Resume from manual pause
rm ~/sync/.pause
```

## Dashboard

```bash
# Launch dashboard (also shows on laptop screen at boot)
~/dashboard.sh

# Inside dashboard:
# q — quit to shell
# r — force refresh
```

## Logs

```bash
# Watch live log
tail -f ~/task-pipeline.log

# Last 20 lines
tail -20 ~/task-pipeline.log

# Search log for a project
grep "clock-widget" ~/task-pipeline.log
```

## Syncthing

```bash
# Check syncthing status
systemctl --user status syncthing.service

# Restart syncthing
systemctl --user restart syncthing.service

# Open Syncthing web UI (run on Windows, then open localhost:8384)
ssh -L 8384:localhost:8384 -N crux@192.168.1.211
```

## Git (Zero System repo)

```bash
# Check status
git -C ~/projects/zero-system status

# Push latest changes to GitHub
git -C ~/projects/zero-system push

# View commit history
git -C ~/projects/zero-system log --oneline
```

## SSH from Windows

```bash
# Connect to Epyon
ssh -t crux@192.168.1.211

# Syncthing tunnel (run in separate window)
ssh -L 8384:localhost:8384 -N crux@192.168.1.211
```

## Useful Shortcuts

```bash
# Check what's in the sync folder
ls ~/sync/

# Check what projects exist
ls ~/projects/

# Check a project's results
cat ~/projects/<name>/results.md

# Check a project's tasks
cat ~/sync/<name>/tasks.md

# Re-trigger a project manually
touch ~/sync/<name>/tasks.md

# Check system resources
free -h && df -h /
```
