import log from "electron-log";


export class GoogleOauthSettings implements ISettings {

    categoryName: string;
    localizedName: string;

    private clientKey: string;
    private clientSecret: string;
    private token: string;

    constructor() {
        this.categoryName = "googleapi";
        this.localizedName = "Google API Settings";

        this.clientKey = "";
        this.clientSecret = "";
        this.token = null;
    }


    fromJson(jsonModel: {}): ISettings {
        this.clientKey = jsonModel["client_key"];
        this.clientSecret = jsonModel["client_secret"];
        this.token = jsonModel["token"];
        return this;
    }

    getRenderingModel(): settingFrame {
        let clientKeyName = this.clientKey !== "" && this.token == null ? "Client Key <>" : "Client Key";
        //log.info(this.clientKey, this.clientKey !== null, this.token, clientKeyName);
        return {
            id: this.categoryName,
            category: this.localizedName,
            settings: [
                {id: 'client_key', value: this.clientKey, size: 50, name: clientKeyName},
                {id: 'client_secret', value: this.clientSecret, size: 50, name: "Client Secret"}
            ]
        }
    }

    getSettingsJson(): {} {
        return {
            client_key: this.clientKey,
            client_secret: this.clientSecret,
            token: this.token
        };
    }

    equals(settingImpl: {}): boolean {
        let setting: GoogleOauthSettings = <GoogleOauthSettings>new GoogleOauthSettings().fromJson(settingImpl);
        return setting.clientKey === this.clientKey &&
            setting.clientSecret === this.clientSecret;

    }

    public getToken() {
        return this.token;
    }

    public getClientKey() {
        return this.clientKey;
    }

    public getClientSecret() {
        return this.clientSecret;
    }

    public setToken(token) {
        this.token = token;
    }
}