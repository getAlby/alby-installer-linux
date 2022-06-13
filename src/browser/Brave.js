import Browser from "./Browser.js";


export default class Brave extends Browser {


    constructor() {
        super({
            name: "Brave",
            linux: {
                exe: ["brave-browser", "brave"],
                dir: [
                    "%HOME%/snap/brave/current/.config/BraveSoftware/Brave-Browser",
                    "%HOME%/snap/brave/common/.config/BraveSoftware/Brave-Browser",
                    "%HOME%/snap/brave/common/BraveSoftware/Brave-Browser",
                    "%HOME%/.config/BraveSoftware/Brave-Browser"
                ]
            },
            icon: "./assets/browser/brave.png",
            extensionUrl: `https://chrome.google.com/webstore/detail/alby-bitcoin-lightning-wa/iokeahhehimjnekafflcihljlcjccdbe`,
            nativeMessagingConfig:{
                "name": "alby",
                "description": "Alby native messaging to connect to nodes behind Tor",
                "path": "%EXE%",
                "type": "stdio",
                "allowed_origins": [ "chrome-extension://iokeahhehimjnekafflcihljlcjccdbe/" ]
              },
            nativeMessagingPath:"%DIR%/NativeMessagingHosts/alby.json"

        });
    }





}