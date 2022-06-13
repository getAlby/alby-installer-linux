import fetch from 'node-fetch';
import Utils from './Utils.js';
import Path from 'path';
import Fs from 'fs/promises';
import Os from 'os';

const CONFIG = {
    linux: {
        githubRepo: process.env.ALBY_COMPANION_REPO || "getAlby/alby-companion-rs",
        supportedExt: ".tar.gz",
        executable: "alby",
        chmod: "766"
    }
}

export default class Companion {

    static getOsArch(os, arch) {
        if (os == null) os = process.platform;
        if (arch == null) {
            arch = process.arch;
            if (arch == "x64") arch = "x86_64";
            else if (arch == "x32") arch = "x86";
        }
        return [os, arch];
    }

    static async getLastRelease(os, arch) {
        let data;
        try {
            if (this.latestRelease) return this.latestRelease;
            [os, arch] = this.getOsArch(os, arch);
            const config = CONFIG[os];

            try {
                data = process.env.ALBY_COMPANION_VERSION && process.env.ALBY_COMPANION_VERSION != "latest" ? JSON.parse(process.env.ALBY_COMPANION_VERSION) : undefined;
            } catch (e) {
                console.error(e);
            }

            if (!data && process.env.ALBY_COMPANION_VERSION_FILE) {
                try {
                    data = JSON.parse(await Fs.readFile(process.env.ALBY_COMPANION_VERSION_FILE, { encoding: "utf-8" }));
                } catch (e) {
                    console.error(e);
                }
            }

            if (!data) {
                try {
                    console.log("Fetch release info from github...");
                    data = await fetch(`https://api.github.com/repos/${config.githubRepo}/releases/latest`).then(res => res.json());
                } catch (e) {
                    console.error(e);
                }
            }

            if (!data) throw "Can't load version info";

            for (const asset of data.assets) {
                if (asset.name.indexOf(`_${arch}`) != -1 && asset.name.indexOf(`-${os}`) != -1 && asset.name.endsWith(config.supportedExt)) {
                    return this.latestRelease = {
                        version: data.name.trim(),
                        name: asset.name,
                        url: asset.browser_download_url,
                        hashUrl: asset.browser_download_url + ".sha256sum",
                        executable: config.executable,
                        size: asset.size,
                        os: os,
                        arch: arch,
                        chmod: config.chmod
                    }
                }
            }
            return null;
        } catch (e) {
            console.error(e);
            throw "Can't fetch latest release " + JSON.stringify(data);
        }
    }

    static async getInstalledVersion(path) {
        try {
            const versioningFile = Path.join(path, "alby-companion.version");
            return await Utils.fileExists(versioningFile) ? (await Fs.readFile(versioningFile, { encoding: "utf-8" })).trim() : undefined;
        } catch (e) {
            console.error(e);
            return undefined;
        }
    }

    static async remove(destination) {
        if (await Utils.fileExists(destination)) await Fs.rename(destination, `${destination}-old.${Date.now()}`);
    }

    static async download(release, destination, callback, tmp) {
        // "remove" old destination directory
        await this.remove(destination);

        // create destination directory
        await Fs.mkdir(destination);
        let downloadedFile;

        if (process.env.ALBY_COMPANION_FILE) {
            downloadedFile = process.env.ALBY_COMPANION_FILE;
            downloadedFile = downloadedFile.replace("%PWD%", __dirname);
        } else {
            // create tmp directory if needed
            if (!tmp) tmp = await Fs.mkdtemp(Path.join(Os.tmpdir(), "alby-installer"));

            // prepare for download
            downloadedFile = Path.join(tmp, release.name);

            // Fetch signature
            callback(`Downloading signature...`, 1);
            let expectedSign = await fetch(release.hashUrl).then(res => res.text());
            if (!expectedSign) throw "Signature not found in host";
            expectedSign = expectedSign.split(" ")[0];

            // Download file
            const signature = await Utils.download(release.name, release.url, release.size, downloadedFile, callback);

            // check signature
            if (signature !== expectedSign) throw "Invalid signature!";
        }

        // extract
        callback("Extracting...", 1);
        await Utils.extract(downloadedFile, destination, callback);

        // write metadata
        await Fs.writeFile(Path.join(destination, "alby-companion.exc"), release.executable);
        await Fs.writeFile(Path.join(destination, "alby-companion.version"), release.version);

        if (release.chmod) {
            callback("Chmod...", 1);
            await Fs.chmod(Path.join(destination, release.executable), release.chmod);
        }
        callback("Done.", 1);
    }
}

