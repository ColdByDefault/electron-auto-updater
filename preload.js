const { contextBridge, ipcRenderer } = require("electron")

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // App info
  getVersion: () => ipcRenderer.invoke("get-version"),

  // Update methods
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  downloadUpdate: () => ipcRenderer.invoke("download-update"),
  installUpdate: () => ipcRenderer.invoke("install-update"),

  // Update events
  onUpdateAvailable: (callback) => {
    ipcRenderer.on("update-available", (_, info) => callback(info))
    // Return a function to remove the listener
    return () => ipcRenderer.removeListener("update-available", callback)
  },
  onUpdateNotAvailable: (callback) => {
    ipcRenderer.on("update-not-available", () => callback())
    return () => ipcRenderer.removeListener("update-not-available", callback)
  },
  onUpdateError: (callback) => {
    ipcRenderer.on("update-error", (_, error) => callback(error))
    return () => ipcRenderer.removeListener("update-error", callback)
  },
  onDownloadProgress: (callback) => {
    ipcRenderer.on("download-progress", (_, progressObj) => callback(progressObj))
    return () => ipcRenderer.removeListener("download-progress", callback)
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on("update-downloaded", () => callback())
    return () => ipcRenderer.removeListener("update-downloaded", callback)
  },
})

