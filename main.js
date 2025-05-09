const { app, BrowserWindow, ipcMain, dialog } = require("electron")
const path = require("path")
const { autoUpdater } = require("electron-updater")
const electronRemote = require("@electron/remote/main")

// Initialize remote module
electronRemote.initialize()

// Keep a global reference of the window object to prevent garbage collection
let mainWindow

function createWindow() {
  console.log("Creating main window")

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(app.getAppPath(), "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  })

  // Enable remote module for this window
  electronRemote.enable(mainWindow.webContents)

  console.log(`Loading file from: ${path.join(__dirname, "index.html")}`)

  // Load the index.html file
  mainWindow.loadFile("index.html")
  console.log("File loaded")

  // Open DevTools only in development
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools()
    console.log("Opening DevTools (development mode)")
  } else {
    console.log("DevTools not opened (production mode)")
  }

  // Emitted when the window is closed
  mainWindow.on("closed", () => {
    console.log("Window closed")
    mainWindow = null
  })
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  console.log("App is ready")
  createWindow()

  // Check for updates after app is ready
  if (process.env.NODE_ENV !== "development") {
    console.log("Checking for updates")
    autoUpdater.checkForUpdates()
  }

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
  })
})

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  console.log("All windows closed")
  if (process.platform !== "darwin") app.quit()
})

// Auto updater events
autoUpdater.on("checking-for-update", () => {
  console.log("Checking for update...")
  sendStatusToWindow("Checking for update...")
})

autoUpdater.on("update-available", (info) => {
  console.log("Update available:", info)
  sendStatusToWindow("Update available.")
  mainWindow.webContents.send("update-available", info)
})

autoUpdater.on("update-not-available", (info) => {
  console.log("Update not available:", info)
  sendStatusToWindow("Update not available.")
})

autoUpdater.on("error", (err) => {
  console.error("Error in auto-updater:", err)
  sendStatusToWindow(`Error in auto-updater: ${err.toString()}`)
})

autoUpdater.on("download-progress", (progressObj) => {
  const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred} / ${progressObj.total})`
  console.log(message)
  sendStatusToWindow(message)
  mainWindow.webContents.send("download-progress", progressObj)
})

autoUpdater.on("update-downloaded", (info) => {
  console.log("Update downloaded:", info)
  sendStatusToWindow("Update downloaded; will install now")
  mainWindow.webContents.send("update-downloaded", info)
})

// Helper function to send status to renderer
function sendStatusToWindow(text) {
  console.log(text)
  if (mainWindow) {
    mainWindow.webContents.send("update-message", text)
  }
}

// IPC handlers for renderer communication
ipcMain.handle("check-for-updates", async () => {
  console.log("check-for-updates called from renderer")
  try {
    await autoUpdater.checkForUpdates()
    return { success: true }
  } catch (err) {
    console.error("Error checking for updates:", err)
    return { success: false, error: err.message }
  }
})

ipcMain.handle("quit-and-install", async () => {
  console.log("quit-and-install called from renderer")
  autoUpdater.quitAndInstall(false, true)
})

ipcMain.handle("show-update-dialog", async (event, info) => {
  console.log("show-update-dialog called from renderer with info:", info)
  const dialogOpts = {
    type: "info",
    buttons: ["Install and Restart", "Later"],
    title: "Application Update",
    message: info && info.version ? `Version ${info.version} is available.` : "An update is available.",
    detail: "A new version is available. Would you like to install it now?",
  }

  const response = await dialog.showMessageBox(dialogOpts)
  console.log("Dialog response:", response)
  return { buttonIndex: response.response }
})

// Get app version
ipcMain.handle("get-app-version", () => {
  return app.getVersion()
})
