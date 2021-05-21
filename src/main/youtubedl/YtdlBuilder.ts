import {getYoutubeDlManager} from "@main/main";

const path = require('path');
const { spawn } = require('child_process');

export class YtdlBuilder {

    private downloadUrl: string;
    private executeArgs: string[];
    private outputFormat: string;
    private outputPath: string;

    constructor(url: string) {
        this.downloadUrl = url;
        this.executeArgs = [];
        this.outputFormat = "%(title)s.%(ext)s";
        this.outputPath = null;
    }

    public downloadPlaylists(): YtdlBuilder {
        this.executeArgs.push("--yes-playlists");
        return this;
    }

    public randomizePlaylistDownloadOrder(): YtdlBuilder {
        this.executeArgs.push("--playlist-random");
        return this;
    }

    public reversePlaylistDownloadOrder(): YtdlBuilder {
        this.executeArgs.push("--playlist-reverse");
        return this;
    }

    public downloadJsonInfo(): YtdlBuilder {
        this.executeArgs.push("--write-info-json");
        return this;
    }

    public downloadAnnotations(): YtdlBuilder {
        this.executeArgs.push("--write-annotations");
        return this;
    }

    public downloadThumbnail(): YtdlBuilder {
        this.executeArgs.push("--write-thumbnail");
        return this;
    }

    public downloadAllThumbnails(): YtdlBuilder {
        this.executeArgs.push("--write-all-thumbnails");
        return this;
    }

    public downloadDescription(): YtdlBuilder {
        this.executeArgs.push("--write-description");
        return this;
    }

    public retryLimit(limit): YtdlBuilder {
        this.executeArgs.push("--retries", limit);
        return this;
    }

    public setOutputTemplate(template: string): YtdlBuilder {
        this.outputFormat = template;
        return this;
    }

    public setFilePath(filePath: string): YtdlBuilder {
        this.outputPath = filePath.endsWith(path.sep) ? filePath : filePath + path.sep;
        return this;
    }

    public normalizeFileNames(): YtdlBuilder {
        this.executeArgs.push("--restrict-filenames");
        return this;
    }

    public disableFileOverwriting(): YtdlBuilder {
        this.executeArgs.push("--no-overwrites");
        return this;
    }

    public rencodeToMp4(): YtdlBuilder {
        this.executeArgs.push('--recode-video mp4');
        return this;
    }


    //Authentication options. No intent to use them, but they're here; just in case!
    public authenticated(username: string, password: string): YtdlBuilder {
        this.executeArgs.push("--username", username, "--password", password);
        return this;
    }

    public useNetRcFile(): YtdlBuilder {
        this.executeArgs.push("--netrc");
        return this;
    }

    public async executeCommand(): Promise<number> {
        if (this.outputPath != null) {
            this.executeArgs.push("-o", this.outputPath + this.outputFormat);
        } else {
            this.executeArgs.push("-o", this.outputFormat);
        }
        this.executeArgs.push(this.downloadUrl);

        const youtubedl = spawn(getYoutubeDlManager().getFullApplicationPath(), this.executeArgs);

        return await new Promise((resolve, reject) => {
            youtubedl.on('close', resolve);
        });
    }

}