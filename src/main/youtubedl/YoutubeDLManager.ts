//https://yt-dl.org/downloads/latest/youtube-dl.exe
import {YtDownloader} from '@main/youtubedl/YtDownloader';


export class YoutubeDLManager extends YtDownloader {

    constructor(basePath: string) {
        super(basePath, "youtubedl", "youtube-dl", "https://yt-dl.org/downloads/latest/");
        this.checksumData = {
            type: "md5",
            name: 'MD5SUMS',
            len: 32
        }
    }

}
