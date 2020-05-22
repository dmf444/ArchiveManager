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

    public static createNewFileEntry(filePath: string, fileName: string, url: string, isDuplicate: boolean, md5: string, isStaged: boolean) {
        let metadata = FileUtils.createDefaultMetadataEntry();
        let fileId: number = getFileDatabase().getNextFreeFileId();
        let firstState: FileState = isStaged ? FileState.NEW : FileState.ACCEPTED;
        let state: FileState = isDuplicate ? FileState.DUPLICATE : firstState;
        let file = new FileModel(fileId, fileName, filePath, state, url, md5, metadata);
        getFileDatabase().addFile(file);
    }

    public static createNewErrorFileEntry(url: string) {
        let metadata: FileUploadData = FileUploadData.fromJson(null);
        let fileId: number = getFileDatabase().getNextFreeFileId();
        let file = new FileModel(fileId, "", "", FileState.ERROR, url, "", metadata);
        getFileDatabase().addFile(file);
    }

    public static async queryForDuplicates(hash: string): Promise<boolean> {
        let remoteAnswer: boolean = false;
        if (getWebDatabase().isConnected()) {
            //Check MD5 against database
            remoteAnswer = await getWebDatabase().matchAny(hash);
        }
        return !(remoteAnswer && getFileDatabase().isFileUnique(hash));
    }

    public static deletePhysicalFile(file: FileModel) {
        jetpack.remove(file.savedLocation);
    }

    public static moveFileToIngestion(file: FileModel) {
        let stagingingPath: string = this.getProcessingPath();
        if(jetpack.exists(stagingingPath + file.fileName) != false){
            jetpack.rename(file.savedLocation, "1_" + file.fileName);
            file.fileName = "1_" + file.fileName;
        }
        jetpack.move(file.savedLocation, stagingingPath + file.fileName);
    }

}