// DOM Elements
const versionElement = document.getElementById("version")
const checkForUpdatesButton = document.getElementById("check-for-updates")
const downloadUpdateButton = document.getElementById("download-update")
const installUpdateButton = document.getElementById("install-update")
const statusMessage = document.getElementById("status-message")
const progressBarContainer = document.getElementById("progress-bar-container")
const progressBar = document.getElementById("progress-bar")

// Display current version
const displayAppVersion = async () => {
  try {
    const version = await window.electronAPI.getVersion()
    versionElement.textContent = version
  } catch (error) {
    console.error("Error getting app version:", error)
    versionElement.textContent = "Error"
  }
}

// Update status message
const updateStatus = (message) => {
  statusMessage.textContent = message
  console.log(`Status: ${message}`)
}

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  await displayAppVersion()

  // Register update event handlers
  window.electronAPI.onUpdateAvailable((info) => {
    updateStatus(`Update available: v${info.version}`)
    downloadUpdateButton.disabled = false
  })

  window.electronAPI.onUpdateNotAvailable(() => {
    updateStatus("No updates available. You have the latest version!")
  })

  window.electronAPI.onUpdateError((error) => {
    updateStatus(`Error checking for updates: ${error}`)
    console.error("Update error:", error)
  })

  window.electronAPI.onDownloadProgress((progressObj) => {
    progressBarContainer.classList.remove("hidden")
    progressBar.style.width = `${progressObj.percent}%`
    updateStatus(`Downloading update: ${Math.round(progressObj.percent)}%`)
  })

  window.electronAPI.onUpdateDownloaded(() => {
    updateStatus("Update downloaded. Ready to install!")
    installUpdateButton.disabled = false
  })
})

// Button event listeners
checkForUpdatesButton.addEventListener("click", async () => {
  updateStatus("Checking for updates...")
  downloadUpdateButton.disabled = true
  installUpdateButton.disabled = true

  try {
    await window.electronAPI.checkForUpdates()
  } catch (error) {
    updateStatus(`Error checking for updates: ${error.message}`)
    console.error("Error checking for updates:", error)
  }
})

downloadUpdateButton.addEventListener("click", async () => {
  updateStatus("Starting download...")
  downloadUpdateButton.disabled = true

  try {
    await window.electronAPI.downloadUpdate()
  } catch (error) {
    updateStatus(`Error downloading update: ${error.message}`)
    console.error("Error downloading update:", error)
  }
})

installUpdateButton.addEventListener("click", () => {
  updateStatus("Installing update...")
  window.electronAPI.installUpdate()
})
