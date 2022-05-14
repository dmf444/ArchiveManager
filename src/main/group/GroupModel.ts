import {FileModel} from '@main/file/FileModel';
import {StandardFileModel} from '@main/group/StandardFileModel';
import {IJsonSerializable} from '@main/database/IJsonSerializable';

export class GroupModel implements IJsonSerializable<GroupModel> {
    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    private _id: number;
    private _name: string;
    private _year: number;
    private _container: number;
    private _restrictions: number;
    private _tags: string[];
    private _desc: string;
    private _standardFiles: StandardFileModel[];
    private _fileModels: FileModel[];

    constructor(id: number, name: string, year: number, container: number, restriction: number, tags: string[], desc: string, files: StandardFileModel[], models: FileModel[]) {
        this._id = id;
        this._name = name;
        this._year = year;
        this._container = container;
        this._restrictions = restriction;
        this._tags = tags;
        this._desc = desc;
        this._standardFiles = files;
        this._fileModels = models;
    }

    static fromJson(modelJson: {}): GroupModel {
        let fileModels = [];
        modelJson['fileModels'].forEach((jsonObj) => {
            fileModels.push(FileModel.fromJson(jsonObj));
        });
        let standardFiles = [];
        modelJson['standardFiles'].forEach((jsonObj) => {
            standardFiles.push(StandardFileModel.fromJson(jsonObj));
        });
        return new GroupModel(modelJson['id'], modelJson['name'], modelJson['year'], modelJson['container'], modelJson['restriction'], modelJson['tags'], modelJson['desc'], standardFiles, fileModels);
    }

    toJson() {
        let standardJson = [];
        this._standardFiles.forEach((standardFile: StandardFileModel) => {
           standardJson.push(standardFile.toJson());
        });
        let fileModelJson = [];
        this._fileModels.forEach((fileModel: FileModel) => {
           fileModelJson.push(fileModel.toJson());
        });
        return {
            id: this._id,
            name: this._name,
            year: this._year,
            container: this._container,
            restriction: this._restrictions,
            tags: this._tags,
            desc: this._desc,
            standardFiles: standardJson,
            fileModels: fileModelJson
        };
    }

}
