# Electron App with Auto-Updater for Windows

**A simple Windows desktop application built with Electron, Node.js, HTML, and CSS. It checks for updates from a GitHub repository and auto-updates itself using GitHub Releases.**

## Features

- 🧭 Auto-check for updates on launch
- 🚀 Auto-download and install updates from GitHub Releases
- 🔁 Silent update & restart
- 💻 Built for Windows (32/64-bit)

## Tech Stack

- [Electron](https://www.electronjs.org/)
- [Node.js](https://nodejs.org/)
- HTML & CSS
- [electron-updater](https://www.electron.build/auto-update) via [electron-builder](https://www.electron.build/)
- GitHub Releases for deployment

## Prerequisites

- Node.js (v18 or later)
- Git
- Windows OS (Tested on Windows 10/11)
- A GitHub repository with signed releases (for updates)

## Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/ColdByDefault/electron-auto-updater.git
   cd electron-auto-updater
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the app in development**
   ```bash
   npm start
   ```

4. **Build the app for production**
   ```bash
   npm run dist
   ```

## Reusable Auto-Update Setup

Ensure you configure the `build` section in your `package.json`:

```json
"build": {
  "appId": "com.yourdomain.yourapp",
  "productName": "YourAppName",
  "publish": [
    {
      "provider": "github",
      "owner": "your-username",
      "repo": "your-repo"
    }
  ],
  "win": {
    "target": "nsis"
  },
  "nsis": {
    "oneClick": false,
    "perMachine": true,
    "allowToChangeInstallationDirectory": true
  }
}
```

> 🔐 Make sure your GitHub repo has signed releases and you generate `.yml` and `.exe` assets during packaging.

## How Updates Work

1. On launch, the app checks the GitHub Releases API for a new version.
2. If a new version is found, it's downloaded automatically.
3. When the download is complete, the app prompts or automatically installs the update and restarts.

## Publishing Updates

1. Update your app version in `package.json`.
2. Build the release:
   ```bash
   npm run dist
   ```
3. Create a new GitHub Release and upload the generated `.exe` and `.yml` files from the `dist` folder.

## Security Tips

- Always sign your releases
- Never expose sensitive keys in your codebase
- Use `.env` files or GitHub Secrets for CI/CD

