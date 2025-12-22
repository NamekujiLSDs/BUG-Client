require("v8-compile-cache")
const log = require("electron-log")
const path = require('path')


const bgSet = () => {
    // log.info("BG SET RUN ")
    const loadingBg = Object.assign(document.createElement("div"), {
        id: "loadingBg3",
        style: "z-index:999;background:#222;position:fixed;top:0;left:0;right:unset;bottom:unset;width:100%;height:100%;"

    })
    const loadingText = Object.assign(document.createElement("div"), {
        id: "loadingText",
        innerText: "LOADING"
    })
    const loadingImage = Object.assign(document.createElement("img"), {
        id: "clientLogo",
        src: "bug://" + path.join(__dirname, "../../img/icons/512x512.png")
    })
    const circle1 = Object.assign(document.createElement("div"), {
        classList: "circle1"
    })
    const circle2 = Object.assign(document.createElement("div"), {
        classList: "circle2"
    })
    const circle3 = Object.assign(document.createElement("div"), {
        classList: "circle3"
    })
    const circle4 = Object.assign(document.createElement("div"), {
        classList: "circle4"
    })
    const circle5 = Object.assign(document.createElement("div"), {
        classList: "circle5"
    })
    loadingBg.append(loadingImage, loadingText, circle1, circle2, circle3, circle4, circle5,)
    document.body.append(loadingBg)
};

const bgHide = () => {
    // log.info("Delete Backgound")
    document.getElementById("loadingBg3").setAttribute("style", "display:none")

};

module.exports = {
    bgSet,
    bgHide
}
