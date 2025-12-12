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
    let category
    document.getElementById("settHolder").innerHTML = "";
    Object.keys(settings).forEach(function (cat) {
        if (category != settings[cat] && cat != null) {
            let setHed = Object.assign(document.createElement("div"), {
                classList: "setHed",
                innerText: cat,
                id: "setHead_bug" + cat
            })
            setHed.setAttribute("onclick", "window.windows[0].collapseFolder(this)")
            let setAllow = Object.assign(document.createElement("span"), {
                innerText: "keyboard_arrow_down",
                classList: "material-icons plusOrMinus"
            })
            setHed.insertAdjacentElement("afterbegin", setAllow)
            let setBodH = Object.assign(document.createElement("div"), {
                classList: "setBodH",
                id: "setBod_bug" + cat,
                style: "",
            })
            document.getElementById("settHolder").append(setHed, setBodH)
        }
        category = cat
        Object.keys(settings[cat]).forEach(function (setting) {
            const settName = Object.assign(document.createElement("div"), {
                classList: "settName",
                innerText: settings[cat][setting]["title"]
            })
            //  <label class="switch" style="margin-left:10px">
            //      <input type="checkbox" onclick="window.setSetting(&quot;antiAlias&quot;, this.checked)">
            //      <span class="slider">
            //          <span class="grooves">
            //          </span>
            //      </span>
            //  </label>

            switch (setting["type"]) {
                case "cb": {
                    const sw = Object.assing(document.createElement("label"), {
                        class: "switch",
                        style: "margin-left:10px"
                    })
                    const inp = Object.assign(document.createElement("input"), {
                        type: "checkbox",
                        value: settings[cat][setting]["value"]
                    })
                    inp.setAttribute("onclick", "window.bugSetting(" + setting + ",this.checked)")
                    break;
                }
            }

            log.info(setting)
            document.getElementById("setBod_bug" + cat).append(settName)
        })
    })
};

module.exports = {
    tests,
    renderSettingsDom
}