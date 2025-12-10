const { app, ipcMain, BrowserWindow } = require("electron")
const path = require('path');


let splashWindow, gameWindow

const makeSplashWindow = () => {
    splashWindow = new BrowserWindow({
        height: 350,
        width: 600,
        alwaysOnTop: true,
        transparent: true,
        frame: false,
        resizable: false,
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
    })
    gameWindow.webContents.loadURL("https://krunker.io/")
};

app.on("ready", () => {
    makeSplashWindow()
})