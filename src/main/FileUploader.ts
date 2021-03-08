import {FileModel} from '@main/file/FileModel';
import * as fs from 'fs';
const fetch = require('node-fetch');
const FormData = require('form-data');
const log = require('electron-log');

export class FileUploader {
    private file: FileModel;

    constructor(file) {
        this.file = file;
    }

    public upload() {
        let data = new FormData();

        data.append('date', this.file.fileMetadata.date);
        if(this.file.savedLocation != null){
            data.append('original_file', fs.createReadStream(this.file.savedLocation + "/" + this.file.fileName) as any);
        }
        if(this.file.fileMetadata.extraFile != null) {
            data.append('cached_file', fs.createReadStream(this.file.fileMetadata.extraFile));
        }

        let saveName = this.file.fileMetadata.localizedName == null ? this.file.fileName : this.file.fileMetadata.localizedName;
        data.append('save_name', saveName);
        data.append('container', this.file.fileMetadata.container);
        data.append('description', this.file.fileMetadata.description);
        data.append('desc_version', this.file.fileMetadata.descriptionVersion);
        data.append('page_count', this.file.fileMetadata.pageCount);
        data.append('restriction', this.file.fileMetadata.restrictions);
        this.file.fileMetadata.tags.forEach(tag => {
            data.append('tags[]', tag);
        })

        fetch("http://localhost/smcsarchives/api/upload.php?endpoint=document",
            {
                method: "post",
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                body: data,
                mode: "cors"
            }).then(response => {
                log.info(response);
            }).catch(e => {
                log.info(e);
            });
    }

}