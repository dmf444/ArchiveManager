import * as jetpack from "fs-jetpack";
import {FileUtils} from "@main/downloader/FileUtils";
import {YtdlBuilder} from "@main/youtubedl/YtdlBuilder";
import {InspectResult} from "fs-jetpack/types";
const path = require('path');
const log = require('electron-log');
const AdmZip = require('adm-zip');

export class YouTubeDownloader implements IDownloader {
    downloaderName: string = "Video Downloader";

    acceptsUrl(url: string): boolean {
        let regex = new RegExp("https?:\\/\\/(www.)?youtu(\\.)?be(.com)?\\/(watch\\?v=)?");
        return regex.test(url);
    }

    downloadUrl(url: string, stage: boolean, callbackFunc: (state: string, fileName: string, filePathDir: string, md5?: string) => void): void {
        let initalDirectory = FileUtils.getFilePath(true) + "video_dl";
        log.info(initalDirectory);
        jetpack.dir(initalDirectory, {empty: true});

        log.info(`Now downloading video from ${url}`)
        let youtubeBuilder: YtdlBuilder = new YtdlBuilder(url);
        youtubeBuilder.setFilePath(initalDirectory).setOutputTemplate("%(title)s_%(id)s.%(ext)s").downloadThumbnail().downloadJsonInfo()
            .downloadDescription().downloadAnnotations().normalizeFileNames().executeCommand((code) => {
                if(code == 0) {
                    let fileNames: string[] = jetpack.list(initalDirectory);

                    let fileName: string = this.getVideoFileName(fileNames);
                    let md5: string = this.getMd5FromFile(initalDirectory + path.sep + fileName);

                    var zip = new AdmZip();
                    fileNames.forEach((dlFileName: string) => {
                        zip.addLocalFile(initalDirectory + path.sep + dlFileName);
                    });

                    let zipName: string = fileName.split('.')[0] + ".zip";
                    let zipSavePath: string = FileUtils.getFilePath(stage) + path.sep + zipName;
                    zip.writeZip(zipSavePath);


                    jetpack.remove(initalDirectory);
                    callbackFunc("completed", zipName, zipSavePath, md5);
                } else {
                    log.error("Failed to download video file!");

                    jetpack.remove(initalDirectory);
                    callbackFunc("error", "", "");
                }

        });
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

}