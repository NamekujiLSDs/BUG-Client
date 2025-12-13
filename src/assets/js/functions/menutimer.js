require("v8-compile-cache")
const { app, ipcRenderer } = require("electron")

const updateTimer = () => {
    let time = window.getGameActivity().time
    const m = Math.floor(time / 60).toString().padStart(2, '0');
    const s = (time % 60).toString().padStart(2, '0');
    time = `${m}:${s}`;
    document.getElementById("menuTimer").innerText = time
};

const makeTimerDom = () => {
    const menuTImerDom = Object.assign(document.createElement("div"), {
        id: "menuTimer",
        innerText: "00:00"
    })
    document.getElementById("instructionHider").append(menuTImerDom)
    updateTimer()
}

module.exports = {
    updateTimer,
    makeTimerDom
}

