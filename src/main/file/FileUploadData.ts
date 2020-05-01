
export class FileUploadData {

    private localizedName: string;
    private container: number;
    private description: string;
    private descriptionVersion: string;
    private pageCount: number;
    private restrictions: number;
    private tags: string[];

    constructor(localizedName: string, container: number, desc: string, descVers: string, count: number, restriction: number, tags: string[]) {
        this.localizedName = localizedName;
        this.container = container;
        this.description = desc;
        this.descriptionVersion = descVers;
        this.pageCount = count;
        this.restrictions = restriction;
        this.tags = tags;
    }


    public toJson() {
        return {
            localName: this.localizedName,
            container: this.container,
            description: this.description,
            descVersion: this.descriptionVersion,
            count: this.pageCount,
            restr: this.restrictions,
            tags: this.tags
        };
    }

    static fromJson(uploadDataModel: {}): FileUploadData {
        if(uploadDataModel == null) {
            return new FileUploadData(null, null, null, null, null, null, []);
        } else {
            return new FileUploadData(uploadDataModel['localName'], uploadDataModel['container'], uploadDataModel['description'], uploadDataModel['descVersion'], uploadDataModel['count'], uploadDataModel['restr'], uploadDataModel['tags']);
        }
    }
}