import {getFileDatabase, getSettingsManager, getWebDatabase} from "../main";
import {FileSaveSettings} from "../settings/FileSaveSettings";
import * as jetpack from "fs-jetpack";
import {FileUploadData} from "@main/file/FileUploadData";
import {FileState} from "@main/file/FileState";
import {FileModel} from "@main/file/FileModel";
import DownloadItem = Electron.DownloadItem;

const log = require('electron-log');

const {BrowserWindow} = require("electron");
const {download} = require("electron-dl");


export class FileUtils {

    private static getStagingPath(): string {
        let saveSettings: FileSaveSettings = <FileSaveSettings>getSettingsManager().getSettings("save");
        if(jetpack.exists(saveSettings.stagingPath) == false){
            jetpack.dir(saveSettings.stagingPath);
        }
        return saveSettings.stagingPath;
    }

    private static getProcessingPath(): string {
        let saveSettings: FileSaveSettings = <FileSaveSettings>getSettingsManager().getSettings("save");
        if(jetpack.exists(saveSettings.processingPath) == false){
            jetpack.dir(saveSettings.processingPath);
        }
        return saveSettings.processingPath;
    }

    public static getFilePath(staging: boolean): string {
        if(staging) {
            return FileUtils.getStagingPath();
        }
        return FileUtils.getProcessingPath();
    }

    private static createDefaultMetadataEntry(): FileUploadData  {
        let metadata: FileUploadData = FileUploadData.fromJson(null);
        metadata.container = 0;
        metadata.restrictions = 1;
        return metadata;
    }

    public static createNewFileEntry(filePath: string, item: DownloadItem, url: string, isDuplicate: boolean) {
        let metadata = FileUtils.createDefaultMetadataEntry();
        let fileId: number = getFileDatabase().getNextFreeFileId();
        let state: FileState = isDuplicate ? FileState.DUPLICATE : FileState.NEW;
        let file = new FileModel(fileId, item.getFilename(), filePath, state, url, metadata);
        getFileDatabase().addFile(file);
    }

    public static createNewErrorFileEntry(url: string) {
        let metadata: FileUploadData = FileUploadData.fromJson(null);
        let fileId: number = getFileDatabase().getNextFreeFileId();
        let file = new FileModel(fileId, "", "", FileState.ERROR, url, metadata);
        getFileDatabase().addFile(file);
    }

    public static async queryRemoteForDuplicates(hash: string): Promise<boolean> {
        if (getWebDatabase().isConnected()) {
            //Check MD5 against database
            return await getWebDatabase().matchAny(hash);
        }
        return false;
    }

}