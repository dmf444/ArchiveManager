import {getFileDatabase, getSettingsManager, getWebDatabase} from "../main";
import {FileSaveSettings} from "../settings/FileSaveSettings";
import * as jetpack from "fs-jetpack";
import {FileUploadData} from "@main/file/FileUploadData";
import {FileState} from "@main/file/FileState";
import {FileModel} from "@main/file/FileModel";
import {InspectResult} from "fs-jetpack/types";
import * as path from "path";

const log = require('electron-log');



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

    public static createNewFileEntry(filePath: string, fileName: string, url: string, isDuplicate: boolean, md5: string, isStaged: boolean): FileModel {
        let metadata = FileUtils.createDefaultMetadataEntry();
        let fileId: number = getFileDatabase().getNextFreeFileId();
        let firstState: FileState = isStaged ? FileState.NEW : FileState.ACCEPTED;
        let state: FileState = isDuplicate ? FileState.DUPLICATE : firstState;
        let file = new FileModel(fileId, fileName, filePath, state, url, md5, metadata);
        getFileDatabase().addFile(file);
        return file;
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
        return remoteAnswer || !getFileDatabase().isFileUnique(hash);
    }

    public static deletePhysicalFile(file: FileModel) {
        jetpack.remove(file.savedLocation);
    }

    /**
     * Moves a file from anywhere to the Ingestion (active) directory. This will rename the file if a file already exists with the same name
     *
     * NOTE: This function can change the file name! Make sure that after using it, you save the fileModel back to the database.
     * @param file file you wish to move
     */
    public static moveFileToIngestion(file: FileModel) {
        let stagingingPath: string = this.getProcessingPath();
        let oldFileName = file.fileName;
        file.fileName = this.renameFileIfExists(file.fileName, file.savedLocation);
        if(oldFileName != file.fileName) {
            file.savedLocation = file.savedLocation.replace(oldFileName, "") + file.fileName;
        }
        jetpack.move(file.savedLocation, stagingingPath + file.fileName);
    }

    public static moveFileByPath(absolutePath: string) {
        let stagingingPath: string = this.getProcessingPath();
        let index = absolutePath.lastIndexOf(path.sep);
        let fileName = absolutePath.slice(index + 1);
        log.info(fileName);
        fileName = this.renameFileIfExists(fileName, absolutePath);
        log.info(fileName);
        jetpack.move(absolutePath, stagingingPath + fileName);
        return stagingingPath + fileName;
    }

    private static renameFileIfExists(fileName: string, currentAbsolutePath: string,  destinationPath: string = FileUtils.getFilePath(false)): string {
        if(jetpack.exists(destinationPath + fileName) != false) {
            let fileNumber: number = 1;
            let fileNameSplit = fileName.split(".", 2);
            let newFileName = fileNameSplit[0] + "_" + fileNumber + "." + fileNameSplit[1];
            while (jetpack.exists(destinationPath + newFileName) != false) {
                fileNumber++;
                newFileName = fileNameSplit[0] + "_" + fileNumber + fileNameSplit[1];
            }

            jetpack.rename(currentAbsolutePath, newFileName);
            return newFileName;
        }
        return fileName;
    }

    public static getFileHash(filePath: string): string {
        let result: InspectResult = jetpack.inspect(filePath, {checksum: "md5"});
        return result.md5;
    }

}