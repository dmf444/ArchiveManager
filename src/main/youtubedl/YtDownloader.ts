import * as jetpack from "fs-jetpack";
import {Checksum, InspectResult} from 'fs-jetpack/types';
import DownloadItem = Electron.DownloadItem;
import {toggleMenu} from "@main/main";

const {download} = require("electron-dl");
const {BrowserWindow} = require("electron");
const path = require('path');
const log = require('electron-log');
const fs = require('fs');

type checksumType = {
    type: Checksum,
    name: string,
    len: number
}
export abstract class YtDownloader {
    private basePath: string;
    private isWindows: boolean;
    private appName: string;
    protected checksumData: checksumType = {
        type: "sha256",
        name: 'SHA2-256SUMS',
        len: 64
    };
    private downloadUrl: string;


    protected constructor(basePath: string, folderName: string, appName: string, downloadUrl: string) {
        this.basePath = basePath + path.sep + folderName;
        this.appName = appName;
        this.isWindows = process.platform == 'win32';
        this.downloadUrl = downloadUrl;
        this.verifyFolder();
    }

    public getFullApplicationPath(): string {
        let file: string = this.getFileName();
        return this.basePath + path.sep + file;
    }

    private getFileName() {
        return this.isWindows ? this.appName + ".exe" : this.appName;
    }

    private verifyFolder(){
        if(jetpack.exists(this.basePath) == false){
            jetpack.dir(this.basePath);
        }
    }

    public getNewestDownloaderVersion() {
        let file: string = this.getFileName();
        this.downloadChecksumData().then(() => {
            if(jetpack.exists(this.pathTo(file)) == false) {
                this.downloadYoutubeDl();
            } else {
                let content: string = jetpack.read(this.pathTo(this.checksumData.name));
                let regexPattern = RegExp(`([\\d\\w]{${this.checksumData.len}})\\s\\s${file}$`, "m");
                let newestChecksum: string = regexPattern.exec(content)[1];

                let results: InspectResult = jetpack.inspect(this.pathTo(file), {checksum: this.checksumData.type});
                log.info(`Comparing newest ${this.appName} hash ${newestChecksum} with current ${results[this.checksumData.type]}`);
                if(newestChecksum !== results[this.checksumData.type]) {
                    log.info("Newer Version of ytdl is available!");
                    jetpack.remove(this.pathTo(file));
                    this.downloadYoutubeDl();
                }
            }
        });
    }

    private async downloadChecksumData() {
        if (jetpack.exists(this.pathTo(this.checksumData.name)) == "file") {
            jetpack.remove(this.pathTo(this.checksumData.name));
        }

        let url: string = this.downloadUrl + this.checksumData.name;
        log.info(url, this.basePath);
        await download(BrowserWindow.getAllWindows()[0], url, {directory: this.basePath, filename: this.checksumData.name}).then(dlitem => {
            log.info(dlitem.getSavePath());
        });
    }

    private downloadYoutubeDl(){
        log.info(`Downloading newest version of ${this.appName}`);
        let file: string = this.getFileName();
        let url: string = this.downloadUrl + file;
        let window : Electron.BrowserWindow = BrowserWindow.getAllWindows()[0];
        if(window == null) {
            toggleMenu();
        }
        download(BrowserWindow.getAllWindows()[0], url, {directory: this.basePath, filename: this.getFileName()}).then((downloadItem: DownloadItem) => {
            if(!this.isWindows) {
                fs.chmodSync(downloadItem.getSavePath(), 0o555);
            }
            log.info(`Success downloading ${this.appName}.`);
        });
    }

    private pathTo(destination: string) {
        return this.basePath + path.sep + destination;
    }
}
