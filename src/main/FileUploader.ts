import {FileModel} from '@main/file/FileModel';
import * as fs from 'fs';
import {getFileDatabase, getFileManager, getMainWindow, getSettingsManager} from "@main/main";
import {UploadSettings} from "@main/settings/UploadSettings";
const fetch = require('node-fetch');
const FormData = require('formdata-node');
const log = require('electron-log');

export class FileUploader {
    private file: FileModel;
    private _settings: UploadSettings;

    constructor(file) {
        this.file = file;
        this._settings = <UploadSettings>getSettingsManager().getSettings("upload");
    }

    public upload() {
        let data = new FormData();


        if(this.file.savedLocation != null){
            data.set('original_file', fs.createReadStream(this.file.savedLocation), this.file.fileName);
        }
        if(this.file.fileMetadata.extraFile != null && this.file.fileMetadata.extraFile !== "") {
            data.set('cached_file', fs.createReadStream(this.file.fileMetadata.extraFile));
        }

        let saveName = this.file.fileMetadata.localizedName == null ? this.file.fileName : this.file.fileMetadata.localizedName;
        data.set('save_name', saveName);
        data.set('container', this.file.fileMetadata.container);
        data.set('description', this.file.fileMetadata.description);
        data.set('desc_version', this.file.fileMetadata.descriptionVersion);
        data.set('page_count', this.file.fileMetadata.pageCount);
        data.set('date', this.file.fileMetadata.date);
        data.set('restriction', this.file.fileMetadata.restrictions);
        this.file.fileMetadata.tags.forEach(tag => {
            data.append('tags[]', tag);
        });

        let urlBase = this._settings.getUrl();
        if(urlBase.slice(-1) !== "/") urlBase += "/";
        fetch(urlBase + "api/upload.php?endpoint=document",
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
            });
    }

    async connect(data) {
        //let connection = await
    }

    private parseResults(data) {
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

}