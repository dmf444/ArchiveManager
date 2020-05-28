import {DefaultDownloader} from "@main/downloader/DefaultDownloader";
import {FileUtils} from "@main/downloader/FileUtils";
import {getFileDatabase} from "@main/main";
import {FileModel} from "@main/file/FileModel";
import {FileState} from "@main/file/FileState";
import {YouTubeDownloader} from "@main/downloader/YouTubeDownloader";
import {sendError, sendSuccess} from "@main/NotificationBundle";

const log = require('electron-log');


export class FileManager {

    private downloaders: IDownloader[] = [];

    constructor() {
        this.downloaders.push(new YouTubeDownloader());
        //Alway add this as last downloader
        this.downloaders.push(new DefaultDownloader());
    }


    public downloadFile(url: string, stage: boolean) {
        for(let i = 0; i < this.downloaders.length; i++) {
            let downloader: IDownloader = this.downloaders[i];
            if(downloader.acceptsUrl(url)) {
                downloader.downloadUrl(url, stage).then((downloadPromise: downloadPromise) => {
                    let state = downloadPromise.state;
                    let filePathDir = downloadPromise.filePathDir;
                    let fileName = downloadPromise.fileName;
                    if(state == "completed") {
                        let filePath = filePathDir + fileName;

                        //Get file MD5
                        let hashCheck: string = downloadPromise.md5;
                        if (hashCheck == null) {
                            hashCheck = FileUtils.getFileHash(filePath);
                        }

                        FileUtils.queryForDuplicates(hashCheck).then((contains: boolean) => {
                            FileUtils.createNewFileEntry(filePath, fileName, url, contains, hashCheck, stage);
                            sendSuccess("Download Success!", `File ${fileName} was downloaded successfully!`);
                        });

                    } else {
                        FileUtils.createNewErrorFileEntry(url);
                        sendError("Download Failed!", `Unable to download ${url}`);
                    }
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
            if (downloadPromise.state == "completed") {
                let filePath = downloadPromise.filePathDir + downloadPromise.fileName;

                //Get file MD5
                let hashCheck: string = downloadPromise.md5;
                if (hashCheck == null) {
                    hashCheck = FileUtils.getFileHash(filePath);
                }

                FileUtils.queryForDuplicates(hashCheck).then((contains: boolean) => {
                    file.fileName = downloadPromise.fileName;
                    file.savedLocation = filePath;
                    file.md5 = hashCheck;
                    if(contains){
                        file.state = FileState.DUPLICATE;
                    }
                    getFileDatabase().updateFile(file);
                });

            } else {
                file.state = FileState.ERROR;
                getFileDatabase().updateFile(file);
            }
        });
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

    public moveFileToIngestById(id: number) {
        let file: FileModel = getFileDatabase().getFileById(id);
        log.info("File moved to Ingestion with id: " + file.id + " and name: " + file.fileName);
        FileUtils.moveFileToIngestion(file);
        file.savedLocation = FileUtils.getFilePath(false) + file.fileName;
        file.state = FileState.NORMAL;
        getFileDatabase().updateFile(file);
    }

}