import { drive_v3, google } from "googleapis";
import {getEventsDispatcher, getFileDatabase, getGoogleAuth} from "@main/main";
import {notificationPackage} from "@main/Events";
import log from "electron-log";
import * as jetpack from "fs-jetpack";
import {FileUtils} from "@main/downloader/FileUtils";
import {Readable} from "stream";
import {downloadPromise, IDownloader} from "@main/downloader/interfaces/IDownloader";
import {STATE} from "@main/downloader/interfaces/State";
import {file} from "fs-jetpack";



export class GoogleDriveDownloader implements IDownloader {

    downloaderName: string = "Google Drive Downloader";
    private regex: string = "https?:\\/\\/drive.google.com\\/.*(folders|d)\\/(.+?)(\\/|\\?|$)";
    private drive: drive_v3.Drive;
    private files: downloadPromise[] = [];
    private overrides = [];


    constructor() {
        let auth = getGoogleAuth().getOauthClient();
        this.drive = google.drive({version: 'v3', auth});
        getEventsDispatcher().register(this.eventListener);
    }

    acceptsUrl(url: string): boolean {
        if(getGoogleAuth().isAuthorized()) {
            let regex = new RegExp(this.regex);
            return regex.test(url);
        }
        return false;
    }

    createdFilePostback(file): void {
        if(this.overrides.includes(file.url)){
            file.fileMetadata.setLocalName(this.overrides[file.url]);
            getFileDatabase().updateFile(file);
        }
    }

    async downloadUrl(url: string, stage: boolean): Promise<downloadPromise> {
        let parts = url.match(this.regex);
        let id = parts[2];
        let filePathDir = FileUtils.getFilePath(stage);
        if (url.includes('folders')) {
            this.files = [];
            this.overrides = [];
            log.warn("starting");
            let response = await this.listFiles(id, filePathDir);
            log.warn("RESP: " + response);
            if(response) {
                return {state: STATE.MULTIPLE, fileName: '', filePathDir: '', multiItem: this.files};
            }
            log.warn("complete!" + this.files);
        } else {
            let response = await this.drive.files.get({fileId: id, fields: 'originalFilename'});
            let complete = await this.downloadFile(id, filePathDir + response.data.originalFilename);
            if(complete) {
                return {state: STATE.SUCCESS, fileName: response.data.originalFilename, filePathDir: filePathDir};
            }
        }
        return {state: STATE.FAILED, fileName: '', filePathDir: ''};
    }


    private async downloadFile(fileId: string, savePath: string): Promise<boolean> {
        let fileData = await this.drive.files.get({fileId: fileId, alt: "media"}, {responseType: 'stream'});
        if(fileData.status == 200) {
            const streamContent = fileData.data as Readable;
            const destination = jetpack.createWriteStream(savePath);
            streamContent.pipe(destination);
            return true;
        }
        return false;
    }


    /**
     * Lists upto 10 files in a given directory. Downloads all files and cycles until all have been downloaded.
     */
    private async listFiles(id: string, savePath: string, nextToken=null) {
        let params = {pageSize: 10, q: `'${id}' in parents`, fields: 'nextPageToken, files(id, name, originalFilename, md5Checksum, webContentLink)'};
        if(nextToken != null) {
            params['pageToken'] = nextToken;
        }

        let list = await this.drive.files.list(params);
        if(list.status !== 200) return console.log('The API returned an error: ' + list.statusText);

        const files = list.data.files;
        if (files.length) {
            for (const file of files) {

                //console.log(`${file.name} (${file.id})`);

                let success = await this.downloadFile(file.id, savePath + file.originalFilename);

                if(success){
                    this.files.push({state: STATE.SUCCESS, fileName: file.originalFilename, filePathDir: savePath, url: file.webContentLink, md5: file.md5Checksum});
                    this.overrides[file.webContentLink] = file.name;
                } else {
                    this.files.push({state: STATE.FAILED, fileName: file.originalFilename, filePathDir: '', url: file.webContentLink, md5: file.md5Checksum});
                    this.overrides[file.webContentLink] = file.name;
                }

            }

            if(list.data.nextPageToken != null) {
                await this.listFiles(id, savePath, list.data.nextPageToken);
            }
        }

        return true;
    }

    eventListener = (event: notificationPackage): void => {
        if(event.type == "settings_update" && event.data['settings'] == "googleapi") {
            log.info("[Google Downloader] Listener Called - Reloading Google Settings");
            if (getGoogleAuth().isAuthorized()) {
                let auth = getGoogleAuth().getOauthClient();
                this.drive = google.drive({version: 'v3', auth });
            }
        }
    }

}

/*
https://drive.google.com/drive/u/0/folders/17MJLxr-D-Zc-amgelX0bEwiTPWkJF2LY
https://drive.google.com/file/d/1hU6VkI5Q2CLSsQBORyBqEowSogEnUt_A/view?usp=sharing
https://drive.google.com/drive/folders/17MJLxr-D-Zc-amgelX0bEwiTPWkJF2LY?usp=sharing
 */