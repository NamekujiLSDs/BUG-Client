const settings = require("./settings")
const log = require("electron-log")

const tests = () => {
    Object.keys(settings).forEach(function (cat) {
        Object.keys(settings[cat]).forEach(function (setting) {
            log.info(settings[cat][setting]["title"])
        })
    })
};



const renderSettingsDom = () => {
    document.getElementById("settHolder").innerHTML = "";
    Object.keys(settings).forEach(function (cat) {
        Object.keys(settings[cat]).forEach(function (setting) {
            // log.info(settings[cat][setting]["title"])
            let dom = Object.assign(document.createElement("div"), {
                classList: "setBodH",
                innerText: settings[cat][setting]["title"]
            })
            document.getElementById("settHolder").append(dom)
        })
    })
};

module.exports = {
    tests,
    renderSettingsDom
}