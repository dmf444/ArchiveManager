

export class UploadSettings implements ISettings{
    categoryName: string;
    localizedName: string;

    private __url : string;

    constructor() {
        this.categoryName = "upload";
        this.localizedName = "Upload Endpoint";

        this.__url = "http://localhost/";
    }

    public getUrl() {
        return this.__url;
    }

    equals(settingImpl: {}): boolean {
        let setting: UploadSettings = <UploadSettings>new UploadSettings().fromJson(settingImpl);
        return setting.__url === this.__url;
    }

    fromJson(jsonModel: {}): ISettings {
        this.__url = jsonModel['url'];
        return this;
    }

    getRenderingModel(): settingFrame {
        return {
            id: this.categoryName,
            category: this.localizedName,
            settings: [
                {id: 'url', value: this.__url, size: 100, name: "API Base URL"},
            ]
        }
    }

    getSettingsJson(): {} {
        return {
            url: this.__url
        };
    }

}