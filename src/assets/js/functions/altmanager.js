require("v8-compile-cache")

const { app } = require("electron")
const store = require("electron-store")
const log = require("electron-log")
const path = require('path');

const configalt = new store({
    name: "alt",
    encryptionKey: "BugClient"
})

