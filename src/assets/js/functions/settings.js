const { app } = require("electron")
const store = require("electron-store")

const config = new store({
    encryptionKey: "BugClient"
})

module.exports = {
    General: {
        adBlocker: {
            title: "AdBlocker",
            type: "cb",
            value: config.get("adBlocker", false),
        },
        altManager: {
            title: "Show AltManager",
            type: "cb",
            value: config.get("altManager", true),
        },
        menuTimer: {
            title: "Menu Timer",
            type: "cb",
            value: config.get("menuTimer", false),
        },
        resourceSwapper: {
            title: "Resource Swapper",
            type: "cb",
            value: config.get("resourceSwapper", false)
        }
    },
    Graphics: {
        unlimitedFps: {
            title: "Unlimited FPS",
            type: "cb",
            value: config.get("unlimitedFps", true)
        },
        angleBackend: {
            title: "Angle Backend",
            type: "select",
            options: {
                default: "Default",
                opengl: "OpenGL",
                d3d9: "D3D9",
                d3d11: "D3D11",
                d3d11on12: "D3D11on12",
                d3d12: "D3D12"
            },
            value: config.get("angleBackend", "default")
        },
    },
    DiscordRPC: {
        enableDiscordRpc: {
            title: "Discord RPC",
            type: "cb",
            value: config.get("enbableDiscordRpc", true),
        },
        rpcTimer: {
            title: "Share timer",
            type: "cb",
            value: config.get("rpcTimer", true),
        },
        rpcClass: {
            title: "Share class",
            type: "cb",
            value: config.get("rpcClass", true),
        },
        rpcMap: {
            title: "Share map",
            type: "cb",
            value: config.get("rpcMap", true),
        },
        rpcGamemode: {
            title: "Share gamemode",
            type: "cb",
            value: config.get("rpcGamemode", true)
        }
    },
    Customize: {
        ezcss: {
            title: "EZ CSS",
            type: "select",
            options: {
                disabled: "Disabled",
                local: "Local",
                url: "URL",
                custom1: "BUG Theme",
                custom2: "Vanilla Plus",
                custom3: "custom3",
                custom4: "custom4",
                custom5: "custom5",
                custom6: "custom6",
                custom7: "custom7",
            },
            value: config.get("ezcss", "disabled")
        },
        localCss: {
            title: "Local CSS File",
            type: "file",
            value: config.get("localCss", ""),
        },
        urlCss: {
            title: "Custom CSS URL",
            type: "url",
            value: config.get("urlCss", ""),
        },
        exitButton: {
            title: "Exit Button",
            type: "cb",
            value: config.get('exitButton', true)
        }
    },
    Advanced: {
        removeUseless: {
            title: "Disable Useless Features",
            type: "cb",
            value: config.get("removeUseless", false)
        },
        useBetterFlags: {
            title: "Use Better Flags",
            type: "cb",
            value: config.get("useBetterFlags", false)
        },
        hwAccel: {
            title: "Hardware Acceleration",
            type: "cb",
            value: config.get("hwAccel", true)
        },
        webGl2Context: {
            title: "WebGL2 Context",
            type: "cb",
            value: config.get("webGl2Context", false)
        },
        highPriority: {
            title: "High Priority",
            type: "cb",
            value: config.get("highPriority", false)
        },
        betterLatency: {
            title: "Better Latency",
            type: "cb",
            value: config.get("betterLatency", false)
        },
        unlimitedResource: {
            title: "Unlimited Resource",
            type: "cb",
            value: config.get("unlimitedResource", false)
        },
        gpuRasterizing: {
            title: "GPU Rasterizing",
            type: "cb",
            value: config.get("gpuRasterizing"),
        },
        experimentalFlags: {
            title: "Experimentals",
            type: "cb",
            value: config.get("experimentalFlags", false)
        }
    }
}