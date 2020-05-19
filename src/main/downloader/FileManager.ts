import {DefaultDownloader} from "@main/downloader/DefaultDownloader";


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
                downloader.downloadUrl(url, stage);
                break;
            }
        }
    }

}