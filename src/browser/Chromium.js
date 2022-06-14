import Browser from "./Browser.js";

export default class Chromium extends Browser {
    constructor() {
        super({
            name: "Chromium",
            linux: {
                exe: ["chromium-browser", "chromium"],
                dir: [
                    "%HOME%/snap/chromium/common/chromium/",
                    "%HOME%/snap/chromium/common/.chromium/",
                    "%HOME%/snap/chromium/current/.chromium",
                    "%HOME%/snap/chromium/current/.config/chromium",
                    "%HOME%/.chromium",
                    "%HOME%/.config/chromium"
                ]
            },
            icon: "./assets/browser/chromium.png",
            extensionUrl: `https://chrome.google.com/webstore/detail/alby-bitcoin-lightning-wa/iokeahhehimjnekafflcihljlcjccdbe`,
            nativeMessagingConfig: {
                "name": "alby",
                "description": "Alby native messaging to connect to nodes behind Tor",
                "path": "%EXE%",
                "type": "stdio",
                "allowed_origins": ["chrome-extension://iokeahhehimjnekafflcihljlcjccdbe/"]
            },
            nativeMessagingPath: "%DIR%/NativeMessagingHosts/alby.json"

        });
    }
}