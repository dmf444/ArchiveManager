import {FileModel} from '@main/file/FileModel';
import * as fs from 'fs';
import {getDescriptionReader, getFileDatabase, getFileManager, getMainWindow, getSettingsManager} from "@main/main";
import {UploadSettings} from "@main/settings/UploadSettings";
import fetch, {Headers} from 'node-fetch';
const FormData = require('formdata-node');
const log = require('electron-log');

export class FileUploader {
    protected file: FileModel;
    protected _settings: UploadSettings;

    constructor(file) {
        this.file = file;
        this._settings = <UploadSettings>getSettingsManager().getSettings("upload");
    }

    public async upload() {
        let data = new FormData();


        if (this.file.savedLocation != null) {
            data.set('original_file', fs.createReadStream(this.file.savedLocation), this.file.fileName);
        }
        if (this.file.fileMetadata.extraFile != null && this.file.fileMetadata.extraFile !== "") {
            data.set('cached_file', fs.createReadStream(this.file.fileMetadata.extraFile));
        }

        let saveName = this.file.fileMetadata.localizedName == null ? this.file.fileName : this.file.fileMetadata.localizedName;
        data.set('save_name', saveName);
        data.set('container', this.file.fileMetadata.container);
        data.set('description', this.completeJson(this.file.fileMetadata.description, this.file.fileMetadata.descriptionVersion));
        data.set('desc_version', this.file.fileMetadata.descriptionVersion);
        if (!this.file.fileMetadata.descriptionVersion.startsWith("1")) {
            data.set('page_count', this.file.fileMetadata.pageCount);
        }
        data.set('date', this.file.fileMetadata.date);
        data.set('restriction', this.file.fileMetadata.restrictions);
        this.file.fileMetadata.tags.forEach(tag => {
            data.append('tags[]', tag);
        });
        if (this.getGroup() != null) {
            data.set('group_id', this.getGroup());
        }

        let urlBase = this._settings.getUrl();
        if (urlBase.slice(-1) !== "/") urlBase += "/";
        let endPoint = !this.file.fileMetadata.descriptionVersion.startsWith("1") ? "endpoint=document" : "endpoint=image";
        /*fetch(urlBase + "api/upload.php?" + endPoint,
            {
                method: "post",
                body: data.stream,
                headers: data.headers,
                mode: "no-cors"
            }
        ).then(response => response.json())
            .then(data => { this.parseResults(data) })
            .catch(e => {
                this.parseResults({status: false, message: "Failed HTTP send, see logs for details"})
                log.info('error parsing', e);
            });*/
        let headers = data.headers;
        if (this._settings.getUsername() !== '') {
            headers = new Headers();
            headers.append('Content-Type', data.headers["Content-Type"]);
            headers.append('Authorization', 'Basic ' + Buffer.from(`${this._settings.getUsername()}:${this._settings.getPassword()}`).toString('base64'));
        }
        await this.connect(urlBase + "api/upload.php?" + endPoint, {method: "post", body: data.stream, headers: headers, mode: "no-cors"});
    }

    async connect(url, data) {
        let connection = await fetch(url, data);
        let backup = connection.clone();
        if (connection.headers.has('content-type') && connection.headers.get('content-type') === "application/json") {
            connection.json().then(data => this.parseResults(data)).catch(e => {
                backup.text().then(text => {
                    this.parseResults({status: false, message: "Failed HTTP send, see logs for details - " + backup.status});
                    log.info('error parsing', e);
                    log.info('RESPONSE TEXT: ', text);
                });
            });
        } else {
            this.parseResults({status: false, message: "Failed HTTP send, see logs for details"});
            log.info(connection.text());
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
        return null;
    }

}