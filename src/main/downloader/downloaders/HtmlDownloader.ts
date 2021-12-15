import {downloadPromise, IDownloader} from "@main/downloader/interfaces/IDownloader";
import { FileUtils } from "@main/downloader/FileUtils";


export class HtmlDownloader implements IDownloader {

    downloaderName: string = "Webpage Downloader";
    private regex = 'https?:\\/\\/.*\.html';

    acceptsUrl(url: string): boolean {
        let regex = new RegExp(this.regex);
        return regex.test(url);
    }

    createdFilePostback(file): void {

    }

    downloadUrl(url: string, stage: boolean): Promise<downloadPromise> {
        FileUtils.getFilePath(true);
        return Promise.resolve(undefined);
    }

}