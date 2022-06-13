# Alby Linux Installer

This is the Extension and Companion Installer for [Alby](http://getalby.com/).


![light mode](./screenshot/Screenshot%20from%202022-06-13%2013-46-50.png)

![dark mode](./screenshot/Screenshot%20from%202022-06-13%2013-46-20.png)



## Usage
1. Download the latest release from the [release page](https://github.com/getAlby/alby-installer-linux/releases)
2. Set the execution permission with 
`chmod +x ./AlbyInstaller-x86_64-linux`
3. Launch `AlbyInstaller-x86_64-linux` and click enable

## Build
### Requirements
- NodeJS >= v16.15.0
- NPM >= 8.5.5
- Qt5
- curl

### Commands
```bash
npm i # Download node modules
npm run build # Build the app
npm run debug # Debug the app

./build.sh # Build distributable AppImage in deploy/appimage/
```

## Advanced usage


### Configuration

The installer can be configured by setting the following environment variables

VARIABLE  | DESCRIPTION | VALID VALUES | default
------------- | ------------- | ------------- | ------------- 
DARK_MODE  | Enable/Disable dark mode | 0 = light mode; 1 = dark mode | Light or, when possible, guessed from system configuration
ALBY_COMPANION_REPO | Github repository of the alby companion | owner/repo |  getAlby/alby-companion-rs
ALBY_COMPANION_VERSION | Version metadata | see [Version Metadata](#version-metadata) |  latest from github
ALBY_COMPANION_VERSION_FILE | Same as ALBY_COMPANION_VERSION but loaded from a file | see  [Version Metadata](#version-metadata)  |  latest from github
ALBY_COMPANION_FILE | Local path of the archive with the compation | Path to a  tar.gz file | downloaded using the provided metadata in ALBY_COMPANION_VERSION or ALBY_COMPANION_VERSION_FILE


###  Version Metadata
The version metadata is a json file structured as follow

```json
{
    "name":"v1.0.0", // version name
    "assets":[{
        "name":"something-something-OS_ARCH.tar.gz",
        "browser_download_url": "https://download.url/XXXXX", // tar.gz archive 
        "size": 100000 // in bytes	
    }]
}
```

The installer expects to find a text file at `${browser_download_url}.sha256sum` containing the sha256 checksum of the archive. Both `browser_download_url` and its checksum are ignored when `ALBY_COMPANION_FILE` is used.