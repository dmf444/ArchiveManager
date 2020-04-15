import {getSettingsManager, getWebDatabase} from "./main";
import {FileSaveSettings} from "./settings/FileSaveSettings";
import * as jetpack from "fs-jetpack";
import { InspectResult } from "fs-jetpack/types";
import DownloadItem = Electron.DownloadItem;
const log = require('electron-log');

const {BrowserWindow} = require("electron");
const {download} = require("electron-dl");


export class FileManagement {

    public static async downloadFile(url) {
        let saveSettings: FileSaveSettings = <FileSaveSettings>getSettingsManager().getSettings("save");
        if(jetpack.exists(saveSettings.stagingPath) == false){
            jetpack.dir(saveSettings.stagingPath);
        }

        let fileDownload: DownloadItem = await download(BrowserWindow.getFocusedWindow(), url, {directory: saveSettings.stagingPath});
        //Get file MD5
        let filePath = saveSettings.stagingPath + "\\" + fileDownload.getFilename();
        let result: InspectResult = jetpack.inspect(filePath, {checksum: "md5"});
        log.info("[FileDownloaded] Success with MD5:" + result['md5']);
        //Check MD5 against database
        let doesMatch = await getWebDatabase().matchAny(result['md5']);
        // if needed
        // add file to fileDB
    }
}