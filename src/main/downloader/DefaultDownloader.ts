
import * as jetpack from "fs-jetpack";
import { InspectResult } from "fs-jetpack/types";
import DownloadItem = Electron.DownloadItem;
import {FileUtils} from "@main/downloader/FileUtils";
const log = require('electron-log');

const {BrowserWindow} = require("electron");
const {download} = require("electron-dl");

export class DefaultDownloader implements IDownloader {

    downloaderName: string = "Default Downloader";

    acceptsUrl(url: string): boolean {
        return true;
    }

    downloadUrl(url: string, stage: boolean): void {
        let filePathDir = FileUtils.getFilePath(stage);

        download(BrowserWindow.getFocusedWindow(), url, {directory: filePathDir}).then((fileDownload: DownloadItem) => {
            if(fileDownload.getState() == "completed") {
                //Get file MD5
                let filePath = filePathDir + "\\" + fileDownload.getFilename();
                let result: InspectResult = jetpack.inspect(filePath, {checksum: "md5"});
                log.info("[FileDownloaded] Success with MD5:" + result['md5']);
                FileUtils.queryRemoteForDuplicates(result['md5']).then((contains: boolean) => {
                    FileUtils.createNewFileEntry(filePath, fileDownload, url, contains);
                });

            } else {
                FileUtils.createNewErrorFileEntry(url);
            }
        });
    }

}