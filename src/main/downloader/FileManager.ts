import {DefaultDownloader} from "@main/downloader/DefaultDownloader";
import {FileUtils} from "@main/downloader/FileUtils";
import {getFileDatabase} from "@main/main";
import {FileModel} from "@main/file/FileModel";
import {FileState} from "@main/file/FileState";
import {InspectResult} from "fs-jetpack/types";
import * as jetpack from "fs-jetpack";
import DownloadItem = Electron.DownloadItem;

const log = require('electron-log');


export class FileManager {

    private downloaders: IDownloader[] = [];

    constructor() {

        //Alway add this as last downloader
        this.downloaders.push(new DefaultDownloader());
    }


    public downloadFile(url: string, stage: boolean) {
        for(let i = 0; i < this.downloaders.length; i++) {
            let downloader: IDownloader = this.downloaders[i];
            if(downloader.acceptsUrl(url)) {
                downloader.downloadUrl(url, stage,
                    (state: string, fileName: string, filePathDir: string) => {
                    if(state == "completed") {
                        //Get file MD5
                        let filePath = filePathDir + fileName;
                        let result: InspectResult = jetpack.inspect(filePath, {checksum: "md5"});
                        log.info("[FileDownloaded] Success with MD5:" + result['md5']);
                        FileUtils.queryForDuplicates(result['md5']).then((contains: boolean) => {
                            FileUtils.createNewFileEntry(filePath, fileName, url, contains, result['md5'], stage);
                        });

                    } else {
                        FileUtils.createNewErrorFileEntry(url);
                    }
                });
                break;
            }
        }
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