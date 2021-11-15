import { drive_v3, google } from "googleapis";
import {getEventsDispatcher, getGoogleAuth, reloadDiscordBot} from "@main/main";
import {notificationPackage} from "@main/Events";
import log from "electron-log";
import * as jetpack from "fs-jetpack";
import {FileUtils} from "@main/downloader/FileUtils";
import {Readable} from "stream";



export class GoogleDriveDownloader implements IMultipleDownloader {

    downloaderName: string = "Google Drive Downloader";
    private regex: string = "https?:\\/\\/drive.google.com\\/.*(folders|d)\\/(.+?)(\\/|\\?|$)";
    private drive: drive_v3.Drive;
    private files = [];


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

    createdFilePostback(file): void {}

    async downloadUrl(url: string, stage: boolean): Promise<downloadPromise> {
        let parts = url.match(this.regex);
        let id = parts[2];
        let filePathDir = FileUtils.getFilePath(stage);
        if (url.includes('folders')) {
            this.files = [];
            log.warn("starting");
            this.listFiles(id, filePathDir);
        } else {
            let response = await this.drive.files.get({fileId: id, fields: 'originalFilename'});
            await this.downloadFile(id, filePathDir + response.data.originalFilename);
        }
        return Promise.resolve({state: 'fail', fileName: '', filePathDir: ''});
    }


    private async downloadFile(fileId: string, savePath: string) {
        let fileData = await this.drive.files.get({fileId: fileId, alt: "media"}, {responseType: 'stream'});

        const streamContent = fileData.data as Readable;
        const destination = jetpack.createWriteStream(savePath);
        streamContent.pipe(destination);
    }


    /**
     * Lists the names and IDs of up to 10 files.
     */
    private listFiles(id: string, savePath: string, nextToken=null) {
        let params = {pageSize: 10, q: `'${id}' in parents`, fields: 'nextPageToken, files(id, name, originalFilename, md5Checksum)'};
        if(nextToken != null) {
            params['pageToken'] = nextToken;
        }

        this.drive.files.list(params, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const files = res.data.files;
            if (files.length) {
                files.map((file) => {
                    console.log(`${file.name} (${file.id})`);
                    this.downloadFile(file.id, savePath + file.originalFilename).then(() => {
                        this.files.push({name: file.name, originalName: file.originalFilename, md5: file.md5Checksum});
                    });
                });
                if(res.data.nextPageToken != null) {
                    this.listFiles(id, savePath, res.data.nextPageToken);
                }
            }
        });
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

    handleMultifileDownload() {

    }

}

/*
https://drive.google.com/drive/u/0/folders/17MJLxr-D-Zc-amgelX0bEwiTPWkJF2LY
https://drive.google.com/file/d/1hU6VkI5Q2CLSsQBORyBqEowSogEnUt_A/view?usp=sharing
https://drive.google.com/drive/folders/17MJLxr-D-Zc-amgelX0bEwiTPWkJF2LY?usp=sharing
 */