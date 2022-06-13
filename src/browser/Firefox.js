import Browser from "./Browser.js";


export default class Firefox extends Browser {

    constructor() {
        super({
            name: "Mozilla Firefox",
            linux: {
                exe: ["firefox"],
                dir: [
                    "%HOME%/snap/firefox/common/.mozilla/",
                    "%HOME%/snap/firefox/common/mozilla/",
                    "%HOME%/snap/firefox/current/.mozilla/",
                    "%HOME%/snap/firefox/current/.config/mozilla/",
                    "%HOME%/.mozilla",
                    "%HOME%/.config/mozilla"
     
                ]
            },
            icon: "./assets/browser/firefox.png",
            extensionUrl: `https://addons.mozilla.org/it/firefox/addon/alby/`,
            nativeMessagingConfig:{
                "name": "alby",
                "description": "Alby native messaging to connect to nodes behind Tor",
                "path": "%EXE%",
                "type": "stdio",
                "allowed_extensions": ["extension@getalby.com"]
            },
            nativeMessagingPath:"%DIR%/native-messaging-hosts/alby.json"


        });
    }







}