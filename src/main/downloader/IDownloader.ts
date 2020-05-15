

interface IDownloader {

    /**
     * Localized name; should not look like programmer garbage.
     */
    downloaderName: string;


    acceptsUrl(url: string): boolean;


    downloadUrl(url: string, stage: boolean): void;

}