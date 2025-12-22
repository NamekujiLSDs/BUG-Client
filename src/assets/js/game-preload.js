require("v8-compile-cache");

const { app, ipcRenderer } = require("electron");
const store = require("electron-store");
const log = require("electron-log");
const path = require("path");
const config = new store({
  // encryptionKey: "BugClient"
});

const socialRegex = /^.*:\/\/krunker\.io\/editor\.html.*$/;
const editorRegex = /^.*:\/\/krunker\.io\/social\.html.*$/;

//機能の読み込み
const opensetting = require("./functions/opensetting");
const loadingGame = require("./functions/loadingGame");
const defaults = require("./functions/defaults");
const applySettings = require("./functions/applySetting");

//関数が生成されるまで待つ関数
const waitFor = (checkFn, interval = 10) => {
  return new Promise((resolve) => {
    const check = () => {
      const result = checkFn();
      if (result) {
        resolve(result);
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
};

//要素が存在するかを確認する
function waitForElement(selector) {
  return new Promise((resolve, reject) => {
    // 1. 最初からあるかチェック
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver((mutations) => {
      // 2. 変化があるたびにチェック
      const el = document.querySelector(selector);
      if (el) {
        resolve(el);
        observer.disconnect();
      }
    });

    // 監視対象を document.body ではなく document.documentElement (<html>) に変更
    // これならpreloadスクリプトの時点でもNodeが存在するためエラーにならない
    const targetNode = document.documentElement || document;

    observer.observe(targetNode, { childList: true, subtree: true });
  });
}

//設定UIの作成
document.addEventListener("DOMContentLoaded", async () => {
  window.bugFile = applySettings.localFileOpen;

  window.bugSetting = applySettings.saveSetting;
  await waitFor(() => window.windows[0]?.changeTab);
  const hookedShowWindow = window.showWindow.bind(window);
  const hookedChangeTab = window.windows[0].changeTab.bind(window.windows[0]);

  //showwindowを上書きする
  window.showWindow = (...args) => {
    log.info("SHOW WINDOW");
    log.info();
    const result = hookedShowWindow(...args);

    if (
      ((window.windows[0].tabIndex === 6 ||
        document.getElementsByClassName("settingTab")[
          window.windows[0].tabIndex
        ].textContent === "Client") &&
        args === 1) ||
      document.getElementsByClassName("tabANew")[0].textContent === "Client"
    ) {
      opensetting.renderSettingsDom();
    } else {
      log.info("else");
    }
    return result;
  };
  //changetabを上書きする
  window.windows[0].changeTab = (...args) => {
    log.info("ChangeTab");
    const result = hookedChangeTab(...args);
    if (
      window.windows[0].tabIndex === 6 ||
      document.getElementsByClassName("settingTab")[window.windows[0].tabIndex]
        .textContent === "Client"
    ) {
      opensetting.renderSettingsDom();
    }
    return result;
  };
});

//Loading画面の実装
const loadBgSetup = async () => {
  await waitForElement("body");
  defaults.injectDefaultCss();
  if (
    !socialRegex.test(window.location.href) &&
    !editorRegex.test(window.location.href)
  ) {
    loadingGame.bgSet();
    await waitForElement(".clientPop");
    clearPops();
    loadingGame.bgHide();
  }
};
//設定の適用
const applySetting = async () => {
  await waitForElement("body");
  applySettings.exitButton();
  applySettings.ezcss();
  await waitFor(() => window.getGameActivity);
  applySettings.menuTimer();
  applySettings.setDiscordRpc();
  await waitForElement("#playerHeaderEl");
  applySettings.createAltManager();
};

//ショートカットキーの動作を設定
ipcRenderer.on("shortcutKey", (e, key) => {
  switch (key) {
    case "ESC": {
      document.exitPointerLock();
    }
  }
});

loadBgSetup();
applySetting();
