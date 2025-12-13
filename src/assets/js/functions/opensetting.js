const settings = require("./settings")

const log = require("electron-log")

const renderSettingsDom = () => {
    let category
    document.getElementById("settHolder").innerHTML = "";
    Object.keys(settings).forEach(function (cat) {
        if (category != settings[cat] && cat != null) {
            let setHed = Object.assign(document.createElement("div"), {
                classList: "setHed",
                innerText: cat,
                id: "setHed_bug" + cat
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

            switch (settings[cat][setting]["type"]) {
                case "cb": {
                    const sw = Object.assign(document.createElement("label"), {
                        classList: "switch",
                        style: "margin-left:10px"
                    })
                    const inp = Object.assign(document.createElement("input"), {
                        type: "checkbox",
                    })
                    settings[cat][setting]["value"] ? inp.checked = true : "";
                    inp.setAttribute("onclick", "window.bugSetting('" + setting + "',this.checked)")
                    const slider = Object.assign(document.createElement("span"), {
                        classList: "slider"
                    })
                    const grooves = Object.assign(document.createElement('span'), {
                        classList: "grooves"
                    })
                    slider.append(grooves)
                    sw.append(inp, slider)
                    settName.append(sw)
                    break;
                }
                case "select": {
                    const select = Object.assign(document.createElement("select"), {
                        classList: "inputGrey2"
                    })
                    select.setAttribute("onchange", "window.bugSetting('" + setting + "',this.value)")
                    Object.keys(settings[cat][setting]["options"]).forEach((option) => {
                        const opt = Object.assign(document.createElement("option"), {
                            value: option,
                            innerText: settings[cat][setting]["options"][option]
                        })
                        option === settings[cat][setting]["value"] ? opt.setAttribute("selected", true) : "";
                        select.append(opt)
                    })
                    settName.append(select)
                    break;
                }
                case "url": {
                    const inp = Object.assign(document.createElement("input"), {
                        type: "url",
                        classList: "inputGrey2",
                        value: settings[cat][setting]["value"]
                    })
                    inp.setAttribute("onchange", "window.bugSetting('" + setting + "',this.value)")
                    settName.append(inp)
                    break;
                }
                case "file": {
                    const pathDisp = Object.assign(document.createElement("div"), {
                        classList: "pathDisplay",
                        innerText: settings[cat][setting]["value"].length > 0 && settings[cat][setting]["value"] ? path.basename(settings[cat][setting]["value"]) : "No selected file...",
                        style: "margin-left: auto;color:#888;font-size:12px"
                    })
                    const fileOpener = Object.assign(document.createElement("div"), {
                        classList: "openCollection material-icons",
                        innerText: "folder",
                    })
                    settName.setAttribute("style", "display: flex")
                    settName.append(pathDisp, fileOpener)
                    break;
                }
            }
            document.getElementById("setBod_bug" + cat).append(settName)
        })
    })
};

module.exports = {
    renderSettingsDom
}