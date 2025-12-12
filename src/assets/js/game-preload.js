require("v8-compile-cache")

const { app } = require("electron")
const store = require("electron-store")
const log = require("electron-log")
const path = require('path');

const config = new store({
    encryptionKey: "BugClient"
})

const opensetting = require("./functions/opensetting")

//関数が生成されるまで待つ関数
const waitFor = (checkFn, interval = 100) => {
    return new Promise((resolve) => {
        const check = () => {
            const result = checkFn();
            log.info(result)
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
        // 1. 最初からあるかチェック (カンマ区切りなら「どれか1つ」あればヒット)
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
        observer.observe(document.body, { childList: true, subtree: true });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await waitFor(() => window.windows[0]?.changeTab)
    const hookedShowWindow = window.showWindow.bind(window)
    const hookedChangeTab = window.windows[0].changeTab.bind(window.windows[0])

    //showwindowを上書きする
    window.showWindow = (...args) => {
        log.info("SHOW WINDOW")
        const result = hookedShowWindow(...args);

        if (window.windows[0].tabIndex === 6 || document.getElementsByClassName("settingTab")[window.windows[0].tabIndex].textContent === "Client") {
            opensetting.renderSettingsDom()
        } else {
            log.info("else")
        }
        return result
    }
    //changetabを上書きする
    window.windows[0].changeTab = (...args) => {
        log.info("ChangeTab")
        const result = hookedChangeTab(...args);
        if (window.windows[0].tabIndex === 6 || document.getElementsByClassName("settingTab")[window.windows[0].tabIndex].textContent === "Client") {
            opensetting.renderSettingsDom()
        }
        return result
    };
})

log.info("== BUG CLIENT START ==")

// opensetting.tests()
