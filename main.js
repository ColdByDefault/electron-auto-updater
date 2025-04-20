require('dotenv').config();

const { app, BrowserWindow, ipcMain, Notification } = require("electron")
const { autoUpdater } = require("electron-updater")
const path = require("path")
const fs = require("fs")
const log = require("electron-log")

// Configure logging
log.transports.file.level = "debug"
log.info("Application starting...")

// Configure autoUpdater to use logging
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = "debug"
autoUpdater.autoDownload = false

// Keep a global reference of the window object
let mainWindow

const createWindow = () => {
  log.info("Creating main window")
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "favicon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.loadFile("index.html")

  // Open DevTools in development
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  // Check for updates after the app is ready
  if (process.env.NODE_ENV !== "development") {
    setTimeout(() => {
      log.info("Checking for updates...")
      autoUpdater.checkForUpdates().catch((err) => {
        log.error("Error checking for updates:", err)
      })
    }, 3000) // Delay to ensure app is fully loaded
  }
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// ========== Auto Updater Events ==========

// When an update is available
autoUpdater.on("update-available", (info) => {
  log.info("Update available:", info)

  // Show a system notification
  if (Notification.isSupported()) {
    new Notification({
      title: "Update Available",
      body: `Version ${info.version} is available to download!`,
    }).show()
  }

  if (mainWindow) {
    mainWindow.webContents.send("update-available", info)
  }
})

// When no update is available
autoUpdater.on("update-not-available", (info) => {
  log.info("No update available")
  if (mainWindow) {
    mainWindow.webContents.send("update-not-available")
  }
})

// When an error occurs during update checking
autoUpdater.on("error", (err) => {
  log.error("Update error:", err)
  if (mainWindow) {
    mainWindow.webContents.send("update-error", err.toString())
  }
})

// During download progress
autoUpdater.on("download-progress", (progressObj) => {
  log.info(`Download progress: ${progressObj.percent}%`)
  if (mainWindow) {
    mainWindow.webContents.send("download-progress", progressObj)
  }
})

// When update is downloaded and ready to install
autoUpdater.on("update-downloaded", (info) => {
  log.info("Update downloaded")

  // Show a system notification
  if (Notification.isSupported()) {
    new Notification({
      title: "Update Ready",
      body: "Update has been downloaded and is ready to install!",
    }).show()
  }

  if (mainWindow) {
    mainWindow.webContents.send("update-downloaded")
  }
})

// ========== IPC Handlers ==========

// Handle manual update check request from renderer
ipcMain.handle("check-for-updates", async () => {
  log.info("Checking for updates...")
  if (process.env.NODE_ENV !== "development") {
    try {
      return await autoUpdater.checkForUpdates()
    } catch (err) {
      log.error("Error checking for updates:", err)
      throw err
    }
  }
  return { updateAvailable: false }
})

// Handle download update request from renderer
ipcMain.handle("download-update", async () => {
  log.info("Downloading update...")
  try {
    return await autoUpdater.downloadUpdate()
  } catch (err) {
    log.error("Error downloading update:", err)
    throw err
  }
})

// Handle install update request from renderer
ipcMain.handle("install-update", () => {
  log.info("Installing update...")
  autoUpdater.quitAndInstall(false, true)
})

// Get current app version
ipcMain.handle("get-version", () => {
  return app.getVersion()
})
