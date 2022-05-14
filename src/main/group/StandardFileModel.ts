import {FileModel} from '@main/file/FileModel';
import {FileState} from '@main/file/FileState';
import {FileUploadData} from '@main/file/FileUploadData';
import {IJsonSerializable} from '@main/database/IJsonSerializable';

export class StandardFileModel implements IJsonSerializable<StandardFileModel>{
    private _id: number;
    private _fileName: string;
    private _savedLocation: string;
    private _url: string;
    private _md5: string;

    constructor(id: number, fileName: string, savedLocation: string, url: string, md5: string) {
        this._id = id;
        this._fileName = fileName;
        this._savedLocation = savedLocation;
        this._url = url;
        this._md5 = md5;
    }

    public toFileModel(nextFreeSlot: number): FileModel {
        return new FileModel(nextFreeSlot, this._fileName, this._savedLocation, FileState.NORMAL, this._url, this._md5, FileUploadData.fromJson(null));
    }


    static fromJson(modelJson: {}): StandardFileModel {
        return new StandardFileModel(modelJson['id'], modelJson['fileName'], modelJson['saveLoc'], modelJson['url'], modelJson['md5']);
    }

    public toJson() {
        return {
            id: this._id,
            fileName: this._fileName,
            saveLoc: this._savedLocation,
            url: this._url,
            md5: this._md5
        };
    }
}
