const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { assembleContext } = require('./nerve-context')

let tray   = null
let win    = null
let chatWin = null
let chatParams = { projectName: '', syncPath: '' }

function createTrayIcon() {
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAbElEQVR42u3XsQ0AIAhEUTZgXjdxHwfT1hjRGAOeyRXU/1UKoqrycuRLQC6pWuMGWEVvMC7hE4h7fIcIia8QYXELERqfIbAAEfERQcCTeI8ggAAC+BBhAfgdQ2xEEDshxFYMcRdAXEYwt6HXNPuilaCsY3LMAAAAAElFTkSuQmCC'
  )
  return icon
}

function createWindow() {
  win = new BrowserWindow({
    width: 680,
    height: 700,
    show: false,
    frame: false,
    resizable: true,
    backgroundColor: '#0f0f0f',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'icon.png')
  })

  win.loadFile('index.html')

  win.on('close', (e) => {
    e.preventDefault()
    win.hide()
  })
}

function createChatWindow() {
  if (chatWin && !chatWin.isDestroyed()) {
    chatWin.focus()
    return
  }

  chatWin = new BrowserWindow({
    width: 780,
    height: 640,
    frame: false,
    resizable: true,
    backgroundColor: '#0f0f0f',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'icon.png')
  })

  chatWin.loadFile('chat.html')

  chatWin.on('closed', () => {
    chatWin = null
  })
}

app.whenReady().then(() => {
  createWindow()

  const trayIcon = createTrayIcon()
  tray = new Tray(trayIcon)
  tray.setToolTip('NERVE')

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open NERVE', click: () => { win.show(); win.focus() } },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.exit(0) } }
  ])

  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
      win.focus()
    }
  })
})

app.on('window-all-closed', (e) => {
  e.preventDefault()
})

// IPC: window controls — use event.sender to target the correct window
ipcMain.on('close-window', (event) => {
  const w = BrowserWindow.fromWebContents(event.sender)
  if (!w) return
  if (w === win) {
    w.hide() // main window hides to tray
  } else {
    w.close()
  }
})

ipcMain.on('minimize-window', (event) => {
  const w = BrowserWindow.fromWebContents(event.sender)
  if (w) w.minimize()
})

// IPC: open AI chat window
ipcMain.handle('open-chat', async (event, { projectName, syncPath }) => {
  chatParams = { projectName: projectName || '', syncPath: syncPath || '' }
  createChatWindow()
  return { success: true }
})

// IPC: assemble and return context for the chat window
ipcMain.handle('get-context', async () => {
  const { context, summary } = await assembleContext(chatParams.projectName, chatParams.syncPath)
  return { context, summary, projectName: chatParams.projectName, syncPath: chatParams.syncPath }
})

// IPC: chat window sends draft — forward to main window renderer
ipcMain.on('nerve-draft-ready', (event, { plan, tasks }) => {
  if (win && !win.isDestroyed()) {
    win.webContents.send('nerve-draft-ready', { plan, tasks })
    win.show()
    win.focus()
  }
})

// IPC: save files to sync folder
ipcMain.handle('save-project', async (event, { projectName, syncPath, plan, tasks }) => {
  try {
    const projectDir = path.join(syncPath, projectName)

    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true })
    }

    fs.writeFileSync(path.join(projectDir, 'plan.md'), plan, 'utf8')

    const tasksContent = tasks.map(t => `- [ ] ${t}`).join('\n') + '\n'
    fs.writeFileSync(path.join(projectDir, 'tasks.md'), tasksContent, 'utf8')

    return { success: true, path: projectDir }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// IPC: browse for sync folder
ipcMain.handle('browse-folder', async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'],
    title: 'Select Sync Folder'
  })
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

// IPC: list existing projects in sync folder
ipcMain.handle('list-projects', async (event, syncPath) => {
  try {
    if (!fs.existsSync(syncPath)) return []
    return fs.readdirSync(syncPath, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('.'))
      .map(d => d.name)
      .sort()
  } catch (err) { return [] }
})

// IPC: load existing project files
ipcMain.handle('load-project', async (event, { syncPath, projectName }) => {
  try {
    const projectDir = path.join(syncPath, projectName)
    const planPath  = path.join(projectDir, 'plan.md')
    const tasksPath = path.join(projectDir, 'tasks.md')
    const plan  = fs.existsSync(planPath)  ? fs.readFileSync(planPath,  'utf8') : ''
    const tasks = fs.existsSync(tasksPath) ? fs.readFileSync(tasksPath, 'utf8') : ''
    return { success: true, plan, tasks }
  } catch (err) { return { success: false, error: err.message } }
})
