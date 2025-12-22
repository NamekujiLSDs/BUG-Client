const { app } = require("electron");
const store = require("electron-store");

const config = new store({
  // encryptionKey: "BugClient"
});

module.exports = {
  General: {
    adBlocker: {
      title: "AdBlocker",
      type: "cb",
      get value() {
        return config.get("adBlocker") ?? false;
      },
    },
    altManager: {
      title: "Show AltManager",
      type: "cb",
      get value() {
        return config.get("altManager") ?? true;
      },
    },
    menuTimer: {
      title: "Menu Timer",
      type: "cb",
      get value() {
        return config.get("menuTimer") ?? false;
      },
    },
    resourceSwapper: {
      title: "Resource Swapper",
      type: "cb",
      get value() {
        return config.get("resourceSwapper") ?? false;
      },
    },
  },
  Graphics: {
    unlimitedFps: {
      title: "Unlimited FPS",
      type: "cb",
      get value() {
        return config.get("unlimitedFps") ?? true;
      },
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
        d3d12: "D3D12",
      },
      get value() {
        return config.get("angleBackend") ?? "default";
      },
    },
  },
  DiscordRPC: {
    enableDiscordRpc: {
      title: "Discord RPC",
      type: "cb",
      get value() {
        return config.get("enbableDiscordRpc") ?? true;
      },
    },
    rpcTimer: {
      title: "Share timer",
      type: "cb",
      get value() {
        return config.get("rpcTimer") ?? true;
      },
    },
    rpcClass: {
      title: "Share class",
      type: "cb",
      get value() {
        return config.get("rpcClass") ?? true;
      },
    },
    rpcMap: {
      title: "Share map",
      type: "cb",
      get value() {
        return config.get("rpcMap") ?? true;
      },
    },
    rpcGamemode: {
      title: "Share gamemode",
      type: "cb",
      get value() {
        return config.get("rpcGamemode") ?? true;
      },
    },
  },
  Customize: {
    ezcss: {
      title: "EZ CSS",
      type: "select",
      options: {
        disabled: "Disabled",
        local: "Local",
        url: "URL",
        // custom1: "BUG Theme",
        custom2: "Dopeness",
        // custom3: "MTZish",
        custom4: "Chroma's Vanilla Plus",
        // custom5: "custom 5",
        // custom6: "custom 6",
        // custom7: "custom 7",
      },
      get value() {
        return config.get("ezcss") ?? "disabled";
      },
    },
    localCss: {
      title: "Local CSS File",
      type: "file",
      get value() {
        return config.get("localCss") ?? "";
      },
    },
    urlCss: {
      title: "Custom CSS URL",
      type: "url",
      get value() {
        return config.get("urlCss") ?? "";
      },
    },
    exitButton: {
      title: "Exit Button",
      type: "cb",
      get value() {
        return config.get("exitButton") ?? true;
      },
    },
  },
  Advanced: {
    removeUseless: {
      title: "Disable Useless Features",
      type: "cb",
      get value() {
        return config.get("removeUseless") ?? false;
      },
    },
    useBetterFlags: {
      title: "Use Better Flags",
      type: "cb",
      get value() {
        return config.get("useBetterFlags") ?? false;
      },
    },
    hwAccel: {
      title: "Hardware Acceleration",
      type: "cb",
      get value() {
        return config.get("hwAccel") ?? true;
      },
    },
    webGl2Context: {
      title: "WebGL2 Context",
      type: "cb",
      get value() {
        return config.get("webGl2Context") ?? false;
      },
    },
    highPriority: {
      title: "High Priority",
      type: "cb",
      get value() {
        return config.get("highPriority") ?? false;
      },
    },
    betterLatency: {
      title: "Better Latency",
      type: "cb",
      get value() {
        return config.get("betterLatency") ?? false;
      },
    },
    unlimitedResource: {
      title: "Unlimited Resource",
      type: "cb",
      get value() {
        return config.get("unlimitedResource") ?? false;
      },
    },
    gpuRasterizing: {
      title: "GPU Rasterizing",
      type: "cb",
      get value() {
        return config.get("gpuRasterizing") ?? false;
      },
    },
    experimentalFlags: {
      title: "Experimentals",
      type: "cb",
      get value() {
        return config.get("experimentalFlags") ?? false;
      },
    },
  },
};
