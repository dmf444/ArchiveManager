

export class UploadSettings implements ISettings{
    categoryName: string;
    localizedName: string;

    private __url : string;
    private __username: string = '';
    private __password: string = '';

    constructor() {
        this.categoryName = "upload";
        this.localizedName = "Upload Endpoint";

        this.__url = "http://localhost/";
    }

    public getUrl() {
        return this.__url;
    }

    public getUsername() {
        return this.__username;
    }

    public getPassword() {
        return this.__password;
    }

    equals(settingImpl: {}): boolean {
        let setting: UploadSettings = <UploadSettings>new UploadSettings().fromJson(settingImpl);
        return setting.__url === this.__url && setting.__username === this.__username && setting.__password === this.__password;
    }

    fromJson(jsonModel: {}): ISettings {
        this.__url = jsonModel['url'];
        this.__username = jsonModel['username_uploader'];
        this.__password = jsonModel['password_uploader'];
        return this;
    }

    getRenderingModel(): settingFrame {
        return {
            id: this.categoryName,
            category: this.localizedName,
            settings: [
                {id: 'url', value: this.__url, size: 100, name: "API Base URL"},
                {id: 'username_uploader', value: this.__username, size: 50, name: "API Authentication Username"},
                {id: 'password_uploader', value: this.__password, size: 50, name: "API Authentication Password"}
            ]
        }
    }

    getSettingsJson(): {} {
        return {
            url: this.__url,
            username_uploader: this.__username,
            password_uploader: this.__password
        };
    }

}