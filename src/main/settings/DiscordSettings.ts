


export class DiscordSettings implements ISettings{

    categoryName: string;
    localizedName: string;

    private _token: string;
    private _channel_id: string;
    private _icons_accept: string;
    private _icons_refuse: string;
    private _icons_download: string;
    private _authorizedUsers: string[];

    constructor() {
        this.categoryName = "discord";
        this.localizedName = "Discord Settings";

        this._token = "";
        this._channel_id = "";
        this._icons_accept = "✅";
        this._icons_download = "⏬";
        this._icons_refuse = "❌";
        this._authorizedUsers = [];
    }


    public getSettingsJson(): {} {
        return {
            token: this._token,
            channelId: this._channel_id,
            acceptIcon: this._icons_accept,
            rejectIcon: this._icons_refuse,
            downloadIcon: this._icons_download,
            authorizedUsers: this._authorizedUsers.join(",")
        }
    }

    public fromJson(jsonModel: {}): ISettings {
        this._token = jsonModel['token'];
        this._channel_id = jsonModel['channelId'];
        this._icons_accept = jsonModel['acceptIcon'];
        this._icons_download = jsonModel['downloadIcon'];
        this._icons_refuse = jsonModel['rejectIcon'];
        this._authorizedUsers = jsonModel['authorizedUsers'] == null ? [] : jsonModel['authorizedUsers'].split(",");
        return this;
    }


    public getRenderingModel(): settingFrame {
        return {
            id: this.categoryName,
            category: this.localizedName,
            settings: [
                {id: 'token', value: this.token, size: 66.6, name: "Discord Bot Token"},
                {id: 'channelId', value: this.channel_id, size: 33.3, name: "Channel Id"},
                {id: 'auth_users', value: this._authorizedUsers.join(","), size: 100, name: "Authorized Users"},
                {id: 'acceptIcon', value: this.icons_accept, size: 33.3, name: "Accept Emote"},
                {id: 'rejectIcon', value: this.icons_refuse, size: 33.3, name: "Reject Emote"},
                {id: 'downloadIcon', value: this.icons_download, size: 33.3, name: "Download Emote"}
            ]
        }
    }


    get token(): string {
        return this._token;
    }

    set token(value: string) {
        this._token = value;
    }
    get channel_id(): string {
        return this._channel_id;
    }

    set channel_id(value: string) {
        this._channel_id = value;
    }
    get icons_accept(): string {
        return this._icons_accept;
    }

    set icons_accept(value: string) {
        this._icons_accept = value;
    }
    get icons_refuse(): string {
        return this._icons_refuse;
    }

    set icons_refuse(value: string) {
        this._icons_refuse = value;
    }
    get icons_download(): string {
        return this._icons_download;
    }

    set icons_download(value: string) {
        this._icons_download = value;
    }

    get authorizedUsers(): string[] {
        return this._authorizedUsers;
    }

    set authorizedUsers(value: string[]) {
        this._authorizedUsers = value;
    }

    equals(settingImpl: ISettings): boolean {
        let setting: DiscordSettings = <DiscordSettings>new DiscordSettings().fromJson(settingImpl);
        return setting.token === this.token &&
            setting.channel_id === this.channel_id &&
            setting._authorizedUsers === this._authorizedUsers &&
            setting.icons_refuse === this.icons_refuse &&
            setting.icons_accept === this.icons_accept &&
            setting.icons_download === this.icons_download;
    }

}