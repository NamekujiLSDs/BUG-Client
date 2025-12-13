require("v8-compile-cache")
const { ipcRenderer } = require("electron")

ipcRenderer.on("status", (e, val) => {
    document.getElementById('stat').innerText = val
})

ipcRenderer.on("version", (e, val) => {
    document.getElementById("version").innerText = val
})