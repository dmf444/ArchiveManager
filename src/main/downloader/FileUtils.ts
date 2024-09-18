import {getFileDatabase, getSettingsManager, getWebDatabase} from "../main";
import {FileSaveSettings} from "../settings/FileSaveSettings";
import * as jetpack from "fs-jetpack";
import {FileUploadData} from "@main/file/FileUploadData";
import {FileState} from "@main/file/FileState";
import {FileModel} from "@main/file/FileModel";
import {InspectResult} from "fs-jetpack/types";
import * as path from "path";
const crypto = require('crypto');
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

    public static createNewErrorFileEntry(url: string): FileModel {
        let metadata: FileUploadData = FileUploadData.fromJson(null);
        let fileId: number = getFileDatabase().getNextFreeFileId();
        let file = new FileModel(fileId, "", "", FileState.ERROR, url, "", metadata);
        getFileDatabase().addFile(file);
        return file;
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
     * @param copyFile whether to copy the file or directly move it. defaults to moving.
     */
    public static moveFileToIngestion(file: FileModel, copyFile: boolean = false) {
        let stagingingPath: string = this.getProcessingPath();
        let oldFileName = file.fileName;
        file.fileName = this.renameFileIfExists(file.fileName, file.savedLocation);
        if(oldFileName != file.fileName) {
            file.savedLocation = file.savedLocation.replace(oldFileName, "") + file.fileName;
        }

        this.relocateFile(file.savedLocation, stagingingPath + file.fileName, copyFile);

    }

    private static relocateFile(currentFilePath: string, destinationFilePath: string, copyFile: boolean = false) {
        let fileSize = jetpack.inspect(currentFilePath).size;
        console.debug(`Importing file of size ${fileSize}`);
        if(fileSize < (1024 ** 3)) {
            if(copyFile) {
                jetpack.copy(currentFilePath, destinationFilePath);
            } else{
                jetpack.move(currentFilePath, destinationFilePath);
            }
        } else {
            let readStream = jetpack.createReadStream(currentFilePath);
            let writeStream = jetpack.createWriteStream(destinationFilePath);

            readStream.pipe(writeStream);
            readStream.on('end', () => {
                if(!copyFile) {
                    jetpack.remove(currentFilePath);
                }
            });
        }
    }

    public static moveFileByPath(absolutePath: string) {
        let stagingingPath: string = this.getProcessingPath();
        let index = absolutePath.lastIndexOf(path.sep);
        let fileName = absolutePath.slice(index + 1);
        log.info(fileName);
        fileName = this.renameFileIfExists(fileName, absolutePath);
        log.info(fileName);
        this.relocateFile(absolutePath, stagingingPath + fileName);
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

    public static async getFileHash(filePath: string): Promise<string> {
        //let result: InspectResult = jetpack.inspect(filePath, {checksum: "md5"});
        //log.info(result.md5);
        return await this.hashOfStream(filePath);
    }

    private static async hashOfStream(path): Promise<string> {
        //https://gist.github.com/F1LT3R/2e4347a6609c3d0105afce68cd101561
        return await new Promise((resolve, reject) => {
            const hash = crypto.createHash('md5')
            const rs = jetpack.createReadStream(path);
            rs.on('error', reject);
            rs.on('data', chunk => hash.update(chunk));
            rs.on('end', () => resolve(hash.digest('hex')));
        });
    }

}