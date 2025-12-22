require("v8-compile-cache")

const { app, ipcMain, Menu, protocol, BrowserWindow } = require("electron")
const path = require('path');
const { autoUpdater } = require("electron-updater")
const localShortcut = require("electron-localshortcut")
const log = require("electron-log")
const store = require("electron-store")
const fs = require("fs")

const settings = require("./src/assets/js/functions/settings")
const applySettings = require("./src/assets/js/functions/applySetting")
const adblock = require("./src/assets/js/functions/adblock")


const appVer = app.getVersion()

const config = new store({
    // encryptionKey: "BugClient"
})

//DevMode
autoUpdater.forceDevUpdateConfig = true;


//DiscordRPCの作成をする
const RPC = require('discord-rpc');
const rpc = new RPC.Client({ transport: 'ipc' })
const clientId = '1449338607100887050';
const rpcSetting = () => {
    log.info('Running:RPC SETTING')
    rpc.setActivity({
        details: `Playing Krunker`,
        state: 'Buggy Buggy',
        largeImageKey: "clientlogo",
        largeImageText: "BUG-Client",
        startTimestamp: new Date(),
    })
}
rpc.on("ready", () => {
    if (settings["DiscordRPC"]["enableDiscordRpc"]["value"]) {
        rpcSetting()
    }
})
rpc.login({ clientId: clientId })


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
    //ショートカットキーの設定
    localShortcut.register(gameWindow, "F5", () => {
        gameWindow.reload()
    })
    localShortcut.register(gameWindow, "F6", () => {
        gameWindow.loadURL("https://krunker.io");
    })
    localShortcut.register(gameWindow, "F12", () => {
        gameWindow.webContents.openDevTools()
    })
    localShortcut.register(gameWindow, "Esc", () => {
        gameWindow.webContents.send("shortcutKey", "ESC")
    })
    localShortcut.register(gameWindow, "F11", () => {
        config.set("fullscreen", !gameWindow.isFullScreen())
        gameWindow.setFullScreen(!gameWindow.isFullScreen())
    })
    Menu.setApplicationMenu(null);
    if (settings["General"]["resourceSwapper"]["value"]) {
        initSwapper(gameWindow)
    }
    gameWindow.once("ready-to-show", () => {
        splashWindow.destroy();
        gameWindow.show();
    });
};

//リソーススワッパー
const initSwapper = (win) => {
    const swapPath = path.join(app.getPath('documents'), '/BugSwap');
    if (!fs.existsSync(swapPath)) {
        fs.mkdir(swapPath, { recursive: true }, e => {
            log.warn('ERROR IN RESOURCE SWAPPER');
            log.warn(e);
        });
    }

    const swapFiles = [];

    const recursiveFolder = (prefix = '') => {
        try {
            fs.readdirSync(path.join(swapPath, prefix), { withFileTypes: true }).forEach((cPath) => {
                if (cPath.isDirectory()) {
                    recursiveFolder(`${prefix}/${cPath.name}`);
                } else {
                    const name = `${prefix}/${cPath.name}`;
                    swapFiles.push({
                        urlPath: name.replace(/\\/g, '/'),
                        localPath: path.join(swapPath, name)
                    });
                }
            });
        } catch (e) {
            log.warn('ERROR IN RESOURCE SWAPPER');
            log.warn(e);
        }
    };
    recursiveFolder();

    let adBlockerInstance = null;
    try {
        if (settings["General"]["adBlocker"] && settings["General"]["adBlocker"]["value"]) {
            const adBlockPath = path.join(__dirname, "./src/assets/json/adblock.txt");

            adBlockerInstance = new adblock(adBlockPath);
        }
    } catch (e) {
        log.warn('[AdBlock] Settings check failed:', e);
    }

    if (swapFiles.length > 0 || adBlockerInstance) {
        win.webContents.session.webRequest.onBeforeRequest({ urls: ['<all_urls>'] }, (details, callback) => {
            const url = details.url;



            let urlObj;

            try {
                urlObj = new URL(url);
            } catch (e) {
                // URLパースエラーの場合はそのまま通す
                return callback({ cancel: false });
            }

            // --- A. 外部URLログ出力 (krunker.io 以外) ---
            // ホスト名が krunker.io でもなく、.krunker.io で終わるものでもない場合
            const isKrunker = urlObj.hostname === 'krunker.io' || urlObj.hostname.endsWith('.krunker.io');
            if (!isKrunker) {
                // log.info で出力（必要に応じて warn 等に変更してください）
                log.info(`[External Request] ${url}`);
            }


            if (swapFiles.length > 0) {
                try {
                    const urlObj = new URL(url);
                    if (urlObj.hostname.includes('krunker.io')) {
                        const matchedFile = swapFiles.find(f => urlObj.pathname === f.urlPath);
                        if (matchedFile) {
                            const destPath = matchedFile.localPath.replace(/\\/g, '/');
                            const redirectURL = 'bug://' + destPath;

                            // log.info(`[Swapper] Redirecting: ${url} -> ${redirectURL}`);
                            return callback({ redirectURL: redirectURL });
                        }
                    }
                } catch (e) {
                }
            }

            if (adBlockerInstance && adBlockerInstance.shouldBlock(url)) {
                log.info(`[AdBlock] Blocked: ${url}`);
                return callback({ cancel: true });
            }
            return callback({ cancel: false });
        });
    }
};


//flagの設定
applySettings.flagSwitch()

//RPCの更新
let lastTimer
ipcMain.on("rpcUpdate", (e, val, gInfo) => {
    if ((lastTimer == null && gInfo.time == null) || (lastTimer === 0 && lastTimer == gInfo.time)) {
        lastTimer = gInfo.time
    } else if ((lastTimer == null && gInfo.time != null) || (lastTimer === 0 && lastTimer != gInfo.time)) {
        lastTimer = gInfo.time
        log.info(val)
        rpc.setActivity({
            details: val.details,
            state: val.state,
            largeImageKey: "clientlogo",
            largeImageText: "BUG Client",
        })
    }
})

app.on("ready", () => {
    makeSplashWindow()
})



app.on("quit", () => {
    gameWindow.destroy()
    splashWindow.destroy()
})

