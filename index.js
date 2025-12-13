require("v8-compile-cache")

const { app, ipcMain, Menu, protocol, BrowserWindow } = require("electron")
const path = require('path');
const { autoUpdater } = require("electron-updater")
const localShortcut = require("electron-localshortcut")
const log = require("electron-log")
const store = require("electron-store")

//Discrod RPCの設定
const RPC = require('discord-rpc');
const rpc = new RPC.Client({ transport: 'ipc' })
const clientId = '1449338607100887050';
rpc.login({ clientId: clientId })
const rpcSetting = () => {
    rpc.setActivity({
        pid: process.pid,
        state: 'Playing Krunker.io',
        details: 'BUG Client',
        startTimestamp: new Date(),
        largeImageKey: "clientLogo",
        largeImageText: "NullPo",
        buttons: [
            {
                label: "About VMC",
                url: "https://namekujilsds.github.io/VoxMate"
            }
        ]
    })
}

const appVer = app.getVersion()

const config = new store({
    // encryptionKey: "BugClient"
})


// Developer Portalで取得したApplication ID

const applySettings = require("./src/assets/js/functions/applySetting")

//DevMode
autoUpdater.forceDevUpdateConfig = true;


//プロトコルの実装
protocol.registerSchemesAsPrivileged([{
    scheme: 'bug',
    privileges: {
        secure: true,
        corsEnabled: true
    }
}])
app.on('ready', () => {
    protocol.registerFileProtocol('bug', (request, callback) => callback(decodeURI(request.url.replace(/^bug:\//, ''))));
})

//ゲームウィンドウの作成
let splashWindow, gameWindow

//スプラッシュスクリーンを作成する
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
    const update = async () => {
        splashWindow.webContents.send("version", appVer)
        let updateCheck = null
        autoUpdater.on('checking-for-update', () => {
            splashWindow.webContents.send("status", "Checking for updates...");
            updateCheck = setTimeout(() => {
                splashWindow.webContents.send("status", "Update check error!")
                setTimeout(() => {
                    makeGameWindow()
                }, 1000);
            }, 15000);
        });
        autoUpdater.on("update-available", (i) => {
            if (updateCheck) clearTimeout(updateCheck);
            splashWindow.webContents.send("status", `Found new verison v${i.version}`)
        });
        autoUpdater.on("update-not-available", () => {
            if (updateCheck) clearTimeout(updateCheck);
            splashWindow.webContents.send('status', "You using latest version.");
            setTimeout(() => {
                makeGameWindow();
            }, 1000);
        });
        autoUpdater.on("skipped", () => {
            if (updateCheck) clearTimeout(updateCheck);
            splashWindow.webContents.send('status', "You using latest version.");
            setTimeout(() => {
                makeGameWindow();
            }, 1000);
        });
        autoUpdater.on('error', (e) => {
            if (updateCheck) clearTimeout(updateCheck);
            splashWindow.webContents.send('status', "Error!" + e.name);
            setTimeout(() => {
                makeGameWindow();
            }, 1000);
        });
        autoUpdater.on('download-progress', (i) => {
            if (updateCheck) clearTimeout(updateCheck);
            splashWindow.webContents.send('status', "Downloading new version...");
        });
        autoUpdater.on('update-downloaded', (i) => {
            if (updateCheck) clearTimeout(updateCheck);
            splashWindow.webContents.send("status", "Update downloaded");
            setTimeout(() => {
                autoUpdater.quitAndInstall();
            }, 1000);
        });
        autoUpdater.autoDownload = "download";
        autoUpdater.allowPrerelease = false;
        autoUpdater.checkForUpdates();
    };
    splashWindow.webContents.on("did-finish-load", () => {
        splashWindow.show();
        update()
    })
}

//ゲームウィンドウを作成する
const makeGameWindow = () => {
    gameWindow = new BrowserWindow({
        height: 500,
        width: 800,
        fullscreen: config.get("fullscreen", true),
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "./src/assets/js/game-preload.js")
        }
    })
    gameWindow.webContents.loadURL("https://krunker.io/")
    gameWindow.setTitle("BUG Client")
    localShortcut.register(gameWindow, "F5", () => {
        gameWindow.reload()
    })
    localShortcut.register(gameWindow, "F6", () => {
        gameWindow.loadURL("https://krunker.io");
    })
    localShortcut.register(gameWindow, "F12", () => {
        gameWindow.webContents.toggleWebTools()
    })
    localShortcut.register(gameWindow, "Esc", () => {
        gameWindow.webContents.send("shortcutKey", "ESC")
    })
    localShortcut.register(gameWindow, "F11", () => {
        config.set("fullscreen", !gameWindow.isFullScreen())
        gameWindow.setFullScreen(!gameWindow.isFullScreen())
    })
    Menu.setApplicationMenu(null);

    gameWindow.once("ready-to-show", () => {
        splashWindow.destroy();
        gameWindow.show();
    });
};

//flagの設定
applySettings.flagSwitch()


app.whenReady().then(() => {
});
app.on("ready", () => {
    makeSplashWindow()
    rpcSetting(); // アプリ起動時にRPCも開始

})
app.on("quit", () => {
    gameWindow.destroy()
    splashWindow.destroy()
})
