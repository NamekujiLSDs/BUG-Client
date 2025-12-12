require("v8-compile-cache")

const { app } = require("electron")
const store = require("electron-store")
const log = require("electron-log")
const path = require('path');

const config = new store({
    encryptionKey: "BugClient"
})

const opensetting = require("./functions/opensetting")

//クライアントタブの呼び出しを監視する
window.windows[0].changeTab = (...args) => {
    const result = changeTabHook(...args);
    if (window.windows[0].tabIndex === 6) {
        opensetting.renderSettingsDom()
    }
    return result
};

log.info("== BUG CLIENT START ==")

opensetting.tests()
