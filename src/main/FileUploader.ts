import {FileModel} from '@main/file/FileModel';
import * as fs from 'fs';
import {getDescriptionReader, getFileDatabase, getFileManager, getMainWindow, getSettingsManager} from "@main/main";
import {UploadSettings} from "@main/settings/UploadSettings";
import fetch, {Headers} from 'node-fetch';
import {objectToFormData} from "@octetstream/object-to-form-data/lib/object-to-form-data";
import FormData from "formdata-node";
import RemoteServerApi from "@main/api/RemoteServerApi";
const FormDataNode = require('formdata-node');
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
        const form= objectToFormData({
            save_name: fileMetadata.localizedName ?? this.file.fileName,
            container: fileMetadata.container,
            description: this.completeJson(this.file.fileMetadata.description, this.file.fileMetadata.descriptionVersion),
            desc_version: fileMetadata.descriptionVersion,
            page_count: fileMetadata.descriptionVersion.startsWith("1") ? fileMetadata.pageCount : undefined,
            date: fileMetadata.date ?? "",
            restrictions: fileMetadata.restrictions,
            tags: fileMetadata.tags,
            group_id: this.getGroup()
        }, {FormData: FormDataNode}) as FormData;

        log.debug("Loading files.");
        if (this.file.savedLocation != null) {
            form.set('original_file', fs.createReadStream(this.file.savedLocation), this.file.fileName);
        }
        if (fileMetadata.extraFile != null && fileMetadata.extraFile !== "") {
            form.set('cached_file', fs.createReadStream(this.file.fileMetadata.extraFile));
        }
        if (fileMetadata.coverImage != null && fileMetadata.coverImage !== "") {
            form.set('custom_preview', fs.createReadStream(this.file.fileMetadata.coverImage));
        }
        log.debug("Loading files complete.");


        log.debug("POSTING.");
        try{
            let data = await this.remoteServerApi.uploadFile(form);
            this.parseResults(data);
        } catch(e) {
            this.parseResults({status: false, message: "Failed HTTP send, see logs for details - " + e.code});
            log.info('error parsing', e);
            //log.info('RESPONSE TEXT: ', text);
        }
    }

    async connect(url, data) {
        let connection = await fetch(url, data);
        let backup = connection.clone();
        if (connection.headers.has('content-type') && connection.headers.get('content-type') === "application/json") {
            try {
                let json = await connection.json();
                this.parseResults(json);
            } catch (e) {
                let text = await backup.text();
                this.parseResults({status: false, message: "Failed HTTP send, see logs for details - " + backup.status});
                log.info('error parsing', e);
                log.info('RESPONSE TEXT: ', text);
            }
        } else {
            this.parseResults({status: false, message: "Failed HTTP send, see logs for details"});
            let bodyText = await connection.text();
            log.info(bodyText);
        }
    }

    protected parseResults(data) {
        let date = new Date();
        let uploadAttempt = { intid: this.file.id, name: this.file.fileName, datetime: date.toLocaleDateString() + " " + date.getHours() + ":" + date.getMinutes() };
        let window = getMainWindow();

        if(data.success) {
            uploadAttempt['status'] = 'success';
            getFileManager().removeFileById(this.file.id);
            if(window != null) window.webContents.send('status_update', true);
        } else {
            uploadAttempt['status'] = 'reject';
            uploadAttempt['errors'] = data.message; //.join(" || ")
            if(window != null) window.webContents.send('status_update', false);
        }
        getFileDatabase().addNewUpload(uploadAttempt);
    }

    private completeJson(jsonString, version) {
        let json = JSON.parse(jsonString);
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
