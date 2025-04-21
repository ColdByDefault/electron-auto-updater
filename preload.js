const { contextBridge, ipcRenderer } = require("electron")

console.log("Preload script starting")

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Send events to main process
  checkForUpdates: () => {
    console.log("checkForUpdates called in preload")
    return ipcRenderer.invoke("check-for-updates")
  },
  quitAndInstall: () => ipcRenderer.invoke("quit-and-install"),
  showUpdateDialog: (info) => ipcRenderer.invoke("show-update-dialog", info),

  // Receive events from main process
  onUpdateMessage: (callback) => ipcRenderer.on("update-message", (_, message) => callback(message)),
  onUpdateAvailable: (callback) => ipcRenderer.on("update-available", (_, info) => callback(info)),
  onUpdateDownloaded: (callback) => ipcRenderer.on("update-downloaded", (_, info) => callback(info)),
  onDownloadProgress: (callback) => ipcRenderer.on("download-progress", (_, progressObj) => callback(progressObj)),

  // Remove event listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  },

  // App version
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
})

console.log("Preload script completed, electronAPI exposed")
