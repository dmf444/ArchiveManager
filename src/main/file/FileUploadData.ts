
export class FileUploadData {
    get date(): string {
        return this._date;
    }

    set date(value: string) {
        this._date = value;
    }
    get pageCount(): number {
        return this._pageCount;
    }

    set pageCount(value: number) {
        this._pageCount = value;
    }
    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }
    get localizedName(): string {
        return this._localizedName;
    }

    set localizedName(value: string) {
        this._localizedName = value;
    }
    get restrictions(): number {
        return this._restrictions;
    }
    set container(value: number) {
        this._container = value;
    }
    set restrictions(value: number) {
        this._restrictions = value;
    }

    public addTag(tagString: string) {
        if(!this.tags.includes(tagString)) {
            this.tags.push(tagString);
        }
    }

    public removeTag(tagString: string) {
        let index = this.tags.indexOf(tagString);
        if (index > -1) {
            this.tags.splice(index, 1);
        }
    }

    private _localizedName: string;
    private _container: number;
    private _description: string;
    private descriptionVersion: string;
    private _pageCount: number;
    private _restrictions: number;
    private tags: string[];
    private _date: string;

    constructor(localizedName: string, container: number, desc: string, descVers: string, count: number, restriction: number, tags: string[], date: string) {
        this._localizedName = localizedName;
        this._container = container;
        this._description = desc;
        this.descriptionVersion = descVers;
        this._pageCount = count;
        this._restrictions = restriction;
        this.tags = tags;
        this._date = date;
    }


    public toJson() {
        return {
            localName: this._localizedName,
            container: this._container,
            description: this._description,
            descVersion: this.descriptionVersion,
            count: this._pageCount,
            restr: this._restrictions,
            tags: this.tags,
            date: this._date
        };
    }

    static fromJson(uploadDataModel: {}): FileUploadData {
        if(uploadDataModel == null) {
            return new FileUploadData(null, null, null, null, null, null, [], "");
        } else {
            if(uploadDataModel['date'] == null) {
                uploadDataModel['date'] = "";
            }
            return new FileUploadData(uploadDataModel['localName'], uploadDataModel['container'], uploadDataModel['description'], uploadDataModel['descVersion'], uploadDataModel['count'], uploadDataModel['restr'], uploadDataModel['tags'], uploadDataModel['date']);
        }
    }
}