

export class WebDatabaseSettings implements ISettings {


    categoryName: string;
    localizedName: string;

    databaseName: string;
    username: string;
    password: string;
    hostAddr: string;

    constructor() {
        this.categoryName = "remotedb";
        this.localizedName = "Remote Database Settings";

        this.databaseName = "";
        this.username = "";
        this.password = "";
        this.hostAddr = "";
    }


    fromJson(jsonModel: {}): ISettings {
        this.databaseName = jsonModel["databaseName"];
        this.username = jsonModel["username"];
        this.password = jsonModel["password"];
        this.hostAddr = jsonModel["host_address"];
        return this;
    }

    getRenderingModel(): settingFrame {
        return {
            id: this.categoryName,
            category: this.localizedName,
            settings: [
                {id: 'host_address', value: this.hostAddr, size: 50, name: "Remote Host Address"},
                {id: 'databaseName', value: this.databaseName, size: 50, name: "Database Name"},
                {id: 'username', value: this.username, size: 50, name: "Database Username"},
                {id: 'password', value: this.password, size: 50, name: "Database Password", type: "password"}
            ]
        }
    }

    getSettingsJson(): {} {
        return {
            databaseName: this.databaseName,
            username: this.username,
            password: this.password,
            host_address: this.hostAddr
        };
    }

    equals(settingImpl: {}): boolean {
        let setting: WebDatabaseSettings = <WebDatabaseSettings>new WebDatabaseSettings().fromJson(settingImpl);
        return setting.hostAddr === this.hostAddr &&
            setting.password === this.password &&
            setting.username === this.username &&
            setting.databaseName == this.databaseName;

    }

}