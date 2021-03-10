import {FileModel} from '@main/file/FileModel';
import * as fs from 'fs';
import jetpack from 'fs-jetpack';
const fetch = require('node-fetch');
const FormData = require('formdata-node');
const log = require('electron-log');

export class FileUploader {
    private file: FileModel;

    constructor(file) {
        this.file = file;
    }

    public upload() {
        let data = new FormData();


        if(this.file.savedLocation != null){
            data.set('original_file[]', fs.createReadStream(this.file.savedLocation), this.file.fileName);
        }
        /*if(this.file.fileMetadata.extraFile != null) {
            data.set('cached_file', fs.createReadStream(this.file.fileMetadata.extraFile));
        }*/

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

        this.connect(data).then(text => log.info(text));
    }

    async connect(data) {
        let connection = await fetch("http://localhost/smcsarchives/api/upload.php?endpoint=document",
            {
                method: "post",
                body: data.stream,
                headers: data.headers,
                mode: "no-cors"
            }
        ).then(response => {
           return response.text();
        });
    }

}