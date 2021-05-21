import * as jetpack from "fs-jetpack";
import {FileUtils} from "@main/downloader/FileUtils";
import {YtdlBuilder} from "@main/youtubedl/YtdlBuilder";
import {InspectResult} from "fs-jetpack/types";
import {FileModel} from "@main/file/FileModel";
import {getFileDatabase} from "@main/main";
const path = require('path');
const log = require('electron-log');
const AdmZip = require('adm-zip');

export class YouTubeDownloader implements IDownloader {
    downloaderName: string = "Youtube Downloader";

    acceptsUrl(url: string): boolean {
        let regex = new RegExp("https?:\\/\\/(www.)?youtu(\\.)?be(.com)?\\/(watch\\?v=)?");
        return regex.test(url);
    }

    async downloadUrl(url: string, stage: boolean): Promise<downloadPromise> {
        let initalDirectory = this.getNextFreeFolder();
        log.info(initalDirectory);
        jetpack.dir(initalDirectory, {empty: true});

        log.info(`Now downloading video from ${url}`)
        let youtubeBuilder: YtdlBuilder = new YtdlBuilder(url);
        let responseCode: number = await youtubeBuilder.setFilePath(initalDirectory).setOutputTemplate("%(title)s_%(id)s.%(ext)s")
            .downloadThumbnail().downloadJsonInfo().downloadDescription().downloadAnnotations().normalizeFileNames().executeCommand();

        let downloadPromise: downloadPromise;
        if (responseCode == 0) {
            let fileNames: string[] = jetpack.list(initalDirectory);
            let videoFileName: string = this.getVideoFileName(fileNames);
            let md5: string = this.getMd5FromFile(initalDirectory + path.sep + videoFileName);

            let [zipName, zipBasePath] = this.zipFiles(fileNames, videoFileName, initalDirectory, stage);


            log.info("Video Downloaded!");
            downloadPromise = {state: "completed", fileName: zipName, filePathDir: zipBasePath, md5: md5};
        } else {
            log.error("Failed to download video file!");
            downloadPromise = {state: "error", fileName: "", filePathDir: ""};
        }

        jetpack.remove(initalDirectory);
        return downloadPromise;
    }

    private getVideoFileName(files: string[]): string {
        let name = "";
        files.forEach((fileName: string) => {
            if(!(fileName.endsWith(".json") || fileName.endsWith(".description") || fileName.endsWith(".jpeg") || fileName.endsWith(".jpg") || fileName.endsWith(".gif") || fileName.endsWith(".png"))) {
               name = fileName;
            }
        });
        return name;
    }

    private getMd5FromFile(fullFilePath: string): string {
        let result: InspectResult = jetpack.inspect(fullFilePath, {checksum: "md5"});
        return result.md5;
    }

    private getNextFreeFolder(): string {
        let folderNumber: number = 0;
        let initalDirectory = FileUtils.getFilePath(true) + "video_dl_" + folderNumber;
        while(jetpack.exists(initalDirectory) != false) {
            folderNumber++;
            initalDirectory = FileUtils.getFilePath(true) + "video_dl_" + folderNumber;
        }
        return initalDirectory;
    }

    private zipFiles(fileNames: string[], videoFileName: string, initalDirectory: string, stage: boolean) {
        var zip = new AdmZip();
        fileNames.forEach((dlFileName: string) => {
            zip.addLocalFile(initalDirectory + path.sep + dlFileName);
        });

        let zipBasePath: string = FileUtils.getFilePath(stage);
        let lastDot: number = videoFileName.lastIndexOf(".");
        let zipName: string = videoFileName.substring(0, lastDot) + ".zip";
        let zipSavePath: string = zipBasePath + path.sep + zipName;
        zip.writeZip(zipSavePath);
        return [zipName, zipBasePath];
    }

    private getJsonFileFromZip(fileLocation: string): boolean {
        let zip = new AdmZip(fileLocation);
        let entries = zip.getEntries();
        let searchEntry = null;
        entries.forEach(zipEntry => {
           if(zipEntry.name.endsWith(".json")) {
               searchEntry = zipEntry;
           }
        });
        if(searchEntry !== null) {
            zip.extractEntryTo(searchEntry.entryName, FileUtils.getFilePath(true), false, true);
            return searchEntry.name;
        }
        return false;
    }

    public createdFilePostback(file: FileModel): void {
        let zipName = this.getJsonFileFromZip(file.savedLocation);
        log.info(zipName);
        if(zipName !== false){
            let jsonFilePath = FileUtils.getFilePath(true) + zipName;
            let videoJson = jetpack.read(jsonFilePath, 'json');

            let archivesJson = {
                "original_url": videoJson['webpage_url'],
                "description": "",
                "copyright": "",
                "upload_date": videoJson['upload_date'],
                "video_description": videoJson['description'],
                "channel_name": videoJson['channel'],
                "channel_url": videoJson['uploader_url'],
                "original_tags": videoJson['tags']
            };
            let description = JSON.stringify(archivesJson);
            file.fileMetadata.descriptionVersion = "2.1.0";
            file.fileMetadata.description = description;
            getFileDatabase().updateFile(file);

            jetpack.remove(jsonFilePath);
        }
    }

}