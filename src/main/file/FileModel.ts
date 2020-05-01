import {FileState} from '@main/file/FileState';
import {FileUploadData} from '@main/file/FileUploadData';


export class FileModel {

    private id: number;
    private fileName: string;
    private savedLocation: string;
    private state: FileState;
    private fileMetadata: FileUploadData;


    constructor(id: number, fileName: string, saveLoc: string, state: FileState, fileMetadata: FileUploadData) {
        this.id = id;
        this.fileName = fileName;
        this.savedLocation = saveLoc;
        this.state = state;
        this.fileMetadata = fileMetadata;
    }

    public getId(): number {
        return this.id;
    }


    public toJson() {
        return {
            id: this.id,
            fileName: this.fileName,
            saveLoc: this.savedLocation,
            state: FileState[this.state],
            metaData: this.fileMetadata.toJson()
        };
    }

    static fromJson(fileModelJson: {}): FileModel {
        let stateString: string = fileModelJson['state'];
        return new FileModel(fileModelJson['id'], fileModelJson['fileName'], fileModelJson['saveLoc'], FileState[stateString], FileUploadData.fromJson(fileModelJson['metaData']));
    }
}