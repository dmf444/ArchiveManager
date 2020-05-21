import {FileState} from '@main/file/FileState';
import {FileUploadData} from '@main/file/FileUploadData';


export class FileModel {
    get url(): string {
        return this._url;
    }
    get state(): FileState {
        return this._state;
    }
    get fileName(): string {
        return this._fileName;
    }
    get id(): number {
        return this._id;
    }
    get savedLocation(): string {
        return this._savedLocation;
    }

    private _id: number;
    private _fileName: string;
    private _savedLocation: string;
    private _state: FileState;
    private _url: string;
    private fileMetadata: FileUploadData;


    constructor(id: number, fileName: string, saveLoc: string, state: FileState, url: string, fileMetadata: FileUploadData) {
        this._id = id;
        this._fileName = fileName;
        this._savedLocation = saveLoc;
        this._state = state;
        this._url = url;
        this.fileMetadata = fileMetadata;
    }



    public toJson() {
        return {
            id: this._id,
            fileName: this._fileName,
            saveLoc: this._savedLocation,
            state: FileState[this._state],
            url: this._url,
            metaData: this.fileMetadata.toJson()
        };
    }

    static fromJson(fileModelJson: {}): FileModel {
        let stateString: string = fileModelJson['state'];
        if(fileModelJson['url'] == null){
            fileModelJson['url'] = "";
        }
        return new FileModel(fileModelJson['id'], fileModelJson['fileName'], fileModelJson['saveLoc'], FileState[stateString], fileModelJson["url"], FileUploadData.fromJson(fileModelJson['metaData']));
    }
}