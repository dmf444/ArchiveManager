

interface IDownloader {

    /**
     * Localized name; should not look like programmer garbage.
     */
    downloaderName: string;


    acceptsUrl(url: string): boolean;


    downloadUrl(url: string, stage: boolean, callbackFunction: (state: string, fileName: string, filePathDir: string) => void): void;

}