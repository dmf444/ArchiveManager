import {downloadPromise, IDownloader} from "@main/downloader/interfaces/IDownloader";
import {getEventsDispatcher, getFileDatabase, getGoogleAuth} from "@main/main";
import {gmail_v1, google} from "googleapis";
import {notificationPackage} from "@main/Events";
import log from "electron-log";
import {GmailUrlDecoder} from "@main/google/GmailUrlDecoder";
import Schema$MessagePart = gmail_v1.Schema$MessagePart;
import {FileUtils} from "@main/downloader/FileUtils";
import * as jetpack from "fs-jetpack";
import fetch from 'node-fetch';
import http from 'http';
import https from 'https';
import {STATE} from "@main/downloader/interfaces/State";
import * as path from "path";
import {FileModel} from "@main/file/FileModel";
const mime = require('mime');
const AdmZip = require('adm-zip');



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


    async createdFilePostback(file: FileModel | string): Promise<void> {
        log.info(file)
        if (typeof file === "string") {
            await this.removeTempFolders(file);
        } else if(file.fileName.endsWith(".html")) {
            const folderPath = file.savedLocation.substring(0, file.savedLocation.lastIndexOf(path.sep) + 1);
            let jsonFilePath = folderPath + "original_data.json";
            let emailJson = jetpack.read(jsonFilePath, 'json');

            let headers = emailJson["messages"][0]["payload"]["headers"];
            let date = Date.parse(this.parseData("Date", headers));
            let description = {
                "description": "",
                "date": !isNaN(date) ? date : "0",
                "from": this.parseData("From", headers),
                "subject": this.parseData("Subject", headers),
                "snippet": emailJson["messages"][0]["snippet"],
                "labels": emailJson["messages"][0]["labelIds"]
            };

            let descriptionFinal = JSON.stringify(description);
            file.fileMetadata.descriptionVersion = "5.1.0";
            file.fileMetadata.description = descriptionFinal;
        }
    }

    private parseData(keyTag: string, values: any) {
        for(let data of values) {
            if(data.name == keyTag) {
                return data.value;
            }
        }
        return "";
    }

    private async removeTempFolders(path: string, depth = 0) {
        if (jetpack.exists(path) !== false && depth < 2) {
            try {
                await this.sleep(2000);
                jetpack.remove(path);
            } catch (e) {
                log.warn(`Attempt to remove temporary folder failed. ${path}`);
                await this.sleep(1000);
                await this.removeTempFolders(path, depth + 1);
            }
        }
    }

    private async sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }


    async downloadUrl(url: string, stage: boolean): Promise<downloadPromise> {
        let threadId = new GmailUrlDecoder().parseFullUrl(url);
        if (threadId != null) {
            let path = this.preSetup(stage);

            await this.downloadFromGoogle(path, threadId);

            const tree = jetpack.inspectTree(path);

            return { state: STATE.GROUP, fileName: '', filePathDir: path, multiItem: this.treeCollapse(tree, path) };
        }

        return {state: STATE.FAILED, fileName: '', filePathDir: ''};
    }

    private treeCollapse(treeInspect, rootPath): downloadPromise[] {
        const files = [];

        if(treeInspect.children.length > 0) {
            treeInspect.children.forEach((child) => {
               if(child.type == 'file') {
                   files.push({ fileName: child.name, filePathDir: `${rootPath}${child.name}`})
               } else {
                   files.push(this.treeCollapse(child, `${rootPath}${child.name}${path.sep}`));
               }
            });
        }

        return files;
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
        } else {
            log.error("ERROR: " + googleResponse.status);
        }
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
                let resp = await this.gmail.users.messages.attachments.get({id: part.body.attachmentId, messageId: messageId, userId: 'me'});

                // Download and save file.
                if(resp.data.data) {
                    let attachBuffer = Buffer.from(resp.data.data, 'base64');
                    let name = part.filename;
                    if(!name.includes(".")) {
                        name = `${name}.${mime.getExtension(part.filename)}`;
                    }

                    jetpack.file(path + name, {content: attachBuffer});
                }
            }
        } else {

            let buff = Buffer.from(part.body.data, 'base64');
            let text = buff.toString('utf-8');

            let title = part.body.data.substr(-7).toUpperCase();
            if(part.mimeType == mime.getType('html')) {
                text = await this.parseHtmlPage(text, path);
                title = `root-${title}`;
            }

            let ext = mime.getExtension(part.mimeType);
            jetpack.file(path + title + '.' + ext, {content: text});
        }
    }

    /**
     * If any part of the Message is an HTML document, we need to preserve it for posterity.
     * Running a simple URL Regex, find any URLs, call the endpoint, and download it to disk.
     *
     * Replace the original content of the email with references to the downloaded content.
     * @param htmlContent from google's api, the MessagePart decoded content
     * @param path the download path for the files
     * @private
     */
    private async parseHtmlPage(htmlContent: string, path: string): Promise<string> {
        //HTML LINKs
        let regex = new RegExp('(https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s^\"^<>\']{2,}|www\\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s^\"<>^\']{2,}|https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9]+\\.[^\\s^\"^\']{2,}|www\\.[a-zA-Z0-9]+\\.[^\\s^\"<>^\']{2,})', 'gi')
        let urls = htmlContent.match(regex);

        let data = {};

        for(const url of urls) {
            if(!url.startsWith("http") || url in data) { continue; }
            let response = await this.connectForDownload(url, path);
            if(response != null) {
                data[url] = response[1];
            }
        }

        //TODO: An email should never have a relative link in content, only a CID. This should be implemented however for the site downloader.
        //Relative Link
        //\.\.?\/[^\n"?:*<>|]+\.[A-z0-9]+

        for(let [url, repVal] of Object.entries(data)) {
            htmlContent = htmlContent.replace(url, "./" + repVal);
        }

        return Promise.resolve(htmlContent);
    }

    async connectForDownload(url: string, path: string): Promise<[string, string]> {
        const agentSSL = new https.Agent({rejectUnauthorized: false});
        const agent = new http.Agent();
        try {
            let connection = await fetch(url, {
                redirect: 'follow',
                follow: 20,
                headers: {
                    'Accept-Encoding': "*"
                },
                agent: (parsedUrl => {
                    if(parsedUrl.protocol === "http:"){
                        return agent
                    }
                    return agentSSL;
                })
            });

            if (connection.headers.has('content-type') && !connection.headers.get('content-type').includes(mime.getType('html'))) {
                let fileName = (Math.random() + 1).toString(36).substring(3);
                if(connection.headers.has('content-disposition')) {
                    let contentDispo: string = connection.headers.get('content-disposition');
                    let searchResult = contentDispo.search("filename=");
                    if(searchResult > -1){
                        let wordstart = searchResult + 9;
                        let uncleanName = contentDispo.substring(wordstart);
                        fileName = contentDispo.substring(wordstart, wordstart + uncleanName.lastIndexOf("."));

                    }
                }
                let ext = mime.getExtension(connection.headers.get('content-type'));
                let fullName = fileName + "." + ext;

                let fileStream = jetpack.createWriteStream(path + fullName);
                connection.body.pipe(fileStream);

                await new Promise((resolve, reject) => {
                   fileStream.on("close", () => {
                       log.info(fullName, url, fileStream.bytesWritten);
                       resolve();
                   });
                });

                return [url, fullName];
            }

        } catch (e) {
            log.warn(e);
        }
        return null;
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
        return initalDirectory + path.sep;
    }

}