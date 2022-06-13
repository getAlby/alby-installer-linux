import Browser from "./Browser.js";

export default class Chrome extends Browser {
    constructor() {
        super({
            name: "Chrome",
            linux: {
                exe: ["google-chrome", "google-chrome-browser", "chrome-browser", "chrome"],
                dir: [
                    "%HOME%/snap/google-chrome/common/google-chrome/",
                    "%HOME%/snap/google-chrome/common/.google-chrome/",
                    "%HOME%/snap/google-chrome/current/.google-chrome",
                    "%HOME%/snap/google-chrome/current/.config/google-chrome",
                    "%HOME%/.google-chrome",
                    "%HOME%/.config/google-chrome",
                ]
            },
            icon: "./assets/browser/chrome.png",
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