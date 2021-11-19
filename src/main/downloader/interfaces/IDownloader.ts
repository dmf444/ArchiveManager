import {STATE} from "@main/downloader/interfaces/State";


export type downloadPromise = {
    state: STATE,
    fileName: string,
    filePathDir: string,
    md5?: string,
    url?: string,
    multiItem?: downloadPromise[]
}

export interface IDownloader {

    /**
     * Localized name; should not look like programmer garbage.
     */
    downloaderName: string;

    /**
     * Used to verify the Input URL.
     * If this returns true, then the given download can handle this url.
     * @param url string URI that points to an external resource location.
     */
    acceptsUrl(url: string): boolean;



    downloadUrl(url: string, stage: boolean): Promise<downloadPromise>;

    /**
     *
     * @param file FileModel the created file, for allowing changes to data.
     */
    createdFilePostback(file): void;

    
}