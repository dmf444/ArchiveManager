import {DefaultDownloader} from "@main/downloader/downloaders/DefaultDownloader";
import {FileUtils} from "@main/downloader/FileUtils";
import {getFileDatabase} from "@main/main";
import {FileModel} from "@main/file/FileModel";
import {FileState} from "@main/file/FileState";
import {YouTubeDownloader} from "@main/downloader/downloaders/YouTubeDownloader";
import {sendError, sendSuccess} from "@main/NotificationBundle";
import {downloadPromise, IDownloader} from "@main/downloader/interfaces/IDownloader";
import {STATE} from "@main/downloader/interfaces/State";
import {GoogleDriveDownloader} from "@main/downloader/downloaders/GoogleDriveDownloader";
import {GmailDownloader} from "@main/downloader/downloaders/GmailDownloader";
import {YtdlpDownloader} from '@main/downloader/downloaders/YtdlpDownloader';

const log = require('electron-log');


export class FileManager {

    private downloaders: IDownloader[] = [];

    constructor() {
        this.downloaders.push(new YtdlpDownloader());
        this.downloaders.push(new GoogleDriveDownloader());
        this.downloaders.push(new GmailDownloader());
        //Alway add this as last downloader
        this.downloaders.push(new DefaultDownloader());
    }


    public downloadFile(url: string, stage: boolean) {
        for(let i = 0; i < this.downloaders.length; i++) {
            let downloader: IDownloader = this.downloaders[i];
            if(downloader.acceptsUrl(url)) {
                downloader.downloadUrl(url, stage).then((downloadPromise: downloadPromise) => {
                    log.warn(downloadPromise);
                    this.downloadFileCallback(downloadPromise, downloader, url, stage);
                });
                break;
            }
        }
    }


    public redownloadFile(file: FileModel, downloaderName: string) {
        let downloader: IDownloader = this.downloaders.slice(-1)[0];
        this.downloaders.forEach((registeredDownloaders: IDownloader) => {
            if (registeredDownloaders.downloaderName === downloaderName) {
                downloader = registeredDownloaders;
            }
        });

        let staged:boolean = file.savedLocation.startsWith(FileUtils.getFilePath(true));

        downloader.downloadUrl(file.url, staged).then((downloadPromise: downloadPromise) => {
            this.downloadFileCallback(downloadPromise, downloader, file.url, staged, file);
        });
    }

    private downloadFileCallback(uploadResults: downloadPromise, downloader: IDownloader, url: string, stage: boolean, fileModel: FileModel = null) {
        let state = uploadResults.state;
        log.warn("Promise Resolved Caller: " + uploadResults.multiItem);
        if(state == STATE.SUCCESS) {
            let webUrl = uploadResults.url != null ? uploadResults.url : url;
            this.singleDownloadCallback(uploadResults, downloader, webUrl, stage, fileModel);

        } else if(state == STATE.MULTIPLE && uploadResults.multiItem != null) {

            uploadResults.multiItem.forEach((downloadData: downloadPromise) => {
                log.warn("Calling Each");
                if(downloadData.state == STATE.FAILED){
                    const fileModel = FileUtils.createNewErrorFileEntry(downloadData.url);
                    downloader.createdFilePostback(fileModel);
                    sendError("Download Failed!", `Unable to download ${downloadData.url}`);
                    return;
                }
                let webUrl = downloadData.url != null ? downloadData.url : url;
                this.singleDownloadCallback(downloadData, downloader, webUrl, stage, fileModel);
            });

        } else {
            if(fileModel != null) {
                fileModel.state = FileState.ERROR;
                getFileDatabase().updateFile(fileModel);
            } else {
                FileUtils.createNewErrorFileEntry(url);
            }
            sendError("Download Failed!", `Unable to download ${url}`);
        }
    }

    private singleDownloadCallback(uploadResults: downloadPromise, downloader: IDownloader, url: string, stage: boolean, fileModel: FileModel = null) {
        let filePathDir = uploadResults.filePathDir;
        let fileName = uploadResults.fileName;
        let filePath = filePathDir + fileName;

        //Get file MD5
        let hashCheck: string = uploadResults.md5;
        if (hashCheck == null) {
            hashCheck = FileUtils.getFileHash(filePath);
        }

        FileUtils.queryForDuplicates(hashCheck).then((contains: boolean) => {
            if(fileModel != null) {
                fileModel.fileName = uploadResults.fileName;
                fileModel.savedLocation = filePath;
                fileModel.md5 = hashCheck;
                if(contains){
                    fileModel.state = FileState.DUPLICATE;
                }
                getFileDatabase().updateFile(fileModel);
            } else {
                let file = FileUtils.createNewFileEntry(filePath, fileName, url, contains, hashCheck, stage);
                downloader.createdFilePostback(file);
            }
            sendSuccess("Download Success!", `File ${fileName} was downloaded successfully!`);
        });
    }

    public addFileFromLocal(filePath: string, fileName: string, copyFile: boolean = false) {
        if(!filePath.includes(FileUtils.getFilePath(true)) && !filePath.includes(FileUtils.getFilePath(false))){

            let hashCheck: string = FileUtils.getFileHash(filePath);
            FileUtils.queryForDuplicates(hashCheck).then((contains: boolean) => {
                let file = FileUtils.createNewFileEntry(filePath, fileName, '', contains, hashCheck, false);
                this.moveFileToIngest(file, false, copyFile);
                sendSuccess("Download Success!", `File ${fileName} was downloaded successfully!`);
            });
        }
    }

    public getDownloaders(): string[] {
        let loaders: string[] = [];
        this.downloaders.forEach((downloader: IDownloader) => {
            loaders.push(downloader.downloaderName);
        });
        return loaders;
    }

    public removeFileById(id: number) {
        let file: FileModel = getFileDatabase().getFileById(id);
        log.info("Deleting file with id: " + file.id + " and name: " + file.fileName);
        FileUtils.deletePhysicalFile(file);
        getFileDatabase().removeFile(file);
    }


    public moveFileToIngest(file: FileModel, updateState: boolean, copyFile: boolean = false) {
        log.info("File moved to Ingestion with id: " + file.id + " and name: " + file.fileName);
        FileUtils.moveFileToIngestion(file, copyFile);
        file.savedLocation = FileUtils.getFilePath(false) + file.fileName;
        if(updateState){
            file.state = FileState.NORMAL;
        }
        getFileDatabase().updateFile(file);
    }

}
