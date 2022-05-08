//https://github.com/yt-dlp/yt-dlp/releases/latest/download/SHA2-256SUMS
import {YtDownloader} from '@main/youtubedl/YtDownloader';


export class YoutubeDlpManager extends YtDownloader {

    constructor(basePath: string) {
        super(basePath, "ytdlp", "yt-dlp", "https://github.com/yt-dlp/yt-dlp/releases/latest/download/");
        this.checksumData = {
            type: "sha256",
            name: 'SHA2-256SUMS',
            len: 64
        }
    }

}
