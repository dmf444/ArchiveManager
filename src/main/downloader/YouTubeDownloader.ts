
export class YouTubeDownloader implements IDownloader {
    downloaderName: string = "Video Downloader";

    acceptsUrl(url: string): boolean {
        let regex = new RegExp("https?:\\/\\/(www.)?youtu(\\.)?be(.com)?\\/(watch\\?v=)?");
        return regex.test(url);
    }

    downloadUrl(url: string, stage: boolean, callbackFunc: (state: string, fileName: string, filePathDir: string) => void): void {
    }

}