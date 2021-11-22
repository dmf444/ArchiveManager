import {downloadPromise, IDownloader} from "@main/downloader/interfaces/IDownloader";
import {getGoogleAuth} from "@main/main";


export class GmailDownloader implements IDownloader {
    downloaderName: string = "Gmail Downloader";
    private gmailRegex = 'https?:\\/\\/mail.google.com\\/.*\\/(.*)';


    acceptsUrl(url: string): boolean {
        if(getGoogleAuth().isAuthorized()) {
            let regex = new RegExp(this.gmailRegex);
            return regex.test(url);
        }
        return false;
    }

    createdFilePostback(file): void {
    }

    downloadUrl(url: string, stage: boolean): Promise<downloadPromise> {
        return Promise.resolve(undefined);
    }

}