import Utils from "../Utils.js";
import ChildProcess from 'child_process';
import Path from 'path';
import which from 'which';
import Os from 'os';
import Fs from 'fs/promises';

export default class Browser {
    constructor(config) {
        this.config = config || {
            name: "Browser",
            linux: {
                exe: ["firefox"],
                dir: ["%HOME%/.mozilla"]
            },
            icon: "./assets/browser/generic.ong",
            extensionUrl: `https://addons.mozilla.org/it/firefox/addon/alby/`,
            nativeMessagingConfig:{
                "name": "alby",
                "description": "Alby native messaging to connect to nodes behind Tor",
                "path": "%EXE%",
                "type": "stdio",
                "allowed_extensions": ["extension@getalby.com"]
            },
            nativeMessagingPath:"%DIR%/native-messaging-hosts/alby.json",
            

        }
    }

    async name() {
        return this.config.name;
    }
    async icon() {
        return this.config.icon;
    }

    async getConfig(){
        const currentOs = process.platform;
        if (currentOs != "linux") throw "Unsupported OS";
        const config = this.config[currentOs];

        return config;
    }

    async find() {
        try {


            const config = await this.getConfig();

            for (let exe of config.exe) {
                try {
                    this.executable = which.sync(exe);
                    if (this.executable) break;
                } catch (e) {
                }
            }

            for (let dir of config.dir) {
                this.directory = dir.replace("%HOME%", Os.homedir());
                if (await Utils.fileExists(this.directory)) break;
            }
            if(this.directory && this.executable)return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async getNativeMessagingPath() {
        const path=  this.config.nativeMessagingPath.replace("%DIR%",this.directory);
        if(!path||path.length<5)throw "Invalid path"; // guard against unlikely paths
        const parentPath=Path.dirname(path);
        await Fs.mkdir(parentPath, { recursive: true });
        return path;
    }

    async installNativeMessaging() {
        const executable = Path.join(await this.getCompanionPath(), await Fs.readFile(Path.join(await this.getCompanionPath(), "alby-companion.exc"), { encoding: "utf-8" }));
        const data = JSON.parse(JSON.stringify(this.config.nativeMessagingConfig).replace("%EXE%",executable));
        await Fs.writeFile(await this.getNativeMessagingPath(), JSON.stringify(data ,null, 2));
    }


    async uninstallNativeMessaging() {
       const path=await this.getNativeMessagingPath();
       console.info("Remove",path);
       await Fs.unlink(path);
    }

    async isNativeMessagingInstalled() {
        return await Utils.fileExists(await this.getNativeMessagingPath());
    }

    async getCompanionPath() {
        if (!await this.find()) throw `${this.name} not found!`;
        return Path.join(this.directory, "alby");
    }

    async getExtensionUrl() {
        return this.config.extensionUrl;
    }

    async installExtension() {
        return this.openUrl(await this.getExtensionUrl());
    }

    async openUrl(url) {
        if (!await this.find()) throw `${this.name} not found!`;
        const cmd = `${this.executable} "${url}"`;
        console.log("Exec", cmd);
        ChildProcess.exec(cmd);
    }

  


}