import {  QPixmap,  QLabel,  AspectRatioMode, TransformationMode, AlignmentFlag } from '@nodegui/nodegui';

import Fs from 'fs/promises';
import Fs0 from 'fs';
import Crypto from 'crypto';
import fetch from 'node-fetch';
import Tar from 'tar-fs';
import Gunzip from 'gunzip-maybe';
import  ChildProcess from 'child_process';
export default class Utils {
    static transformRelativeSizes(win,content){
        const winSize = win.size();
        const winHeight = winSize.height();
        const winWidth = winSize.width();
        const winMin = Math.min(winHeight, winWidth);
        const winMax = Math.max(winHeight, winWidth);

        const fl=(n)=>Math.floor(n);

        

        content = content.replaceAll(/[0-9\.]+vw/g, (v) => {
            v = Number.parseFloat(v.substring(0, v.length - 2));
            return fl((winWidth * v / 100)) + "px";
        });
        content = content.replaceAll(/[0-9\.]+vh/g, (v) => {
            v = Number.parseFloat(v.substring(0, v.length - 2));
            return  fl((winHeight * v / 100)) + "px";
        });
        content = content.replaceAll(/[0-9\.]+vmin/g, (v) => {
            v = Number.parseFloat(v.substring(0, v.length - 2));
            return fl((winMin * v / 100)) + "px";
        });
        content = content.replaceAll(/[0-9\.]+vmax/g, (v) => {
            v = Number.parseFloat(v.substring(0, v.length - 2));
            return fl((winMax * v / 100)) + "px";
        });
        return content;
    }
    static async fileExists(filename) {
        try {
            await Fs.access(filename);
            return true;
        } catch (err) {
            if (err.code === 'ENOENT') {
                return false;
            } else {
                throw err;
            }
        }
    }

    static async download(name, url, size, outputFile, callback) {
        const hashFactory = Crypto.createHash('sha256');

        const dlReq = await fetch(url);
        const outputStream = Fs0.createWriteStream(outputFile);
        let written = 0;
        await new Promise((resolve, reject) => {
            dlReq.body.on("data", (data) => {
                hashFactory.update(data);
                outputStream.write(data, () => {
                    written += data.length;
                    callback(`Downloading ${name}...`, (written / size));
                });
            });

            dlReq.body.on("error", reject);
            dlReq.body.on("finish", resolve);
        });
        outputStream.close();

        return hashFactory.digest('hex');
    }

    static setResponsiveStyleSheet(win, stylesheet ,theme) {
        const onResize = () => {
            let bakedTheme = Utils.transformRelativeSizes(win, theme);
            let bakedStyle = Utils.transformRelativeSizes(win, stylesheet);
            win.setStyleSheet(bakedTheme+"\n"+bakedStyle);
        };
        win.addEventListener("Resize", onResize);
        onResize();
    }
    

    static newResponsiveImage(path) {
        const iconEl = new QLabel();
        const iconImg = new QPixmap();
        iconImg.load(path);
        iconEl.setAlignment(AlignmentFlag.AlignCenter);
        const onResize = () => {
            const size = iconEl.size();
            iconEl.setPixmap(iconImg.scaled(size.width(), size.height(), AspectRatioMode.KeepAspectRatio, TransformationMode.SmoothTransformation));
        };
        iconEl.addEventListener("Resize", onResize);
        onResize();
        return iconEl;
    }

    static async sleep(ms){
        return new Promise((res)=>setTimeout(res,ms));
    }

    static async extract(archive,destination){
        if(archive.endsWith(".tar.gz")){
            await new Promise((resolve,reject)=>{
                const stream = Fs0.createReadStream(archive).pipe(Gunzip()).pipe(Tar.extract(destination))
                stream.on("finish", resolve);
                stream.on("error", e=>reject(e));
            });
        }else{
            throw "Unsupported archive "+archive;
        }
    }

    static async isDark(){
        if(process.env.DARK_MODE){
            return process.env.DARK_MODE=="1";
        }
        try{            
            const theme=await new Promise((res,rej)=>{
                ChildProcess.exec(`gsettings get org.gnome.desktop.interface gtk-theme`,(err,stdout,stderr)=>{
                    if(err)rej(err);
                    else res(stdout);
                });
            });
            if(theme.indexOf("dark")!=-1)return true;
        }catch(e){
        }
        return false;

    }
}