import {FileModel} from '@main/file/FileModel';
import * as fs from 'fs';
import {getDescriptionReader, getFileDatabase, getFileManager, getMainWindow, getSettingsManager} from "@main/main";
import {UploadSettings} from "@main/settings/UploadSettings";
import RemoteServerApi, {UploadType} from "@main/api/RemoteServerApi";
import {UploadResultStatusType} from "@main/database/LocalDatabase";
import { WretchError } from 'wretch/resolver';
const log = require('electron-log');

export class FileUploader {
    protected file: FileModel;
    protected _settings: UploadSettings;
    protected remoteServerApi: RemoteServerApi;

    constructor(file: FileModel, remoteApi: RemoteServerApi) {
        this.file = file;
        this._settings = <UploadSettings>getSettingsManager().getSettings("upload");
        this.remoteServerApi = remoteApi;
    }

    public async upload() {

        log.debug("Building standard payload.");
        let fileMetadata = this.file.fileMetadata;
        const form: UploadType = {
            save_name: fileMetadata.localizedName ?? this.file.fileName,
            container: fileMetadata.container,
            description: this.completeJson(this.file.fileMetadata.description, this.file.fileMetadata.descriptionVersion),
            desc_version: fileMetadata.descriptionVersion,
            page_count: !fileMetadata.descriptionVersion.startsWith("1") ? (fileMetadata.pageCount ?? "null") : undefined,
            date: fileMetadata.date ?? "",
            restriction: fileMetadata.restrictions,
            tags: fileMetadata.tags,
            group_id: this.getGroup()
        };

        log.debug("Loading files.");
        if (this.file.savedLocation != null) {
            form.original_file = { file_data: fs.createReadStream(this.file.savedLocation), file_title: this.file.fileName };
        }
        if (fileMetadata.extraFile != null && fileMetadata.extraFile !== "") {
            form.cached_file = fs.createReadStream(this.file.fileMetadata.extraFile);
        }
        if (fileMetadata.coverImage != null && fileMetadata.coverImage !== "") {
            form.custom_preview = fs.createReadStream(this.file.fileMetadata.coverImage);
        }
        log.debug("Loading files complete.");


        log.debug("POSTING.");
        try{
            let data = await this.remoteServerApi.uploadFile(form);
            this.parseResults(data);
        } catch(e) {
            if(e instanceof WretchError) {
                this.parseResults({success: false, message: "Failed HTTP send, see logs for details - " + e.status});
                log.error('Upload Request Failed', e.url, e.message, e.text, e.status);
                log.error(e.stack);
                return;
            }
            log.error("Parse Request Failed", e);
        }
    }

    protected parseResults(data: {success: boolean, message?: string | string[], uid?: string}) {
        let date = new Date();
        let uploadAttempt: UploadResultStatusType = {
            intid: this.file.id.toString(),
            name: this.file.fileName,
            datetime: `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`,
            status: data.success ? "success" : "failure"
        };
        let window = getMainWindow();

        if(data.success) {
            getFileManager().removeFileById(this.file.id);
        } else {
            uploadAttempt['errors'] = data.message;
        }
        if(window != null) window.webContents.send('status_update', data.success);
        getFileDatabase().addNewUpload(uploadAttempt);
    }

    private completeJson(jsonString, version) {
        let json = jsonString ? JSON.parse(jsonString) : {};
        let content = getDescriptionReader().getDescriptionContent(version);
        Object.keys(content).forEach(name => {
            if(!json.hasOwnProperty(name)) {
                json[name] = content[name] === "select" ? null : "";
            }
        });
        return JSON.stringify(json);
    }

    protected getGroup(): string {
        return undefined;
    }

}
