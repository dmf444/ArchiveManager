import DownloadItem = Electron.DownloadItem;
import {FileUtils} from "@main/downloader/FileUtils";
const {basename} = require('path');
const log = require('electron-log');

const {BrowserWindow} = require("electron");
const {download} = require("electron-dl");

export class DefaultDownloader implements IDownloader {

    downloaderName: string = "Default Downloader";

    acceptsUrl(url: string): boolean {
        return true;
    }

    downloadUrl(url: string, stage: boolean, callbackFunction: (state: string, fileName: string, filePathDir: string, md5?: string) => void): void {
        let filePathDir = FileUtils.getFilePath(stage);
        log.info(url, stage, filePathDir);
        //As it stands right now, I can guarantee that there's only one window open at a time.
        download(BrowserWindow.getAllWindows()[0], url, {directory: filePathDir}).then((fileDownload: DownloadItem) => {
            let fileName = basename(fileDownload.getSavePath());
            callbackFunction(fileDownload.getState(), fileName, filePathDir);
        });
    }

}