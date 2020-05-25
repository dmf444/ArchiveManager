//https://yt-dl.org/downloads/latest/youtube-dl.exe
import * as jetpack from "fs-jetpack";
import {InspectResult} from "fs-jetpack/types";

const {download} = require("electron-dl");
const {BrowserWindow} = require("electron");
const path = require('path');
const log = require('electron-log');

export class YoutubeDLManager {

    private basePath: string;
    private isWindows: boolean;
    private checksumFileName: string = "MD5SUMS";

    constructor(basePath: string) {
        this.basePath = basePath + path.sep + "youtubedl";
        this.isWindows = process.platform == 'win32';
        this.verifyFolder();
    }

    public getFullApplicationPath(): string {
        let file: string = this.isWindows ? "youtube-dl.exe" : "youtube-dl";
        return this.basePath + path.sep + file;
    }

    private verifyFolder(){
        if(jetpack.exists(this.basePath) == false){
            jetpack.dir(this.basePath);
        }
    }

    public getNewestDownloaderVersion() {
        let file: string = this.isWindows ? "youtube-dl.exe" : "youtube-dl";
        this.downloadMd5().then(() => {
            if(jetpack.exists(this.basePath + path.sep + file) == false) {
                this.downloadYoutubeDl();
            } else {
                let content: string = jetpack.read(this.basePath + path.sep + this.checksumFileName);
                let thing = RegExp("([\\d\\w]{32})\\s\\s" + file +"$", "m");
                let newestMd5: string = thing.exec(content)[1];

                let results: InspectResult = jetpack.inspect(this.basePath + path.sep + file, {checksum: "md5"});
                log.info(`Comparing newest ytdl hash ${newestMd5} with current ${results.md5}`);
                if(newestMd5 !== results.md5) {
                    log.info("Newer Version of ytdl is available!");
                    jetpack.remove(this.basePath + path.sep + file);
                    this.downloadYoutubeDl();
                }
            }
        });
    }

    private async downloadMd5() {
        if (jetpack.exists(this.basePath + path.sep + this.checksumFileName) == "file") {
            jetpack.remove(this.basePath + path.sep + this.checksumFileName);
        }

        let url: string = "https://yt-dl.org/downloads/latest/" + this.checksumFileName;
        await download(BrowserWindow.getAllWindows()[0], url, {directory: this.basePath});
    }

    private downloadYoutubeDl(){
        log.info("Downloading newest version of Youtube DL");
        let file: string = this.isWindows ? "youtube-dl.exe" : "youtube-dl";
        let url: string = "https://yt-dl.org/downloads/latest/" + file;
        download(BrowserWindow.getAllWindows()[0], url, {directory: this.basePath});
    }

}