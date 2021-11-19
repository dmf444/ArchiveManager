import DownloadItem = Electron.DownloadItem;
import {FileUtils} from "@main/downloader/FileUtils";
import {toggleMenu} from "@main/main";
import {downloadPromise, IDownloader} from "@main/downloader/interfaces/IDownloader";
import {STATE} from "@main/downloader/interfaces/State";
const {basename} = require('path');
const log = require('electron-log');

const {BrowserWindow} = require("electron");
const {download} = require("electron-dl");

export class DefaultDownloader implements IDownloader {

    downloaderName: string = "Default Downloader";

    acceptsUrl(url: string): boolean {
        return true;
    }

    async downloadUrl(url: string, stage: boolean): Promise<downloadPromise> {
        let filePathDir = FileUtils.getFilePath(stage);
        log.info(url, stage, filePathDir);
        //As it stands right now, I can guarantee that there's only one window open at a time.
        let window : Electron.BrowserWindow = BrowserWindow.getAllWindows()[0];
        if(window == null) {
            toggleMenu();
        }
        let fileDownload: DownloadItem = await download(BrowserWindow.getAllWindows()[0], url, {directory: filePathDir});

        let fileName = basename(fileDownload.getSavePath());
        return {
            state: fileDownload.getState() == "completed" ? STATE.SUCCESS : STATE.FAILED,
            fileName: fileName,
            filePathDir: filePathDir
        };
    }

    createdFilePostback(file): void {

    }

}