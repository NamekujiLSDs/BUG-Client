require("v8-compile-cache");

const {
  app,
  ipcMain,
  Menu,
  protocol,
  BrowserWindow,
  dialog,
} = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const localShortcut = require("electron-localshortcut");
const log = require("electron-log");
const store = require("electron-store");
const fs = require("fs");

const settings = require("./src/assets/js/functions/settings");
const applySettings = require("./src/assets/js/functions/applySetting");
const adblock = require("./src/assets/js/functions/adblock");

const appVer = app.getVersion();

const config = new store({
  // encryptionKey: "BugClient"
});

// DevMode
autoUpdater.forceDevUpdateConfig = true;

// DiscordRPCの作成
const RPC = require("discord-rpc");
const { title } = require("process");
const rpc = new RPC.Client({ transport: "ipc" });
const clientId = "1449338607100887050";

const rpcSetting = () => {
  // log.info("Running:RPC SETTING");
  rpc.setActivity({
    details: `Playing Krunker`,
    state: "Buggy Buggy",
    largeImageKey: "clientlogo",
    largeImageText: "BUG-Client",
    startTimestamp: new Date(),
  });
};

rpc.on("ready", () => {
  if (
    settings["DiscordRPC"] &&
    settings["DiscordRPC"]["enableDiscordRpc"]["value"]
  ) {
    rpcSetting();
  }
});

rpc.login({ clientId: clientId }).catch(log.error);

// プロトコルの実装
protocol.registerSchemesAsPrivileged([
  {
    scheme: "bug",
    privileges: {
      secure: true,
      corsEnabled: true,
    },
  },
]);

app.on("ready", () => {
  protocol.registerFileProtocol("bug", (request, callback) =>
    callback(decodeURI(request.url.replace(/^bug:\//, ""))),
  );
});

// ゲームウィンドウの管理
let splashWindow, gameWindow;

// スプラッシュスクリーンを作成する
const makeSplashWindow = () => {
  splashWindow = new BrowserWindow({
    height: 350,
    width: 600,
    alwaysOnTop: true,
    transparent: true,
    frame: false,
    resizable: false,
    show: false,
    title: "BUG Client",
    icon: path.join(__dirname, "./src/assets/img/icons/icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "./src/assets/js/splash-preload.js"),
    },
  });

  splashWindow.webContents.loadFile(
    path.join(__dirname, "./src/assets/html/splash.html"),
  );

  const update = async () => {
    splashWindow.webContents.send("version", appVer);
    let updateCheck = null;

    autoUpdater.on("checking-for-update", () => {
      splashWindow.webContents.send("status", "Checking for updates...");
      updateCheck = setTimeout(() => {
        splashWindow.webContents.send("status", "Update check error!");
        setTimeout(() => {
          makeGameWindow();
        }, 1000);
      }, 15000);
    });

    autoUpdater.on("update-available", (i) => {
      if (updateCheck) clearTimeout(updateCheck);
      splashWindow.webContents.send(
        "status",
        `Found new version v${i.version}`,
      );
    });

    autoUpdater.on("update-not-available", () => {
      if (updateCheck) clearTimeout(updateCheck);
      splashWindow.webContents.send("status", "You using latest version.");
      setTimeout(() => {
        makeGameWindow();
      }, 1000);
    });

    autoUpdater.on("skipped", () => {
      if (updateCheck) clearTimeout(updateCheck);
      splashWindow.webContents.send("status", "You using latest version.");
      setTimeout(() => {
        makeGameWindow();
      }, 1000);
    });

    autoUpdater.on("error", (e) => {
      if (updateCheck) clearTimeout(updateCheck);
      splashWindow.webContents.send("status", "Error!" + e.name);
      setTimeout(() => {
        makeGameWindow();
      }, 1000);
    });

    autoUpdater.on("download-progress", (i) => {
      if (updateCheck) clearTimeout(updateCheck);
      splashWindow.webContents.send("status", "Downloading new version...");
    });

    autoUpdater.on("update-downloaded", (i) => {
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
    update();
  });
};

// ゲームウィンドウを作成する
const makeGameWindow = () => {
  gameWindow = new BrowserWindow({
    height: 500,
    width: 800,
    fullscreen: config.get("fullscreen", true),
    show: false,
    title: "BUG Client",
    icon: path.join(__dirname, "./src/assets/img/icons/icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "./src/assets/js/game-preload.js"),
    },
  });

  gameWindow.webContents.loadURL("https://krunker.io/");
  gameWindow.setTitle("BUG Client");
  gameWindow.on("page-title-updated", (e) => {
    e.preventDefault();
  });
  // ショートカットキーの設定
  localShortcut.register(gameWindow, "F5", () => {
    gameWindow.reload();
  });
  localShortcut.register(gameWindow, "F6", () => {
    gameWindow.loadURL("https://krunker.io");
  });
  localShortcut.register(gameWindow, "F12", () => {
    gameWindow.webContents.openDevTools();
  });
  localShortcut.register(gameWindow, "Esc", () => {
    gameWindow.webContents.send("shortcutKey", "ESC");
  });
  localShortcut.register(gameWindow, "F11", () => {
    const isFullScreen = gameWindow.isFullScreen();
    config.set("fullscreen", !isFullScreen);
    gameWindow.setFullScreen(!isFullScreen);
  });

  Menu.setApplicationMenu(null);

  // リソーススワッパーの初期化
  if (settings["General"] && settings["General"]["resourceSwapper"]["value"]) {
    initSwapper(gameWindow);
  }

  gameWindow.once("ready-to-show", () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.destroy();
    }
    gameWindow.show();
  });
};

// リソーススワッパー
const initSwapper = (win) => {
  const swapPath = path.join(app.getPath("documents"), "/BugSwap");
  if (!fs.existsSync(swapPath)) {
    fs.mkdir(swapPath, { recursive: true }, (e) => {
      if (e) {
        // log.warn("ERROR IN RESOURCE SWAPPER MKDIR");
        // log.warn(e);
      }
    });
  }

  const swapFiles = [];

  const recursiveFolder = (prefix = "") => {
    try {
      const currentDir = path.join(swapPath, prefix);
      if (!fs.existsSync(currentDir)) return;

      fs.readdirSync(currentDir, { withFileTypes: true }).forEach((cPath) => {
        if (cPath.isDirectory()) {
          recursiveFolder(`${prefix}/${cPath.name}`);
        } else {
          const name = `${prefix}/${cPath.name}`;
          swapFiles.push({
            urlPath: name.replace(/\\/g, "/"),
            localPath: path.join(swapPath, name),
          });
        }
      });
    } catch (e) {
      // log.warn("ERROR IN RESOURCE SWAPPER SCAN");
      // log.warn(e);
    }
  };
  recursiveFolder();

  let adBlockerInstance = null;
  try {
    if (
      settings["General"] &&
      settings["General"]["adBlocker"] &&
      settings["General"]["adBlocker"]["value"]
    ) {
      const adBlockPath = path.join(__dirname, "./src/assets/json/adblock.txt");
      adBlockerInstance = new adblock(adBlockPath);
    }
  } catch (e) {
    // log.warn("[AdBlock] Settings check failed:", e);
  }

  if (swapFiles.length > 0 || adBlockerInstance) {
    win.webContents.session.webRequest.onBeforeRequest(
      { urls: ["<all_urls>"] },
      (details, callback) => {
        const url = details.url;
        let urlObj;

        try {
          urlObj = new URL(url);
        } catch (e) {
          return callback({ cancel: false });
        }

        // 外部URLログ出力 (krunker.io 以外)
        const isKrunker =
          urlObj.hostname === "krunker.io" ||
          urlObj.hostname.endsWith(".krunker.io");
        if (!isKrunker) {
          // log.info(`[External Request] ${url}`);
        }

        // スワッパー処理
        if (swapFiles.length > 0 && isKrunker) {
          const matchedFile = swapFiles.find(
            (f) => urlObj.pathname === f.urlPath,
          );
          if (matchedFile) {
            const destPath = matchedFile.localPath.replace(/\\/g, "/");
            const redirectURL = "bug:///" + destPath; // プロトコル形式に合わせる
            return callback({ redirectURL: redirectURL });
          }
        }

        // アドブロック処理
        if (adBlockerInstance && adBlockerInstance.shouldBlock(url)) {
          // log.info(`[AdBlock] Blocked: ${url}`);
          return callback({ cancel: true });
        }

        return callback({ cancel: false });
      },
    );
  }
};

// flagの設定
applySettings.flagSwitch();

// RPCの更新
let lastTimer;
ipcMain.on("rpcUpdate", (e, val, gInfo) => {
  if (
    (lastTimer == null && gInfo.time == null) ||
    (lastTimer === 0 && lastTimer == gInfo.time)
  ) {
    lastTimer = gInfo.time;
  } else if (
    (lastTimer == null && gInfo.time != null) ||
    (lastTimer === 0 && lastTimer != gInfo.time)
  ) {
    lastTimer = gInfo.time;
    // log.info(val);
    rpc.setActivity({
      details: val.details,
      state: val.state,
      largeImageKey: "clientlogo",
      largeImageText: "BUG Client",
    });
  }
});

// ファイル選択画面を開く
ipcMain.handle("openLocalFileSelect", async (e, val) => {
  // log.info("LOCAL FILE OPEN ID = " + val);
  const filePaths = dialog.showOpenDialogSync(null, {
    properties: ["openFile"],
    title: "Select your CSS file...",
    defaultPath: ".",
    filters: [
      { name: "CSS Files", extensions: ["css"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });
  // log.info("OPENED : ", filePaths);
  return filePaths;
});

app.on("ready", () => {
  makeSplashWindow();
});

app.on("quit", () => {
  if (gameWindow && !gameWindow.isDestroyed()) gameWindow.destroy();
  if (splashWindow && !splashWindow.isDestroyed()) splashWindow.destroy();
});
