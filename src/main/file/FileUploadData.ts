
export class FileUploadData {
    get coverImage(): string {
        return this._coverImage;
    }

    set coverImage(value: string) {
        this._coverImage = value;
    }
    get extraFile(): string {
        return this._extraFile;
    }

    set extraFile(value: string) {
        this._extraFile = value;
    }
    get tags(): string[] {
        return this._tags;
    }

    set tags(value: string[]) {
        this._tags = value;
    }
    get descriptionVersion(): string {
        return this._descriptionVersion;
    }

    set descriptionVersion(value: string) {
        this._descriptionVersion = value;
    }
    get container(): number {
        return this._container;
    }
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



    private _localizedName: string;
    private _container: number;
    private _description: string;
    private _descriptionVersion: string;
    private _pageCount: number;
    private _restrictions: number;
    private _tags: string[];
    private _date: string;
    private _extraFile: string;
    private _coverImage: string;

    constructor(localizedName: string, container: number, desc: string, descVers: string, count: number, restriction: number, tags: string[], date: string, extraFile: string, coverImage: string) {
        this._localizedName = localizedName;
        this._container = container;
        this._description = desc;
        this._descriptionVersion = descVers;
        this._pageCount = count;
        this._restrictions = restriction;
        this._tags = tags;
        this._date = date;
        this._extraFile = extraFile;
        this._coverImage = coverImage;
    }


    public toJson() {
        return {
            localName: this._localizedName,
            container: this._container,
            description: this._description,
            descVersion: this._descriptionVersion,
            count: this._pageCount,
            restr: this._restrictions,
            tags: this._tags,
            date: this._date,
            extraFile: this._extraFile,
            coverImage: this._coverImage
        };
    }

    static fromJson(uploadDataModel: {}): FileUploadData {
        if(uploadDataModel == null) {
            return new FileUploadData(null, null, null, null, null, null, [], "", "", "");
        } else {
            if(uploadDataModel['date'] == null) {
                uploadDataModel['date'] = "";
            }
            if(uploadDataModel['extraFile'] == null) {
                uploadDataModel['extraFile'] = "";
            }
            if(uploadDataModel['coverImage'] == null) {
                uploadDataModel['coverImage'] = "";
            }
            return new FileUploadData(uploadDataModel['localName'], uploadDataModel['container'], uploadDataModel['description'], uploadDataModel['descVersion'], uploadDataModel['count'], uploadDataModel['restr'], uploadDataModel['tags'], uploadDataModel['date'], uploadDataModel['extraFile'], uploadDataModel['coverImage']);
        }
    }
}
