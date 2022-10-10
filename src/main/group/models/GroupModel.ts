import {FileModel} from '@main/file/FileModel';
import {IJsonSerializable} from '@main/database/IJsonSerializable';

export class GroupModel implements IJsonSerializable<GroupModel> {
    public getName(): string {
        return this._name;
    }
    set name(value: string) {
        this._name = value;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    public addFileModel(model: FileModel) {
        this._fileModels.push(model)
    }

    public getFiles(): FileModel[] {
        return this._fileModels;
    }

    public getYear(): string {
        return this._year;
    }

    public setYear(year: string): void {
        this._year = year;
    }

    public getContainer(): number {
        return this._container;
    }

    public setContainer(container: number): void {
        this._container = container;
    }

    public getTags(): string[] {
        return this._tags;
    }

    public setTags(tags: string[]): void {
        this._tags = tags;
    }

    public getDescription(): string {
        return this._desc;
    }

    public setDescription(desc: string): void {
        this._desc = desc;
    }

    public getRestriction(): number {
        return this._restrictions;
    }

    public setRestriction(restriction: number) {
        this._restrictions = restriction;
    }

    public replaceFileModel(fileModel: FileModel) {
        for(let i = 0; i < this._fileModels.length; i++){
            let model: FileModel = this._fileModels[i];
            if(model.id == fileModel.id) {
                this._fileModels[i] = fileModel;
                return;
            }
        }
    }

    public findFileById(fileModelId: number) {
        return this._fileModels.find((fileModel) => {
            return fileModel.id == fileModelId;
        })
    }

    private _id: number;
    private _name: string;
    private _year: string;
    private _container: number;
    private _restrictions: number;
    private _tags: string[];
    private _desc: string;
    private _fileModels: FileModel[];

    constructor(id: number, name: string, year: string, container: number, restriction: number, tags: string[], desc: string, models: FileModel[]) {
        this._id = id;
        this._name = name;
        this._year = year;
        this._container = container;
        this._restrictions = restriction;
        this._tags = tags;
        this._desc = desc;
        this._fileModels = models;
    }

    static fromJson(modelJson: {}): GroupModel {
        let fileModels = [];
        modelJson['fileModels'].forEach((jsonObj) => {
            fileModels.push(FileModel.fromJson(jsonObj));
        });
        return new GroupModel(modelJson['id'], modelJson['name'], modelJson['year'], modelJson['container'], modelJson['restriction'], modelJson['tags'], modelJson['desc'], fileModels);
    }

    toJson() {
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
            fileModels: fileModelJson
        };
    }

}
