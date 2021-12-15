import {downloadPromise, IDownloader} from "@main/downloader/interfaces/IDownloader";
import {getEventsDispatcher, getGoogleAuth} from "@main/main";
import {gmail_v1, google} from "googleapis";
import {notificationPackage} from "@main/Events";
import log from "electron-log";
import {GmailUrlDecoder} from "@main/google/GmailUrlDecoder";
import Schema$MessagePart = gmail_v1.Schema$MessagePart;
import {FileUtils} from "@main/downloader/FileUtils";
import * as jetpack from "fs-jetpack";
const mime = require('mime');



export class GmailDownloader implements IDownloader {
    downloaderName: string = "Gmail Downloader";
    private gmailRegex = 'https?:\\/\\/mail.google.com\\/.*\\/(.*)';
    private gmail: gmail_v1.Gmail;

    constructor() {
        let auth = getGoogleAuth().getOauthClient();
        this.gmail = google.gmail({version: 'v1', auth });
        getEventsDispatcher().register(this.eventListener);
    }


    acceptsUrl(url: string): boolean {
        if(getGoogleAuth().isAuthorized()) {
            let regex = new RegExp(this.gmailRegex);
            return regex.test(url);
        }
        return false;
    }


    createdFilePostback(file): void {

    }


    async downloadUrl(url: string, stage: boolean): Promise<downloadPromise> {
        let threadId = new GmailUrlDecoder().parseFullUrl(url);
        if (threadId != null) {
            let path = this.preSetup(stage);

            await this.downloadFromGoogle(path, threadId);

            this.postSetup();

        }

        return Promise.resolve(undefined);
    }

    /**
     * Does any setup work, prior to the download taking place.
     * @param staging whether or not the path parameter should be put in the staging environment.
     * @return a newly computed path
     * @private
     */
    private preSetup(staging: boolean): string {
        let path = FileUtils.getFilePath(staging);
        return this.getNextFreeFolder(path);
    }

    public async downloadFromGoogle(path: string, threadId: string) {
        let googleResponse = await this.gmail.users.threads.get({id: threadId, userId: "me"});
        if(googleResponse.status == 200) {
            jetpack.write(path + "original_data.json", googleResponse.data);
            for (let msg of googleResponse.data.messages) {
                let message: Schema$MessagePart = msg.payload;
                if(message.body.size > 0) {
                    await this.handlePart(path, msg.id, message);
                } else {
                    for(let part of message.parts) {
                        await this.handlePart(path, msg.id, part);
                    }
                }
            }
        }
    }

    private postSetup() {

    }


    /**
     * While theoretically there could be multiple parts per MessagePart, into infinite recursion, we assume here that
     * we've hit the bottom most part, and can download valid data from the body/attachments.
     * @param path filepath (terminating in /) that the file should download into.
     * @param messageId the message id to download any valid attachments.
     * @param part the part to download / parse
     * @private
     */
    public async handlePart(path: string, messageId: string, part: Schema$MessagePart) {
        if(part.filename !== "") {
            if(part.body.attachmentId) {
                //let resp = await this.gmail.users.messages.attachments.get({id: part.body.attachmentId, messageId: messageId, userId: 'me'});
                // Download and save file.
            }
        } else {

            let buff = Buffer.from(part.body.data, 'base64');
            let text = buff.toString('utf-8');
            let ext = mime.getExtension(part.mimeType);
            jetpack.file(path + part.body.data.substr(-7).toUpperCase() + '.' + ext, {content: text});
        }
    }


    eventListener = (event: notificationPackage): void => {
        if(event.type == "settings_update" && event.data['settings'] == "googleapi") {
            log.info("[Google Downloader] Listener Called - Reloading Google Settings");
            if (getGoogleAuth().isAuthorized()) {
                let auth = getGoogleAuth().getOauthClient();
                this.gmail = google.gmail({version: 'v1', auth });
            }
        }
    }

    private getNextFreeFolder(baseDir: string): string {
        let folderNumber: number = 0;
        let initalDirectory;
        do {
            initalDirectory = baseDir + "email_" + folderNumber;
            folderNumber++;
        } while (jetpack.exists(initalDirectory) != false);
        return initalDirectory;
    }

    //https://cloud.google.com/appengine/docs/standard/php/mail/mail-with-headers-attachments

}