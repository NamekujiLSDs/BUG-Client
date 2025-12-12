require("v8-compile-cache")

const { app, ipcMain, BrowserWindow } = require("electron")
const path = require('path');
const { autoUpdater } = require("electron-updater")
const localShortcut = require("electron-localshortcut")
const log = require("electron-log")
const store = require("electron-store")

const config = new store({
    encryptionKey: "BugClient"
})

log.info(Date.now())

let splashWindow, gameWindow

const makeSplashWindow = () => {
    splashWindow = new BrowserWindow({
        height: 350,
        width: 600,
        alwaysOnTop: true,
        transparent: true,
        frame: false,
        resizable: false,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "./src/assets/js/splash-preload.js")
        }
    })
    splashWindow.webContents.loadFile(path.join(__dirname, "./src/assets/html/splash.html"))
}


const makeGameWindow = () => {
    gameWindow = new BrowserWindow({
        height: 500,
        width: 800,
        // show: false,
        webPreferences: {
            preload: path.join(__dirname, "./src/assets/js/game-preload.js")
        }
    })
    gameWindow.webContents.loadURL("https://krunker.io/")
};

app.on("ready", () => {
    makeGameWindow()
})