
type downloadPromise = {
    state: string,
    fileName: string,
    filePathDir: string,
    md5?: string
}

interface IDownloader {

    /**
     * Localized name; should not look like programmer garbage.
     */
    downloaderName: string;


    acceptsUrl(url: string): boolean;


    //downloadUrl(url: string, stage: boolean, callbackFunction: (state: string, fileName: string, filePathDir: string, md5?: string) => void): void;

    downloadUrl(url: string, stage: boolean): Promise<downloadPromise>;

}