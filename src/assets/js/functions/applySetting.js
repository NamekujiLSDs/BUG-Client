require("v8-compile-cache")
const { app } = require("electron")
const log = require("electron-log")
const os = require('os');
const path = require("path");
const store = require("electron-store")
const config = new store({
    // encryptionKey: "BugClient"
})

const settings = require("./settings")
const menuTimers = require("./menutimer")
//起動時のフラグ設定
const flagSwitch = () => {
    //unlimited fps
    if (settings["Graphics"]["unlimitedFps"]["value"]) {
        app.commandLine.appendSwitch('disable-frame-rate-limit')
    }
    if (settings["Graphics"]["angleBackend"]["value"]) {
        app.commandLine.appendSwitch("use-angle", settings["Graphics"]["angleBackend"]["options"][settings["Graphics"]["angleBackend"]["value"]])
    }
    if (settings["Advanced"]["removeUseless"]["value"]) {
        app.commandLine.appendSwitch('disable-breakpad')
        app.commandLine.appendSwitch('disable-print-preview')
        app.commandLine.appendSwitch('disable-metrics-repo')
        app.commandLine.appendSwitch('disable-metrics')
        app.commandLine.appendSwitch('disable-2d-canvas-clip-aa')
        app.commandLine.appendSwitch('disable-bundled-ppapi-flash')
        app.commandLine.appendSwitch('disable-logging')
        app.commandLine.appendSwitch('disable-hang-monitor')
        app.commandLine.appendSwitch('disable-component-update')
    }
    if (settings["Advanced"]["useBetterFlags"]["value"]) {
        app.commandLine.appendSwitch('enable-javascript-harmony');
        app.commandLine.appendSwitch('enable-future-v8-vm-features');
        app.commandLine.appendSwitch('enable-webgl');
        app.commandLine.appendSwitch('enable-webgl2-compute-context');
        app.commandLine.appendSwitch('disable-background-timer-throttling');
        app.commandLine.appendSwitch('disable-renderer-backgrounding');
        app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
    }
    if (!settings["Advanced"]["hwAccel"]["value"]) {
        app.commandLine.appendSwitch('disable-gpu')
        app.commandLine.appendSwitch('disable-software-rasterizer')
        app.commandLine.appendSwitch('disable-gpu-compositing')
        app.commandLine.appendSwitch('disable-accelerated-2d-canvas')
    }
    if (settings["Advanced"]["webGl2Context"]["value"]) {
        app.commandLine.appendSwitch("enable-webgl2-compute-context")
    }
    if (settings["Advanced"]["betterLatency"]["value"]) {
        app.commandLine.appendSwitch('enable-highres-timer');
        app.commandLine.appendSwitch('enable-quic');
        app.commandLine.appendSwitch('enable-accelerated-2d-canvas');

    }
    if (settings["Advanced"]["unlimitedResource"]["value"]) {
        app.commandLine.appendSwitch('renderer-process-limit', '100')
        app.commandLine.appendSwitch('max-active-webgl-contexts', '100');
        app.commandLine.appendSwitch('webrtc-max-cpu-consumption-percentage', '100');
        app.commandLine.appendSwitch('ignore-gpu-blacklist');

    }
    if (settings["Advanced"]["gpuRasterizing"]["value"]) {
        app.commandLine.appendSwitch('enable-gpu-rasterization');
        app.commandLine.appendSwitch('enable-oop-rasterization');
        app.commandLine.appendSwitch('disable-zero-copy');
    }
    if (settings["Advanced"]["experimentalFlags"]["value"]) {
        app.commandLine.appendSwitch('disable-low-end-device-mode');
        app.commandLine.appendSwitch('enable-accelerated-video-decode');
        app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');
        app.commandLine.appendSwitch('high-dpi-support', '1');
        app.commandLine.appendSwitch('ignore-gpu-blacklist');
        app.commandLine.appendSwitch('no-pings');
        app.commandLine.appendSwitch('no-proxy-server');
    }
};

//ezcssのホルダ設定
const ezcss = () => {
    if (document.getElementById("ezCssHolder")) {
        const ezCss = document.getElementById("ezCssHolder")
        log.info("val:", settings["Customize"]["urlCss"]["value"])
        log.info("type:", typeof settings["Customize"]["urlCss"]["value"])
        switch (settings["Customize"]["ezcss"]["value"]) {
            case "disabled": {
                break
            }
            case "local": {
                ezCss.setAttribute("href", "bug://" + settings["Customize"]["localCss"]["value"])
                break
            }
            case "url": {
                ezCss.setAttribute("href", settings["Customize"]["urlCss"]["value"])
                break
            }
            default: {
                ezCss.setAttribute("href", "bug://" + path.join(__dirname, "../../css/ezcss/" + settings["Customize"]["ezcss"]["value"] + ".css"))
                break
            }
        }
    } else {
        const ezcss = Object.assign(document.createElement("link"), {
            rel: "stylesheet",
            classList: "ezcssHolder",
            id: "ezCssHolder"
        })
        switch (settings["Customize"]["ezcss"]["value"]) {
            case "disabled": {
                break
            }
            case "local": {
                ezcss.setAttribute("href", "bug://" + settings["Customize"]["localCss"]["value"])
                break
            }
            case "url": {
                ezcss.setAttribute("href", settings["Customize"]["urlCss"]["value"])
                break
            }
            default: {
                ezcss.setAttribute("href", "bug://" + path.join(__dirname, "../../css/ezcss/" + settings["Customize"]["ezcss"]["value"] + ".css"))
                break
            }
        }
        document.body.append(ezcss)
    }
};

//exitボタンの表示の設定
const exitButton = () => {
    let val = config.get('exitButton') ?? true
    const cssPath = settings["Customize"]["exitButton"]["value"] ? "bug://" + path.join(__dirname, "../../css/exitButton.css") : "";
    if (document.getElementById("exitCss")) {
        document.getElementById("exitCss").setAttribute("href", cssPath)
    } else {
        exitCss = Object.assign(document.createElement("link"), {
            rel: "stylesheet",
            id: "exitCss",
            href: cssPath
        })
        document.body.append(exitCss)
    }
};

//メニュータイマーの表示
const menuTimer = () => {
    if (!document.getElementById("menuTimer")) {
        menuTimers.makeTimerDom()
    }
    if (settings["General"]["menuTimer"]["value"]) {
        document.getElementById("menuTimer").setAttribute("style", "display: block;")
        menuTimerCtrl.start()
    } else {
        document.getElementById("menuTimer").setAttribute("style", "display: none;")
        menuTimerCtrl.stop()
    }
};
const menuTimerCtrl = {
    timerId: null,

    start() {
        if (this.timerId) return;

        this.timerId = setInterval(() => {
            menuTimers.updateTimer();
        }, 500);
    },

    // 停止する関数
    stop() {
        if (!this.timerId) return;

        clearInterval(this.timerId);
        this.timerId = null;
    }
};

//設定の保存と適用
const saveSetting = (id, val) => {
    config.set(id, val)
    log.info("Setting saved - ", id, " : ", val)
    switch (id) {
        case "urlCss":
        case "ezcss": {
            ezcss()
            break;
        }
        case "exitButton": {
            exitButton()
            break;
        }
        case "altManager": { }
        case "menuTimer": {
            menuTimer()
            break;
        }
    }
};

module.exports = {
    flagSwitch,
    ezcss,
    exitButton,
    saveSetting,
    menuTimer
}