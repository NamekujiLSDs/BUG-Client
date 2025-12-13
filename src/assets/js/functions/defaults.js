require("v8-compile-cache")
const path = require("path")

const injectDefaultCss = () => {
    const cssDom = Object.assign(document.createElement("link"), {
        rel: "stylesheet",
        href: "bug://" + path.join(__dirname, "../../css/default.css")
    })
    document.head.append(cssDom)
}

module.exports = {
    injectDefaultCss
}